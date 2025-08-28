import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/dbconfig";
import { getUserFromToken } from "@/lib/utils";
import { Subscription } from "@/models/subscription.model";

export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get("token")?.value;

		if (!token) {
			return NextResponse.json(
				{ message: "Authentication required", success: false },
				{ status: 401 }
			);
		}

		await connectDb();

		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		const subscriptions = await Subscription.find({
			userId: userId,
		}).sort({ createdAt: -1 });

		return NextResponse.json({
			success: true,
			subscriptions,
		});
	} catch (error) {
		console.error("Error fetching subscriptions:", error);
		return NextResponse.json(
			{ message: "Failed to fetch subscriptions", success: false },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const token = request.cookies.get("token")?.value;

		if (!token) {
			return NextResponse.json(
				{ message: "Authentication required", success: false },
				{ status: 401 }
			);
		}

		const user = await getUserFromToken(token);
		if (!user) {
			return NextResponse.json(
				{ message: "User not found", success: false },
				{ status: 500 }
			);
		}

		await connectDb();

		const body = await request.json();
		const { userId: requestUserId, planId } = body;

		// Validate user can only create subscriptions for themselves
		if (requestUserId !== user._id.toString()) {
			return NextResponse.json(
				{ message: "Unauthorized", success: false },
				{ status: 403 }
			);
		}

		// Handle free plan
		if (planId === "free") {
			// Check if user already has a free subscription
			const existingSubscription = await Subscription.findOne({
				userId: user._id,
				planId: "free",
			});

			if (existingSubscription) {
				return NextResponse.json({
					success: true,
					message: "Free plan already active",
					subscription: existingSubscription,
				});
			}

			// Create free subscription
			const freeSubscription = new Subscription({
				userId: user._id,
				planId: "free",
				planName: "Free Plan",
				tier: "free",
				status: "active",
				amount: 0,
				billingCycle: "monthly",
				currentPeriodStart: new Date(),
				currentPeriodEnd: new Date(
					Date.now() + 365 * 24 * 60 * 60 * 1000
				), // 1 year
				planDuration: "monthly",
				paymentMethod: "Free",
				autoRenew: true,
			});

			await freeSubscription.save();

			return NextResponse.json({
				success: true,
				message: "Free plan activated successfully",
				subscription: freeSubscription,
			});
		}

		return NextResponse.json(
			{ message: "Invalid plan", success: false },
			{ status: 400 }
		);
	} catch (error) {
		console.error("Error creating subscription:", error);
		return NextResponse.json(
			{ message: "Failed to create subscription", success: false },
			{ status: 500 }
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		const token = request.cookies.get("token")?.value;

		if (!token) {
			return NextResponse.json(
				{ message: "Authentication required", success: false },
				{ status: 401 }
			);
		}

		const user = await getUserFromToken(token);
		if (!user) {
			return NextResponse.json(
				{ message: "User not found", success: false },
				{ status: 401 }
			);
		}

		await connectDb();

		const body = await request.json();
		const { subscriptionId, action } = body;

		if (!subscriptionId || !action) {
			return NextResponse.json(
				{
					message: "Subscription ID and action are required",
					success: false,
				},
				{ status: 400 }
			);
		}

		const subscription = await Subscription.findOne({
			_id: subscriptionId,
			userId: user._id,
		});

		if (!subscription) {
			return NextResponse.json(
				{ message: "Subscription not found", success: false },
				{ status: 404 }
			);
		}

		if (action === "cancel") {
			subscription.status = "canceled";
			subscription.cancelledAt = new Date();
			await subscription.save();

			return NextResponse.json({
				success: true,
				subscription,
			});
		}

		return NextResponse.json(
			{ message: "Invalid action", success: false },
			{ status: 400 }
		);
	} catch (error) {
		console.error("Error updating subscription:", error);
		return NextResponse.json(
			{ message: "Failed to update subscription", success: false },
			{ status: 500 }
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const token = request.cookies.get("token")?.value;

		if (!token) {
			return NextResponse.json(
				{ message: "Authentication required", success: false },
				{ status: 401 }
			);
		}

		const user = await getUserFromToken(token);
		if (!user) {
			return NextResponse.json(
				{ message: "User not found", success: false },
				{ status: 401 }
			);
		}

		// Only allow admins to delete subscriptions
		if (user.role !== "admin") {
			return NextResponse.json(
				{
					message: "Unauthorized - Admin access required",
					success: false,
				},
				{ status: 403 }
			);
		}

		await connectDb();
		const { searchParams } = new URL(request.url);
		const subscriptionId = searchParams.get("subscriptionId");

		if (!subscriptionId) {
			return NextResponse.json(
				{ message: "Subscription ID is required", success: false },
				{ status: 400 }
			);
		}

		const subscription = await Subscription.findByIdAndDelete(
			subscriptionId
		);

		if (!subscription) {
			return NextResponse.json(
				{ message: "Subscription not found", success: false },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			message: "Subscription deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting subscription:", error);
		return NextResponse.json(
			{ message: "Failed to delete subscription", success: false },
			{ status: 500 }
		);
	}
}
