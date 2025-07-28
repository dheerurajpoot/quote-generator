import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Ensure Cloudinary is configured (reuse logic from image-utils.ts)
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
}

// Cloudinary resource type (partial, for our use)
type CloudinaryResource = {
	public_id: string;
	[key: string]: unknown; // allow extra fields, but we only use public_id
};

// Cloudinary search response type (partial, for our use)
type CloudinarySearchResponse = {
	resources?: CloudinaryResource[];
	[key: string]: unknown;
};

export async function POST() {
	try {
		// 1. Search for all images in the 'quote-generator' folder
		const resources = (await cloudinary.search
			.expression("folder:quote-generator")
			.max_results(500) // Cloudinary max per call
			.execute()) as CloudinarySearchResponse;

		const publicIds =
			(resources.resources as CloudinaryResource[])?.map(
				(r) => r.public_id
			) || [];

		if (publicIds.length === 0) {
			return NextResponse.json({
				success: true,
				deleted: 0,
				message: "No images found.",
			});
		}

		// 2. Delete all found images
		const deleteResult = await cloudinary.api.delete_resources(publicIds);

		return NextResponse.json({
			success: true,
			deleted: publicIds.length,
			deleteResult,
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: (error as Error).message || String(error),
			},
			{ status: 500 }
		);
	}
}

export const dynamic = "force-dynamic";
