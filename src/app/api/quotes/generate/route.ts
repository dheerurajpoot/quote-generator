import { NextRequest, NextResponse } from "next/server";
import { getRandomHindiQuote } from "@/lib/quote-service";
import { generateQuoteImage } from "@/lib/server-image-generator";
import { uploadImage } from "@/lib/image-utils";
import { User } from "@/models/user.model";
import { connectDb } from "@/lib/dbconfig";

async function getUserById(userId: string) {
	try {
		await connectDb();
		const user = await User.findById(userId);
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

		if (!userId) {
			return NextResponse.json(
				{ error: "UserId not found" },
				{ status: 500 }
			);
		}
		const user = await getUserById(userId);

		// Get a random quote
		const quote = await getRandomHindiQuote();

		if (!quote || !quote.text) {
			console.error("Failed to get a valid quote");
			return NextResponse.json(
				{ error: "Failed to get a valid quote" },
				{ status: 500 }
			);
		}

		// Generate the image on the server
		let imageUrl;
		try {
			// Use user's author name if available, otherwise use quote's author
			const authorName = user?.author || quote.author;
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
				author: user?.author || quote.author,
			},
			imageUrl,
		});
	} catch (error) {
		console.error("Error generating quote:", error);
		return NextResponse.json(
			{ error: "Failed to generate quote" },
			{ status: 500 }
		);
	}
}
