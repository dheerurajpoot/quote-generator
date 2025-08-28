import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { User } from "@/models/user.model";
import { MetaApi } from "@/lib/meta-api";
import { SocialConnection } from "@/models/socialConnection.model";
import { connectDb } from "@/lib/dbconfig";

export async function POST(request: Request) {
	try {
		await connectDb();

		const body = await request.json();
		const {
			userId,
			platform,
			accessToken,
			imageUrl,
			caption,
			instagramAccountId,
			pageAccessToken,
		} = body;

		// Validate input
		if (!userId) {
			return NextResponse.json(
				{ message: "User ID is required", success: false },
				{ status: 400 }
			);
		}

		// Check if user exists
		const user = await User.findById(userId);
		if (!user) {
			return NextResponse.json(
				{ message: "User not found", success: false },
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
			});

			const connectionData = {
				accessToken,
				profileId:
					platform === "instagram" ? instagramAccountId : profile.id,
				profileName: body.profileName || profile.name,
				profileImage: body.profileImage || profile.picture?.data?.url,
				pageAccessToken:
					platform === "instagram" ? pageAccessToken : accessToken,
				instagramAccountId:
					platform === "instagram" ? instagramAccountId : undefined,
				updatedAt: new Date(),
			};

			if (existingConnection) {
				// Update existing connection
				Object.assign(existingConnection, connectionData);
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
				...connectionData,
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
			// Validate image URL
			try {
				const url = new URL(imageUrl);
				// Ensure the URL is using HTTPS
				const cleanImageUrl = url
					.toString()
					.replace("http://", "https://");

				// Get the user's social connection for the platform
				const connection = await SocialConnection.findOne({
					userId: new mongoose.Types.ObjectId(userId),
					platform,
				});

				if (!connection) {
					console.log(
						`No ${platform} connection found for user ${userId}`
					);
					return NextResponse.json(
						{ message: `No ${platform} connection found` },
						{ status: 400 }
					);
				}

				// Initialize Meta API with the connection's access token
				const metaApi = new MetaApi({
					accessToken:
						platform === "instagram"
							? connection.pageAccessToken
							: connection.accessToken,
				});

				// Post to the appropriate platform
				let result;
				try {
					if (platform === "facebook") {
						result = await metaApi.postToFacebook(
							connection.profileId,
							connection.pageAccessToken ||
								connection.accessToken,
							cleanImageUrl,
							caption
						);
					} else if (platform === "instagram") {
						result = await metaApi.postToInstagram(
							connection.instagramAccountId ||
								connection.profileId,
							connection.pageAccessToken ||
								connection.accessToken,
							cleanImageUrl,
							caption
						);
					} else {
						return NextResponse.json(
							{
								message: "Unsupported platform",
								success: false,
							},
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
				} catch (error) {
					console.error(`Error posting to ${platform}:`, error);
					return NextResponse.json(
						{
							message:
								error instanceof Error
									? error.message
									: `Failed to post to ${platform}`,
							details: error,
						},
						{ status: 500 }
					);
				}
			} catch (e) {
				console.error("Invalid image URL:", e);
				return NextResponse.json(
					{
						message: "Invalid image URL provided",
						success: false,
						details:
							e instanceof Error ? e.message : "Unknown error",
					},
					{ status: 400 }
				);
			}
		}

		return NextResponse.json(
			{ message: "Invalid request", success: false },
			{ status: 400 }
		);
	} catch (error) {
		console.error("Error in social API:", error);
		return NextResponse.json(
			{ message: "An error occurred", success: false },
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
				{
					message: "User ID and platform are required",
					success: false,
				},
				{ status: 400 }
			);
		}

		// Find the connection first to verify it exists
		const connection = await SocialConnection.findOne({
			userId: new mongoose.Types.ObjectId(userId),
			platform,
		});

		if (!connection) {
			return NextResponse.json(
				{ message: "No connection found to delete", success: false },
				{ status: 404 }
			);
		}

		// Delete connection
		const result = await SocialConnection.deleteOne({
			userId: new mongoose.Types.ObjectId(userId),
			platform,
		});

		if (result.deletedCount === 0) {
			return NextResponse.json(
				{ message: "Failed to delete connection", success: false },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			message: `Successfully disconnected ${platform} account`,
		});
	} catch (error) {
		console.error("Error disconnecting social account:", error);
		return NextResponse.json(
			{ message: "Failed to disconnect social account", success: false },
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
				{ message: "User ID is required", success: false },
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
			{ message: "Failed to fetch social connections", success: false },
			{ status: 500 }
		);
	}
}
