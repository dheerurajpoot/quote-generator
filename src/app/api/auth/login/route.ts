import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { User } from "@/models/user.model";
import { connectDb } from "@/lib/dbconfig";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
	try {
		await connectDb();
		const { email, password } = await request.json();

		if (!email || !password) {
			return NextResponse.json(
				{ message: "Email and password are required" },
				{ status: 400 }
			);
		}

		const user = await User.findOne({ email });

		if (!user) {
			return NextResponse.json(
				{ message: "Invalid email or password" },
				{ status: 400 }
			);
		}

		// Check if email is verified
		if (!user.isVerified) {
			return NextResponse.json(
				{
					message: "Please verify your email before logging in",
					success: false,
				},
				{ status: 400 }
			);
		}

		const validPassword = await bcryptjs.compare(password, user.password);

		if (!validPassword) {
			return NextResponse.json(
				{ message: "Invalid email or password" },
				{ status: 400 }
			);
		}

		const token = jwt.sign(
			{ userId: user._id },
			process.env.TOKEN_SECRET!,
			{
				expiresIn: "30d",
			}
		);

		const response = NextResponse.json({
			message: "Login successful",
			success: true,
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				appId: user.facebookAppId,
				appSecret: user.facebookAppSecret,
				author: user.author,
				isBlocked: user.isBlocked,
				createdAt: user.createdAt,
			},
		});

		response.cookies.set("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 30 * 24 * 60 * 60,
		});

		return response;
	} catch (error: unknown) {
		console.error("Login error:", error);
		return NextResponse.json(
			{ message: "An error occurred while logging in" },
			{ status: 500 }
		);
	}
}
