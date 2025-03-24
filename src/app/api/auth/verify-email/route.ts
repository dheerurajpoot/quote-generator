import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/user.model";
import { connectDb } from "@/lib/dbconfig";
import jwt from "jsonwebtoken";

interface JwtError extends Error {
	name: string;
}

export async function POST(request: NextRequest) {
	try {
		await connectDb();
		const { token } = await request.json();

		if (!token) {
			return NextResponse.json(
				{ message: "Verification token is required" },
				{ status: 400 }
			);
		}

		// First verify the JWT token
		let decoded;
		try {
			decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as {
				userId: string;
			};
		} catch (error: unknown) {
			console.error("Token verification error:", error);
			const jwtError = error as JwtError;
			if (jwtError.name === "TokenExpiredError") {
				return NextResponse.json(
					{ message: "Verification link has expired" },
					{ status: 400 }
				);
			}
			return NextResponse.json(
				{ message: "Invalid verification token" },
				{ status: 400 }
			);
		}

		// Find user with valid verification token
		const user = await User.findOne({
			_id: decoded.userId,
			verifyToken: token,
			verifyTokenExpiry: { $gt: Date.now() },
		});

		if (!user) {
			// Let's check if the user exists at all
			const userExists = await User.findById(decoded.userId);
			console.log("User exists check:", userExists);

			// If user exists, check their token fields
			if (userExists) {
				console.log("User token fields:", {
					verifyToken: userExists.verifyToken,
					verifyTokenExpiry: userExists.verifyTokenExpiry,
					currentTime: Date.now(),
				});

				// If there's a different token in the database, it means this is an old link
				if (
					userExists.verifyToken &&
					userExists.verifyToken !== token
				) {
					return NextResponse.json(
						{
							message:
								"This verification link has expired. Please request a new one.",
						},
						{ status: 400 }
					);
				}
			}

			return NextResponse.json(
				{ message: "Invalid or expired verification token" },
				{ status: 400 }
			);
		}

		// Update user's verification status and clear verification token
		user.isVerified = true;
		user.verifyToken = undefined;
		user.verifyTokenExpiry = undefined;
		await user.save();

		return NextResponse.json({
			message: "Email verified successfully",
			success: true,
		});
	} catch (error: unknown) {
		console.error("Email verification error:", error);
		return NextResponse.json(
			{ message: "An error occurred while verifying your email" },
			{ status: 500 }
		);
	}
}
