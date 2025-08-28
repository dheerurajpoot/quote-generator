import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/dbconfig";
import { getUserFromToken } from "@/lib/utils";
import { User } from "@/models/user.model";
import { Subscription } from "@/models/subscription.model";
import { Transaction } from "@/models/transaction.model";

export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get("token")?.value;

		if (!token) {
			return NextResponse.json(
				{ message: "Authentication required", success: false },
				{ status: 401 }
			);
		}

		const user = await getUserFromToken(token);
		if (!user) {
			return NextResponse.json(
				{ message: "User not found", success: false },
				{ status: 401 }
			);
		}

		// Check if user is admin
		if (user.role !== "admin") {
			return NextResponse.json(
				{
					message: "Unauthorized - Admin access required",
					success: false,
				},
				{ status: 403 }
			);
		}

		await connectDb();

		// Fetch all users
		const users = await User.find({}, { password: 0 }).sort({
			createdAt: -1,
		});

		// Fetch all subscriptions
		const subscriptions = await Subscription.find({}).sort({
			createdAt: -1,
		});

		// Fetch all transactions
		const transactions = await Transaction.find({}).sort({ createdAt: -1 });

		// Calculate statistics
		const totalUsers = users.length;
		const premiumUsers = subscriptions.filter(
			(sub) => sub.tier === "premium" && sub.status === "active"
		).length;

		// Calculate total revenue from successful transactions
		const totalRevenue = transactions
			.filter((txn) => txn.status === "success")
			.reduce((sum, txn) => sum + (txn.amount || 0), 0);

		// Calculate monthly growth (last 30 days vs previous 30 days)
		const now = new Date();
		const thirtyDaysAgo = new Date(
			now.getTime() - 30 * 24 * 60 * 60 * 1000
		);
		const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

		const recentUsers = users.filter(
			(user) => new Date(user.createdAt) >= thirtyDaysAgo
		).length;
		const previousUsers = users.filter(
			(user) =>
				new Date(user.createdAt) >= sixtyDaysAgo &&
				new Date(user.createdAt) < thirtyDaysAgo
		).length;

		const recentRevenue = transactions
			.filter(
				(txn) =>
					txn.status === "success" &&
					new Date(txn.createdAt) >= thirtyDaysAgo
			)
			.reduce((sum, txn) => sum + (txn.amount || 0), 0);

		const previousRevenue = transactions
			.filter(
				(txn) =>
					txn.status === "success" &&
					new Date(txn.createdAt) >= sixtyDaysAgo &&
					new Date(txn.createdAt) < thirtyDaysAgo
			)
			.reduce((sum, txn) => sum + (txn.amount || 0), 0);

		// Calculate growth percentages
		const userGrowth =
			previousUsers > 0
				? Math.round(
						((recentUsers - previousUsers) / previousUsers) * 100
				  )
				: recentUsers > 0
				? 100
				: 0;

		const revenueGrowth =
			previousRevenue > 0
				? Math.round(
						((recentRevenue - previousRevenue) / previousRevenue) *
							100
				  )
				: recentRevenue > 0
				? 100
				: 0;

		// Generate chart data for the last 7 months
		const userChartData = Array.from({ length: 7 }, (_, i) => {
			const date = new Date(now);
			date.setMonth(date.getMonth() - (6 - i));
			const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
			const monthEnd = new Date(
				date.getFullYear(),
				date.getMonth() + 1,
				0
			);

			const monthUsers = users.filter(
				(user) =>
					new Date(user.createdAt) >= monthStart &&
					new Date(user.createdAt) <= monthEnd
			).length;

			return {
				name: date.toLocaleString("default", { month: "short" }),
				total: monthUsers,
			};
		});

		const revenueChartData = Array.from({ length: 7 }, (_, i) => {
			const date = new Date(now);
			date.setMonth(date.getMonth() - (6 - i));
			const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
			const monthEnd = new Date(
				date.getFullYear(),
				date.getMonth() + 1,
				0
			);

			const monthRevenue = transactions
				.filter(
					(txn) =>
						txn.status === "success" &&
						new Date(txn.createdAt) >= monthStart &&
						new Date(txn.createdAt) <= monthEnd
				)
				.reduce((sum, txn) => sum + (txn.amount || 0), 0);

			return {
				name: date.toLocaleString("default", { month: "short" }),
				total: monthRevenue,
			};
		});

		return NextResponse.json({
			success: true,
			data: {
				stats: {
					totalUsers,
					premiumUsers,
					totalRevenue,
					revenueGrowth,
					userGrowth,
				},
				userStats: userChartData,
				revenueStats: revenueChartData,
				users,
				subscriptions,
				transactions,
			},
		});
	} catch (error) {
		console.error("Error fetching admin dashboard data:", error);
		return NextResponse.json(
			{ message: "Failed to fetch dashboard data", success: false },
			{ status: 500 }
		);
	}
}
