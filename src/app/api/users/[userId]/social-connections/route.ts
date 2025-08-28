import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/dbconfig";
import { SocialConnection } from "@/models/socialConnection.model";
import { getUserFromToken } from "@/lib/utils";

// GET - Fetch user's social connections
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	try {
		const { userId } = await params;
		await connectDb();

		const token = request.cookies.get("token")?.value;
		if (!token) {
			return NextResponse.json(
				{
					success: false,
					message: "Please log in to access this feature",
				},
				{ status: 401 }
			);
		}

		const user = await getUserFromToken(token);
		if (!user) {
			return NextResponse.json(
				{ success: false, message: "User not found" },
				{ status: 401 }
			);
		}

		// Check if user is requesting their own connections or is admin
		if (user._id.toString() !== userId && user.role !== "admin") {
			return NextResponse.json(
				{ success: false, message: "Unauthorized access" },
				{ status: 403 }
			);
		}

		const connections = await SocialConnection.find({
			userId: userId,
		}).sort({ createdAt: -1 });

		return NextResponse.json({
			success: true,
			connections: connections.map((conn) => ({
				_id: conn._id,
				platform: conn.platform,
				profileId: conn.profileId,
				profileName: conn.profileName,
				profileImage: conn.profileImage,
				accessToken: conn.accessToken,
				pageAccessToken: conn.pageAccessToken,
				instagramAccountId: conn.instagramAccountId,
				expiresAt: conn.expiresAt,
				createdAt: conn.createdAt,
				updatedAt: conn.updatedAt,
			})),
		});
	} catch (error) {
		console.error("Error fetching social connections:", error);
		return NextResponse.json(
			{ success: false, message: "Internal server error" },
			{ status: 500 }
		);
	}
}
