import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbconfig";
import { User } from "@/models/user.model";
import { cookies } from "next/headers";

export async function GET() {
	try {
		await connectDb();
		const users = await User.find({}, { password: 0 });
		return NextResponse.json(users);
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json(
			{ error: "Failed to fetch users" },
			{ status: 500 }
		);
	}
}

export async function PUT(request: Request) {
	try {
		const cookieStore = await cookies();
		const userRole = cookieStore.get("user_role")?.value;

		if (!userRole || userRole !== "admin") {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		await connectDb();
		const { userId, updates } = await request.json();

		if (!userId || !updates) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		const user = await User.findByIdAndUpdate(
			userId,
			{ $set: updates },
			{ new: true }
		);

		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		// If user is being blocked/unblocked, update their cookie
		if (updates.isBlocked !== undefined) {
			const headers = new Headers();
			headers.set("Content-Type", "application/json");

			if (updates.isBlocked) {
				headers.append(
					"Set-Cookie",
					"is_blocked=true; Path=/; HttpOnly; SameSite=Lax"
				);
			} else {
				headers.append(
					"Set-Cookie",
					"is_blocked=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
				);
			}

			return new NextResponse(JSON.stringify(user), {
				status: 200,
				headers,
			});
		}

		return NextResponse.json(user);
	} catch (error) {
		console.error("Error updating user:", error);
		return NextResponse.json(
			{ error: "Failed to update user" },
			{ status: 500 }
		);
	}
}

export async function DELETE(request: Request) {
	try {
		const cookieStore = await cookies();
		const userRole = cookieStore.get("user_role")?.value;

		if (!userRole || userRole !== "admin") {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}

		await connectDb();
		const user = await User.findByIdAndDelete(userId);

		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ message: "User deleted successfully" });
	} catch (error) {
		console.error("Error deleting user:", error);
		return NextResponse.json(
			{ error: "Failed to delete user" },
			{ status: 500 }
		);
	}
}
