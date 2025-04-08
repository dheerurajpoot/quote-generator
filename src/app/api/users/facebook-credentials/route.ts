import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDb } from "@/lib/dbconfig";
import { User } from "@/models/user.model";

// Helper function to get user from token
async function getUserFromToken(token: string) {
	try {
		const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as {
			userId: string;
		};

		await connectDb();
		const user = await User.findById(decoded.userId);

		return user;
	} catch (error) {
		console.error("Error getting user from token:", error);
		return null;
	}
}

export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get("token")?.value;

		if (!token) {
			return NextResponse.json(
				{ message: "Please log in to access this feature" },
				{ status: 401 }
			);
		}

		const user = await getUserFromToken(token);
		if (!user) {
			return NextResponse.json(
				{ message: "User not found" },
				{ status: 401 }
			);
		}
		return NextResponse.json({
			appId: user.facebookAppId || "",
			appSecret: user.facebookAppSecret || "",
			author: user.author || "",
		});
	} catch (error) {
		console.error("Error in GET Facebook credentials:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const token = request.cookies.get("token")?.value;
		console.log("Token present:", !!token);

		if (!token) {
			return NextResponse.json(
				{ message: "Please log in to access this feature" },
				{ status: 401 }
			);
		}

		const user = await getUserFromToken(token);
		if (!user) {
			return NextResponse.json(
				{ message: "User not found" },
				{ status: 401 }
			);
		}

		const { appId, appSecret, author } = await request.json();

		if (!appId || !appSecret) {
			return NextResponse.json(
				{ message: "App ID and App Secret are required" },
				{ status: 400 }
			);
		}

		user.facebookAppId = appId;
		user.facebookAppSecret = appSecret;
		user.author = author;
		await user.save();

		return NextResponse.json({
			message: "Facebook credentials saved successfully",
		});
	} catch (error) {
		console.error("Error in POST Facebook credentials:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const token = request.cookies.get("token")?.value;

		if (!token) {
			return NextResponse.json(
				{ message: "Please log in to access this feature" },
				{ status: 401 }
			);
		}

		const user = await getUserFromToken(token);
		if (!user) {
			return NextResponse.json(
				{ message: "User not found" },
				{ status: 401 }
			);
		}

		user.facebookAppId = "";
		user.facebookAppSecret = "";
		user.author = "";
		await user.save();

		return NextResponse.json({
			message: "Facebook credentials removed successfully",
		});
	} catch (error) {
		console.error("Error in DELETE Facebook credentials:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}
