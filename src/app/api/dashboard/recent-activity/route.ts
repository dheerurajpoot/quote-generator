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

		// Get recent posts (last 10)
		const recentPosts = await ScheduledPost.find({ userId: user._id })
			.sort({ createdAt: -1 })
			.limit(10)
			.select("title status postType platforms createdAt scheduledAt");

		// Get recent social connections
		const recentConnections = await SocialConnection.find({
			userId: user._id,
		})
			.sort({ createdAt: -1 })
			.limit(5)
			.select("platform profileName status createdAt");

		// Format recent posts
		const formattedPosts = recentPosts.map((post) => ({
			id: post._id,
			type: "post",
			title: post.title,
			status: post.status,
			postType: post.postType,
			platforms: post.platforms,
			timestamp: post.createdAt,
			scheduledAt: post.scheduledAt,
		}));

		// Format recent connections
		const formattedConnections = recentConnections.map((conn) => ({
			id: conn._id,
			type: "connection",
			platform: conn.platform,
			profileName: conn.profileName,
			status: conn.status,
			timestamp: conn.createdAt,
		}));

		// Combine and sort by timestamp
		const allActivities = [...formattedPosts, ...formattedConnections]
			.sort(
				(a, b) =>
					new Date(b.timestamp).getTime() -
					new Date(a.timestamp).getTime()
			)
			.slice(0, 15);

		return NextResponse.json({
			success: true,
			activities: allActivities,
		});
	} catch (error) {
		console.error("Error fetching recent activity:", error);
		return NextResponse.json(
			{ message: "Failed to fetch recent activity", success: false },
			{ status: 500 }
		);
	}
}
