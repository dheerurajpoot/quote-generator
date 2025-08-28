import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/dbconfig";
import { Subscription } from "@/models/subscription.model";
import { User } from "@/models/user.model";
import { Transaction } from "@/models/transaction.model";

export async function POST(request: NextRequest) {
	try {
		await connectDb();

		const body = await request.json();
		const {
			userId,
			planId,
			planName,
			amount,
			billingCycle,
			transactionId,
			upiId,
		} = body;
		console.log("body", body);

		// Validate required fields
		if (
			!userId ||
			!planId ||
			!planName ||
			!amount ||
			!billingCycle ||
			!transactionId ||
			!upiId
		) {
			return NextResponse.json(
				{ message: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Validate billing cycle
		if (!["monthly", "annually"].includes(billingCycle)) {
			return NextResponse.json(
				{ message: "Invalid billing cycle" },
				{ status: 400 }
			);
		}

		// Check if user exists
		const user = await User.findById(userId);
		if (!user) {
			return NextResponse.json(
				{ message: "User not found" },
				{ status: 404 }
			);
		}

		// Check if transaction ID already exists
		const existingPayment = await Subscription.findOne({ transactionId });
		if (existingPayment) {
			return NextResponse.json(
				{ message: "Transaction ID already exists" },
				{ status: 400 }
			);
		}

		// Check if user already has a pending subscription for this plan
		const existingPendingSubscription = await Subscription.findOne({
			userId,
			planId,
			status: "pending",
		});

		if (existingPendingSubscription) {
			return NextResponse.json(
				{
					message:
						"You already have a pending subscription for this plan",
				},
				{ status: 400 }
			);
		}

		// Create pending subscription
		const pendingSubscription = new Subscription({
			userId,
			planId,
			planName,
			tier: planId === "free" ? "free" : "premium",
			status: "pending",
			amount,
			billingCycle,
			planDuration: billingCycle,
			transactionId,
			upiId,
			paymentMethod: "UPI",
			currentPeriodStart: new Date(),
			currentPeriodEnd: new Date(),
			autoRenew: true,
		});

		const savedSubscription = await pendingSubscription.save();

		// Create transaction record
		const transaction = new Transaction({
			userId,
			subscriptionId: savedSubscription._id,
			amount,
			currency: "INR",
			status: "pending",
			paymentMethod: "UPI",
			upiId,
			transactionId,
			description: `UPI payment for ${planName} plan`,
			planName,
			planDuration: billingCycle,
			billingCycle,
		});

		const transactionResult = await transaction.save();

		return NextResponse.json({
			success: true,
			message:
				"Payment submitted successfully. Your subscription will be activated after verification.",
			paymentId: savedSubscription._id,
			transactionId: transactionResult._id,
			status: "success",
		});
	} catch (error) {
		console.error("UPI payment submission error:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}
