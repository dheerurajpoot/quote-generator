import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/dbconfig";
import { getUserFromToken } from "@/lib/utils";
import { ScheduledPost } from "@/models/scheduledPost.model";
import { SocialConnection } from "@/models/socialConnection.model";
import { AutoPostingCampaign } from "@/models/autoPostingCampaign.model";

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

		const userId = user._id.toString();

		// Get total posts count
		const totalPosts = await ScheduledPost.countDocuments({ userId });

		// Get posts by status
		const postsByStatus = await ScheduledPost.aggregate([
			{ $match: { userId: user._id } },
			{ $group: { _id: "$status", count: { $sum: 1 } } },
		]);

		// Get scheduled posts count for next 7 days
		const nextWeek = new Date();
		nextWeek.setDate(nextWeek.getDate() + 7);
		const scheduledPosts = await ScheduledPost.countDocuments({
			userId: user._id,
			status: "scheduled",
			scheduledAt: { $lte: nextWeek },
		});

		// Get platform distribution
		const platformDistribution = await ScheduledPost.aggregate([
			{ $match: { userId: user._id } },
			{ $unwind: "$platforms" },
			{ $group: { _id: "$platforms", count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
		]);

		// Get weekly engagement data (last 7 days)
		const lastWeek = new Date();
		lastWeek.setDate(lastWeek.getDate() - 7);

		const weeklyData = await ScheduledPost.aggregate([
			{ $match: { userId: user._id, createdAt: { $gte: lastWeek } } },
			{
				$group: {
					_id: {
						$dayOfWeek: "$createdAt",
					},
					posts: { $sum: 1 },
					engagement: {
						$sum: { $ifNull: ["$analytics.engagement", 0] },
					},
				},
			},
			{ $sort: { _id: 1 } },
		]);

		// Get total followers from social connections
		const socialConnections = await SocialConnection.find({
			userId: user._id,
		});
		const totalFollowers = socialConnections.reduce((total, conn) => {
			return total + (conn.followers || 0);
		}, 0);

		// Get auto-posting campaigns count
		const autoPostingCampaigns = await AutoPostingCampaign.countDocuments({
			userId: user._id,
		});

		// Calculate engagement rate
		const totalEngagement = postsByStatus
			.filter((stat) => stat._id === "published")
			.reduce((total, stat) => total + stat.count, 0);

		const engagementRate =
			totalPosts > 0
				? ((totalEngagement / totalPosts) * 100).toFixed(1)
				: "0";

		// Format weekly data for charts
		const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		const formattedWeeklyData = daysOfWeek.map((day, index) => {
			// MongoDB $dayOfWeek returns 1-7 where 1=Sunday, so we need to map accordingly
			const dayNumber = index + 1; // Map Sun=1, Mon=2, Tue=3, etc.
			const dayData = weeklyData.find((d) => d._id === dayNumber);
			return {
				name: day,
				posts: dayData?.posts || 0,
				engagement: dayData?.engagement || 0,
			};
		});

		// Format platform data for pie chart
		const formattedPlatformData = platformDistribution.map((platform) => {
			const colors = {
				facebook: "#1877F2",
				instagram: "#E1306C",
				twitter: "#1DA1F2",
				linkedin: "#0A66C2",
			};

			return {
				name:
					platform._id.charAt(0).toUpperCase() +
					platform._id.slice(1),
				value: platform.count,
				color: colors[platform._id as keyof typeof colors] || "#666",
			};
		});

		return NextResponse.json({
			success: true,
			stats: {
				totalPosts,
				scheduledPosts,
				totalFollowers,
				engagementRate: parseFloat(engagementRate),
				autoPostingCampaigns,
			},
			charts: {
				weeklyData: formattedWeeklyData,
				platformData: formattedPlatformData,
			},
		});
	} catch (error) {
		console.error("Error fetching dashboard stats:", error);
		return NextResponse.json(
			{ message: "Failed to fetch dashboard stats", success: false },
			{ status: 500 }
		);
	}
}
