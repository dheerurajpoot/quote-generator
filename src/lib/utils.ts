import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import jwt from "jsonwebtoken";
import { connectDb } from "./dbconfig";
import { User } from "@/models/user.model";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function generateHashtags(content: string, count: number = 5): string[] {
	const hashtagPattern = /#\w+/g;
	const existingHashtags =
		content.match(hashtagPattern)?.map((match) => match) || [];

	// Common motivational hashtags
	const commonHashtags = [
		"#motivation",
		"#inspiration",
		"#success",
		"#mindset",
		"#goals",
		"#positive",
		"#happiness",
		"#life",
		"#love",
		"#peace",
		"#growth",
		"#change",
		"#believe",
		"#dream",
		"#achieve",
		"#strength",
		"#courage",
		"#wisdom",
		"#knowledge",
		"#learning",
		"#gratitude",
		"#blessed",
		"#faith",
		"#hope",
		"#joy",
		"#fitness",
		"#health",
		"#wellness",
		"#mindfulness",
		"#meditation",
	];

	// Filter out existing hashtags and get random ones
	const availableHashtags = commonHashtags.filter(
		(hashtag) => !existingHashtags.includes(hashtag)
	);

	const randomHashtags = availableHashtags
		.sort(() => Math.random() - 0.5)
		.slice(0, Math.min(count, availableHashtags.length));

	return [...existingHashtags, ...randomHashtags];
}

// Helper function to get user from token
export async function getUserFromToken(token: string) {
	try {
		const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as {
			userId: string;
		};

		await connectDb();
		const user = await User.findById(decoded.userId);

		return user;
	} catch (error) {
		console.error("Error getting user from token:", error);
		return null;
	}
}
