import { NextResponse } from "next/server";
import { getRandomHindiQuote } from "@/lib/quote-service";
import { generateQuoteImage } from "@/lib/server-image-generator";
import { uploadImage } from "@/lib/image-utils";

export async function GET() {
	try {
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
				author: quote.author,
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
