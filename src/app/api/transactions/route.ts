import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/dbconfig";
import { getUserFromToken } from "@/lib/utils";

// Define interface for transaction data
interface Transaction {
	id: string;
	amount: number;
	currency: string;
	status: string;
	paymentMethod: string;
	description: string;
	planName: string;
	createdAt: string;
}

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
		if (!user) {
			return NextResponse.json(
				{ message: "User not found", success: false },
				{ status: 401 }
			);
		}

		await connectDb();

		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		if (!userId || userId !== user._id.toString()) {
			return NextResponse.json(
				{ message: "Unauthorized", success: false },
				{ status: 403 }
			);
		}

		// For now, return empty transactions since we're using UPI payments
		// In the future, you can create a Transaction model and store UPI payment details
		const transactions: Transaction[] = [];

		return NextResponse.json({
			success: true,
			transactions,
		});
	} catch (error: unknown) {
		console.error("Error fetching transactions:", error);
		return NextResponse.json(
			{ message: "Failed to fetch transactions", success: false },
			{ status: 500 }
		);
	}
}
