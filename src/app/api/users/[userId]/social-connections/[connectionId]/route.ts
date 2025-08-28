import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/dbconfig";
import { SocialConnection } from "@/models/socialConnection.model";
import { PlatformMetrics } from "@/models/platformMetrics.model";
import { getUserFromToken } from "@/lib/utils";

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string; connectionId: string }> }
) {
	try {
		const { userId, connectionId } = await params;

		// Get token from cookie
		const token = request.headers
			.get("cookie")
			?.split("; ")
			?.find((row) => row.startsWith("token="))
			?.split("=")[1];

		if (!token) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		// Verify user
		const user = await getUserFromToken(token);
		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 401 }
			);
		}

		// Check if user owns this connection
		if (user._id.toString() !== userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 403 }
			);
		}

		await connectDb();

		// Delete the social connection
		const deletedConnection = await SocialConnection.findByIdAndDelete(
			connectionId
		);

		if (!deletedConnection) {
			return NextResponse.json(
				{ error: "Connection not found" },
				{ status: 404 }
			);
		}

		// Also delete all platform metrics associated with this connection
		await PlatformMetrics.deleteMany({ connectionId: connectionId });

		return NextResponse.json({
			success: true,
			message: "Connection and associated metrics deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting social connection:", error);
		return NextResponse.json(
			{ error: "Failed to delete connection" },
			{ status: 500 }
		);
	}
}
