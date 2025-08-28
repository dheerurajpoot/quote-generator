import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/dbconfig";
import { ScheduledPost } from "@/models/scheduledPost.model";
import { getUserFromToken } from "@/lib/utils";
import mongoose from "mongoose";
import { uploadImage, uploadVideo } from "@/lib/image-utils";
import { User } from "@/models/user.model";

// Define the query interface for MongoDB queries
interface ScheduledPostQuery {
	userId: mongoose.Types.ObjectId;
	status?: string;
	platforms?: string;
	$or?: Array<{
		title?: { $regex: string; $options: string };
		content?: { $regex: string; $options: string };
	}>;
	scheduledAt?: {
		$gte: Date;
		$lt: Date;
	};
}

// GET - Fetch all scheduled posts for a user
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	try {
		const { userId } = await params;
		const { searchParams } = new URL(request.url);

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

		// Check if user owns this data
		if (user._id.toString() !== userId) {
			return NextResponse.json(
				{ message: "Unauthorized", success: false },
				{ status: 403 }
			);
		}

		await connectDb();

		// Build query based on filters
		const query: ScheduledPostQuery = {
			userId: new mongoose.Types.ObjectId(userId),
		};

		const status = searchParams.get("status");
		const platform = searchParams.get("platform");
		const search = searchParams.get("search");
		const date = searchParams.get("date");

		if (status && status !== "all") {
			query.status = status;
		}

		if (platform && platform !== "all") {
			query.platforms = platform;
		}

		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ content: { $regex: search, $options: "i" } },
			];
		}

		if (date) {
			const startDate = new Date(date);
			const endDate = new Date(startDate);
			endDate.setDate(endDate.getDate() + 1);
			query.scheduledAt = {
				$gte: startDate,
				$lt: endDate,
			};
		}

		// Get user's scheduled posts
		const posts = await ScheduledPost.find(query).sort({
			scheduledAt: 1,
			createdAt: -1,
		});

		return NextResponse.json({
			success: true,
			posts,
		});
	} catch (error: unknown) {
		console.error("Error fetching scheduled posts:", error);
		return NextResponse.json(
			{ message: "Failed to fetch posts", success: false },
			{ status: 500 }
		);
	}
}

// POST - Create a new scheduled post
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	try {
		const { userId } = await params;
		const body = await request.json();

		// Verify user
		const user = await User.findById(userId);
		if (!user) {
			return NextResponse.json(
				{ message: "User not found", success: false },
				{ status: 401 }
			);
		}

		// Check if user owns this data
		if (user._id.toString() !== userId) {
			return NextResponse.json(
				{ message: "Unauthorized", success: false },
				{ status: 403 }
			);
		}

		await connectDb();

		// Validate required fields
		const requiredFields = ["title", "content", "postType", "platforms"];
		for (const field of requiredFields) {
			if (!body[field]) {
				return NextResponse.json(
					{
						message: `Missing required field: ${field}`,
						success: false,
					},
					{ status: 400 }
				);
			}
		}

		// Validate platforms
		const validPlatforms = ["facebook", "instagram", "twitter", "linkedin"];
		for (const platform of body.platforms) {
			if (!validPlatforms.includes(platform)) {
				return NextResponse.json(
					{
						message: `Invalid platform: ${platform}`,
						success: false,
					},
					{ status: 400 }
				);
			}
		}

		// Handle file uploads to Cloudinary if present
		let mediaFiles: string[] = [];
		if (body.mediaFiles && body.mediaFiles.length > 0) {
			try {
				// Upload each file to Cloudinary based on post type
				const uploadPromises = body.mediaFiles.map(
					async (file: string | File) => {
						if (typeof file === "string") {
							if (file.startsWith("data:")) {
								// Base64 data URL - use appropriate upload function
								if (body.postType === "video") {
									return await uploadVideo(file);
								} else {
									return await uploadImage(file);
								}
							} else if (file.startsWith("http")) {
								// Already a URL, return as is
								return file;
							} else {
								// File path or other string format
								if (body.postType === "video") {
									return await uploadVideo(file);
								} else {
									return await uploadImage(file);
								}
							}
						} else {
							// File object - convert to Buffer
							const arrayBuffer = await file.arrayBuffer();
							const buffer = Buffer.from(arrayBuffer);
							if (body.postType === "video") {
								return await uploadVideo(buffer);
							} else {
								return await uploadImage(buffer);
							}
						}
					}
				);

				mediaFiles = await Promise.all(uploadPromises);
			} catch (uploadError) {
				console.error(
					"Error uploading files to Cloudinary:",
					uploadError
				);
				return NextResponse.json(
					{
						message: "Failed to upload media files",
						success: false,
					},
					{ status: 500 }
				);
			}
		}

		// If scheduling, validate and create scheduledAt datetime
		let scheduledAt: Date | undefined;
		if (body.status === "scheduled") {
			if (!body.scheduledDate || !body.scheduledTime) {
				return NextResponse.json(
					{
						message: "Scheduled posts require both date and time",
						success: false,
					},
					{ status: 400 }
				);
			}

			// Combine date and time into single datetime
			const scheduledDate = new Date(body.scheduledDate);
			const scheduledTime = body.scheduledTime;
			const [hours, minutes] = scheduledTime.split(":").map(Number);
			scheduledDate.setHours(hours, minutes, 0, 0);

			// Check if scheduled datetime is in the future
			if (scheduledDate <= new Date()) {
				return NextResponse.json(
					{
						message: "Scheduled datetime must be in the future",
						success: false,
					},
					{ status: 400 }
				);
			}

			scheduledAt = scheduledDate;
		} else if (body.status === "published") {
			scheduledAt = new Date(new Date().getTime() + 1 * 60 * 1000);
		}

		// Create post with new structure
		const post = new ScheduledPost({
			...body,
			userId: new mongoose.Types.ObjectId(userId),
			lastModifiedBy: user._id,
			mediaFiles,
			status: "scheduled",
			scheduledAt,
		});

		await post.save();

		return NextResponse.json(
			{
				success: true,
				post,
				message: "Post created successfully",
			},
			{ status: 201 }
		);
	} catch (error: unknown) {
		console.error("Error creating scheduled post:", error);
		return NextResponse.json(
			{ message: "Failed to create post", success: false },
			{ status: 500 }
		);
	}
}
