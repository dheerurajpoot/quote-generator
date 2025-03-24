import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { User } from "@/models/user.model";
import { connectDb } from "@/lib/dbconfig";
import { sendMail } from "@/lib/mail";

export async function POST(request: NextRequest) {
	try {
		await connectDb();
		const { name, email, password } = await request.json();

		if (!name || !email || !password) {
			return NextResponse.json(
				{ message: "All fields are required" },
				{ status: 400 }
			);
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email });

		if (existingUser) {
			return NextResponse.json(
				{ message: "User already exists with this email" },
				{ status: 400 }
			);
		}

		// Hash password
		const salt = await bcryptjs.genSalt(10);
		const hashedPassword = await bcryptjs.hash(password, salt);

		// Create new user
		const user = new User({
			name,
			email,
			password: hashedPassword,
			isVerified: false, // Set initial verification status to false
		});

		await user.save();

		// Send verification email
		await sendMail({
			email: user.email,
			emailType: "VERIFY",
			userId: user._id,
		});

		return NextResponse.json({
			message: "Please check your email to verify your account",
			success: true,
		});
	} catch (error: unknown) {
		console.error("Signup error:", error);
		return NextResponse.json(
			{ message: "An error occurred while signing up" },
			{ status: 500 }
		);
	}
}
