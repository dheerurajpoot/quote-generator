import mongoose, { Schema } from "mongoose";

export interface ISocialConnection extends Document {
	userId: mongoose.Types.ObjectId;
	platform: string;
	accessToken: string;
	refreshToken?: string;
	expiresAt?: Date;
	profileId: string;
	profileName: string;
	profileImage?: string;
	createdAt: Date;
	updatedAt: Date;
}

const SocialConnectionSchema = new Schema<ISocialConnection>({
	userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
	platform: { type: String, enum: ["facebook", "instagram"], required: true },
	accessToken: { type: String, required: true },
	refreshToken: { type: String },
	expiresAt: { type: Date },
	profileId: { type: String, required: true },
	profileName: { type: String, required: true },
	profileImage: { type: String },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});
export const SocialConnection =
	mongoose.models.SocialConnection ||
	mongoose.model<ISocialConnection>(
		"SocialConnection",
		SocialConnectionSchema
	);
