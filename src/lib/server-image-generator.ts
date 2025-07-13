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
	process.cwd(),
	"public/fonts/Mukta-Regular.ttf"
);
const muktaBoldPath = path.join(process.cwd(), "public/fonts/Mukta-Bold.ttf");

try {
	if (existsSync(muktaRegularPath)) {
		registerFont(muktaRegularPath, { family: "Mukta", weight: "400" });
		// console.log("Mukta Regular font registered successfully");
	}
	if (existsSync(muktaBoldPath)) {
		registerFont(muktaBoldPath, { family: "Mukta", weight: "700" });
		// console.log("Mukta Bold font registered successfully");
	}
} catch (error) {
	console.error("Error registering Mukta fonts:", error);
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
	template?: string;
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
	const template = quote.template || "classic";
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

		if (template === "minimal") {
			// Minimal: white/gray background, black text, centered, no overlay
			ctx.fillStyle = "#f5f5f5";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "#222";
			ctx.font = `500 ${Math.floor(canvas.width * 0.045)}px Mukta`;
			ctx.shadowBlur = 0;
			const maxWidth = canvas.width * 0.8;
			const lines = wrapText(ctx, quote.text, maxWidth);
			const lineHeight = Math.floor(canvas.width * 0.045) * 1.5;
			const totalHeight = lines.length * lineHeight;
			const startY = (canvas.height - totalHeight) / 2;
			lines.forEach((line, i) => {
				ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
			});
			ctx.font = `400 ${Math.floor(canvas.width * 0.03)}px Mukta`;
			ctx.fillText(
				`— ${quote.author}`,
				canvas.width / 2,
				startY + totalHeight + lineHeight
			);
			return canvas.toBuffer("image/png");
		}

		if (template === "elegant") {
			ctx.fillStyle = "#000";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "#ffffff";
			const fontSize = Math.floor(canvas.width * 0.04);
			ctx.font = `300 ${fontSize}px Mukta`;
			ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
			ctx.shadowBlur = 8;
			ctx.shadowOffsetX = 2;
			ctx.shadowOffsetY = 2;

			const maxWidth = canvas.width * 0.75;
			const lines = wrapText(ctx, quote.text, maxWidth);
			const lineHeight = fontSize * 1.6;
			const totalHeight = lines.length * lineHeight;
			const startY = (canvas.height - totalHeight) / 2 - 50;

			// Add decorative line above text
			// ctx.strokeStyle = "#ffffff";
			// ctx.lineWidth = 2;
			// ctx.globalAlpha = 0.8;
			// ctx.beginPath();
			// ctx.moveTo(canvas.width * 0.2, startY - 30);
			// ctx.lineTo(canvas.width * 0.8, startY - 30);
			// ctx.stroke();
			ctx.globalAlpha = 1;

			lines.forEach((line, i) => {
				const y = startY + i * lineHeight;
				ctx.fillText(line, canvas.width / 2, y);
			});

			// Author with elegant styling
			ctx.shadowBlur = 4;
			ctx.shadowOffsetX = 1;
			ctx.shadowOffsetY = 1;
			const authorFontSize = Math.floor(fontSize * 0.6);
			ctx.font = `400 ${authorFontSize}px Mukta`;
			ctx.fillStyle = "#f0f0f0";
			ctx.fillText(
				`— ${quote.author}`,
				canvas.width / 2,
				startY + totalHeight + lineHeight + 20
			);

			// Add decorative line below text
			// ctx.strokeStyle = "#ffffff";
			// ctx.lineWidth = 1;
			// ctx.globalAlpha = 0.6;
			// ctx.beginPath();
			// ctx.moveTo(
			// 	canvas.width * 0.3,
			// 	startY + totalHeight + lineHeight + 50
			// );
			// ctx.lineTo(
			// 	canvas.width * 0.7,
			// 	startY + totalHeight + lineHeight + 50
			// );
			ctx.stroke();
			ctx.globalAlpha = 1;

			return canvas.toBuffer("image/png");
		}

		if (template === "bold") {
			// Bold: high contrast, strong typography, dramatic shadows
			// Create dark overlay
			ctx.fillStyle = "#000";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "#ffffff";
			const fontSize = Math.floor(canvas.width * 0.05);
			ctx.font = `700 ${fontSize}px Mukta`;
			ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
			ctx.shadowBlur = 20;
			ctx.shadowOffsetX = 8;
			ctx.shadowOffsetY = 8;

			const maxWidth = canvas.width * 0.7;
			const lines = wrapText(ctx, quote.text, maxWidth);
			const lineHeight = fontSize * 1.4;
			const totalHeight = lines.length * lineHeight;
			const startY = (canvas.height - totalHeight) / 2;

			// Add bold border around text area
			// ctx.strokeStyle = "#ffffff";
			// ctx.lineWidth = 4;
			// ctx.globalAlpha = 0.3;
			// ctx.strokeRect(
			// 	canvas.width * 0.1,
			// 	startY - 40,
			// 	canvas.width * 0.8,
			// 	totalHeight + 80
			// );
			ctx.globalAlpha = 1;

			lines.forEach((line, i) => {
				const y = startY + i * lineHeight;
				ctx.fillText(line, canvas.width / 2, y);
			});

			// Author with bold styling
			ctx.shadowBlur = 15;
			ctx.shadowOffsetX = 5;
			ctx.shadowOffsetY = 5;
			const authorFontSize = Math.floor(fontSize * 0.8);
			ctx.font = `500 ${authorFontSize}px Mukta`;
			ctx.fillStyle = "#ffd700";
			ctx.fillText(
				`— ${quote.author}`,
				canvas.width / 2,
				startY + totalHeight + lineHeight + 30
			);

			return canvas.toBuffer("image/png");
		}

		// Classic: current style (default)
		ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "#ffffff";
		const fontSize = Math.floor(canvas.width * 0.035);
		ctx.font = `600 ${fontSize}px Mukta`;
		ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
		ctx.shadowBlur = 15;
		ctx.shadowOffsetX = 5;
		ctx.shadowOffsetY = 5;
		const maxWidth = canvas.width * 0.8;
		const lines = wrapText(ctx, quote.text, maxWidth);
		const lineHeight = fontSize * 1.5;
		const totalHeight = lines.length * lineHeight;
		const startY = (canvas.height - totalHeight) / 2;
		lines.forEach((line, i) => {
			const y = startY + i * lineHeight;
			ctx.fillText(line, canvas.width / 2, y);
		});
		ctx.shadowBlur = 10;
		ctx.shadowOffsetX = 3;
		ctx.shadowOffsetY = 3;
		const authorFontSize = Math.floor(fontSize * 0.7);
		ctx.font = `400 ${authorFontSize}px Mukta`;
		ctx.fillText(
			`— ${quote.author}`,
			canvas.width / 2,
			startY + totalHeight + lineHeight
		);
		return canvas.toBuffer("image/png");
	} catch (error) {
		console.error("Error generating quote image:", error);
		throw error;
	}
}
