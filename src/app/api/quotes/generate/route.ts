import { NextRequest, NextResponse } from "next/server";
import { getRandomQuote } from "@/lib/quote-service";
import { generateQuoteImage } from "@/lib/server-image-generator";
import { uploadImage } from "@/lib/image-utils";
import { User } from "@/models/user.model";
import { connectDb } from "@/lib/dbconfig";
import mongoose from "mongoose";

async function getUserById(userId: string) {
	try {
		// Validate if userId is a valid MongoDB ObjectId
		if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
			console.error("Invalid userId format:", userId);
			return null;
		}

		await connectDb();
		const user = await User.findById(userId);

		if (!user) {
			console.error("User not found for ID:", userId);
			return null;
		}

		return user;
	} catch (error) {
		console.error("Error getting user by ID:", error);
		return null;
	}
}

export async function GET(request: NextRequest) {
	try {
		await connectDb();

		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		// Validate userId parameter
		if (!userId) {
			console.error("UserId parameter is missing");
			return NextResponse.json(
				{ message: "UserId parameter is required" },
				{ status: 400 }
			);
		}

		// Get user with validation
		const user = await getUserById(userId);
		if (!user) {
			console.error("User not found or invalid userId:", userId);
			return NextResponse.json(
				{ message: "Invalid or non-existent user ID" },
				{ status: 404 }
			);
		}

		// Get language parameter from query string
		const language =
			(searchParams.get("language") as "hindi" | "english") || "hindi";

		// Get a random quote based on language
		const quote = await getRandomQuote(language);

		if (!quote || !quote.text) {
			console.error("Failed to get a valid quote");
			return NextResponse.json(
				{ message: "Failed to get a valid quote" },
				{ status: 500 }
			);
		}

		// Generate the image on the server
		let imageUrl;
		try {
			// Use user's author name if available, otherwise use quote's author
			const authorName = user.author || quote.author;
			const imageBuffer = await generateQuoteImage({
				...quote,
				author: authorName,
			});
			// Upload the image to Cloudinary
			imageUrl = await uploadImage(imageBuffer);
		} catch (imageError) {
			console.error("Error generating or uploading image:", imageError);
			// Use a placeholder image if generation or upload fails
			imageUrl = "https://via.placeholder.com/1200x1200?text=Quote+Image";
		}

		return NextResponse.json({
			quote: {
				text: quote.text,
				author: user.author || quote.author,
			},
			imageUrl,
		});
	} catch (error) {
		console.error("Error generating quote:", error);
		return NextResponse.json(
			{ message: "Failed to generate quote" },
			{ status: 500 }
		);
	}
}
