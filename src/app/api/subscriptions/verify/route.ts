import { NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { connectDb } from "@/lib/dbconfig";
import { Subscription } from "@/models/subscription.model";

export async function POST(request: Request) {
	try {
		await connectDb();

		const body = await request.json();
		const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
			body;

		// Validate input
		if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
			return NextResponse.json(
				{
					error: "Order ID, Payment ID, and Signature are required",
				},
				{ status: 400 }
			);
		}

		// Verify payment signature
		const isValid = verifyPaymentSignature(
			razorpay_order_id,
			razorpay_payment_id,
			razorpay_signature
		);

		if (!isValid) {
			return NextResponse.json(
				{ error: "Invalid payment signature" },
				{ status: 400 }
			);
		}

		// Find subscription by order ID
		const subscription = await Subscription.findOne({
			razorpayOrderId: razorpay_order_id,
		});

		if (!subscription) {
			return NextResponse.json(
				{ error: "Subscription not found" },
				{ status: 404 }
			);
		}

		// Update subscription
		subscription.razorpayPaymentId = razorpay_payment_id;
		subscription.status = "active";
		subscription.currentPeriodEnd = new Date(
			Date.now() + 30 * 24 * 60 * 60 * 1000
		); // 30 days from now
		subscription.updatedAt = new Date();
		await subscription.save();

		return NextResponse.json({
			success: true,
			subscription: {
				id: subscription._id,
				userId: subscription.userId.toString(),
				planId: subscription.planId,
				tier: subscription.tier,
				status: subscription.status,
				currentPeriodEnd: subscription.currentPeriodEnd,
			},
		});
	} catch (error) {
		console.error("Error verifying payment:", error);
		return NextResponse.json(
			{ error: "Failed to verify payment" },
			{ status: 500 }
		);
	}
}
