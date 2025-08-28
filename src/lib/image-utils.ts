// uploading images and videos to cloudinary

import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with error handling
let cloudinaryConfigured = false;
try {
	if (
		process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
		process.env.CLOUDINARY_API_KEY &&
		process.env.CLOUDINARY_API_SECRET
	) {
		cloudinary.config({
			cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET,
		});
		cloudinaryConfigured = true;
		// console.log("Cloudinary configured successfully");
	} else {
		console.error("Missing Cloudinary configuration");
	}
} catch (error) {
	console.error("Error configuring Cloudinary:", error);
}

export async function uploadImage(input: string | Buffer): Promise<string> {
	return await uploadMedia(input, "image");
}

export async function uploadVideo(input: string | Buffer): Promise<string> {
	return await uploadMedia(input, "video");
}

export async function uploadMedia(
	input: string | Buffer,
	resourceType: "image" | "video" = "image"
): Promise<string> {
	try {
		// If Cloudinary is not configured, return a placeholder URL
		if (!cloudinaryConfigured) {
			console.error(
				"Cloudinary is not configured, using placeholder URL"
			);
			return resourceType === "video"
				? "https://via.placeholder.com/1280x720?text=Video+Placeholder"
				: "https://via.placeholder.com/1200x1200?text=Image+Placeholder";
		}

		let result;

		if (Buffer.isBuffer(input)) {
			// If input is a Buffer, convert it to base64 with data URI prefix
			const mimeType =
				resourceType === "video" ? "video/mp4" : "image/png";
			const base64Data = `data:${mimeType};base64,${input.toString(
				"base64"
			)}`;
			result = await cloudinary.uploader.upload(base64Data, {
				folder: "quote-generator",
				resource_type: resourceType,
			});
		} else if (input.startsWith("data:")) {
			// If it's a data URL, upload it directly
			result = await cloudinary.uploader.upload(input, {
				folder: "quote-generator",
				resource_type: resourceType,
			});
		} else {
			// If it's an HTTPS URL, upload it using the URL
			result = await cloudinary.uploader.upload(input, {
				folder: "quote-generator",
				resource_type: resourceType,
			});
		}

		if (!result || !result.secure_url) {
			throw new Error("Failed to get secure URL from Cloudinary");
		}

		return result.secure_url;
	} catch (error) {
		console.error(`Error uploading ${resourceType} to Cloudinary:`, error);
		// Return a placeholder URL if upload fails
		return resourceType === "video"
			? "https://via.placeholder.com/1280x720?text=Video+Upload+Failed"
			: "https://via.placeholder.com/1200x1200?text=Image+Upload+Failed";
	}
}

// We don't need cleanup anymore as Cloudinary handles that
export function cleanupImage(): void {
	// No-op as Cloudinary handles cleanup
}

export function getAbsoluteUrl(publicUrl: string): string {
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
	return `${baseUrl}${publicUrl}`;
}
