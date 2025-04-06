import mongoose from "mongoose";

let isConnected = false;

const connectDb = async () => {
	if (isConnected) {
		console.log("Database already connected!");
		return isConnected;
	}
	try {
		if (!process.env.MONGO_URI) {
			throw new Error(
				"MONGO_URI is not defined in environment variables"
			);
		}

		const res = await mongoose.connect(process.env.MONGO_URI);
		isConnected = res.connection;
		console.log("Database connected successfully");
		return isConnected;
	} catch (error) {
		console.error("Error connecting to database:", error);
		throw error;
	}
};

module.exports = { connectDb };
