import mongoose, { Schema } from "mongoose";

// Subscription Model
export interface ISubscription extends Document {
	userId: mongoose.Types.ObjectId;
	planId: string;
	tier: "free" | "premium";
	status: "active" | "canceled" | "expired";
	stripeSubscriptionId?: string;
	stripePriceId?: string;
	stripeCurrentPeriodEnd?: Date;
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
		enum: ["active", "cancelled", "expired"],
		required: true,
	},
	stripeSubscriptionId: { type: String },
	stripePriceId: { type: String },
	stripeCurrentPeriodEnd: { type: Date },
	currentPeriodEnd: { type: Date, required: true },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

export const Subscription =
	mongoose.models.Subscription ||
	mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
