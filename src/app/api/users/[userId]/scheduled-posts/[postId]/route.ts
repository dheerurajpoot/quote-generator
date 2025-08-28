import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/dbconfig";
import { ScheduledPost } from "@/models/scheduledPost.model";
import { getUserFromToken } from "@/lib/utils";
import mongoose from "mongoose";

// GET - Get a specific scheduled post
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string; postId: string }> }
) {
	try {
		const { userId, postId } = await params;

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

		return NextResponse.json({
			success: true,
			post,
		});
	} catch (error) {
		console.error("Error fetching scheduled post:", error);
		return NextResponse.json(
			{ error: "Failed to fetch post" },
			{ status: 500 }
		);
	}
}

// PUT - Update a scheduled post
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string; postId: string }> }
) {
	try {
		const { userId, postId } = await params;
		const body = await request.json();

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

		// Don't allow editing published posts
		if (post.status === "published") {
			return NextResponse.json(
				{ error: "Cannot edit published posts" },
				{ status: 400 }
			);
		}

		// If changing to scheduled status, validate date and time
		if (body.status === "scheduled") {
			if (!body.scheduledDate || !body.scheduledTime) {
				return NextResponse.json(
					{ error: "Scheduled posts require both date and time" },
					{ status: 400 }
				);
			}

			// Check if scheduled date is in the future
			const scheduledDate = new Date(body.scheduledDate);
			const scheduledTime = body.scheduledTime;
			const [hours, minutes] = scheduledTime.split(":").map(Number);
			scheduledDate.setHours(hours, minutes, 0, 0);

			if (scheduledDate <= new Date()) {
				return NextResponse.json(
					{ error: "Scheduled date must be in the future" },
					{ status: 400 }
				);
			}
		}

		// Update post
		Object.assign(post, {
			...body,
			lastModifiedBy: user._id,
		});

		await post.save();

		return NextResponse.json({
			success: true,
			post,
			message: "Post updated successfully",
		});
	} catch (error) {
		console.error("Error updating scheduled post:", error);
		return NextResponse.json(
			{ error: "Failed to update post" },
			{ status: 500 }
		);
	}
}

// DELETE - Delete a scheduled post
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string; postId: string }> }
) {
	try {
		const { userId, postId } = await params;

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

		const deletedPost = await ScheduledPost.findOneAndDelete({
			_id: postId,
			userId: new mongoose.Types.ObjectId(userId),
		});

		if (!deletedPost) {
			return NextResponse.json(
				{ error: "Post not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			message: "Post deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting scheduled post:", error);
		return NextResponse.json(
			{ error: "Failed to delete post" },
			{ status: 500 }
		);
	}
}

// PATCH - Update post status
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string; postId: string }> }
) {
	try {
		const { userId, postId } = await params;
		const { status } = await request.json();

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

		// Update status
		post.status = status;
		post.lastModifiedBy = user._id;

		// If changing to scheduled, validate date and time
		if (status === "scheduled") {
			if (!post.scheduledDate || !post.scheduledTime) {
				return NextResponse.json(
					{ error: "Cannot schedule post without date and time" },
					{ status: 400 }
				);
			}

			// Check if scheduled date is in the future
			const scheduledDate = new Date(post.scheduledDate);
			const scheduledTime = post.scheduledTime;
			const [hours, minutes] = scheduledTime.split(":").map(Number);
			scheduledDate.setHours(hours, minutes, 0, 0);

			if (scheduledDate <= new Date()) {
				return NextResponse.json(
					{ error: "Scheduled date must be in the future" },
					{ status: 400 }
				);
			}
		}

		await post.save();

		return NextResponse.json({
			success: true,
			post,
			message: `Post ${status} successfully`,
		});
	} catch (error) {
		console.error("Error updating post status:", error);
		return NextResponse.json(
			{ error: "Failed to update post status" },
			{ status: 500 }
		);
	}
}
