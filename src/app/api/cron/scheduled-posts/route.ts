import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbconfig";
import { ScheduledPost } from "@/models/scheduledPost.model";
import { MetaApi } from "@/lib/meta-api";
import { SocialConnection } from "@/models/socialConnection.model";

// Define interfaces for better type safety
interface PublishResult {
	success: boolean;
	platform: string;
	result?: unknown;
	error?: string;
}

interface ScheduledPostData {
	_id: string;
	title: string;
	content: string;
	platforms: string[];
	mediaFiles?: string[];
	userId: string;
	scheduledAt?: Date;
	status: string;
	hashtags?: string[];
}

interface SocialConnectionData {
	accessToken: string;
	userId: string;
	platform: string;
	profileId: string; // Changed from pageId to profileId
	pageAccessToken?: string;
	instagramAccountId?: string;
}

// Function to check if it's time to post based on scheduledAt
const shouldPostNow = (
	scheduledAt: Date,
	bufferMinutes: number = 2
): boolean => {
	const now = new Date();
	const scheduledTime = new Date(scheduledAt);

	// Calculate time difference in minutes
	const timeDiffMinutes = Math.floor(
		(now.getTime() - scheduledTime.getTime()) / (1000 * 60)
	);

	// Post is ready if it's within the buffer window (past scheduled time but not too old)
	return timeDiffMinutes >= 0 && timeDiffMinutes <= bufferMinutes;
};

// Function to get next posting time for a post
const getNextPostingTime = (scheduledAt: Date): Date => {
	return new Date(scheduledAt);
};

export async function GET() {
	try {
		await connectDb();

		// Find all posts that need to be processed
		const now = new Date();
		const bufferMinutes = 2;

		const postsToProcess = await ScheduledPost.find({
			$or: [
				// Scheduled posts that are ready
				{
					status: "scheduled",
					scheduledAt: {
						$lte: new Date(
							now.getTime() + bufferMinutes * 60 * 1000
						), // Within buffer window
						$gte: new Date(
							now.getTime() - bufferMinutes * 60 * 1000
						), // Not too old
					},
				},
			],
		}).populate("userId", "email");

		if (postsToProcess.length === 0) {
			return NextResponse.json({
				success: true,
				message: "No posts to process",
				processed: 0,
				timestamp: now.toISOString(),
			});
		}

		let processedCount = 0;
		let successCount = 0;
		let failureCount = 0;
		let skippedCount = 0;

		// Process each post
		for (const post of postsToProcess) {
			try {
				// For scheduled posts, check if it's actually time to post
				if (post.status === "scheduled" && post.scheduledAt) {
					if (!shouldPostNow(post.scheduledAt, bufferMinutes)) {
						const nextTime = getNextPostingTime(post.scheduledAt);
						console.log(
							`⏰ Scheduled post ${
								post.title
							} not ready yet. Next check: ${nextTime?.toISOString()}`
						);
						skippedCount++;
						continue;
					}
				}

				// Get user's social connections for the platforms
				const connections = await SocialConnection.find({
					userId: post.userId,
					platform: { $in: post.platforms },
				});

				if (connections.length === 0) {
					console.log(
						`❌ No social connections found for user ${post.userId}`
					);
					await markPostAsFailed(
						post._id,
						"No social connections found"
					);
					failureCount++;
					continue;
				}

				// Publish to each platform
				const publishResults = await Promise.allSettled(
					post.platforms.map(async (platform: string) => {
						const connection = connections.find(
							(conn) => conn.platform === platform
						);
						if (!connection) {
							throw new Error(
								`No connection found for ${platform}`
							);
						}

						return await publishToPlatform(
							post,
							connection,
							platform
						);
					})
				);

				// Check results
				const successfulPlatforms = publishResults
					.filter(
						(
							result
						): result is PromiseFulfilledResult<PublishResult> =>
							result.status === "fulfilled" &&
							result.value.success
					)
					.map((result) => result.value.platform);

				const failedPlatforms = publishResults
					.filter(
						(
							result
						): result is
							| PromiseRejectedResult
							| PromiseFulfilledResult<PublishResult> =>
							result.status === "rejected" ||
							(result.status === "fulfilled" &&
								!result.value.success)
					)
					.map((result) =>
						result.status === "fulfilled"
							? result.value.platform
							: "unknown"
					);

				// Update post status based on results
				if (successfulPlatforms.length > 0) {
					await markPostAsPublished(post._id, successfulPlatforms);

					if (failedPlatforms.length === 0) {
						// All platforms successful
						successCount++;
					} else {
						// Partial success
						successCount++;
						console.log(
							`⚠️ Post published partially: ${
								post.title
							} - Success: ${successfulPlatforms.join(
								", "
							)}, Failed: ${failedPlatforms.join(", ")}`
						);
					}
				} else {
					// All platforms failed
					await markPostAsFailed(
						post._id,
						`Failed on all platforms: ${failedPlatforms.join(", ")}`
					);
					failureCount++;
					console.log(
						`❌ Post failed on all platforms: ${post.title}`
					);
				}

				processedCount++;
			} catch (error: unknown) {
				console.error(`❌ Error processing post ${post._id}:`, error);
				await markPostAsFailed(
					post._id,
					`Processing error: ${
						error instanceof Error ? error.message : "Unknown error"
					}`
				);
				failureCount++;
			}
		}

		console.log(
			`🏁 Cron job completed. Processed: ${processedCount}, Success: ${successCount}, Failed: ${failureCount}, Skipped: ${skippedCount}`
		);

		return NextResponse.json({
			success: true,
			message: "Scheduled posts processed",
			processed: processedCount,
			successCount: successCount,
			failed: failureCount,
			skipped: skippedCount,
			timestamp: now.toISOString(),
		});
	} catch (error: unknown) {
		console.error("❌ Cron job error:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Cron job failed",
				error: error instanceof Error ? error.message : "Unknown error",
				timestamp: new Date().toISOString(),
			},
			{ status: 500 }
		);
	}
}

