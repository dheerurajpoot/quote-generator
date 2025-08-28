import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbconfig";
import { User } from "@/models/user.model";
import { cookies } from "next/headers";

export async function GET() {
	try {
		await connectDb();
		const users = await User.find({}, { password: 0 });
		return NextResponse.json(
			{ message: "Users fetched successfully", users, success: true },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json(
			{ message: "Failed to fetch users", success: false },
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
				{ message: "Unauthorized", success: false },
				{ status: 401 }
			);
		}

		await connectDb();
		const { userId, updates } = await request.json();

		if (!userId || !updates) {
			return NextResponse.json(
				{ message: "Missing required fields", success: false },
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
				{ message: "User not found", success: false },
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

		return NextResponse.json(
			{ message: "User updated successfully", user, success: true },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error updating user:", error);
		return NextResponse.json(
			{ message: "Failed to update user", success: false },
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
				{ message: "Unauthorized", success: false },
				{ status: 401 }
			);
		}

		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		if (!userId) {
			return NextResponse.json(
				{ message: "User ID is required", success: false },
				{ status: 400 }
			);
		}

		await connectDb();
		const user = await User.findByIdAndDelete(userId);

		if (!user) {
			return NextResponse.json(
				{ message: "User not found", success: false },
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{ message: "User deleted successfully", success: true },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error deleting user:", error);
		return NextResponse.json(
			{ message: "Failed to delete user", success: false },
			{ status: 500 }
		);
	}
}
