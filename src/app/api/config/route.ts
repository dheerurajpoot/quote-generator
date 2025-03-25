import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbconfig";
import { Config } from "@/models/config.model";
import { cookies } from "next/headers";

export async function GET() {
	try {
		await connectDb();
		const configs = await Config.find({});
		return NextResponse.json(configs);
	} catch (error) {
		console.error("Error fetching configs:", error);
		return NextResponse.json(
			{ error: "Failed to fetch configurations" },
			{ status: 500 }
		);
	}
}

export async function PUT(request: Request) {
	try {
		const cookieStore = await cookies();
		const userRole = cookieStore.get("user_role")?.value;

		if (!userRole || userRole !== "admin") {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		await connectDb();
		const { key, value } = await request.json();

		if (!key || value === undefined) {
			return NextResponse.json(
				{ error: "Key and value are required" },
				{ status: 400 }
			);
		}

		const config = await Config.findOneAndUpdate(
			{ key },
			{
				$set: {
					value,
					updatedAt: new Date(),
				},
			},
			{ upsert: true, new: true }
		);

		return NextResponse.json(config);
	} catch (error) {
		console.error("Error updating config:", error);
		return NextResponse.json(
			{ error: "Failed to update configuration" },
			{ status: 500 }
		);
	}
}
