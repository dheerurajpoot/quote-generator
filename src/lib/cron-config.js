import cron from "node-cron";
import { connectDb } from "./dbconfig.ts";
import { AutoPostingSettings } from "../models/autoPostingSettings.model.ts";
import { MetaApi } from "./meta-api.ts";
import { SocialConnection } from "../models/socialConnection.model.ts";
import axios from "axios";

// Function to check if it's time to post based on lastPostTime and interval
const shouldPost = (settings) => {
	if (!settings.lastPostTime) return true;

	const lastPost = new Date(settings.lastPostTime);
	const now = new Date();
	const minutesSinceLastPost =
		(now.getTime() - lastPost.getTime()) / (1000 * 60);

	return minutesSinceLastPost >= settings.interval;
};

// Function to handle auto-posting for a single user
const handleUserAutoPosting = async (settings) => {
	try {
		if (!settings.isEnabled || !shouldPost(settings)) return;

		// Get a new quote
		const quoteResponse = await axios.get("/api/quotes/generate");
		const { quote, imageUrl } = quoteResponse.data;

		// Get user's social connections
		const connections = await SocialConnection.find({
			userId: settings.userId,
			platform: { $in: settings.platforms },
		});

		// Post to each connected platform
		for (const connection of connections) {
			const metaApi = new MetaApi({
				accessToken:
					connection.platform === "instagram"
						? connection.pageAccessToken
						: connection.accessToken,
				userId: settings.userId,
				platform: connection.platform,
			});

			const caption = `${quote.text}\n\n— ${quote.author}`;

			if (connection.platform === "facebook") {
				await metaApi.postToFacebook(
					connection.profileId,
					connection.accessToken,
					imageUrl,
					caption
				);
			} else if (connection.platform === "instagram") {
				await metaApi.postToInstagram(
					connection.instagramAccountId || connection.profileId,
					connection.pageAccessToken || connection.accessToken,
					imageUrl,
					caption
				);
			}
		}

		// Update lastPostTime
		await AutoPostingSettings.findByIdAndUpdate(settings._id, {
			lastPostTime: new Date(),
		});

		console.log(`Successfully auto-posted for user ${settings.userId}`);
	} catch (error) {
		console.error(
			`Error in auto-posting for user ${settings.userId}:`,
			error
		);
	}
};

// Function to start all cron jobs
const startCronJobs = async () => {
	// Run every minute to check for auto-posting
	cron.schedule("* * * * *", async () => {
		try {
			await connectDb();
			console.log("Auto-posting cron job started successfully");

			// Get all enabled auto-posting settings
			const settings = await AutoPostingSettings.find({
				isEnabled: true,
			});

			// Handle auto-posting for each user
			for (const setting of settings) {
				await handleUserAutoPosting(setting);
			}
		} catch (error) {
			console.error("Error in auto-posting cron job:", error);
		}
	});

	console.log("Auto-posting cron jobs started successfully");
};
export { startCronJobs };
