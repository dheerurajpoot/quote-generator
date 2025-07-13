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

interface SocialMediaResponse {
	data: {
		success: boolean;
	};
}

const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;

export async function getRandomPexelsImage(): Promise<string> {
	try {
		const response = await axios.get("https://api.pexels.com/v1/curated", {
			headers: {
				Authorization: PEXELS_API_KEY,
			},
			params: {
				per_page: 500,
			},
		});

		// Select a random image
		const images = response.data.photos;
		if (images.length === 0) throw new Error("No images found");

		const randomImage = images[Math.floor(Math.random() * images.length)];

		return randomImage.src.large; // Return high-quality image URL
	} catch (error) {
		console.error("Error fetching image:", error);
		return "/img1.jpg"; // Fallback image if API fails
	}
}

export async function getRandomHindiQuote(): Promise<Quote> {
	try {
		// Using a free Hindi quotes API
		const response = await axios.get(
			"https://hindi-quotes.vercel.app/random"
		);

		// Check if the response has the expected format
		if (!response.data || !response.data.quote) {
			console.error("Unexpected API response format:", response.data);
			throw new Error("Unexpected API response format");
		}

		// Get a background image
		let image = "/img1.jpg";
		try {
			image = await getRandomPexelsImage();
		} catch (imageError) {
			console.error("Error fetching Pexels image:", imageError);
		}

		return {
			text: response.data.quote,
			author: "QuoteArt",
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

export async function getRandomQuote(
	language: "hindi" | "english" = "hindi"
): Promise<Quote> {
	if (language === "english") {
		return getRandomEnglishQuote();
	} else {
		return getRandomHindiQuote();
	}
}

export async function getRandomEnglishQuote(): Promise<Quote> {
	try {
		// Using a free English quotes API
		const response = await axios.get(
			"https://quotes-api-self.vercel.app/quote"
		);

		// Check if the response has the expected format
		if (!response.data || !response.data.quote) {
			console.error("Unexpected API response format:", response.data);
			throw new Error("Unexpected API response format");
		}

		// Get a background image
		let image = "/img1.jpg";
		try {
			image = await getRandomPexelsImage();
		} catch (imageError) {
			console.error("Error fetching Pexels image:", imageError);
		}

		return {
			text: response.data.quote,
			author: "QuoteArt",
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
				text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
				author: "Winston Churchill",
				backgroundImage: "/img1.jpg?height=600&width=600",
				textColor: "#ffffff",
				backgroundColor: "rgba(0, 0, 0, 0.5)",
				fontFamily: "font-sans",
				fontSize: 24,
				watermark: "@quote_art",
			},
			{
				text: "The only way to do great work is to love what you do.",
				author: "Steve Jobs",
				backgroundImage: "/img1.jpg?height=600&width=600",
				textColor: "#ffffff",
				backgroundColor: "rgba(0, 0, 0, 0.5)",
				fontFamily: "font-sans",
				fontSize: 24,
				watermark: "@quote_art",
			},
			{
				text: "Life is what happens when you're busy making other plans.",
				author: "John Lennon",
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

export async function postToSocialMedia(
	imageUrl: string | undefined,
	userId: string | undefined,
	platform: string,
	caption: string
): Promise<SocialMediaResponse> {
	try {
		if (!userId) {
			throw new Error("User ID is required to post to social media");
		}

		if (!imageUrl) {
			throw new Error("Image URL is required to post to social media");
		}

		const response = await axios.post("/api/social", {
			userId,
			imageUrl,
			platform,
			caption,
		});
		return response;
	} catch (error) {
		console.error("Error posting to social media:", error);
		throw error;
	}
}
