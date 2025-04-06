import { AutoPostingSettings } from "@/models/autoPostingSettings.model";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDb } from "@/lib/dbconfig";
import { getRandomHindiQuote } from "@/lib/quote-service";
import { SocialConnection } from "@/models/socialConnection.model";
import { MetaApi } from "@/lib/meta-api";
import { uploadImage } from "@/lib/image-utils";
import { generateQuoteImage } from "@/lib/server-image-generator";

interface AutoPostingSettingsDocument {
	_id: mongoose.Types.ObjectId;
	userId: mongoose.Types.ObjectId;
	isEnabled: boolean;
	interval: number;
	platforms: string[];
	lastPostTime: Date | null;
}

// This function will be called by the cron job
export async function GET(request: Request) {
	try {
		await connectDb();

		// Get the userId from the query parameters
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		// If userId is provided, only process that user's auto-posting
		if (userId) {
			const setting = await AutoPostingSettings.findOne({
				userId: new mongoose.Types.ObjectId(userId),
				isEnabled: true,
			});

			if (!setting) {
				return NextResponse.json({
					success: false,
					message: "No auto-posting settings found for this user",
				});
			}

			const result = await processUserAutoPosting(
				setting as AutoPostingSettingsDocument
			);
			return NextResponse.json({
				success: true,
				result,
			});
		}

		// If no userId is provided, process all users' auto-posting
		const settings = await AutoPostingSettings.find({ isEnabled: true });

		if (!settings || settings.length === 0) {
			return NextResponse.json({
				success: false,
				message: "No auto-posting settings found",
			});
		}

		const results = [];

		// Process each user's auto-posting settings
		for (const setting of settings) {
			try {
				const result = await processUserAutoPosting(
					setting as AutoPostingSettingsDocument
				);
				results.push(result);
			} catch (error) {
				console.error(
					`Error processing auto-posting for user ${setting.userId}:`,
					error
				);
				results.push({
					userId: setting.userId.toString(),
					success: false,
					error:
						error instanceof Error
							? error.message
							: "Unknown error",
				});
			}
		}

		return NextResponse.json({
			success: true,
			message: "Auto-posting completed",
			results,
		});
	} catch (error) {
		console.error("Error in auto-posting cron job:", error);
		return NextResponse.json(
			{
				success: false,
				error: "An error occurred during auto-posting",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

// Helper function to process a single user's auto-posting
async function processUserAutoPosting(setting: AutoPostingSettingsDocument) {
	const userId = setting.userId.toString();

	try {
		// Get the user's social connections for the selected platforms
		const connections = await SocialConnection.find({
			userId: new mongoose.Types.ObjectId(userId),
			platform: { $in: setting.platforms },
		});

		if (!connections || connections.length === 0) {
			console.log(`No social connections found for user ${userId}`);
			return {
				userId,
				success: false,
				error: "No social connections found",
			};
		}

		// Fetch a random quote
		const quote = await getRandomHindiQuote();

		// Generate the quote image
		const quoteImageBuffer = await generateQuoteImage(quote);

		// Upload the generated image to Cloudinary
		const cloudinaryUrl = await uploadImage(quoteImageBuffer);

		// Generate a caption
		const caption = `${quote.text}\n\n— ${quote.author}`;

		const results = [];

		// Post to each platform
		for (const connection of connections) {
			try {
				// Initialize Meta API with the connection's access token
				const metaApi = new MetaApi({
					accessToken:
						connection.platform === "instagram"
							? connection.pageAccessToken
							: connection.accessToken,
				});

				// Post to the appropriate platform
				let result;
				if (connection.platform === "facebook") {
					result = await metaApi.postToFacebook(
						connection.profileId,
						connection.accessToken,
						cloudinaryUrl,
						caption
					);
				} else if (connection.platform === "instagram") {
					result = await metaApi.postToInstagram(
						connection.instagramAccountId || connection.profileId,
						connection.pageAccessToken || connection.accessToken,
						cloudinaryUrl,
						caption
					);
				}

				results.push({
					platform: connection.platform,
					success: true,
					url: result?.url,
				});
			} catch (error) {
				console.error(
					`Error posting to ${connection.platform} for user ${userId}:`,
					error
				);
				results.push({
					platform: connection.platform,
					success: false,
					error:
						error instanceof Error
							? error.message
							: "Unknown error",
				});
			}
		}

		return {
			userId,
			success: true,
			results,
		};
	} catch (error) {
		console.error(
			`Error in processUserAutoPosting for user ${userId}:`,
			error
		);
		return {
			userId,
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
