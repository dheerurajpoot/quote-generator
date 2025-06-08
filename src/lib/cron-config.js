import cron from "node-cron";
import { connectDb } from "@/lib/dbconfig";

// Function to start all cron jobs
const startCronJobs = () => {
	// Run every 5 minutes instead of every minute to avoid rate limiting
	cron.schedule("*/5 * * * *", async () => {
		try {
			console.log("Running auto-posting cron job...");

			await connectDb();
		} catch (error) {
			console.error("Error in auto-posting cron job:", error);
		}
	});

	console.log("Cron jobs started successfully");
};

export { startCronJobs };
