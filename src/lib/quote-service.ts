import axios from "axios";

interface Quote {
	text: string;
	author: string;
	backgroundImage?: string;
	textColor?: string;
	backgroundColor?: string;
	fontFamily?: string;
	fontSize?: number;
	watermark?: string;
}

const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;

export async function getRandomPexelsImage(): Promise<string> {
	try {
		const response = await axios.get("https://api.pexels.com/v1/curated", {
			headers: {
				Authorization: PEXELS_API_KEY,
			},
			params: {
				per_page: 30, // Get 30 images to randomize
			},
		});

		// Select a random image
		const images = response.data.photos;
		if (images.length === 0) throw new Error("No images found");

		const randomImage = images[Math.floor(Math.random() * images.length)];

		return randomImage.src.large; // Return high-quality image URL
	} catch (error) {
		console.error("Error fetching image:", error);
		return "/fallback.jpg"; // Fallback image if API fails
	}
}

export async function getRandomHindiQuote(): Promise<Quote> {
	try {
		// Using a free Hindi quotes API
		const response = await axios.get(
			"https://hindi-quotes.vercel.app/random"
		);

		const image = await getRandomPexelsImage();
		return {
			text: response.data.quote,
			author: response.data.author || "QuoteArt",
			// Default styling
			backgroundImage: `${image}?height=600&width=600`,
			textColor: "#ffffff",
			backgroundColor: "rgba(0, 0, 0, 0.5)",
			fontFamily: "font-sans",
			fontSize: 24,
			watermark: "@quote_art",
		};
	} catch (error) {
		console.error("Error fetching quote:", error);
		// Fallback quotes in case API fails
		const fallbackQuotes: Quote[] = [
			{
				text: "जीवन में सफलता पाने के लिए सबसे पहले खुद पर विश्वास करना जरूरी है।",
				author: "स्वामी विवेकानंद",
				backgroundImage: "/img1.jpg?height=600&width=600",
				textColor: "#ffffff",
				backgroundColor: "rgba(0, 0, 0, 0.5)",
				fontFamily: "font-sans",
				fontSize: 24,
				watermark: "@quote_art",
			},
			{
				text: "कर्म करो, फल की चिंता मत करो।",
				author: "श्री कृष्ण",
				backgroundImage: "/img1.jpg?height=600&width=600",
				textColor: "#ffffff",
				backgroundColor: "rgba(0, 0, 0, 0.5)",
				fontFamily: "font-sans",
				fontSize: 24,
				watermark: "@quote_art",
			},
			{
				text: "जीवन में आगे बढ़ने के लिए साहस की जरूरत होती है।",
				author: "चाणक्य",
				backgroundImage: "/img1.jpg?height=600&width=600",
				textColor: "#ffffff",
				backgroundColor: "rgba(0, 0, 0, 0.5)",
				fontFamily: "font-sans",
				fontSize: 24,
				watermark: "@quote_art",
			},
		];
		return fallbackQuotes[
			Math.floor(Math.random() * fallbackQuotes.length)
		];
	}
}

export async function generateQuoteImage(
	// quote: Quote,
	canvasRef: HTMLDivElement
): Promise<string> {
	try {
		// Generate image using html2canvas
		const html2canvas = (await import("html2canvas")).default;
		const canvas = await html2canvas(canvasRef, {
			allowTaint: true,
			useCORS: true,
			scale: 2,
		});

		// Return the image data URL
		return canvas.toDataURL("image/png");
	} catch (error) {
		console.error("Error generating quote image:", error);
		throw error;
	}
}

export async function postToSocialMedia(
	imageUrl: string,
	quote: Quote
): Promise<void> {
	try {
		// Facebook Graph API
		if (process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN) {
			await axios.post(
				`https://graph.facebook.com/v18.0/${process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID}/photos`,
				{
					url: imageUrl,
					caption: `${quote.text}\n\n— ${quote.author}\n\n${quote.watermark}`,
					access_token: process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN,
				}
			);
		}

		// Instagram Graph API
		if (process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN) {
			// First create a container
			const containerResponse = await axios.post(
				`https://graph.facebook.com/v18.0/${process.env.NEXT_PUBLIC_INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`,
				{
					image_url: imageUrl,
					caption: `${quote.text}\n\n— ${quote.author}\n\n${quote.watermark}`,
					access_token:
						process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN,
				}
			);

			// Then publish the container
			await axios.post(
				`https://graph.facebook.com/v18.0/${process.env.NEXT_PUBLIC_INSTAGRAM_BUSINESS_ACCOUNT_ID}/media_publish`,
				{
					creation_id: containerResponse.data.id,
					access_token:
						process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN,
				}
			);
		}
	} catch (error) {
		console.error("Error posting to social media:", error);
		throw error;
	}
}
