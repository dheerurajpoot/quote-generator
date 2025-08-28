import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/dbconfig";
import { getUserFromToken } from "@/lib/utils";
import { ScheduledPost } from "@/models/scheduledPost.model";
import { SocialConnection } from "@/models/socialConnection.model";

export async function GET(request: NextRequest) {
	try {
		// Get token from cookie
		const token = request.headers
			.get("cookie")
			?.split("; ")
			?.find((row) => row.startsWith("token="))
			?.split("=")[1];

		if (!token) {
			return NextResponse.json(
				{ message: "Authentication required", success: false },
				{ status: 401 }
			);
		}

		// Verify user
		const user = await getUserFromToken(token);
		if (!user) {
			return NextResponse.json(
				{ message: "User not found", success: false },
				{ status: 401 }
			);
		}

		await connectDb();

		// Get platform-specific metrics
		const platformMetrics = await ScheduledPost.aggregate([
			{ $match: { userId: user._id } },
			{ $unwind: "$platforms" },
			{
				$group: {
					_id: "$platforms",
					totalPosts: { $sum: 1 },
					publishedPosts: {
						$sum: {
							$cond: [{ $eq: ["$status", "published"] }, 1, 0],
						},
					},
					scheduledPosts: {
						$sum: {
							$cond: [{ $eq: ["$status", "scheduled"] }, 1, 0],
						},
					},
					draftPosts: {
						$sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
					},
					failedPosts: {
						$sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
					},
					avgEngagement: {
						$avg: { $ifNull: ["$analytics.engagement", 0] },
					},
					avgReach: { $avg: { $ifNull: ["$analytics.reach", 0] } },
					avgLikes: { $avg: { $ifNull: ["$analytics.likes", 0] } },
					avgComments: {
						$avg: { $ifNull: ["$analytics.comments", 0] },
					},
					avgShares: { $avg: { $ifNull: ["$analytics.shares", 0] } },
				},
			},
			{ $sort: { totalPosts: -1 } },
		]);

		// Get social connection details for each platform
		const socialConnections = await SocialConnection.find({
			userId: user._id,
		});

		// Combine metrics with connection details
		const detailedMetrics = platformMetrics.map((metric) => {
			const connection = socialConnections.find(
				(conn) => conn.platform === metric._id
			);
			return {
				platform: metric._id,
				profileName: connection?.profileName || "Unknown",
				status: connection?.status || "disconnected",
				followers: connection?.followers || 0,
				metrics: {
					totalPosts: metric.totalPosts,
					publishedPosts: metric.publishedPosts,
					scheduledPosts: metric.scheduledPosts,
					draftPosts: metric.draftPosts,
					failedPosts: metric.failedPosts,
					avgEngagement: Math.round(metric.avgEngagement || 0),
					avgReach: Math.round(metric.avgReach || 0),
					avgLikes: Math.round(metric.avgLikes || 0),
					avgComments: Math.round(metric.avgComments || 0),
					avgShares: Math.round(metric.avgShares || 0),
				},
			};
		});

		// Calculate overall performance summary
		const totalPosts = detailedMetrics.reduce(
			(sum, platform) => sum + platform.metrics.totalPosts,
			0
		);
		const totalPublished = detailedMetrics.reduce(
			(sum, platform) => sum + platform.metrics.publishedPosts,
			0
		);
		const totalFollowers = detailedMetrics.reduce(
			(sum, platform) => sum + platform.followers,
			0
		);
		const avgEngagement =
			totalPosts > 0
				? Math.round(
						detailedMetrics.reduce(
							(sum, platform) =>
								sum + platform.metrics.avgEngagement,
							0
						) / detailedMetrics.length
				  )
				: 0;

		return NextResponse.json({
			success: true,
			platformMetrics: detailedMetrics,
			summary: {
				totalPosts,
				totalPublished,
				totalFollowers,
				avgEngagement,
				platformCount: detailedMetrics.length,
			},
		});
	} catch (error) {
		console.error("Error fetching platform metrics:", error);
		return NextResponse.json(
			{ message: "Failed to fetch platform metrics", success: false },
			{ status: 500 }
		);
	}
}
