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
	language?: string;
	template?: string;
}

// Helper to generate hashtags from quote text and author
function generateHashtags(text: string, author: string, count = 15): string[] {
	const trending = [
		"#motivation",
		"#inspiration",
		"#quotes",
		"#success",
		"#life",
		"#viral",
		"#trending",
		"#positivity",
		"#quoteoftheday",
		"#mindset",
		"#wisdom",
		"#selfgrowth",
		"#hindi",
		"#hindiquotes",
		"#anmolvachan",
		"#zindagi",
		"#soch",
		"#jeevan",
		"#suvichar",
		"#hindikavita",
		"#hindistatus",
		"#hindimotivation",
	];
	// Detect Hindi (Devanagari) characters
	const isHindi = /[\u0900-\u097F]/.test(text);
	if (isHindi) {
		// Shuffle trending and pick 'count' tags
		const shuffled = trending.sort(() => 0.5 - Math.random());
		return shuffled.slice(0, count);
	}
	// English/other: use keyword extraction + trending
	const stopwords = new Set([
		"the",
		"is",
		"and",
		"a",
		"to",
		"of",
		"in",
		"that",
		"it",
		"on",
		"for",
		"with",
		"as",
		"was",
		"at",
		"by",
		"an",
		"be",
		"this",
		"have",
		"from",
		"or",
		"but",
		"not",
		"are",
		"your",
		"just",
		"they",
		"want",
		"know",
		"you",
		"their",
		"all",
		"has",
		"will",
		"can",
		"we",
		"our",
		"so",
		"if",
		"do",
		"does",
		"had",
		"been",
		"more",
		"no",
		"out",
		"up",
		"who",
		"what",
		"when",
		"how",
		"why",
		"which",
		"about",
		"into",
		"than",
		"then",
		"them",
		"he",
		"she",
		"his",
		"her",
		"him",
		"i",
		"me",
		"my",
		"mine",
		"it's",
		"its",
		"too",
		"also",
		"get",
		"got",
		"let",
		"let's",
		"us",
		"because",
		"over",
		"under",
		"off",
		"this",
		"that",
		"these",
		"those",
		"such",
		"only",
		"even",
		"very",
		"much",
		"some",
		"any",
		"each",
		"every",
		"either",
		"neither",
		"both",
		"few",
		"many",
		"most",
		"other",
		"another",
		"again",
		"once",
		"here",
		"there",
		"where",
		"when",
		"why",
		"how",
		"all",
		"any",
		"both",
		"each",
		"few",
		"more",
		"most",
		"other",
		"some",
		"such",
		"no",
		"nor",
		"not",
		"only",
		"own",
		"same",
		"so",
		"than",
		"too",
		"very",
	]);
	const words = text
		.replace(/[.,!?"'’]/g, "")
		.split(/\s+/)
		.map((w) => w.toLowerCase())
		.filter((w) => w.length > 3 && !stopwords.has(w));
	const unique = Array.from(new Set(words));
	const hashtags = unique.slice(0, count).map((w) => `#${w}`);
	if (
		author &&
		author.toLowerCase() !== "unknown" &&
		hashtags.length < count
	) {
		hashtags.push(`#${author.replace(/\s+/g, "").toLowerCase()}`);
	}
	const trendingCopy = [...trending];
	while (hashtags.length < count && trendingCopy.length > 0) {
		hashtags.push(trendingCopy.shift()!);
	}
	return hashtags.slice(0, count);
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

// Helper function to retry DB update
async function retryUpdateLastPostTime(
	id: string,
	newLastPostTime: Date,
	maxRetries = 3
) {
	let attempt = 0;
	let updatedSettings = null;
	while (attempt < maxRetries) {
		updatedSettings = await AutoPostingSettings.findByIdAndUpdate(
			id,
			{ lastPostTime: newLastPostTime },
			{ new: true }
		);
		if (updatedSettings) break;
		attempt++;
		await new Promise((res) => setTimeout(res, 500)); // wait 0.5s before retry
	}
	return updatedSettings;
}

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

		// Get a new quote based on language setting
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_APP_URL}/api/quotes/generate?userId=${
				settings.userId
			}&language=${settings.language || "hindi"}&template=${
				settings.template || "classic"
			}`,
			{
				timeout: 60000, // 60 seconds
				validateStatus: (status) => status >= 200 && status < 500,
			}
		);

		if (!response.data) {
			throw new Error("Empty response from quote generation");
		}
		const { quote, imageUrl } = response.data;
		const { text, author } = quote;

		if (!text || !author || !imageUrl) {
			console.error("Invalid quote data:", response.data);
			throw new Error(
				"Missing required quote data (text, author, or imageUrl)"
			);
		}

		// Get user's social connections
		const connections = await SocialConnection.find({
			userId: settings.userId,
			platform: { $in: settings.platforms },
		});

		// Declare these once for use in both branches
		const newLastPostTime = new Date();
		const updatedSettings = await retryUpdateLastPostTime(
			settings._id,
			newLastPostTime
		);
		if (!updatedSettings) {
			throw new Error(
				`Failed to update lastPostTime for user ${settings.userId} after multiple attempts`
			);
		}
		console.log(
			`Updated lastPostTime for user ${settings.userId} (pre-post):`,
			{
				oldLastPostTime: settings.lastPostTime,
				newLastPostTime,
			}
		);

		if (!connections || connections.length === 0) {
			return {
				success: true,
				userId: settings.userId,
				message: `No social connections found for user ${settings.userId}`,
				numPosts: 0,
				nextPostTime: new Date(
					newLastPostTime.getTime() + settings.interval * 60 * 1000
				),
			};
		}

		// Post to each connected platform (robust: always fetch fresh connection from DB)
		let successfulPosts = 0;
		for (const platform of settings.platforms) {
			try {
				// Always fetch the latest connection for this user/platform
				const connection = await SocialConnection.findOne({
					userId: settings.userId,
					platform,
				});
				if (!connection) {
					console.warn(
						`[CRON] No connection found for user ${settings.userId} and platform ${platform}`
					);
					continue;
				}

				// Skip posting if imageUrl is a known placeholder or failed upload
				if (
					!imageUrl ||
					imageUrl.includes("placeholder.com") ||
					imageUrl.includes("Timeout")
				) {
					console.warn(
						`[CRON] Skipping ${platform} post for user ${settings.userId} due to invalid or placeholder imageUrl:`,
						imageUrl
					);
					continue;
				}

				const metaApi = new MetaApi({
					accessToken: connection.pageAccessToken,
					userId: settings.userId,
					platform,
				});

				const hashtags = generateHashtags(text, author, 15);
				console.log("HashTags: ", hashtags);
				const caption = `${text}\n\n— ${author}\n\n${hashtags.join(
					" "
				)}`;
				console.log("caption: ", caption);
				if (platform === "facebook") {
					const postResponse = await metaApi.postToFacebook(
						connection.profileId,
						connection.pageAccessToken,
						imageUrl,
						caption
					);
					if (postResponse.success) {
						successfulPosts++;
					}
				} else if (platform === "instagram") {
					const postResponse = await metaApi.postToInstagram(
						connection.instagramAccountId || connection.profileId,
						connection.pageAccessToken,
						imageUrl,
						caption
					);
					if (postResponse.success) {
						successfulPosts++;
					}
				}
			} catch (error) {
				console.error(
					`[CRON] Error posting to ${platform} for user ${settings.userId}:`,
					error
				);
			}
		}

		return {
			success: successfulPosts > 0,
			userId: settings.userId,
			message:
				successfulPosts > 0
					? `Successfully auto-posted for user ${settings.userId}`
					: `Failed to post to any platform for user ${settings.userId}`,
			numPosts: successfulPosts,
			nextPostTime: new Date(
				newLastPostTime.getTime() + settings.interval * 60 * 1000
			),
		};
	} catch (error) {
		console.error(
			`Error in auto-posting for user ${settings.userId}:`,
			error
		);
		return {
			success: false,
			userId: settings.userId,
			message:
				error instanceof Error
					? error.message
					: "Unknown error occurred",
			nextPostTime: settings.lastPostTime,
		};
	}
};

export async function GET(request: Request): Promise<Response> {
	try {
		// Check for valid API key
		const apiKey = request.headers.get("x-api-key");
		if (!apiKey || apiKey !== process.env.CRON_API_KEY) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized access" },
				{ status: 401 }
			);
		}

		await connectDb();

		// Get all enabled auto-posting settings
		const settings = await AutoPostingSettings.find({ isEnabled: true });

		// Merge jobs by userId: combine platforms for each user
		const userJobMap = new Map();
		for (const setting of settings) {
			if (!userJobMap.has(setting.userId)) {
				userJobMap.set(setting.userId, {
					...setting.toObject(),
					platforms: new Set(setting.platforms),
				});
			} else {
				const merged = userJobMap.get(setting.userId);
				for (const p of setting.platforms) {
					merged.platforms.add(p);
				}
				// Use the latest lastPostTime and interval (pick the smallest interval)
				if (setting.lastPostTime > merged.lastPostTime) {
					merged.lastPostTime = setting.lastPostTime;
				}
				if (setting.interval < merged.interval) {
					merged.interval = setting.interval;
				}
			}
		}
		const mergedSettings = Array.from(userJobMap.values()).map((s) => ({
			...s,
			platforms: Array.from(s.platforms),
		}));

		const results = [];

		for (const setting of mergedSettings) {
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
					message:
						error instanceof Error
							? error.message
							: "Unknown error",
				});
			}
		}

		return NextResponse.json({
			success: true,
			results,
			totalUsersProcessed: mergedSettings.length,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Error in auto-posting endpoint:", error);
		return NextResponse.json(
			{
				success: false,
				message:
					error instanceof Error
						? error.message
						: "Unknown error occurred",
			},
			{ status: 500 }
		);
	}
}
