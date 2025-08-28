import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDb } from "@/lib/dbconfig";
import { AutoPostingCampaign } from "@/models/autoPostingCampaign.model";

export async function GET(request: Request) {
	try {
		await connectDb();

		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		if (!userId) {
			return NextResponse.json(
				{ message: "User ID is required", success: false },
				{ status: 400 }
			);
		}

		const settings = await AutoPostingCampaign.find({
			userId: new mongoose.Types.ObjectId(userId),
		});

		return NextResponse.json(
			{
				message: "Auto-posting settings fetched successfully",
				settings,
				success: true,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error fetching auto-posting settings:", error);
		return NextResponse.json(
			{
				message: "Failed to fetch auto-posting settings",
				success: false,
			},
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	try {
		await connectDb();

		const body = await request.json();
		const {
			userId,
			isEnabled,
			campaignName,
			interval,
			platforms,
			language,
			template,
		} = body;

		if (!userId) {
			return NextResponse.json(
				{ message: "User ID is required", success: false },
				{ status: 400 }
			);
		}

		const settings = new AutoPostingCampaign({
			userId,
			campaignName,
			isEnabled,
			interval,
			platforms,
			language,
			template,
			lastPostTime: isEnabled
				? new Date(new Date().getTime() - interval * 60 * 1000)
				: null,
		});
		await settings.save();

		return NextResponse.json(
			{
				message:
					"Campaign created successfully, auto posting will start in 1 minute",
				settings,
				success: true,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error updating auto-posting settings:", error);
		return NextResponse.json(
			{
				message: "Failed to update auto-posting settings",
				success: false,
			},
			{ status: 500 }
		);
	}
}

export async function PUT(request: Request) {
	try {
		await connectDb();

		const { searchParams } = new URL(request.url);
		const campaignId = searchParams.get("campaignId");
		if (!campaignId) {
			return NextResponse.json(
				{ message: "Campaign ID is required", success: false },
				{ status: 400 }
			);
		}

		const { isEnabled, interval } = await request.json();

		if (!campaignId) {
			return NextResponse.json(
				{ message: "Campaign ID is required", success: false },
				{ status: 400 }
			);
		}

		const settings = await AutoPostingCampaign.findByIdAndUpdate(
			{ _id: new mongoose.Types.ObjectId(campaignId) },
			{
				$set: {
					isEnabled,
					lastPostTime: isEnabled
						? new Date(new Date().getTime() - interval * 60 * 1000)
						: null,
				},
			},
			{ new: true }
		);

		return NextResponse.json(
			{
				message: isEnabled
					? "Auto posting has been started in 1 minute"
					: "Auto posting has been stopped",
				settings,
				success: true,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error updating last post time:", error);
		return NextResponse.json(
			{ message: "Failed to update last post time", success: false },
			{ status: 500 }
		);
	}
}
export async function DELETE(request: Request) {
	try {
		await connectDb();

		const { searchParams } = new URL(request.url);
		const campaignId = searchParams.get("campaignId");

		if (!campaignId) {
			return NextResponse.json(
				{ message: "Campaign ID is required", success: false },
				{ status: 400 }
			);
		}

		const settings = await AutoPostingCampaign.findOneAndDelete({
			_id: new mongoose.Types.ObjectId(campaignId),
		});

		return NextResponse.json(
			{
				message: "Campaign deleted successfully",
				settings,
				success: true,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error deleting campaign:", error);
		return NextResponse.json(
			{ message: "Failed to delete campaign", success: false },
			{ status: 500 }
		);
	}
}
