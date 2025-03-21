import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { User } from "@/models/user.model";
import { connectDb } from "@/lib/dbconfig";
import jwt from "jsonwebtoken";

// Type for the token payload
interface TokenData {
	id: string;
	name: string;
}

export async function POST(request: NextRequest) {
	try {
		await connectDb();
		const reqBody = await request.json();
		const { email, password }: { email: string; password: string } =
			reqBody;

		const user = await User.findOne({ email });
		if (!user) {
			return NextResponse.json(
				{ message: "User does not exist with this email" },
				{ status: 400 }
			);
		}

		// Optional email verification check
		// if (!user.isVerified) {
		//   return NextResponse.json(
		//     { message: "Please verify your email first!" },
		//     { status: 400 }
		//   );
		// }

		const isValid = await bcryptjs.compare(password, user.password);
		if (!isValid) {
			return NextResponse.json(
				{ message: "Email or Password is incorrect" },
				{ status: 400 }
			);
		}

		const tokenData: TokenData = {
			id: user._id.toString(),
			name: user.email,
		};

		if (!process.env.TOKEN_SECRET) {
			throw new Error(
				"TOKEN_SECRET is not defined in environment variables"
			);
		}

		const token = jwt.sign(tokenData, process.env.TOKEN_SECRET, {
			expiresIn: "30d",
		});

		// Response with cookie
		const response = NextResponse.json({
			message: "Login Successfully",
			success: true,
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user?.role,
				token: token,
				createdAt: user?.createdAt,
			},
		});

		response.cookies.set("token", token, {
			httpOnly: true,
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production",
			maxAge: 30 * 24 * 60 * 60, // 30 days
		});

		response.cookies.set("userRole", user.role, {
			httpOnly: true,
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production",
			maxAge: 30 * 24 * 60 * 60,
		});

		return response;
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.log(error);
			return NextResponse.json(
				{ message: error.message },
				{ status: 500 }
			);
		}
		return NextResponse.json(
			{ message: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
