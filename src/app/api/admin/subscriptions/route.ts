import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/dbconfig";
import { getUserFromToken } from "@/lib/utils";
import { Subscription } from "@/models/subscription.model";

export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get("token")?.value;

		if (!token) {
			return NextResponse.json(
				{ message: "Authentication required", success: false },
				{ status: 401 }
			);
		}

		const user = await getUserFromToken(token);
		if (!user || user.role !== "admin") {
			return NextResponse.json(
				{ message: "Unauthorized", success: false },
				{ status: 401 }
			);
		}

		await connectDb();

		const subscriptions = await Subscription.find().populate("userId");

		return NextResponse.json({
			success: true,
			subscriptions,
		});
	} catch (error) {
		console.error("Error fetching subscriptions:", error);
		return NextResponse.json(
			{ message: "Failed to fetch subscriptions", success: false },
			{ status: 500 }
		);
	}
}
