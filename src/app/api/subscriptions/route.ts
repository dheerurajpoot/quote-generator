import { NextResponse } from "next/server";
import mongoose from "mongoose";
import stripe, {
	createCheckoutSession,
	createPortalSession,
	PREMIUM_PRICE_ID,
} from "@/lib/stripe";
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
			status: { $in: ["active", "cancelled"] },
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
			stripeSubscriptionId: subscription.stripeSubscriptionId,
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
				// If they have a Stripe subscription, cancel it
				if (existingSubscription.stripeSubscriptionId) {
					try {
						await stripe.subscriptions.cancel(
							existingSubscription.stripeSubscriptionId
						);
					} catch (error) {
						console.error(
							"Error canceling Stripe subscription:",
							error
						);
					}
				}

				// Update to free plan
				existingSubscription.planId = "free";
				existingSubscription.tier = "free";
				existingSubscription.status = "active";
				existingSubscription.stripeSubscriptionId = undefined;
				existingSubscription.stripePriceId = undefined;
				existingSubscription.stripeCurrentPeriodEnd = undefined;
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

		// For premium plan, create a Stripe checkout session
		if (planId === "premium") {
			// Check if user already has a Stripe customer ID
			if (!user.stripeCustomerId) {
				// Create a Stripe customer
				const customer = await stripe.customers.create({
					email: user.email,
					name: user.name || undefined,
					metadata: {
						userId: user._id.toString(),
					},
				});

				// Update user with Stripe customer ID
				user.stripeCustomerId = customer.id;
				await user.save();
			}

			// Create a checkout session
			const session = await createCheckoutSession(
				user._id.toString(),
				PREMIUM_PRICE_ID
			);

			return NextResponse.json({ url: session.url });
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

// Create a billing portal session
export async function PUT(request: Request) {
	try {
		await connectDb();

		const body = await request.json();
		const { userId } = body;

		// Validate input
		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}

		// Find user
		const user = await User.findById(userId);
		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		// Check if user has a Stripe customer ID
		if (!user.stripeCustomerId) {
			return NextResponse.json(
				{ error: "No subscription found" },
				{ status: 404 }
			);
		}

		// Create a billing portal session
		const session = await createPortalSession(user.stripeCustomerId);

		return NextResponse.json({ url: session.url });
	} catch (error) {
		console.error("Error creating billing portal session:", error);
		return NextResponse.json(
			{ error: "Failed to create billing portal session" },
			{ status: 500 }
		);
	}
}
