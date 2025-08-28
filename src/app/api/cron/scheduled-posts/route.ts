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
}

interface SocialConnectionData {
	accessToken: string;
	userId: string;
	platform: string;
	pageId?: string;
	pageAccessToken?: string;
	instagramAccountId?: string;
}

export async function GET() {
	try {
		console.log(
			"🕐 Cron job triggered for scheduled posts at:",
			new Date().toISOString()
		);

		await connectDb();

		// Find all posts that are scheduled and ready to publish
		const now = new Date();
		const readyPosts = await ScheduledPost.find({
			status: "scheduled",
			scheduledAt: { $lte: now }, // Posts scheduled for now or in the past
		}).populate("userId", "email");

		console.log(`📝 Found ${readyPosts.length} posts ready to publish`);

		if (readyPosts.length === 0) {
			return NextResponse.json({
				success: true,
				message: "No posts ready to publish",
				processed: 0,
				timestamp: now.toISOString(),
			});
		}

		let processedCount = 0;
		let successCount = 0;
		let failureCount = 0;

		// Process each ready post
		for (const post of readyPosts) {
			try {
				console.log(
					`🚀 Processing post: ${post.title} (ID: ${post._id})`
				);

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
						console.log(
							`✅ Post published successfully to all platforms: ${post.title}`
						);
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
			`🏁 Cron job completed. Processed: ${processedCount}, Success: ${successCount}, Failed: ${failureCount}`
		);

		return NextResponse.json({
			success: true,
			message: "Scheduled posts processed",
			processed: processedCount,
			successCount: successCount,
			failed: failureCount,
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
		console.log(`📤 Publishing to ${platform}...`);

		const metaApi = new MetaApi({
			accessToken: connection.accessToken,
			userId: connection.userId.toString(),
			platform: platform,
		});

		let publishResult;

		switch (platform) {
			case "facebook":
				// For Facebook, we need pageId and pageAccessToken
				if (connection.pageId && connection.pageAccessToken) {
					const mediaFile =
						post.mediaFiles && post.mediaFiles.length > 0
							? post.mediaFiles[0]
							: "";
					publishResult = await metaApi.postToFacebook(
						connection.pageId,
						connection.pageAccessToken,
						mediaFile,
						post.content
					);
				} else {
					throw new Error("Missing Facebook page ID or access token");
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
					publishResult = await metaApi.postToInstagram(
						connection.instagramAccountId,
						connection.pageAccessToken,
						mediaFile,
						post.content
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
