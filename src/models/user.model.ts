import mongoose from "mongoose";

const userModel = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: true,
			trim: true,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		isBlocked: {
			type: Boolean,
			default: false,
		},
		razorpayCustomerId: { type: String },
		role: {
			type: String,
			enum: ["user", "admin"],
			default: "user",
		},
		forgotPasswordToken: String,
		forgotPasswordTokenExpiry: Date,
		verifyToken: String,
		verifyTokenExpiry: Date,
		facebookAppId: { type: String },
		facebookAppSecret: { type: String },
		author: {
			type: String,
			default: "QuoteArt",
		},
	},
	{ timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", userModel);
