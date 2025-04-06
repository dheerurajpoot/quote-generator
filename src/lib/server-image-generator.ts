import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";
import axios from "axios";
import fs from "fs/promises";

// Register Hindi font from node_modules
const fontPath = path.join(
	process.cwd(),
	"node_modules/@fontsource/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-900-normal.woff"
);
registerFont(fontPath, {
	family: "NotoSansDevanagari",
	weight: "900",
});

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

async function loadImageFromUrl(url: string): Promise<Buffer> {
	try {
		const response = await axios.get(url, {
			responseType: "arraybuffer",
		});
		return Buffer.from(response.data);
	} catch (error) {
		console.error("Error loading image from URL:", error);
		// Return default image if URL loading fails
		const defaultImagePath = path.join(process.cwd(), "public", "img1.jpg");
		return fs.readFile(defaultImagePath);
	}
}

// Helper function to intelligently break text
function smartTextBreak(text: string): string[] {
	// First, try to break at commas, semicolons, or other natural break points
	const breakPoints = /[,;।]/;
	if (breakPoints.test(text)) {
		return text
			.split(breakPoints)
			.map((part) => part.trim())
			.filter((part) => part.length > 0);
	}

	// If no natural break points, break at a reasonable length
	const words = text.split(" ");
	const lines = [];
	let currentLine = words[0];
	let currentLength = currentLine.length;
	const targetLength = 30; // Adjust this value based on your needs

	for (let i = 1; i < words.length; i++) {
		const word = words[i];
		if (currentLength + word.length + 1 <= targetLength) {
			currentLine += " " + word;
			currentLength += word.length + 1;
		} else {
			lines.push(currentLine);
			currentLine = word;
			currentLength = word.length;
		}
	}
	lines.push(currentLine);
	return lines;
}

export async function generateQuoteImage(quote: Quote): Promise<Buffer> {
	// Create a canvas with fixed dimensions
	const canvas = createCanvas(1200, 1200);
	const ctx = canvas.getContext("2d");

	try {
		// Load and draw background image
		let imageBuffer;
		if (quote.backgroundImage && quote.backgroundImage.startsWith("http")) {
			imageBuffer = await loadImageFromUrl(quote.backgroundImage);
		} else {
			// Use default image from public directory
			const defaultImagePath = path.join(
				process.cwd(),
				"public",
				"img1.jpg"
			);
			imageBuffer = await fs.readFile(defaultImagePath);
		}

		const image = await loadImage(imageBuffer);
		ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

		// Add semi-transparent overlay with gradient
		const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
		gradient.addColorStop(0, "rgba(0, 0, 0, 0.7)");
		gradient.addColorStop(0.5, "rgba(0, 0, 0, 0.5)");
		gradient.addColorStop(1, "rgba(0, 0, 0, 0.7)");
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Configure text settings
		ctx.fillStyle = quote.textColor || "#ffffff";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		// Set font size and family
		const fontSize = 34; // Increased font size
		ctx.font = `400 ${fontSize}px "NotoSansDevanagari"`;

		// Smart text wrapping
		const lines = smartTextBreak(quote.text);
		const lineHeight = fontSize * 1.4; // Increased line height for Hindi text
		const totalHeight = lines.length * lineHeight;
		const startY = (canvas.height - totalHeight) / 2;

		// Draw each line with a subtle text shadow
		ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
		ctx.shadowBlur = 10;
		ctx.shadowOffsetX = 2;
		ctx.shadowOffsetY = 2;

		lines.forEach((line, i) => {
			ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
		});

		// Reset shadow for author and watermark
		ctx.shadowColor = "transparent";

		// Draw author with larger font and better positioning
		const authorFontSize = fontSize * 0.6;
		ctx.font = `400 ${authorFontSize}px "NotoSansDevanagari"`;
		ctx.fillText(
			`— ${quote.author}`,
			canvas.width / 2,
			startY + totalHeight + lineHeight * 0.8
		);

		// Convert canvas to buffer
		return canvas.toBuffer("image/png");
	} catch (error) {
		console.error("Error generating quote image:", error);
		throw error;
	}
}
