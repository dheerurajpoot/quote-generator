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
	if (!settings.lastPostTime) return true;

	const lastPost = new Date(settings.lastPostTime);
	const now = new Date();
	const minutesSinceLastPost = Math.floor(
		(now.getTime() - lastPost.getTime()) / (1000 * 60)
	);

	return minutesSinceLastPost >= settings.interval;
};

// Function to handle auto-posting for a single user
let quoteResponse: QuoteResponse;
const handleUserAutoPosting = async (settings: AutoPostingSettings) => {
	try {
		if (!settings.isEnabled || !shouldPost(settings)) return;

		// Get a new quote
		const MAX_RETRIES = 5; // Increased retries
		let retryCount = 0;

		while (retryCount < MAX_RETRIES) {
			try {
				quoteResponse = await axios.get(
					`${process.env.NEXT_PUBLIC_APP_URL}/api/quotes/generate`,
					{
						timeout: 15000, // Increased timeout to 15 seconds
						validateStatus: (status) =>
							status >= 200 && status < 500, // More lenient status validation
					}
				);
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

		// Safely extract quote data with proper error handling
		const quoteData = quoteResponse.data;
		if (
			!quoteData.quote ||
			!quoteData.quote.text ||
			!quoteData.quote.author
		) {
			console.error(
				`Invalid quote data structure for user ${settings.userId}:`,
				quoteData
			);
			throw new Error("Invalid quote data structure");
		}

		const { text, author } = quoteData.quote;
		const imageUrl = quoteData.imageUrl;

		if (!imageUrl) {
			console.error(
				`No image URL in quote data for user ${settings.userId}`
			);
			throw new Error("Missing image URL in quote data");
		}

		// Get user's social connections
		const connections = await SocialConnection.find({
			userId: settings.userId,
			platform: { $in: settings.platforms },
		});

		if (!connections || connections.length === 0) {
			console.log(
				`No social connections found for user ${settings.userId}`
			);
			return {
				success: true,
				message: `No social connections found for user ${settings.userId}`,
				numPosts: 0,
			};
		}

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

			const caption = `${text}\n\n— ${author}`;

			try {
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
			} catch (postError) {
				console.error(
					`Error posting to ${connection.platform} for user ${settings.userId}:`,
					postError
				);
				// Continue with other platforms even if one fails
				continue;
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
