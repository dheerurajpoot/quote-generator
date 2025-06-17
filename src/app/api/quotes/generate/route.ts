import { NextResponse } from "next/server";
import { getRandomHindiQuote } from "@/lib/quote-service";
import { generateQuoteImage } from "@/lib/server-image-generator";
import { uploadImage } from "@/lib/image-utils";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { User } from "@/models/user.model";
import { connectDb } from "@/lib/dbconfig";

export async function GET() {
	try {
		// Get user from token
		const cookieStore = await cookies();
		const token = cookieStore.get("token");

		if (!token?.value) {
			return NextResponse.json(
				{ error: "User not authenticated" },
				{ status: 401 }
			);
		}

		// Verify token and get user data
		const decoded = jwt.verify(token.value, process.env.TOKEN_SECRET!) as {
			userId: string;
		};

		// Connect to database
		await connectDb();

		// Get user information
		const user = await User.findById(decoded.userId);
		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

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
			{ error: "Failed to generate quote" },
			{ status: 500 }
		);
	}
}
