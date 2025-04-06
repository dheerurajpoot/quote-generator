import mongoose from "mongoose";

const autoPostingSettingsSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
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
	},
	{
		timestamps: true,
	}
);

// Create a compound index for userId to ensure uniqueness
autoPostingSettingsSchema.index({ userId: 1 }, { unique: true });

const AutoPostingSettings =
	mongoose.models.AutoPostingSettings ||
	mongoose.model("AutoPostingSettings", autoPostingSettingsSchema);

export { AutoPostingSettings };
