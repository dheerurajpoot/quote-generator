import cron from "node-cron";
import axios from "axios";
import https from "https";
import { connectDb } from "./dbconfig.js";
import { AutoPostingSettings } from "../models/autoPostingSettings.model.js";

// Configure axios with HTTPS agent
const httpsAgent = new https.Agent({
	rejectUnauthorized: false,
	keepAlive: true,
	timeout: 60000, // 60 seconds timeout
});

// Create axios instance with custom configuration
const apiClient = axios.create({
	httpsAgent,
	timeout: 60000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Retry function for failed requests
async function retryRequest(url, maxRetries = 3) {
	let lastError;
	for (let i = 0; i < maxRetries; i++) {
		try {
			const response = await apiClient.get(url);
			return response;
		} catch (error) {
			lastError = error;
			console.log(`Attempt ${i + 1} failed, retrying...`);
			await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
		}
	}
	throw lastError;
}

// Function to start all cron jobs
const startCronJobs = () => {
	console.log("Starting cron jobs...");

	// Run every 5 minutes instead of every minute to avoid rate limiting
	cron.schedule("*/5 * * * *", async () => {
		try {
			console.log("Running auto-posting cron job...");

			// Connect to the database
			await connectDb();

			// Get all auto-posting settings that are enabled
			const settings = await AutoPostingSettings.find({
				isEnabled: true,
			});

			if (!settings || settings.length === 0) {
				console.log("No auto-posting settings found");
				return;
			}

			// Process each user's auto-posting settings
			for (const setting of settings) {
				try {
					// Check if it's time to post based on the interval
					const now = new Date();
					const lastPostTime = setting.lastPostTime || new Date(0);
					const intervalInMinutes = setting.interval || 60;

					// Calculate the time difference in minutes
					const timeDiffInMinutes =
						(now.getTime() - lastPostTime.getTime()) / (1000 * 60);

					// If it's not time to post yet, skip this user
					if (timeDiffInMinutes < intervalInMinutes) {
						console.log(
							`Skipping user ${setting.userId} - not time to post yet`
						);
						continue;
					}

					console.log(
						`Processing auto-posting for user ${setting.userId}`
					);

					// Call the auto-posting API for this user with retry logic
					const response = await retryRequest(
						`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/auto-posting?userId=${setting.userId}`
					);

					if (response.data.success) {
						// Update the last post time only if the post was successful
						await AutoPostingSettings.findByIdAndUpdate(
							setting._id,
							{
								$set: { lastPostTime: now },
							}
						);
						console.log(
							`Successfully posted for user ${setting.userId}`
						);
					} else {
						console.error(
							`Failed to post for user ${setting.userId}:`,
							response.data.error
						);
					}
				} catch (error) {
					console.error(
						`Error processing auto-posting for user ${setting.userId}:`,
						error?.response?.data ||
							error?.message ||
							"Unknown error"
					);
				}
			}
		} catch (error) {
			console.error("Error in auto-posting cron job:", error);
		}
	});

	console.log("Cron jobs started successfully");
};

export { startCronJobs };
