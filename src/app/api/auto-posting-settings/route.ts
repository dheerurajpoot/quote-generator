import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDb } from "@/lib/dbconfig";
import { AutoPostingSettings } from "@/models/autoPostingSettings.model";

export async function GET(request: Request) {
	try {
		await connectDb();

		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}

		const settings = await AutoPostingSettings.findOne({
			userId: new mongoose.Types.ObjectId(userId),
		});

		return NextResponse.json(
			settings || { isEnabled: false, platforms: [], interval: 1 }
		);
	} catch (error) {
		console.error("Error fetching auto-posting settings:", error);
		return NextResponse.json(
			{ error: "Failed to fetch auto-posting settings" },
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	try {
		await connectDb();

		const body = await request.json();
		const { userId, isEnabled, interval, platforms } = body;

		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}

		const settings = await AutoPostingSettings.findOneAndUpdate(
			{ userId: new mongoose.Types.ObjectId(userId) },
			{
				$set: {
					isEnabled,
					interval,
					platforms,
					lastPostTime: isEnabled ? new Date() : null,
				},
			},
			{ upsert: true, new: true }
		);

		return NextResponse.json(settings);
	} catch (error) {
		console.error("Error updating auto-posting settings:", error);
		return NextResponse.json(
			{ error: "Failed to update auto-posting settings" },
			{ status: 500 }
		);
	}
}

export async function PUT(request: Request) {
	try {
		await connectDb();

		const body = await request.json();
		const { userId, interval } = body;

		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}

		const settings = await AutoPostingSettings.findOneAndUpdate(
			{ userId: new mongoose.Types.ObjectId(userId) },
			{
				$set: {
					interval: interval,
				},
			},
			{ new: true }
		);

		return NextResponse.json(settings);
	} catch (error) {
		console.error("Error updating last post time:", error);
		return NextResponse.json(
			{ error: "Failed to update last post time" },
			{ status: 500 }
		);
	}
}
