import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/user.model";
import { connectDb } from "@/lib/dbconfig";
import { sendMail } from "@/lib/mail";

export async function POST(request: NextRequest) {
	try {
		await connectDb();
		const { email } = await request.json();

		if (!email) {
			return NextResponse.json(
				{ message: "Email is required" },
				{ status: 400 }
			);
		}

		const user = await User.findOne({ email });

		if (!user) {
			// Return success even if user not found to prevent email enumeration
			return NextResponse.json({
				message:
					"If an account exists with this email, a password reset link will be sent.",
				success: true,
			});
		}

		// Send reset email
		await sendMail({
			email: user.email,
			emailType: "RESET",
			userId: user._id,
		});

		return NextResponse.json({
			message:
				"If an account exists with this email, a password reset link will be sent.",
			success: true,
		});
	} catch (error: unknown) {
		console.error("Forgot password error:", error);
		return NextResponse.json(
			{ message: "An error occurred while processing your request" },
			{ status: 500 }
		);
	}
}
