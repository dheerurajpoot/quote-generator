import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/user.model";
import { connectDb } from "@/lib/dbconfig";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

interface JwtError extends Error {
	name: string;
}

export async function POST(request: NextRequest) {
	try {
		await connectDb();
		const { token, password } = await request.json();

		if (!token || !password) {
			return NextResponse.json(
				{ message: "Token and password are required" },
				{ status: 400 }
			);
		}

		// First verify the JWT token
		let decoded;
		try {
			decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as {
				userId: string;
			};
			console.log("Decoded token:", decoded);
		} catch (error: unknown) {
			console.error("Token verification error:", error);
			const jwtError = error as JwtError;
			if (jwtError.name === "TokenExpiredError") {
				return NextResponse.json(
					{ message: "Reset token has expired" },
					{ status: 400 }
				);
			}
			return NextResponse.json(
				{ message: "Invalid reset token" },
				{ status: 400 }
			);
		}

		// Find user with valid reset token
		const user = await User.findOne({
			_id: decoded.userId,
			forgotPasswordToken: token,
			forgotPasswordTokenExpiry: { $gt: Date.now() },
		});

		if (!user) {
			// Let's check if the user exists at all
			const userExists = await User.findById(decoded.userId);
			console.log("User exists check:", userExists);

			// If user exists, check their token fields
			if (userExists) {
				console.log("User token fields:", {
					forgotPasswordToken: userExists.forgotPasswordToken,
					forgotPasswordTokenExpiry:
						userExists.forgotPasswordTokenExpiry,
					currentTime: Date.now(),
				});

				// If there's a different token in the database, it means this is an old link
				if (
					userExists.forgotPasswordToken &&
					userExists.forgotPasswordToken !== token
				) {
					return NextResponse.json(
						{
							message:
								"This password reset link has expired. Please request a new one.",
						},
						{ status: 400 }
					);
				}
			}

			return NextResponse.json(
				{ message: "Invalid or expired reset token" },
				{ status: 400 }
			);
		}

		// Hash new password
		const salt = await bcryptjs.genSalt(10);
		const hashedPassword = await bcryptjs.hash(password, salt);

		// Update user's password and clear reset token
		user.password = hashedPassword;
		user.forgotPasswordToken = undefined;
		user.forgotPasswordTokenExpiry = undefined;
		await user.save();

		return NextResponse.json({
			message: "Password reset successfully",
			success: true,
		});
	} catch (error: unknown) {
		console.error("Reset password error:", error);
		return NextResponse.json(
			{ message: "An error occurred while resetting your password" },
			{ status: 500 }
		);
	}
}
