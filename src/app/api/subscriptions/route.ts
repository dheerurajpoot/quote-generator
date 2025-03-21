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

export async function GET(request: Request) {
	try {
		await connectDb();

		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}

		// Find active subscription for user
		const subscription = await Subscription.findOne({
			userId: new mongoose.Types.ObjectId(userId),
			status: { $in: ["active", "canceled"] },
		});

		if (!subscription) {
			// Create a free subscription for the user if none exists
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

		// Check if subscription is expired
		if (subscription.currentPeriodEnd < new Date()) {
			subscription.status = "expired";
			await subscription.save();
		}

		return NextResponse.json({
			id: subscription._id,
			userId: subscription.userId.toString(),
			planId: subscription.planId,
			tier: subscription.tier,
			status: subscription.status,
			currentPeriodEnd: subscription.currentPeriodEnd,
			createdAt: subscription.createdAt,
			razorpaySubscriptionId: subscription.razorpaySubscriptionId,
		});
	} catch (error) {
		console.error("Error fetching subscription:", error);
		return NextResponse.json(
			{ error: "Failed to fetch subscription" },
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

		// For free plan, just create a subscription record
		if (planId === "free") {
			const existingSubscription = await Subscription.findOne({
				userId: new mongoose.Types.ObjectId(userId),
			});

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

		// For premium plan, create a Razorpay order
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
			const existingSubscription = await Subscription.findOne({
				userId: new mongoose.Types.ObjectId(userId),
			});

			if (existingSubscription) {
				existingSubscription.planId = "premium";
				existingSubscription.tier = "premium";
				existingSubscription.status = "pending"; // Will be updated to active after payment
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
		await connectDb();

		const body = await request.json();
		const { subscriptionId } = body;

		// Validate input
		if (!subscriptionId) {
			return NextResponse.json(
				{ error: "Subscription ID is required" },
				{ status: 400 }
			);
		}

		// Find subscription
		const subscription = await Subscription.findById(subscriptionId);
		if (!subscription) {
			return NextResponse.json(
				{ error: "Subscription not found" },
				{ status: 404 }
			);
		}

		// Cancel Razorpay subscription if exists
		if (subscription.razorpaySubscriptionId) {
			try {
				await cancelRazorpaySubscription(
					subscription.razorpaySubscriptionId
				);
			} catch (error) {
				console.error("Error canceling Razorpay subscription:", error);
			}
		}

		// Update subscription status
		subscription.status = "canceled";
		subscription.updatedAt = new Date();
		await subscription.save();

		return NextResponse.json({
			id: subscription._id,
			userId: subscription.userId.toString(),
			planId: subscription.planId,
			tier: subscription.tier,
			status: subscription.status,
			currentPeriodEnd: subscription.currentPeriodEnd,
			createdAt: subscription.createdAt,
		});
	} catch (error) {
		console.error("Error canceling subscription:", error);
		return NextResponse.json(
			{ error: "Failed to cancel subscription" },
			{ status: 500 }
		);
	}
}
