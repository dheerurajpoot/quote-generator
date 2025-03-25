import mongoose, { Schema } from "mongoose";

export interface IConfig extends Document {
	key: string;
	value: any;
	description?: string;
	updatedAt: Date;
}

const ConfigSchema = new Schema<IConfig>({
	key: { type: String, required: true, unique: true },
	value: { type: Schema.Types.Mixed, required: true },
	description: { type: String },
	updatedAt: { type: Date, default: Date.now },
});

export const Config =
	mongoose.models.Config || mongoose.model<IConfig>("Config", ConfigSchema);
