import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbconfig";
import { AutoPostingSettings } from "@/models/autoPostingSettings.model";
import { MetaApi } from "@/lib/meta-api";
import { SocialConnection } from "@/models/socialConnection.model";
import axios from "axios";
import { AxiosError } from "axios";

interface AutoPostingSettings {
	_id: string;
	userId: string;
	platforms: string[];
	interval: number;
	lastPostTime: Date;
	isEnabled: boolean;
}

interface QuoteResponse {
	quote: string;
	quoteId: string;
	data: {
		text: string;
		author: string;
		imageUrl: string;
		quote: {
			text: string;
			author: string;
		};
	};
}
// Function to check if it's time to post based on lastPostTime and interval
const shouldPost = (settings: AutoPostingSettings) => {
	if (!settings.isEnabled) {
		return {
			shouldPost: false,
			message: `Auto-posting is disabled for user ${settings.userId}`,
			nextPostTime: null,
		};
	}

	if (!settings.lastPostTime) {
		return {
			shouldPost: true,
			message: `First post for user ${settings.userId}`,
			nextPostTime: new Date(),
		};
	}

	const lastPost = new Date(settings.lastPostTime);
	const now = new Date();
	const minutesSinceLastPost = Math.floor(
		(now.getTime() - lastPost.getTime()) / (1000 * 60)
	);

	const shouldPostNow = minutesSinceLastPost >= settings.interval;
	const nextPostTime = new Date(
		lastPost.getTime() + settings.interval * 60 * 1000
	);

	console.log(`Posting check for user ${settings.userId}:`, {
		lastPostTime: lastPost.toISOString(),
		currentTime: now.toISOString(),
		minutesSinceLastPost,
		interval: settings.interval,
		shouldPost: shouldPostNow,
		nextPostTime: nextPostTime.toISOString(),
	});

	return {
		shouldPost: shouldPostNow,
		message: shouldPostNow
			? `Time to post for user ${settings.userId}`
			: `Not time to post yet for user ${settings.userId}`,
		nextPostTime,
	};
};

