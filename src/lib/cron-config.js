import cron from "node-cron";
import axios from "axios";
import { connectDb } from "./dbconfig.js";
import { AutoPostingSettings } from "../models/autoPostingSettings.model.js";

// Function to start all cron jobs
export function startCronJobs() {
	console.log("Starting cron jobs...");

	cron.schedule("* * * * *", async () => {
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
						continue;
					}

					// Call the auto-posting API for this user
					await axios.get(
						`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/auto-posting?userId=${setting.userId}`
					);

					// Update the last post time
					await AutoPostingSettings.findByIdAndUpdate(setting._id, {
						$set: { lastPostTime: now },
					});
				} catch (error) {
					console.error(
						`Error processing auto-posting for user ${setting.userId}:`,
						error
					);
				}
			}
		} catch (error) {
			console.error("Error in auto-posting cron job:", error);
		}
	});

	console.log("Cron jobs started successfully");
}
