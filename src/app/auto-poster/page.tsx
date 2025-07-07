import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDb } from "@/lib/dbconfig";
import { User } from "@/models/user.model";
import { Subscription } from "@/models/subscription.model";
import AutoQuotePoster from "@/components/auto-quote-poster";
import jwt from "jsonwebtoken";

export default async function AutoPosterPage() {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;

	if (!token) {
		redirect("/login");
	}

	let userId: string | null = null;
	try {
		const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as {
			userId: string;
		};
		userId = decoded.userId;
	} catch {
		redirect("/login");
	}

	await connectDb();
	const user = await User.findById(userId);
	if (!user) {
		redirect("/login");
	}

	// Find the user's active or valid subscription
	const subscription = await Subscription.findOne({
		userId: user._id,
		$or: [
			{ status: "active" },
			{ status: "canceled", currentPeriodEnd: { $gt: new Date() } },
		],
	});

	if (!subscription || subscription.tier !== "premium") {
		redirect("/pricing");
	}

	return (
		<main className='container mx-auto py-16'>
			<div className='max-w-4xl mx-auto space-y-8'>
				<AutoQuotePoster />
			</div>
		</main>
	);
}
