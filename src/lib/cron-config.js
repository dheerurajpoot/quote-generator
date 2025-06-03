import cron from "node-cron";
import axios from "axios";
import https from "https";
import { connectDb } from "./dbconfig.js";
import { AutoPostingSettings } from "../models/autoPostingSettings.model.js";

// Configure axios with HTTPS agent
const httpsAgent = new https.Agent({
	rejectUnauthorized: false,
	keepAlive: true,
	timeout: 0, // Disable agent-level timeout
	maxSockets: 25, // Further reduce concurrent connections
	maxFreeSockets: 5,
	freeSocketTimeout: 30000,
	keepAliveMsecs: 30000, // Reduce keep-alive duration
	scheduling: "fifo", // Use FIFO scheduling for better reliability
});

// Create axios instance with custom configuration
const apiClient = axios.create({
	httpsAgent,
	timeout: 60000, // Set a reasonable timeout for individual requests
	maxContentLength: 50 * 1024 * 1024, // 50MB max content length
	maxBodyLength: 50 * 1024 * 1024, // 50MB max body length
	headers: {
		"Content-Type": "application/json",
		Connection: "keep-alive",
		Accept: "*/*",
	},
	maxRedirects: 5,
	validateStatus: (status) => status >= 200 && status < 300,
	decompress: true, // Handle compressed responses
	// Handle DNS lookup timeouts
	lookup: false,
});

// Enhanced retry function with better error detection
async function retryRequest(url, maxRetries = 3) {
	let lastError;
	let attempt = 0;

	const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

	while (attempt < maxRetries) {
		try {
			// Add a small delay between attempts
			if (attempt > 0) {
				const backoffTime = Math.min(
					1000 * Math.pow(2, attempt),
					10000
				);
				console.log(
					`Waiting ${backoffTime}ms before retry ${attempt + 1}...`
				);
				await wait(backoffTime);
			}

			const response = await apiClient.get(url, {
				// Use a fresh agent for each retry
				httpsAgent: new https.Agent({
					...httpsAgent.options,
					keepAlive: true,
					timeout: 60000,
				}),
				// Request-specific timeout
				timeout: 60000,
				// Add retry attempt to headers for debugging
				headers: {
					...apiClient.defaults.headers,
					"X-Retry-Attempt": attempt + 1,
				},
			});

			// Validate response
			if (!response.data) {
				throw new Error("Empty response received");
			}

			return response;
		} catch (error) {
			attempt++;
			// Log detailed error information
			console.error("Request failed:", {
				attempt,
				error: error.message,
				code: error.code,
				errno: error.errno,
				syscall: error.syscall,
				address: error.address,
				port: error.port,
				status: error.response?.status,
				headers: error.response?.headers,
			});

			// Don't retry on certain errors
			if (
				error.response?.status === 404 ||
				error.response?.status === 401 ||
				error.response?.status === 403
			) {
				throw error;
			}

			// Check if we've exhausted retries
			if (attempt === maxRetries) {
				console.error(`All ${maxRetries} retry attempts failed`);
				throw new Error(
					`Failed after ${maxRetries} attempts. Last error: ${error.message}`
				);
			}
		}
	}
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