// Helper function to publish post to a specific platform
async function publishToPlatform(
	post: ScheduledPostData,
	connection: SocialConnectionData,
	platform: string
) {
	try {
		const metaApi = new MetaApi({
			accessToken: connection.accessToken,
			userId: connection.userId.toString(),
			platform: platform,
		});

		let publishResult;

		switch (platform) {
			case "facebook":
				// For Facebook, we need profileId and pageAccessToken
				if (connection.profileId && connection.pageAccessToken) {
					const mediaFile =
						post.mediaFiles && post.mediaFiles.length > 0
							? post.mediaFiles[0]
							: "";
					const caption = `${post.content} \n\n ${post.hashtags?.join(
						" "
					)}`;
					publishResult = await metaApi.postToFacebook(
						connection.profileId,
						connection.pageAccessToken,
						mediaFile,
						caption
					);
				} else {
					throw new Error(
						"Missing Facebook profile ID or page access token"
					);
				}
				break;
			case "instagram":
				// For Instagram, we need instagramAccountId and pageAccessToken
				if (
					connection.instagramAccountId &&
					connection.pageAccessToken
				) {
					const mediaFile =
						post.mediaFiles && post.mediaFiles.length > 0
							? post.mediaFiles[0]
							: "";

					const caption = `${post.content} \n\n ${post.hashtags?.join(
						" "
					)}`;
					publishResult = await metaApi.postToInstagram(
						connection.instagramAccountId,
						connection.pageAccessToken,
						mediaFile,
						caption
					);
				} else {
					throw new Error(
						"Missing Instagram account ID or access token"
					);
				}
				break;
			case "twitter":
				// Twitter not implemented yet
				throw new Error("Twitter posting not implemented yet");
			case "linkedin":
				// LinkedIn not implemented yet
				throw new Error("LinkedIn posting not implemented yet");
			default:
				throw new Error(`Unsupported platform: ${platform}`);
		}

		return {
			success: true,
			platform,
			result: publishResult,
		};
	} catch (error: unknown) {
		console.error(`❌ Failed to publish to ${platform}:`, error);
		return {
			success: false,
			platform,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

// Helper function to mark post as published
async function markPostAsPublished(postId: string, platforms: string[]) {
	try {
		await ScheduledPost.findByIdAndUpdate(postId, {
			status: "published",
			publishedDate: new Date(),
			publishedPlatforms: platforms,
			updatedAt: new Date(),
		});
	} catch (error: unknown) {
		console.error("Error marking post as published:", error);
	}
}

// Helper function to mark post as failed
async function markPostAsFailed(postId: string, reason: string) {
	try {
		await ScheduledPost.findByIdAndUpdate(postId, {
			status: "failed",
			failureReasons: { general: reason },
			updatedAt: new Date(),
		});
	} catch (error: unknown) {
		console.error("Error marking post as failed:", error);
	}
}
