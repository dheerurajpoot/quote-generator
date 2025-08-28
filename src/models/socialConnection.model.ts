import mongoose, { Schema, Document } from "mongoose";

export interface ISocialConnection extends Document {
	userId: mongoose.Types.ObjectId;
	platform: "facebook" | "instagram";
	accessToken: string;
	pageAccessToken?: string;
	instagramAccountId?: string;
	profileId: string;
	profileName: string;
	profileImage?: string;
	followers?: number;
	status?: string;
	expiresAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const SocialConnectionSchema = new Schema<ISocialConnection>({
	userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
	platform: { type: String, enum: ["facebook", "instagram"], required: true },
	accessToken: { type: String, required: true },
	pageAccessToken: { type: String },
	instagramAccountId: { type: String },
	profileId: { type: String, required: true },
	profileName: { type: String, required: true },
	profileImage: { type: String },
	followers: { type: Number, default: 0 },
	status: {
		type: String,
		enum: ["connected", "disconnected", "expired"],
		default: "connected",
	},
	expiresAt: { type: Date },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

export const SocialConnection =
	mongoose.models.SocialConnection ||
	mongoose.model<ISocialConnection>(
		"SocialConnection",
		SocialConnectionSchema
	);
