import mongoose, { Schema, Document } from "mongoose";
import "./subscription.model";
import "./user.model";

export interface ITransaction extends Document {
	userId: mongoose.Types.ObjectId;
	subscriptionId: mongoose.Types.ObjectId;
	amount: number;
	currency: string;
	status: "pending" | "success" | "failed" | "cancelled" | "rejected";
	paymentMethod: "UPI" | "other";

	// UPI specific fields
	upiId?: string;
	transactionId?: string;

	// Transaction details
	description: string;
	planName: string;
	planDuration: string;
	billingCycle: "monthly" | "annually";

	// Admin verification fields
	adminNotes?: string;
	verifiedBy?: mongoose.Types.ObjectId;
	verifiedAt?: Date;

	// Timestamps
	createdAt: Date;
	updatedAt: Date;
	paidAt?: Date;
}

const TransactionSchema = new Schema<ITransaction>({
	userId: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
		index: true,
	},
	subscriptionId: {
		type: Schema.Types.ObjectId,
		ref: "Subscription",
		required: true,
		index: true,
	},
	amount: {
		type: Number,
		required: true,
		min: 0,
	},
	currency: {
		type: String,
		required: true,
		default: "INR",
	},
	status: {
		type: String,
		enum: ["pending", "success", "failed", "cancelled", "rejected"],
		required: true,
		default: "pending",
	},
	paymentMethod: {
		type: String,
		enum: ["UPI", "other"],
		required: true,
		default: "UPI",
	},

	// UPI specific fields
	upiId: { type: String, index: true },
	transactionId: { type: String, index: true },

	// Transaction details
	description: { type: String, required: true },
	planName: { type: String, required: true },
	planDuration: { type: String, required: true },
	billingCycle: {
		type: String,
		enum: ["monthly", "annually"],
		required: true,
	},

	// Admin verification fields
	adminNotes: { type: String },
	verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
	verifiedAt: { type: Date },

	// Timestamps
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
	paidAt: { type: Date },
});

// Indexes for efficient querying
TransactionSchema.index({ userId: 1, status: 1 });
TransactionSchema.index({ subscriptionId: 1, status: 1 });
// TransactionSchema.index({ upiId: 1 });
// TransactionSchema.index({ transactionId: 1 });
TransactionSchema.index({ status: 1, createdAt: 1 });
TransactionSchema.index({ verifiedBy: 1 });

export const Transaction =
	mongoose?.models?.Transaction ||
	mongoose.model<ITransaction>("Transaction", TransactionSchema);
