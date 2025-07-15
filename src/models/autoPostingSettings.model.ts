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

// Create a compound index for userId to ensure uniqueness
autoPostingSettingsSchema.index({ userId: 1 }, { unique: true });

const AutoPostingSettings =
	mongoose.models.AutoPostingSettings ||
	mongoose.model("AutoPostingSettings", autoPostingSettingsSchema);

// Support both CommonJS and ES modules
export { AutoPostingSettings };
export default { AutoPostingSettings };
