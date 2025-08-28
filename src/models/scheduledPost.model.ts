import mongoose, { Schema, Document } from "mongoose";

export interface IScheduledPost extends Document {
	userId: mongoose.Types.ObjectId;
	title: string;
	content: string;
	postType: "text" | "image" | "video";
	platforms: string[];
	status: "draft" | "scheduled" | "published" | "failed" | "cancelled";

	// Content details
	mediaFiles?: string[]; // Cloudinary URLs
	hashtags?: string[];

	// Scheduling - Single datetime field for cron compatibility
	scheduledAt?: Date; // ISO datetime string for easy cron triggering

	// Publishing details
	publishedDate?: Date;
	publishedPlatforms?: string[]; // Which platforms were successfully published to
	failureReasons?: Record<string, string>; // Platform-specific failure reasons

	// Platform-specific settings
	platformSettings?: {
		facebook?: {
			pageId?: string;
			customMessage?: string;
		};
		instagram?: {
			caption?: string;
			location?: string;
		};
		twitter?: {
			replyTo?: string;
		};
		linkedin?: {
			companyPage?: string;
		};
	};

	// Analytics
	analytics?: {
		reach?: number;
		engagement?: number;
		clicks?: number;
		shares?: number;
		likes?: number;
		comments?: number;
	};

	// Metadata
	createdAt: Date;
	updatedAt: Date;
	lastModifiedBy: mongoose.Types.ObjectId;
}

const ScheduledPostSchema = new Schema<IScheduledPost>(
	{
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		title: { type: String, required: true, trim: true },
		content: { type: String, required: true, trim: true },
		postType: {
			type: String,
			enum: ["text", "image", "video"],
			required: true,
		},
		platforms: [
			{
				type: String,
				enum: ["facebook", "instagram", "twitter", "linkedin"],
				required: true,
			},
		],
		status: {
			type: String,
			enum: ["draft", "scheduled", "published", "failed", "cancelled"],
			default: "draft",
		},

		// Content details
		mediaFiles: [{ type: String }], // Cloudinary URLs
		hashtags: [{ type: String }],

		// Scheduling - Single datetime field for cron compatibility
		scheduledAt: { type: Date }, // ISO datetime for easy cron triggering

		// Publishing details
		publishedDate: { type: Date },
		publishedPlatforms: [{ type: String }],
		failureReasons: { type: Schema.Types.Mixed },

		// Platform-specific settings
		platformSettings: {
			facebook: {
				pageId: { type: String },
				customMessage: { type: String },
			},
			instagram: {
				caption: { type: String },
				location: { type: String },
			},
			twitter: {
				replyTo: { type: String },
			},
			linkedin: {
				companyPage: { type: String },
			},
		},

		// Analytics
		analytics: {
			reach: { type: Number, default: 0 },
			engagement: { type: Number, default: 0 },
			clicks: { type: Number, default: 0 },
			shares: { type: Number, default: 0 },
			likes: { type: Number, default: 0 },
			comments: { type: Number, default: 0 },
		},
	},
	{ timestamps: true }
);

// Indexes for efficient querying and cron compatibility
ScheduledPostSchema.index({ userId: 1, status: 1 });
ScheduledPostSchema.index({ status: 1, scheduledAt: 1 }); // For cron jobs to find posts ready to publish
ScheduledPostSchema.index({ platforms: 1 });
ScheduledPostSchema.index({ createdAt: 1 });

// Pre-save middleware to update timestamps
ScheduledPostSchema.pre("save", function (next) {
	this.updatedAt = new Date();
	next();
});

// Method to check if post is ready to publish (cron compatible)
ScheduledPostSchema.methods.isReadyToPublish = function () {
	if (this.status !== "scheduled") return false;
	if (!this.scheduledAt) return false;

	const now = new Date();
	return now >= this.scheduledAt;
};

// Method to mark as published
ScheduledPostSchema.methods.markAsPublished = function (platform: string) {
	if (!this.publishedPlatforms) this.publishedPlatforms = [];
	if (!this.publishedPlatforms.includes(platform)) {
		this.publishedPlatforms.push(platform);
	}

	// If all platforms are published, update status
	if (this.publishedPlatforms.length === this.platforms.length) {
		this.status = "published";
		this.publishedDate = new Date();
	}
};

// Method to mark as failed
ScheduledPostSchema.methods.markAsFailed = function (
	platform: string,
	reason: string
) {
	if (!this.failureReasons) this.failureReasons = {};
	this.failureReasons[platform] = reason;

	// If any platform failed, update status
	this.status = "failed";
};

export const ScheduledPost =
	mongoose.models.ScheduledPost ||
	mongoose.model<IScheduledPost>("ScheduledPost", ScheduledPostSchema);
