import { NextResponse } from "next/server";
import { headers } from "next/headers";
import stripe from "@/lib/stripe";
import { connectDb } from "@/lib/dbconfig";
import { User } from "@/models/user.model";
import { Subscription } from "@/models/subscription.model";

export async function POST(req: Request) {
	const body = await req.text();
	const headersList = await headers();
	const signature = headersList.get("Stripe-Signature") as string;

	let event;

	try {
		event = stripe.webhooks.constructEvent(
			body,
			signature,
			process.env.STRIPE_WEBHOOK_SECRET || ""
		);
	} catch (error: any) {
		return new NextResponse(`Webhook Error: ${error.message}`, {
			status: 400,
		});
	}

	await connectDb();

	try {
		switch (event.type) {
			case "checkout.session.completed":
				const checkoutSession = event.data.object;
				const userId = checkoutSession.metadata?.userId;

				if (!userId) {
					throw new Error("No userId found in session metadata");
				}

				// Update user with Stripe customer ID
				await User.findByIdAndUpdate(userId, {
					stripeCustomerId: checkoutSession.customer,
				});

				break;

			case "customer.subscription.created":
			case "customer.subscription.updated":
				const subscription = event.data.object;
				const stripeCustomerId = subscription.customer as string;

				// Find user by Stripe customer ID
				const user = await User.findOne({ stripeCustomerId });
				if (!user) {
					throw new Error(
						`No user found with Stripe customer ID: ${stripeCustomerId}`
					);
				}

				// Get subscription details
				const subscriptionItem = subscription.items.data[0];
				const stripePriceId = subscriptionItem.price.id;

				// Determine tier based on price ID
				const tier =
					stripePriceId === process.env.STRIPE_PREMIUM_PRICE_ID
						? "premium"
						: "free";

				// Update or create subscription
				await Subscription.findOneAndUpdate(
					{ userId: user._id },
					{
						planId: tier,
						tier,
						status:
							subscription.status === "active"
								? "active"
								: "cancelled",
						stripeSubscriptionId: subscription.id,
						stripePriceId,
						stripeCurrentPeriodEnd: new Date(
							subscription.current_period_end * 1000
						),
						currentPeriodEnd: new Date(
							subscription.current_period_end * 1000
						),
						updatedAt: new Date(),
					},
					{ upsert: true, new: true }
				);

				break;

			case "customer.subscription.deleted":
				const deletedSubscription = event.data.object;
				const customerIdToDelete =
					deletedSubscription.customer as string;

				// Find user by Stripe customer ID
				const userToUpdate = await User.findOne({
					stripeCustomerId: customerIdToDelete,
				});
				if (!userToUpdate) {
					throw new Error(
						`No user found with Stripe customer ID: ${customerIdToDelete}`
					);
				}

				// Update subscription status
				await Subscription.findOneAndUpdate(
					{
						userId: userToUpdate._id,
						stripeSubscriptionId: deletedSubscription.id,
					},
					{
						status: "cancelled",
						updatedAt: new Date(),
					}
				);

				break;
		}

		return NextResponse.json({ received: true });
	} catch (error: unknown) {
		if (error instanceof Error) {
			return new NextResponse(`Webhook Error: ${error.message}`, {
				status: 400,
			});
		}
		return new NextResponse("Webhook Error: Unknown error", {
			status: 400,
		});
	}
}
