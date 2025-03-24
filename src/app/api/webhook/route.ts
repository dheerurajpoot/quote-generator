import { connectDb } from "@/lib/dbconfig";
import { Subscription } from "@/models/subscription.model";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createRazorpaySubscription } from "@/lib/razorpay";

// Verify Razorpay webhook signature
function verifyWebhookSignature(
	body: string,
	signature: string,
	secret: string
): boolean {
	const hmac = crypto.createHmac("sha256", secret);
	hmac.update(body);
	const calculatedSignature = hmac.digest("hex");
	return calculatedSignature === signature;
}

export async function POST(req: Request) {
	try {
		const body = await req.text();
		const signature = req.headers.get("x-razorpay-signature");

		if (!signature) {
			return new NextResponse("Missing signature", { status: 400 });
		}

		// Verify webhook signature
		if (
			!verifyWebhookSignature(
				body,
				signature,
				process.env.RAZORPAY_WEBHOOK_SECRET!
			)
		) {
			return new NextResponse("Invalid signature", { status: 400 });
		}

		const payload = JSON.parse(body);
		const { event } = payload;

		await connectDb();

		switch (event) {
			case "payment.authorized":
				// Payment has been authorized
				const paymentId = payload.payment.entity.id;
				const orderId = payload.payment.entity.order_id;

				// Find subscription by order ID
				const subscription = await Subscription.findOne({
					razorpayOrderId: orderId,
				});

				if (subscription) {
					// Update subscription with payment ID
					subscription.razorpayPaymentId = paymentId;
					subscription.status = "active";
					subscription.updatedAt = new Date();
					await subscription.save();

					// Create Razorpay subscription for recurring payments
					if (subscription.planId === "premium") {
						try {
							const razorpaySubscription =
								await createRazorpaySubscription(
									"premium_plan",
									subscription.userId.toString(),
									12 // 12 months
								);
							subscription.razorpaySubscriptionId =
								razorpaySubscription.id;
							await subscription.save();
						} catch (error) {
							console.error(
								"Error creating Razorpay subscription:",
								error
							);
						}
					}
				}
				break;

			case "subscription.activated":
				// Subscription has been activated
				const subscriptionId = payload.subscription.entity.id;

				// Find subscription by Razorpay subscription ID
				const activatedSubscription = await Subscription.findOne({
					razorpaySubscriptionId: subscriptionId,
				});

				if (activatedSubscription) {
					// Update subscription status
					activatedSubscription.status = "active";
					activatedSubscription.currentPeriodEnd = new Date(
						payload.subscription.entity.current_end * 1000
					);
					activatedSubscription.updatedAt = new Date();
					await activatedSubscription.save();
				}
				break;

			case "subscription.charged":
				// Subscription has been charged (recurring payment)
				const chargedSubscriptionId = payload.subscription.entity.id;

				// Find subscription by Razorpay subscription ID
				const chargedSubscription = await Subscription.findOne({
					razorpaySubscriptionId: chargedSubscriptionId,
				});

				if (chargedSubscription) {
					// Update subscription end date
					chargedSubscription.currentPeriodEnd = new Date(
						payload.subscription.entity.current_end * 1000
					);
					chargedSubscription.updatedAt = new Date();
					await chargedSubscription.save();
				}
				break;

			case "subscription.cancelled":
				// Subscription has been cancelled
				const cancelledSubscriptionId = payload.subscription.entity.id;

				// Find subscription by Razorpay subscription ID
				const cancelledSubscription = await Subscription.findOne({
					razorpaySubscriptionId: cancelledSubscriptionId,
				});

				if (cancelledSubscription) {
					// Update subscription status
					cancelledSubscription.status = "canceled";
					cancelledSubscription.updatedAt = new Date();
					await cancelledSubscription.save();
				}
				break;

			case "subscription.completed":
				// Subscription has completed all charges
				const completedSubscriptionId = payload.subscription.entity.id;

				// Find subscription by Razorpay subscription ID
				const completedSubscription = await Subscription.findOne({
					razorpaySubscriptionId: completedSubscriptionId,
				});

				if (completedSubscription) {
					// Update subscription status
					completedSubscription.status = "expired";
					completedSubscription.updatedAt = new Date();
					await completedSubscription.save();
				}
				break;

			case "subscription.updated":
				// Subscription has been updated
				const updatedSubscriptionId = payload.subscription.entity.id;

				// Find subscription by Razorpay subscription ID
				const updatedSubscription = await Subscription.findOne({
					razorpaySubscriptionId: updatedSubscriptionId,
				});

				if (updatedSubscription) {
					// Update subscription details
					updatedSubscription.status =
						payload.subscription.entity.status;
					updatedSubscription.currentPeriodEnd = new Date(
						payload.subscription.entity.current_end * 1000
					);
					updatedSubscription.updatedAt = new Date();
					await updatedSubscription.save();
				}
				break;
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		console.error("Webhook error:", error);
		return NextResponse.json(
			{ error: "Webhook handler failed" },
			{ status: 500 }
		);
	}
}
