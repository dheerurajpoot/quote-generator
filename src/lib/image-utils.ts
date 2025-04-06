import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(input: string | Buffer): Promise<string> {
	try {
		let result;

		if (Buffer.isBuffer(input)) {
			// If input is a Buffer, convert it to base64 with data URI prefix
			const base64Data = `data:image/png;base64,${input.toString(
				"base64"
			)}`;
			result = await cloudinary.uploader.upload(base64Data, {
				folder: "quote-generator",
				resource_type: "auto",
			});
		} else if (input.startsWith("data:")) {
			// If it's a data URL, upload it directly
			result = await cloudinary.uploader.upload(input, {
				folder: "quote-generator",
				resource_type: "auto",
			});
		} else {
			// If it's an HTTPS URL, upload it using the URL
			result = await cloudinary.uploader.upload(input, {
				folder: "quote-generator",
				resource_type: "auto",
			});
		}

		if (!result || !result.secure_url) {
			throw new Error("Failed to get secure URL from Cloudinary");
		}

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
