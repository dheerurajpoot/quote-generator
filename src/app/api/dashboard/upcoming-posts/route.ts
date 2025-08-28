import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/dbconfig";
import { getUserFromToken } from "@/lib/utils";
import { ScheduledPost } from "@/models/scheduledPost.model";

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

		// Get upcoming posts (scheduled and draft) for next 7 days
		const nextWeek = new Date();
		nextWeek.setDate(nextWeek.getDate() + 7);

		const upcomingPosts = await ScheduledPost.find({
			userId: user._id,
			$or: [
				{ status: "scheduled", scheduledAt: { $lte: nextWeek } },
				{ status: "draft" },
			],
		})
			.sort({ scheduledAt: 1, createdAt: -1 })
			.limit(10)
			.select("title platforms status scheduledAt postType createdAt");

		// Format posts for display
		const formattedPosts = upcomingPosts.map((post) => ({
			id: post._id,
			title: post.title,
			platform: post.platforms[0] || "Unknown", // Show first platform
			scheduledTime: post.scheduledAt || post.createdAt,
			status: post.status,
			type: post.postType,
			platforms: post.platforms,
		}));

		return NextResponse.json({
			success: true,
			posts: formattedPosts,
		});
	} catch (error) {
		console.error("Error fetching upcoming posts:", error);
		return NextResponse.json(
			{ message: "Failed to fetch upcoming posts", success: false },
			{ status: 500 }
		);
	}
}
