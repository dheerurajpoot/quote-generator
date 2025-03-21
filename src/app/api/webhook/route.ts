import { connectDb } from "@/lib/dbconfig";
import { Subscription } from "@/models/subscription.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { payload, event } = body;

		// Verify webhook signature (in a production environment)
		// const signature = req.headers.get('x-razorpay-signature');
		// if (!verifyWebhookSignature(JSON.stringify(body), signature)) {
		//   return new NextResponse('Invalid signature', { status: 400 });
		// }

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
