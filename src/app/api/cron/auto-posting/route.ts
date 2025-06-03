import { AutoPostingSettings } from "@/models/autoPostingSettings.model";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDb } from "@/lib/dbconfig";
import { getRandomHindiQuote } from "@/lib/quote-service";
import { SocialConnection } from "@/models/socialConnection.model";
import { MetaApi } from "@/lib/meta-api";
import { uploadImage } from "@/lib/image-utils";
import { generateQuoteImage } from "@/lib/server-image-generator";

interface AutoPostingSettingsDocument {
	_id: mongoose.Types.ObjectId;
	userId: mongoose.Types.ObjectId;
	isEnabled: boolean;
	interval: number;
	platforms: string[];
	lastPostTime: Date | null;
}

// This function will be called by the cron job
export async function GET(request: Request) {
	try {
		await connectDb();

		// Get the userId from the query parameters
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		// If userId is provided, only process that user's auto-posting
		if (userId) {
			const setting = await AutoPostingSettings.findOne({
				userId: new mongoose.Types.ObjectId(userId),
				isEnabled: true,
			});

			if (!setting) {
				return NextResponse.json({
					success: false,
					message: "No auto-posting settings found for this user",
				});
			}

			const result = await processUserAutoPosting(
				setting as AutoPostingSettingsDocument
			);
			return NextResponse.json({
				success: true,
				result,
			});
		}

		// If no userId is provided, process all users' auto-posting
		const settings = await AutoPostingSettings.find({ isEnabled: true });

		if (!settings || settings.length === 0) {
			return NextResponse.json({
				success: false,
				message: "No auto-posting settings found",
			});
		}

		const results = [];

		// Process each user's auto-posting settings
		for (const setting of settings) {
			try {
				const result = await processUserAutoPosting(
					setting as AutoPostingSettingsDocument
				);
				results.push(result);
			} catch (error) {
				console.error(
					`Error processing auto-posting for user ${setting.userId}:`,
					error
				);
				results.push({
					userId: setting.userId.toString(),
					success: false,
					error:
						error instanceof Error
							? error.message
							: "Unknown error",
				});
			}
		}

		return NextResponse.json({
			success: true,
			message: "Auto-posting completed",
			results,
		});
	} catch (error) {
		console.error("Error in auto-posting cron job:", error);
		return NextResponse.json(
			{
				success: false,
				error: "An error occurred during auto-posting",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

// Network request handler with circuit breaker
const handleNetworkRequest = async <T>(
	operation: () => Promise<T>,
	name: string,
	maxRetries = 3,
	initialDelay = 1000
): Promise<T> => {
	let lastError: Error | null = null;
	let consecutiveFailures = 0;

	for (let i = 0; i < maxRetries; i++) {
		try {
			// Circuit breaker: if too many consecutive failures, wait longer
			if (consecutiveFailures > 2) {
				const circuitBreakerDelay = Math.min(
					5000 * Math.pow(2, consecutiveFailures - 2),
					30000
				);
				console.log(
					`Circuit breaker activated: waiting ${circuitBreakerDelay}ms`
				);
				await new Promise((resolve) =>
					setTimeout(resolve, circuitBreakerDelay)
				);
			}

			// Add jitter to prevent thundering herd
			const jitter = Math.random() * 1000;
			const delay =
				i === 0
					? 0
					: Math.min(
							initialDelay * Math.pow(2, i - 1) + jitter,
							30000
					  );

			if (delay > 0) {
				console.log(
					`${name}: Waiting ${delay}ms before attempt ${i + 1}`
				);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}

			const result = await operation();
			consecutiveFailures = 0; // Reset on success
			return result;
		} catch (err) {
			const error = err as Error;
			lastError = error;
			consecutiveFailures++;

			console.error(`${name} attempt ${i + 1} failed:`, {
				error: error.message,
				stack: error.stack,
				consecutiveFailures,
			});

			// Check if the error has a response property (axios error)
			if (error && typeof error === "object" && "response" in error) {
				const axiosError = error as { response?: { status?: number } };
				// Don't retry certain errors
				if (
					axiosError.response?.status === 404 ||
					axiosError.response?.status === 401 ||
					axiosError.response?.status === 403
				) {
					throw error;
				}
			}
		}
	}

	throw new Error(
		`${name}: All ${maxRetries} attempts failed. Last error: ${
			lastError?.message || "Unknown error"
		}`
	);
};

// Helper function to process a single user's auto-posting
async function processUserAutoPosting(setting: AutoPostingSettingsDocument) {
	const userId = setting.userId.toString();

	try {
		// Get the user's social connections with retry
		const connections = await handleNetworkRequest(
			async () => {
				const result = await SocialConnection.find({
					userId: new mongoose.Types.ObjectId(userId),
					platform: { $in: setting.platforms },
				});
				if (!result || result.length === 0) {
					throw new Error("No social connections found");
				}
				return result;
			},
			"Fetch social connections",
			3
		);

		// Fetch quote with retry
		const quote = await handleNetworkRequest(
			() => getRandomHindiQuote(),
			"Quote fetching",
			3
		);

		// Generate image with retry
		const quoteImageBuffer = await handleNetworkRequest(
			() => generateQuoteImage(quote),
			"Image generation",
			3
		);

		// Upload image with retry
		const cloudinaryUrl = await handleNetworkRequest(
			() => uploadImage(quoteImageBuffer),
			"Image upload",
			3
		);

		const caption = `${quote.text}\n\n— ${quote.author}`;
		const results = [];

		// Post to each platform
		for (const connection of connections) {
			try {
				const metaApi = new MetaApi({
					accessToken:
						connection.platform === "instagram"
							? connection.pageAccessToken
							: connection.accessToken,
				});

				const result = await handleNetworkRequest(
					async () => {
						if (connection.platform === "facebook") {
							return await metaApi.postToFacebook(
								connection.profileId,
								connection.accessToken,
								cloudinaryUrl,
								caption
							);
						} else if (connection.platform === "instagram") {
							return await metaApi.postToInstagram(
								connection.instagramAccountId ||
									connection.profileId,
								connection.pageAccessToken ||
									connection.accessToken,
								cloudinaryUrl,
								caption
							);
						}
						throw new Error(
							`Unsupported platform: ${connection.platform}`
						);
					},
					`${connection.platform} posting`,
					3
				);

				results.push({
					platform: connection.platform,
					success: true,
					url: result?.url,
				});
			} catch (error) {
				console.error(
					`Error posting to ${connection.platform} for user ${userId}:`,
					error
				);
				results.push({
					platform: connection.platform,
					success: false,
					error:
						error instanceof Error
							? error.message
							: "Unknown error",
				});
			}
		}

		return {
			userId,
			success: true,
			results,
		};
	} catch (error) {
		console.error(
			`Error in processUserAutoPosting for user ${userId}:`,
			error
		);
		return {
			userId,
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
