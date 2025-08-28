import mongoose from "mongoose";

const autoPostingCampaignSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		campaignName: {
			type: String,
			trim: true,
			required: true,
		},
		isEnabled: {
			type: Boolean,
			default: false,
		},
		interval: {
			type: Number,
			default: 1,
		},
		platforms: {
			type: [String],
			default: [],
		},
		lastPostTime: {
			type: Date,
			default: null,
		},
		language: {
			type: String,
			enum: ["hindi", "english"],
			default: "hindi",
		},
		template: {
			type: String,
			enum: [
				"classic",
				"minimal",
				"elegant",
				"bold",
				"iconic",
				"neutral",
			],
			default: "classic",
		},
	},
	{
		timestamps: true,
	}
);

export const AutoPostingCampaign =
	mongoose.models?.AutoPostingCampaign ||
	mongoose.model("AutoPostingCampaign", autoPostingCampaignSchema);