// Function to handle auto-posting for a single user
const handleUserAutoPosting = async (settings: AutoPostingSettings) => {
	try {
		// Check if it's time to post
		const postingCheck = shouldPost(settings);
		if (!postingCheck.shouldPost) {
			return {
				success: true,
				userId: settings.userId,
				message: postingCheck.message,
				numPosts: 0,
				nextPostTime: postingCheck.nextPostTime,
			};
		}

		// Get a new quote
		const MAX_RETRIES = 5;
		let retryCount = 0;
		let quoteResponse: QuoteResponse | null = null;

		while (retryCount < MAX_RETRIES) {
			try {
				const response = await axios.get(
					`${process.env.NEXT_PUBLIC_APP_URL}/api/quotes/generate`,
					{
						timeout: 15000,
						validateStatus: (status) =>
							status >= 200 && status < 500,
					}
				);
				quoteResponse = response.data;
				break;
			} catch (error: unknown) {
				console.error(
					`Error fetching quote for user ${
						settings.userId
					} (attempt ${retryCount + 1}):`,
					{
						error:
							error instanceof Error
								? error.message
								: "Unknown error",
						status:
							error instanceof AxiosError
								? error.response?.status
								: undefined,
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
		const { text, author } = quote;

		// Get user's social connections
		const connections = await SocialConnection.find({
			userId: settings.userId,
			platform: { $in: settings.platforms },
		});

		if (!connections || connections.length === 0) {
			return {
				success: true,
				userId: settings.userId,
				message: `No social connections found for user ${settings.userId}`,
				numPosts: 0,
				nextPostTime: new Date(
					Date.now() + settings.interval * 60 * 1000
				),
			};
		}

		// Post to each connected platform
		let successfulPosts = 0;
		for (const connection of connections) {
			try {
				const metaApi = new MetaApi({
					accessToken:
						connection.platform === "instagram"
							? connection.pageAccessToken
							: connection.accessToken,
					userId: settings.userId,
					platform: connection.platform,
				});

				const caption = `${text}\n\n— ${author}`;

				if (connection.platform === "facebook") {
					await metaApi.postToFacebook(
						connection.profileId,
						connection.accessToken,
						imageUrl,
						caption
					);
					successfulPosts++;
				} else if (connection.platform === "instagram") {
					await metaApi.postToInstagram(
						connection.instagramAccountId || connection.profileId,
						connection.pageAccessToken || connection.accessToken,
						imageUrl,
						caption
					);
					successfulPosts++;
				}
			} catch (error) {
				console.error(
					`Error posting to ${connection.platform} for user ${settings.userId}:`,
					error
				);
				// Continue with other platforms even if one fails
			}
		}

		// Only update lastPostTime if at least one post was successful
		if (successfulPosts > 0) {
			const newLastPostTime = new Date();
			await AutoPostingSettings.findByIdAndUpdate(settings._id, {
				lastPostTime: newLastPostTime,
			});

			console.log(`Updated lastPostTime for user ${settings.userId}:`, {
				oldLastPostTime: settings.lastPostTime,
				newLastPostTime: newLastPostTime,
				successfulPosts,
			});

			return {
				success: true,
				userId: settings.userId,
				message: `Successfully auto-posted for user ${settings.userId}`,
				numPosts: successfulPosts,
				nextPostTime: new Date(
					newLastPostTime.getTime() + settings.interval * 60 * 1000
				),
			};
		} else {
			return {
				success: false,
				userId: settings.userId,
				message: `Failed to post to any platform for user ${settings.userId}`,
				numPosts: 0,
				nextPostTime: settings.lastPostTime, // Keep the same lastPostTime since no posts were successful
			};
		}
	} catch (error) {
		console.error(
			`Error in auto-posting for user ${settings.userId}:`,
			error
		);
		return {
			success: false,
			userId: settings.userId,
			error:
				error instanceof Error
					? error.message
					: "Unknown error occurred",
			nextPostTime: settings.lastPostTime, // Keep the same lastPostTime on error
		};
	}
};

export async function GET(request: Request) {
	try {
		// Check for valid API key
		const apiKey = request.headers.get("x-api-key");
		if (!apiKey || apiKey !== process.env.CRON_API_KEY) {
			return NextResponse.json(
				{
					success: false,
					error: "Unauthorized access",
				},
				{ status: 401 }
			);
		}

		// Set a timeout for the entire operation
		const timeoutPromise = new Promise((_, reject) => {
			setTimeout(() => {
				reject(new Error("Operation timed out"));
			}, 25000); // 25 second timeout
		});

		const operationPromise = (async () => {
			await connectDb();

			// Get all enabled auto-posting settings
			const settings = await AutoPostingSettings.find({
				isEnabled: true,
			});

			// Handle auto-posting for each user
			const results = [];
			for (const setting of settings) {
				try {
					const result = await handleUserAutoPosting(setting);
					results.push(result);
				} catch (error) {
					console.error(
						`Error processing user ${setting.userId}:`,
						error
					);
					results.push({
						success: false,
						userId: setting.userId,
						error:
							error instanceof Error
								? error.message
								: "Unknown error",
					});
				}
			}

			return NextResponse.json({
				success: true,
				results,
				totalUsersProcessed: settings.length,
				timestamp: new Date().toISOString(),
			});
		})();

		// Race between the operation and the timeout
		return await Promise.race([operationPromise, timeoutPromise]);
	} catch (error) {
		console.error("Error in auto-posting endpoint:", error);

		// Check if it's a timeout error
		if (error instanceof Error && error.message === "Operation timed out") {
			return NextResponse.json(
				{
					success: false,
					error: "Operation timed out",
					message: "The operation took too long to complete",
				},
				{ status: 504 }
			);
		}

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
