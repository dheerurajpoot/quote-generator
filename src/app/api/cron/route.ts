import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbconfig";
import { AutoPostingSettings } from "@/models/autoPostingSettings.model";
import { MetaApi } from "@/lib/meta-api";
import { SocialConnection } from "@/models/socialConnection.model";
import axios from "axios";

interface AutoPostingSettings {
	_id: string;
	userId: string;
	platforms: string[];
	interval: number;
	lastPostTime: Date;
	isEnabled: boolean;
}
// Function to check if it's time to post based on lastPostTime and interval
const shouldPost = (settings: AutoPostingSettings) => {
	if (!settings.lastPostTime) return true;

	const lastPost = new Date(settings.lastPostTime);
	const now = new Date();
	const minutesSinceLastPost =
		(now.getTime() - lastPost.getTime()) / (1000 * 60);

	return minutesSinceLastPost >= settings.interval;
};

// Function to handle auto-posting for a single user
const handleUserAutoPosting = async (settings: AutoPostingSettings) => {
	try {
		if (!settings.isEnabled || !shouldPost(settings)) return;

		// Get a new quote
		const MAX_RETRIES = 3;
		let retryCount = 0;
		let quoteResponse: any;

		while (retryCount < MAX_RETRIES) {
			try {
				quoteResponse = await axios.get(
					`${process.env.NEXT_PUBLIC_APP_URL}/api/quotes/generate`,
					{
						timeout: 15000,
						validateStatus: (status) =>
							status >= 200 && status < 500,
					}
				);
				break;
			} catch (error: any) {
				console.error(
					`Error fetching quote for user ${
						settings.userId
					} (attempt ${retryCount + 1}):`,
					{
						error: error.message,
						status: error.response?.status,
						retryCount: retryCount + 1,
						totalAttempts: MAX_RETRIES,
					}
				);

				if (retryCount === MAX_RETRIES - 1) {
					throw error;
				}
				retryCount++;
				await new Promise((resolve) =>
					setTimeout(resolve, 3000 * retryCount)
				);
			}
		}

		if (!quoteResponse || !quoteResponse.data) {
			console.error(`No quote data received for user ${settings.userId}`);
			throw new Error("Failed to get quote response");
		}
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

		return {
			success: true,
			message: `Successfully auto-posted for user ${settings.userId}`,
			numPosts: connections.length,
		};
	} catch (error) {
		console.error(
			`Error in auto-posting for user ${settings.userId}:`,
			error
		);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Unknown error occurred",
		};
	}
};

export async function GET() {
	try {
		await connectDb();

		// Get all enabled auto-posting settings
		const settings = await AutoPostingSettings.find({
			isEnabled: true,
		});

		// Handle auto-posting for each user
		const results = [];
		for (const setting of settings) {
			const result = await handleUserAutoPosting(setting);
			results.push(result);
		}

		return NextResponse.json({
			success: true,
			results,
			totalUsersProcessed: settings.length,
		});
	} catch (error) {
		console.error("Error in auto-posting endpoint:", error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Unknown error occurred",
			},
			{ status: 500 }
		);
	}
}
