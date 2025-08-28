import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/dbconfig";
import { ScheduledPost } from "@/models/scheduledPost.model";
import { getUserFromToken } from "@/lib/utils";
import mongoose from "mongoose";

// POST - Publish a post immediately
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	try {
		const { userId } = await params;
		const { postId } = await request.json();

		// Get token from cookie
		const token = request.headers
			.get("cookie")
			?.split("; ")
			?.find((row) => row.startsWith("token="))
			?.split("=")[1];

		if (!token) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		// Verify user
		const user = await getUserFromToken(token);
		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 401 }
			);
		}

		// Check if user owns this data
		if (user._id.toString() !== userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 403 }
			);
		}

		await connectDb();

		const post = await ScheduledPost.findOne({
			_id: postId,
			userId: new mongoose.Types.ObjectId(userId),
		});

		if (!post) {
			return NextResponse.json(
				{ error: "Post not found" },
				{ status: 404 }
			);
		}

		// Check if post can be published
		if (post.status === "published") {
			return NextResponse.json(
				{ error: "Post is already published" },
				{ status: 400 }
			);
		}

		// TODO: Implement actual social media publishing logic
		// For now, just mark as published
		post.status = "published";
		post.publishedDate = new Date();
		post.publishedPlatforms = post.platforms;
		post.lastModifiedBy = user._id;

		await post.save();

		return NextResponse.json({
			success: true,
			post,
			message: "Post published successfully",
		});
	} catch (error) {
		console.error("Error publishing post:", error);
		return NextResponse.json(
			{ error: "Failed to publish post" },
			{ status: 500 }
		);
	}
}
