import fs from "fs";
import path from "path";
import https from "https";
import { v4 as uuidv4 } from "uuid";

const TEMP_DIR = path.join(process.cwd(), "public", "temp");

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
	fs.mkdirSync(TEMP_DIR, { recursive: true });
}

export async function downloadImage(imageUrl: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const fileName = `${uuidv4()}.jpg`;
		const filePath = path.join(TEMP_DIR, fileName);
		const file = fs.createWriteStream(filePath);

		// Handle data URLs
		if (imageUrl.startsWith("data:")) {
			// Extract the base64 data from the data URL
			const base64Data = imageUrl.split(",")[1];
			const buffer = Buffer.from(base64Data, "base64");

			file.write(buffer);
			file.end();

			file.on("finish", () => {
				file.close();
				resolve(`/temp/${fileName}`);
			});

			file.on("error", (err) => {
				fs.unlink(filePath, () => {}); // Clean up file on error
				reject(err);
			});
			return;
		}

		// Handle HTTPS URLs
		const url = new URL(imageUrl);
		if (url.protocol === "https:") {
			https
				.get(imageUrl, (response) => {
					response.pipe(file);

					file.on("finish", () => {
						file.close();
						resolve(`/temp/${fileName}`);
					});
				})
				.on("error", (err) => {
					fs.unlink(filePath, () => {}); // Clean up file on error
					reject(err);
				});
		} else {
			reject(
				new Error(
					`Unsupported protocol: ${url.protocol}. Only HTTPS and data URLs are supported.`
				)
			);
		}
	});
}

export function cleanupImage(publicUrl: string): void {
	try {
		const fileName = path.basename(publicUrl);
		const filePath = path.join(TEMP_DIR, fileName);

		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
	} catch (error) {
		console.error("Error cleaning up image:", error);
	}
}

export function getAbsoluteUrl(publicUrl: string): string {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
	return `${baseUrl}${publicUrl}`;
}
