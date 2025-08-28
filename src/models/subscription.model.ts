import mongoose, { Schema, Document } from "mongoose";
import "./user.model";

export interface ISubscription extends Document {
	userId: mongoose.Types.ObjectId;
	planId: string;
	planName: string;
	tier: "free" | "premium";
	status: "pending" | "active" | "canceled" | "expired" | "rejected";

	// Payment fields
	transactionId?: string;
	upiId?: string;
	paymentMethod: string;
	amount: number;
	billingCycle: "monthly" | "annually";

	// Admin verification fields
	adminNotes?: string;
	verifiedBy?: mongoose.Types.ObjectId;
	verifiedAt?: Date;

	// Subscription details
	currentPeriodStart: Date;
	currentPeriodEnd: Date;
	planDuration: string; // "monthly", "annually"
	autoRenew: boolean;

	// Timestamps
	createdAt: Date;
	updatedAt: Date;
	cancelledAt?: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		planId: { type: String, required: true },
		planName: { type: String, required: true },
		tier: { type: String, enum: ["free", "premium"], required: true },
		status: {
			type: String,
			enum: ["pending", "active", "canceled", "expired", "rejected"],
			required: true,
		},

		// Payment fields
		transactionId: { type: String },
		upiId: { type: String },
		paymentMethod: { type: String, default: "UPI" },
		amount: { type: Number, required: true },
		billingCycle: {
			type: String,
			enum: ["monthly", "annually"],
			default: "monthly",
		},

		// Admin verification fields
		adminNotes: { type: String },
		verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
		verifiedAt: { type: Date },

		// Subscription details
		currentPeriodStart: { type: Date, required: true },
		currentPeriodEnd: { type: Date, required: true },
		planDuration: {
			type: String,
			enum: ["monthly", "annually"],
			default: "monthly",
		},
		autoRenew: { type: Boolean, default: true },

		cancelledAt: { type: Date },
	},
	{ timestamps: true }
);

// Add a compound index to ensure one active subscription per user
SubscriptionSchema.index(
	{ userId: 1, status: 1 },
	{ unique: true, partialFilterExpression: { status: "active" } }
);

// Index for UPI transaction tracking
SubscriptionSchema.index({ transactionId: 1 });
// SubscriptionSchema.index({ upiId: 1 });

// Index for admin verification queries
SubscriptionSchema.index({ status: 1, createdAt: 1 });
SubscriptionSchema.index({ verifiedBy: 1 });

export const Subscription =
	mongoose.models.Subscription ||
	mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
