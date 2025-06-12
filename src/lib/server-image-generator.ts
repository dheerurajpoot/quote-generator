import {
	createCanvas,
	loadImage,
	registerFont,
	CanvasRenderingContext2D,
} from "canvas";
import path from "path";
import axios from "axios";
import fs from "fs/promises";
import { existsSync } from "fs";

// Register Mukta fonts for Hindi text
const muktaRegularPath = path.join(
	process.env.NEXT_PUBLIC_APP_URL || process.cwd(),
	"public/fonts/Mukta-Regular.ttf"
);
const muktaBoldPath = path.join(
	process.env.NEXT_PUBLIC_APP_URL || process.cwd(),
	"public/fonts/Mukta-Bold.ttf"
);

try {
	if (existsSync(muktaRegularPath)) {
		registerFont(muktaRegularPath, { family: "Mukta", weight: "400" });
		console.log("Mukta Regular font registered successfully");
	} else {
		console.error("Mukta Regular font file not found at:", muktaRegularPath);
	}

	if (existsSync(muktaBoldPath)) {
		registerFont(muktaBoldPath, { family: "Mukta", weight: "700" });
		console.log("Mukta Bold font registered successfully");
	} else {
		console.error("Mukta Bold font file not found at:", muktaBoldPath);
	}
} catch (error) {
	console.error("Error registering Mukta fonts:", error);
	// Fallback to a default font
	registerFont("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", {
		family: "DejaVu Sans",
		weight: "400"
	});
	console.log("Using fallback DejaVu Sans font");
}

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
		const response = await axios.get(url, { responseType: "arraybuffer" });
		return Buffer.from(response.data);
	} catch (error) {
		console.error("Error loading image from URL:", error);
		const defaultImagePath = path.join(process.cwd(), "public", "img1.jpg");
		return fs.readFile(defaultImagePath);
	}
}

function wrapText(
	ctx: CanvasRenderingContext2D,
	text: string,
	maxWidth: number
): string[] {
	// Split text into words while preserving Hindi word boundaries
	const words = text.split(/(?<=[\s।,.!?])/);
	const lines: string[] = [];
	let currentLine = words[0] || "";

	for (let i = 1; i < words.length; i++) {
		const word = words[i];
		const width = ctx.measureText(currentLine + word).width;

		if (width < maxWidth) {
			currentLine += word;
		} else {
			// Only push non-empty lines
			if (currentLine.trim()) {
				lines.push(currentLine.trim());
			}
			currentLine = word;
		}
	}

	// Add the last line if it's not empty
	if (currentLine.trim()) {
		lines.push(currentLine.trim());
	}

	return lines;
}

export async function generateQuoteImage(quote: Quote): Promise<Buffer> {
	// Create a larger canvas for better quality
	const canvas = createCanvas(1500, 1500);
	const ctx = canvas.getContext("2d");

	try {
		// Load and draw background
		let imageBuffer;
		if (quote.backgroundImage && quote.backgroundImage.startsWith("http")) {
			try {
				imageBuffer = await loadImageFromUrl(quote.backgroundImage);
			} catch (error) {
				console.log("error", error);
				const defaultImagePath = path.join(
					process.cwd(),
					"public",
					"img1.jpg"
				);
				imageBuffer = await fs.readFile(defaultImagePath);
			}
		} else {
			const defaultImagePath = path.join(
				process.cwd(),
				"public",
				"img1.jpg"
			);
			imageBuffer = await fs.readFile(defaultImagePath);
		}

		const image = await loadImage(imageBuffer);
		ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

		// Add dark overlay for better text visibility
		ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Configure text rendering
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "#ffffff";

		// Set up text properties with bold weight and smaller font size
		const fontSize = Math.floor(canvas.width * 0.035); // Decreased from 0.045 to 0.035
		ctx.font = `600 ${fontSize}px Mukta`;

		// Add text shadow for better visibility
		ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
		ctx.shadowBlur = 15;
		ctx.shadowOffsetX = 5;
		ctx.shadowOffsetY = 5;

		// Calculate text wrapping
		const maxWidth = canvas.width * 0.8;
		const lines = wrapText(ctx, quote.text, maxWidth);

		// Calculate total height of text block
		const lineHeight = fontSize * 1.5;
		const totalHeight = lines.length * lineHeight;
		const startY = (canvas.height - totalHeight) / 2;

		// Draw each line
		lines.forEach((line, i) => {
			const y = startY + i * lineHeight;
			ctx.fillText(line, canvas.width / 2, y);
		});

		// Reset shadow for author text
		ctx.shadowBlur = 10;
		ctx.shadowOffsetX = 3;
		ctx.shadowOffsetY = 3;

		// Draw author with regular weight
		const authorFontSize = Math.floor(fontSize * 0.7);
		ctx.font = `400 ${authorFontSize}px Mukta`;
		ctx.fillText(
			`— ${quote.author}`,
			canvas.width / 2,
			startY + totalHeight + lineHeight
		);

		// Return the image buffer
		return canvas.toBuffer("image/png");
	} catch (error) {
		console.error("Error generating quote image:", error);
		throw error;
	}
}
