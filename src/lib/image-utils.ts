import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(imageUrl: string): Promise<string> {
	try {
		console.log("Starting image upload to Cloudinary:", {
			imageUrl: imageUrl.substring(0, 50) + "...", // Log truncated URL for security
		});

		// If it's a data URL, upload it directly
		if (imageUrl.startsWith("data:")) {
			const result = await cloudinary.uploader.upload(imageUrl, {
				folder: "quote-generator",
				resource_type: "auto",
			});
			console.log("Successfully uploaded data URL to Cloudinary");
			return result.secure_url;
		}

		// If it's an HTTPS URL, upload it using the URL
		const result = await cloudinary.uploader.upload(imageUrl, {
			folder: "quote-generator",
			resource_type: "auto",
		});
		console.log("Successfully uploaded URL to Cloudinary");
		return result.secure_url;
	} catch (error) {
		console.error("Error uploading image to Cloudinary:", error);
		if (error instanceof Error) {
			throw new Error(`Failed to upload image: ${error.message}`);
		}
		throw new Error("Failed to upload image");
	}
}

// We don't need cleanup anymore as Cloudinary handles that
export function cleanupImage(): void {
	// No-op as Cloudinary handles cleanup
}

export function getAbsoluteUrl(publicUrl: string): string {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
	return `${baseUrl}${publicUrl}`;
}
