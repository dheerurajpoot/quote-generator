import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDb } from "@/lib/dbconfig";
import { User } from "@/models/user.model";
import { MetaApi } from "@/lib/meta-api";
import { SocialConnection } from "@/models/socialConnection.model";

export async function POST(request: Request) {
	try {
		await connectDb();

		const body = await request.json();
		const { userId, platform, accessToken, imageUrl, caption } = body;

		// Validate input
		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}

		// Check if user exists
		const user = await User.findById(userId);
		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		// If this is a social media connection request
		if (platform && accessToken) {
			// Initialize Meta API
			const metaApi = new MetaApi({ accessToken });

			// Get user profile
			const profile = await metaApi.getUserProfile();

			// Check for existing connection
			const existingConnection = await SocialConnection.findOne({
				userId: new mongoose.Types.ObjectId(userId),
				platform,
				profileId: profile.id,
			});

			if (existingConnection) {
				// Update existing connection
				existingConnection.accessToken = accessToken;
				existingConnection.profileName = profile.name;
				existingConnection.profileImage = profile.picture?.data?.url;
				existingConnection.updatedAt = new Date();
				await existingConnection.save();

				return NextResponse.json({
					id: existingConnection._id,
					platform: existingConnection.platform,
					profileId: existingConnection.profileId,
					profileName: existingConnection.profileName,
					profileImage: existingConnection.profileImage,
					connected: true,
				});
			}

			// Create new connection
			const newConnection = await SocialConnection.create({
				userId: new mongoose.Types.ObjectId(userId),
				platform,
				accessToken,
				profileId: profile.id,
				profileName: profile.name,
				profileImage: profile.picture?.data?.url,
			});

			return NextResponse.json(
				{
					id: newConnection._id,
					platform: newConnection.platform,
					profileId: newConnection.profileId,
					profileName: newConnection.profileName,
					profileImage: newConnection.profileImage,
					connected: true,
				},
				{ status: 201 }
			);
		}

		// If this is a social media post request
		if (platform && imageUrl && caption) {
			// Get the user's social connection for the platform
			const connection = await SocialConnection.findOne({
				userId: new mongoose.Types.ObjectId(userId),
				platform,
			});

			if (!connection) {
				return NextResponse.json(
					{ error: `No ${platform} connection found` },
					{ status: 400 }
				);
			}

			// Initialize Meta API with the connection's access token
			const metaApi = new MetaApi({
				accessToken: connection.accessToken,
			});

			// Post to the appropriate platform
			let result;
			if (platform === "facebook") {
				result = await metaApi.postToFacebook(
					connection.profileId,
					connection.accessToken,
					imageUrl,
					caption
				);
			} else if (platform === "instagram") {
				result = await metaApi.postToInstagram(
					connection.profileId,
					connection.accessToken,
					imageUrl,
					caption
				);
			} else {
				return NextResponse.json(
					{ error: "Unsupported platform" },
					{ status: 400 }
				);
			}

			return NextResponse.json({
				success: true,
				platforms: {
					[platform]: {
						success: true,
						url: result.url,
					},
				},
			});
		}

		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	} catch (error) {
		console.error("Error in social API:", error);
		return NextResponse.json(
			{ error: "An error occurred" },
			{ status: 500 }
		);
	}
}

export async function DELETE(request: Request) {
	try {
		await connectDb();

		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");
		const platform = searchParams.get("platform");

		if (!userId || !platform) {
			return NextResponse.json(
				{ error: "User ID and platform are required" },
				{ status: 400 }
			);
		}

		// Delete connection
		await SocialConnection.deleteOne({
			userId: new mongoose.Types.ObjectId(userId),
			platform,
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error disconnecting social account:", error);
		return NextResponse.json(
			{ error: "Failed to disconnect social account" },
			{ status: 500 }
		);
	}
}

export async function GET(request: Request) {
	try {
		await connectDb();

		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}

		// Fetch all social connections for the user
		const connections = await SocialConnection.find({
			userId: new mongoose.Types.ObjectId(userId),
		});

		return NextResponse.json(connections);
	} catch (error) {
		console.error("Error fetching social connections:", error);
		return NextResponse.json(
			{ error: "Failed to fetch social connections" },
			{ status: 500 }
		);
	}
}
