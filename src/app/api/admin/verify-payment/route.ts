import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/dbconfig";
import { Subscription } from "@/models/subscription.model";
import { Transaction } from "@/models/transaction.model";

export async function POST(request: NextRequest) {
	try {
		await connectDb();

		const body = await request.json();
		const { paymentId, action, adminNotes, adminId } = body;

		// Validate required fields
		if (!paymentId || !action || !adminId) {
			return NextResponse.json(
				{ message: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Validate action
		if (!["approve", "reject"].includes(action)) {
			return NextResponse.json(
				{ message: "Invalid action" },
				{ status: 400 }
			);
		}

		// Find the pending subscription
		const pendingSubscription = await Subscription.findOne({
			_id: paymentId,
			status: "pending",
		});

		if (!pendingSubscription) {
			return NextResponse.json(
				{ message: "Pending payment not found" },
				{ status: 404 }
			);
		}

		// Update subscription status
		pendingSubscription.status =
			action === "approve" ? "active" : "rejected";
		pendingSubscription.adminNotes = adminNotes || "";
		pendingSubscription.verifiedBy = adminId;
		pendingSubscription.verifiedAt = new Date();

		// Create transaction record
		const transactionData = {
			userId: pendingSubscription.userId,
			subscriptionId: pendingSubscription._id,
			amount: pendingSubscription.amount,
			currency: "INR",
			status: action === "approve" ? "success" : "rejected",
			paymentMethod: pendingSubscription.paymentMethod,
			upiId: pendingSubscription.upiId,
			transactionId: pendingSubscription.transactionId,
			description: `${
				action === "approve" ? "Payment approved" : "Payment rejected"
			} for ${pendingSubscription.planName}`,
			planName: pendingSubscription.planName,
			planDuration: pendingSubscription.planDuration,
			billingCycle: pendingSubscription.billingCycle,
			adminNotes: adminNotes || "",
			verifiedBy: adminId,
			verifiedAt: new Date(),
			paidAt: action === "approve" ? new Date() : undefined,
		};

		const transaction = new Transaction(transactionData);

		if (action === "approve") {
			// Update subscription period dates
			pendingSubscription.currentPeriodStart = new Date();
			pendingSubscription.currentPeriodEnd = new Date(
				Date.now() +
					(pendingSubscription.billingCycle === "monthly"
						? 30
						: 365) *
						24 *
						60 *
						60 *
						1000
			);
			pendingSubscription.autoRenew = true;

			// Check if user already has an active subscription
			const existingActiveSubscription = await Subscription.findOne({
				userId: pendingSubscription.userId,
				status: "active",
			});

			if (existingActiveSubscription) {
				// Cancel existing subscription
				existingActiveSubscription.status = "canceled";
				existingActiveSubscription.cancelledAt = new Date();
				await existingActiveSubscription.save();
			}
		}

		// Save both subscription and transaction
		await Promise.all([pendingSubscription.save(), transaction.save()]);

		return NextResponse.json({
			success: true,
			message:
				action === "approve"
					? "Payment approved and subscription activated"
					: "Payment rejected",
			subscription: pendingSubscription,
			transaction: transaction,
		});
	} catch (error) {
		console.error("Payment verification error:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}

// Get all pending payments for admin dashboard
export async function GET(request: NextRequest) {
	try {
		await connectDb();

		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status") || "pending";
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");

		const query = status === "all" ? {} : { status };

		const pendingSubscriptions = await Subscription.find(query)
			.populate("userId", "name email")
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit);

		const total = await Subscription.countDocuments(query);

		return NextResponse.json({
			success: true,
			payments: pendingSubscriptions,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error: unknown) {
		console.error("Get pending payments error:", error);
		const errorMessage =
			(error as Error)?.message || "Failed to fetch payments";
		return NextResponse.json({ message: errorMessage }, { status: 500 });
	}
}
