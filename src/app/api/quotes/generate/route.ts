import { NextResponse, NextRequest } from "next/server";
import { getRandomHindiQuote } from "@/lib/quote-service";
import { generateQuoteImage } from "@/lib/server-image-generator";
import { uploadImage } from "@/lib/image-utils";
import { connectDb } from "@/lib/dbconfig";
import { User } from "@/models/user.model";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get("token")?.value;
		if (!token) {
			return NextResponse.json(
				{
					error: "Authentication required",
				},
				{ status: 401 }
			);
		}
		const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET!) as {
			userId: string;
		};
		// Connect to MongoDB
		await connectDb();

		// Get user's author name
		const user = await User.findById(decodedToken.userId);
		if (!user) {
			return NextResponse.json(
				{
					error: "User not found",
				},
				{ status: 404 }
			);
		}

		// Get a random quote
		const newquote = await getRandomHindiQuote();
		newquote.author = user.author;
		const quote = newquote;

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
			const imageBuffer = await generateQuoteImage(quote);
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
				author: user.author,
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
