import { NextResponse } from "next/server";
import { getRandomHindiQuote } from "@/lib/quote-service";
import { generateQuoteImage } from "@/lib/server-image-generator";
import { uploadImage } from "@/lib/image-utils";

export async function GET() {
	try {
		// Get a random quote
		const quote = await getRandomHindiQuote();

		// Generate the image on the server
		const imageBuffer = await generateQuoteImage(quote);

		// Upload the image to Cloudinary
		const imageUrl = await uploadImage(imageBuffer);

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
