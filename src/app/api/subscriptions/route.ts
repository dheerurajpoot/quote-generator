import { NextResponse } from "next/server";
import mongoose from "mongoose";
import {
	createRazorpayOrder,
	createRazorpayCustomer,
	cancelRazorpaySubscription,
	PREMIUM_PLAN_PRICE,
	RAZORPAY_KEY_ID,
} from "@/lib/razorpay";
import { connectDb } from "@/lib/dbconfig";
import { Subscription } from "@/models/subscription.model";
import { User } from "@/models/user.model";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(request: Request) {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get("token")?.value;

		if (!token) {
			return NextResponse.json(
				{ error: "User not authenticated" },
				{ status: 401 }
			);
		}

		// Verify token and get user data
		const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as {
			userId: string;
		};

		const userId = decoded.userId;

		await connectDb();
		const { searchParams } = new URL(request.url);
		const requestedUserId = searchParams.get("userId");

		// If no userId is provided in query params, return 400
		if (!requestedUserId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}

		// Get user role from database
		const user = await User.findById(userId);
		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		// Allow access if user is admin or if user is requesting their own subscription
		if (
			user.role !== "admin" &&
			userId !== requestedUserId &&
			requestedUserId !== "all"
		) {
			console.log("Authorization failed:", {
				userRole: user.role,
				userId,
				requestedUserId,
				path: request.url,
			});
			return NextResponse.json(
				{
					error: "Unauthorized - You can only access your own subscription",
				},
				{ status: 401 }
			);
		}

		// Build query based on requestedUserId
		let query = {};
		if (requestedUserId === "all") {
			// Admin can see all subscriptions
			query = {};
		} else {
			// Regular users can only see their own subscriptions
			query = { userId: new mongoose.Types.ObjectId(requestedUserId) };
		}

		const subscriptions = await Subscription.find(query)
			.populate("userId", "name email")
			.sort({ createdAt: -1 });

		if (!subscriptions || subscriptions.length === 0) {
			return NextResponse.json([]);
		}

		return NextResponse.json(subscriptions);
	} catch (error) {
		console.error("Error fetching subscriptions:", error);
		return NextResponse.json(
			{ error: "Failed to fetch subscriptions" },
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	try {
		await connectDb();

		const body = await request.json();
		const { userId, planId } = body;

		// Validate input
		if (!userId || !planId) {
			return NextResponse.json(
				{ error: "User ID and plan ID are required" },
				{ status: 400 }
			);
		}

		// Check if user exists
		const user = await User.findById(userId);
		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		// Find existing subscription
		const existingSubscription = await Subscription.findOne({
			userId: new mongoose.Types.ObjectId(userId),
		});

		// For free plan
		if (planId === "free") {
			if (existingSubscription) {
				// If they have a Razorpay subscription, cancel it
				if (existingSubscription.razorpaySubscriptionId) {
					try {
						await cancelRazorpaySubscription(
							existingSubscription.razorpaySubscriptionId
						);
					} catch (error) {
						console.error(
							"Error canceling Razorpay subscription:",
							error
						);
					}
				}

				// Update to free plan
				existingSubscription.planId = "free";
				existingSubscription.tier = "free";
				existingSubscription.status = "active";
				existingSubscription.razorpaySubscriptionId = undefined;
				existingSubscription.razorpayOrderId = undefined;
				existingSubscription.razorpayPaymentId = undefined;
				existingSubscription.currentPeriodEnd = new Date(
					Date.now() + 365 * 24 * 60 * 60 * 1000
				);
				existingSubscription.updatedAt = new Date();
				await existingSubscription.save();

				return NextResponse.json({
					id: existingSubscription._id,
					userId: existingSubscription.userId.toString(),
					planId: existingSubscription.planId,
					tier: existingSubscription.tier,
					status: existingSubscription.status,
					currentPeriodEnd: existingSubscription.currentPeriodEnd,
					createdAt: existingSubscription.createdAt,
				});
			}

			// Create new free subscription
			const newSubscription = await Subscription.create({
				userId: new mongoose.Types.ObjectId(userId),
				planId: "free",
				tier: "free",
				status: "active",
				currentPeriodEnd: new Date(
					Date.now() + 365 * 24 * 60 * 60 * 1000
				), // 1 year from now
			});

			return NextResponse.json({
				id: newSubscription._id,
				userId: newSubscription.userId.toString(),
				planId: newSubscription.planId,
				tier: newSubscription.tier,
				status: newSubscription.status,
				currentPeriodEnd: newSubscription.currentPeriodEnd,
				createdAt: newSubscription.createdAt,
			});
		}

		// For premium plan
		if (planId === "premium") {
			// Check if user already has a Razorpay customer ID
			if (!user.razorpayCustomerId) {
				// Create a Razorpay customer
				const customer = await createRazorpayCustomer(
					user.name || user.email,
					user.email
				);

				// Update user with Razorpay customer ID
				user.razorpayCustomerId = customer.id;
				await user.save();
			}

			// Create a Razorpay order
			const order = await createRazorpayOrder(
				PREMIUM_PLAN_PRICE,
				`subscription_${user._id.toString()}`
			);

			// Create or update subscription record
			if (existingSubscription) {
				existingSubscription.planId = "premium";
				existingSubscription.tier = "premium";
				existingSubscription.status = "pending";
				existingSubscription.razorpayOrderId = order.id;
				existingSubscription.updatedAt = new Date();
				await existingSubscription.save();
			} else {
				await Subscription.create({
					userId: new mongoose.Types.ObjectId(userId),
					planId: "premium",
					tier: "premium",
					status: "pending",
					razorpayOrderId: order.id,
					currentPeriodEnd: new Date(
						Date.now() + 30 * 24 * 60 * 60 * 1000
					), // Will be updated after payment
				});
			}

			// Return order details for client-side payment
			return NextResponse.json({
				orderId: order.id,
				amount: order.amount,
				currency: order.currency,
				keyId: RAZORPAY_KEY_ID,
			});
		}

		return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
	} catch (error) {
		console.error("Error creating subscription:", error);
		return NextResponse.json(
			{ error: "Failed to create subscription" },
			{ status: 500 }
		);
	}
}

// Cancel subscription
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
		const body = await request.json();
		const { subscriptionId, updates } = body;

		if (!subscriptionId || !updates) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		const subscription = await Subscription.findByIdAndUpdate(
			subscriptionId,
			{ $set: updates },
			{ new: true }
		).populate("userId", "name email");

		if (!subscription) {
			return NextResponse.json(
				{ error: "Subscription not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(subscription);
	} catch (error) {
		console.error("Error updating subscription:", error);
		return NextResponse.json(
			{ error: "Failed to update subscription" },
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

		await connectDb();
		const { searchParams } = new URL(request.url);
		const subscriptionId = searchParams.get("subscriptionId");

		if (!subscriptionId) {
			return NextResponse.json(
				{ error: "Subscription ID is required" },
				{ status: 400 }
			);
		}

		const subscription = await Subscription.findByIdAndDelete(
			subscriptionId
		);

		if (!subscription) {
			return NextResponse.json(
				{ error: "Subscription not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: "Subscription deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting subscription:", error);
		return NextResponse.json(
			{ error: "Failed to delete subscription" },
			{ status: 500 }
		);
	}
}
