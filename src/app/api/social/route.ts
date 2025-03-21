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
		const { userId, platform, accessToken } = body;

		// Validate input
		if (!userId || !platform || !accessToken) {
			return NextResponse.json(
				{ error: "User ID, platform, and access token are required" },
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
	} catch (error) {
		console.error("Error connecting social account:", error);
		return NextResponse.json(
			{ error: "Failed to connect social account" },
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
