import mongoose, { Schema, Document } from "mongoose";

export interface IPlatformMetrics extends Document {
	connectionId: mongoose.Types.ObjectId;
	platform: "facebook" | "instagram";
	userId: mongoose.Types.ObjectId;

	// Audience metrics
	followers: number;
	following?: number;

	// Content metrics
	totalPosts: number;
	postsThisMonth: number;
	postsThisWeek: number;

	// Engagement metrics
	engagementRate: number;
	reach: number;
	impressions: number;
	clickRate: number;

	// API usage
	apiLimit: number;
	apiUsed: number;

	// Performance metrics
	growthRate: number;
	responseTime: number;
	contentQuality: string;

	// Recent activity
	lastPostAt?: Date;
	bestPerformingPost?: string;
	nextScheduledPost?: Date;

	// Platform-specific data
	pageViews?: number;
	storyViews?: number;
	videoViews?: number;

	// Metadata
	lastFetched: Date;
	createdAt: Date;
	updatedAt: Date;
}

const PlatformMetricsSchema = new Schema<IPlatformMetrics>({
	connectionId: {
		type: Schema.Types.ObjectId,
		ref: "SocialConnection",
		required: true,
	},
	platform: { type: String, enum: ["facebook", "instagram"], required: true },
	userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

	// Audience metrics
	followers: { type: Number, default: 0 },
	following: { type: Number, default: 0 },

	// Content metrics
	totalPosts: { type: Number, default: 0 },
	postsThisMonth: { type: Number, default: 0 },
	postsThisWeek: { type: Number, default: 0 },

	// Engagement metrics
	engagementRate: { type: Number, default: 0 },
	reach: { type: Number, default: 0 },
	impressions: { type: Number, default: 0 },
	clickRate: { type: Number, default: 0 },

	// API usage
	apiLimit: { type: Number, default: 0 },
	apiUsed: { type: Number, default: 0 },

	// Performance metrics
	growthRate: { type: Number, default: 0 },
	responseTime: { type: Number, default: 0 },
	contentQuality: { type: String, default: "Good" },

	// Recent activity
	lastPostAt: { type: Date },
	bestPerformingPost: { type: String },
	nextScheduledPost: { type: Date },

	// Platform-specific data
	pageViews: { type: Number, default: 0 },
	storyViews: { type: Number, default: 0 },
	videoViews: { type: Number, default: 0 },

	// Metadata
	lastFetched: { type: Date, default: Date.now },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

// Index for efficient queries
PlatformMetricsSchema.index({ connectionId: 1, userId: 1 });
PlatformMetricsSchema.index({ platform: 1, userId: 1 });

export const PlatformMetrics =
	mongoose.models.PlatformMetrics ||
	mongoose.model<IPlatformMetrics>("PlatformMetrics", PlatformMetricsSchema);
