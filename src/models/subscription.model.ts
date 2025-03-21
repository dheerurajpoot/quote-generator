import mongoose, { Schema } from "mongoose";

export interface ISubscription extends Document {
	userId: mongoose.Types.ObjectId;
	planId: string;
	tier: "free" | "premium";
	status: "active" | "pending" | "canceled" | "expired";
	razorpaySubscriptionId?: string;
	razorpayOrderId?: string;
	razorpayPaymentId?: string;
	currentPeriodEnd: Date;
	createdAt: Date;
	updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
	userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
	planId: { type: String, required: true },
	tier: { type: String, enum: ["free", "premium"], required: true },
	status: {
		type: String,
		enum: ["active", "pending", "canceled", "expired"],
		required: true,
	},
	razorpaySubscriptionId: { type: String },
	razorpayOrderId: { type: String },
	razorpayPaymentId: { type: String },
	currentPeriodEnd: { type: Date, required: true },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

export const Subscription =
	mongoose.models.Subscription ||
	mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
