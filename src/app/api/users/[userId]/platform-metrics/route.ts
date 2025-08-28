import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/dbconfig";
import { SocialConnection } from "@/models/socialConnection.model";
import { PlatformMetrics } from "@/models/platformMetrics.model";
import { getUserFromToken } from "@/lib/utils";
import { MetaApi } from "@/lib/meta-api";
import mongoose from "mongoose";

// Define interfaces for better type safety
interface SocialConnectionData {
	_id: string;
	accessToken: string;
	userId: string;
	platform: string;
	profileId?: string;
	instagramAccountId?: string;
}

interface PlatformMetricsData {
	apiLimit: number;
	apiUsed: number;
	followers?: number;
	totalPosts?: number;
	postsThisMonth?: number;
	postsThisWeek?: number;
	engagementRate?: number;
	reach?: number;
	impressions?: number;
	clickRate?: number;
	pageViews?: number;
	growthRate?: number;
	responseTime?: number;
	contentQuality?: string;
	lastPostAt?: Date;
	bestPerformingPost?: string;
	following?: number;
	storyViews?: number;
	videoViews?: number;
}

// GET - Fetch platform metrics for a user
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	try {
		const { userId } = await params;
		await connectDb();

		const token = request.cookies.get("token")?.value;
		if (!token) {
			return NextResponse.json(
				{
					success: false,
					message: "Please log in to access this feature",
				},
				{ status: 401 }
			);
		}

		const user = await getUserFromToken(token);
		if (!user) {
			return NextResponse.json(
				{ success: false, message: "User not found" },
				{ status: 401 }
			);
		}

		// Check if user is requesting their own metrics or is admin
		if (user._id.toString() !== userId && user.role !== "admin") {
			return NextResponse.json(
				{ success: false, message: "Unauthorized access" },
				{ status: 403 }
			);
		}

		// Get user's social connections
		const connections = await SocialConnection.find({ userId });

		if (connections.length === 0) {
			// Clean up any orphaned metrics for this user
			await PlatformMetrics.deleteMany({
				userId: new mongoose.Types.ObjectId(userId),
			});

			return NextResponse.json({
				success: true,
				metrics: [],
			});
		}

		// Clean up orphaned metrics (metrics without corresponding connections)
		const connectionIds = connections.map((conn) => conn._id);
		await PlatformMetrics.deleteMany({
			userId: new mongoose.Types.ObjectId(userId),
			connectionId: { $nin: connectionIds },
		});

		// Fetch metrics for each connection
		const metricsPromises = connections.map(async (connection) => {
			try {
				// Check if we have recent metrics (less than 1 hour old)
				const existingMetrics = await PlatformMetrics.findOne({
					connectionId: connection._id,
					lastFetched: {
						$gte: new Date(Date.now() - 60 * 60 * 1000),
					},
				});

				if (existingMetrics) {
					return existingMetrics;
				}

				// Fetch real metrics from the platform
				const realMetrics = await fetchRealPlatformMetrics(connection);

				// Store or update metrics in database
				const metrics = await PlatformMetrics.findOneAndUpdate(
					{ connectionId: connection._id },
					{
						...realMetrics,
						connectionId: connection._id,
						platform: connection.platform,
						userId: connection.userId,
						lastFetched: new Date(),
						updatedAt: new Date(),
					},
					{ upsert: true, new: true }
				);

				return metrics;
			} catch (error) {
				console.error(
					`Failed to fetch metrics for ${connection.platform}:`,
					error
				);
				// Return existing metrics if available, or null
				return await PlatformMetrics.findOne({
					connectionId: connection._id,
				});
			}
		});

		const metrics = await Promise.all(metricsPromises);
		const validMetrics = metrics.filter((metric) => metric !== null);

		return NextResponse.json({
			success: true,
			metrics: validMetrics,
		});
	} catch (error: unknown) {
		console.error("Error fetching platform metrics:", error);
		return NextResponse.json(
			{ success: false, message: "Internal server error" },
			{ status: 500 }
		);
	}
}

// Function to fetch real metrics from social media platforms
async function fetchRealPlatformMetrics(connection: SocialConnectionData) {
	try {
		const metaApi = new MetaApi({
			accessToken: connection.accessToken,
			userId: connection.userId.toString(),
			platform: connection.platform,
		});

		let metrics: PlatformMetricsData = {
			// Default API limits based on platform
			apiLimit: connection.platform === "instagram" ? 200 : 300,
			apiUsed: 0, // This would need to be tracked separately
		};

		if (connection.platform === "facebook") {
			// Fetch Facebook page insights
			if (!connection.profileId) {
				console.error(
					"Facebook Profile ID missing for connection:",
					connection._id
				);
				return metrics;
			}

			const pageInsights = await metaApi.getPageInsights(
				connection.profileId
			);
			if (pageInsights) {
				metrics = {
					...metrics,
					followers: pageInsights.followers_count || 0,
					totalPosts: pageInsights.posts_count || 0,
					postsThisMonth: pageInsights.posts_this_month || 0,
					postsThisWeek: pageInsights.posts_this_week || 0,
					engagementRate: pageInsights.engagement_rate || 0,
					reach: pageInsights.reach || 0,
					impressions: pageInsights.impressions || 0,
					clickRate: pageInsights.click_rate || 0,
					pageViews: pageInsights.page_views || 0,
					growthRate: pageInsights.growth_rate || 0,
					responseTime: pageInsights.response_time || 0,
					contentQuality: pageInsights.content_quality || "Good",
					lastPostAt: pageInsights.last_post_at
						? new Date(pageInsights.last_post_at)
						: undefined,
					bestPerformingPost:
						pageInsights.best_performing_post || "N/A",
				};
			}
		} else if (connection.platform === "instagram") {
			// Fetch Instagram business account insights
			if (!connection.instagramAccountId) {
				console.error(
					"Instagram Account ID missing for connection:",
					connection._id
				);
				return metrics;
			}

			const instagramInsights = await metaApi.getInstagramInsights(
				connection.instagramAccountId
			);
			if (instagramInsights) {
				metrics = {
					...metrics,
					followers: instagramInsights.followers_count || 0,
					following: instagramInsights.following_count || 0,
					totalPosts: instagramInsights.media_count || 0,
					postsThisMonth: instagramInsights.posts_this_month || 0,
					postsThisWeek: instagramInsights.posts_this_week || 0,
					engagementRate: instagramInsights.engagement_rate || 0,
					reach: instagramInsights.reach || 0,
					impressions: instagramInsights.impressions || 0,
					storyViews: instagramInsights.story_views || 0,
					videoViews: instagramInsights.video_views || 0,
					growthRate: instagramInsights.growth_rate || 0,
					responseTime: instagramInsights.response_time || 0,
					contentQuality: instagramInsights.content_quality || "Good",
					lastPostAt: instagramInsights.last_post_at
						? new Date(instagramInsights.last_post_at)
						: undefined,
					bestPerformingPost:
						instagramInsights.best_performing_post || "N/A",
				};
			}
		}

		return metrics;
	} catch (error: unknown) {
		console.error(
			`Error fetching real metrics for ${connection.platform}:`,
			error
		);
		// Return default metrics if API call fails
		return {
			followers: 0,
			totalPosts: 0,
			postsThisMonth: 0,
			postsThisWeek: 0,
			engagementRate: 0,
			reach: 0,
			impressions: 0,
			clickRate: 0,
			apiLimit: connection.platform === "instagram" ? 200 : 300,
			apiUsed: 0,
			growthRate: 0,
			responseTime: 0,
			contentQuality: "Unknown",
		};
	}
}
