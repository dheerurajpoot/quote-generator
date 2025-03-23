"use client";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import { Users, CreditCard, DollarSign, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface DashboardStats {
	totalUsers: number;
	premiumUsers: number;
	totalRevenue: number;
	revenueGrowth: number;
	userGrowth: number;
}

interface ChartData {
	name: string;
	total: number;
}

interface Subscription {
	_id: string;
	userId: string;
	tier: "free" | "premium";
	status: "active" | "inactive" | "pending" | "cancelled";
	currentPeriodEnd: string;
	createdAt: string;
	updatedAt: string;
}

export default function AdminDashboardPage() {
	const [stats, setStats] = useState<DashboardStats>({
		totalUsers: 0,
		premiumUsers: 0,
		totalRevenue: 0,
		revenueGrowth: 0,
		userGrowth: 0,
	});
	const [userStats, setUserStats] = useState<ChartData[]>([]);
	const [revenueStats, setRevenueStats] = useState<ChartData[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		try {
			setIsLoading(true);
			const [usersResponse, subscriptionsResponse] = await Promise.all([
				fetch("/api/users"),
				fetch("/api/subscriptions?userId=all"),
			]);

			if (!usersResponse.ok || !subscriptionsResponse.ok) {
				throw new Error("Failed to fetch dashboard data");
			}

			const users = await usersResponse.json();
			const subscriptions: Subscription[] =
				await subscriptionsResponse.json();

			// Calculate total users and premium users
			const totalUsers = users.length;
			const premiumUsers = subscriptions.filter(
				(sub: Subscription) =>
					sub.tier === "premium" && sub.status === "active"
			).length;

			// Calculate total revenue (assuming ₹69 per premium subscription)
			const totalRevenue = premiumUsers * 69;

			// Calculate growth percentages (mock data for now)
			const revenueGrowth = 18; // This should be calculated based on historical data
			const userGrowth = 12; // This should be calculated based on historical data

			// Generate chart data for the last 7 months
			const currentDate = new Date();
			const userChartData = Array.from({ length: 7 }, (_, i) => {
				const date = new Date(currentDate);
				date.setMonth(date.getMonth() - (6 - i));
				return {
					name: date.toLocaleString("default", { month: "short" }),
					total: Math.floor(Math.random() * 100) + 50, // Replace with actual data
				};
			});

			const revenueChartData = Array.from({ length: 7 }, (_, i) => {
				const date = new Date(currentDate);
				date.setMonth(date.getMonth() - (6 - i));
				return {
					name: date.toLocaleString("default", { month: "short" }),
					total: Math.floor(Math.random() * 50000) + 10000, // Replace with actual data
				};
			});

			setStats({
				totalUsers,
				premiumUsers,
				totalRevenue,
				revenueGrowth,
				userGrowth,
			});
			setUserStats(userChartData);
			setRevenueStats(revenueChartData);
		} catch (error) {
			console.error("Error fetching dashboard data:", error);
			toast.error("Failed to load dashboard data");
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h1 className='text-3xl font-bold tracking-tight'>
					Dashboard Overview
				</h1>
				<button
					onClick={fetchDashboardData}
					className='p-2 hover:bg-gray-100 rounded-full'>
					<svg
						className='w-5 h-5'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
						/>
					</svg>
				</button>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Total Users
						</CardTitle>
						<Users className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{stats.totalUsers}
						</div>
						<p className='text-xs text-muted-foreground'>
							+{stats.userGrowth}% from last month
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Premium Subscribers
						</CardTitle>
						<CreditCard className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{stats.premiumUsers}
						</div>
						<p className='text-xs text-muted-foreground'>
							Active premium subscriptions
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Total Revenue
						</CardTitle>
						<DollarSign className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							₹{stats.totalRevenue.toLocaleString()}
						</div>
						<p className='text-xs text-muted-foreground'>
							+{stats.revenueGrowth}% from last month
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Conversion Rate
						</CardTitle>
						<TrendingUp className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{(
								(stats.premiumUsers / stats.totalUsers) *
								100
							).toFixed(1)}
							%
						</div>
						<p className='text-xs text-muted-foreground'>
							Premium conversion rate
						</p>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue='users'>
				<TabsList>
					<TabsTrigger value='users'>Users</TabsTrigger>
					<TabsTrigger value='revenue'>Revenue</TabsTrigger>
				</TabsList>

				<TabsContent value='users' className='space-y-4'>
					<Card>
						<CardHeader>
							<CardTitle>User Growth</CardTitle>
							<CardDescription>
								New user registrations over time
							</CardDescription>
						</CardHeader>
						<CardContent className='h-[300px]'>
							<ResponsiveContainer width='100%' height='100%'>
								<LineChart data={userStats}>
									<CartesianGrid strokeDasharray='3 3' />
									<XAxis dataKey='name' />
									<YAxis />
									<Tooltip />
									<Legend />
									<Line
										type='monotone'
										dataKey='total'
										name='New Users'
										stroke='#8884d8'
										activeDot={{ r: 8 }}
									/>
								</LineChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='revenue' className='space-y-4'>
					<Card>
						<CardHeader>
							<CardTitle>Revenue</CardTitle>
							<CardDescription>
								Monthly revenue from premium subscriptions
							</CardDescription>
						</CardHeader>
						<CardContent className='h-[300px]'>
							<ResponsiveContainer width='100%' height='100%'>
								<LineChart data={revenueStats}>
									<CartesianGrid strokeDasharray='3 3' />
									<XAxis dataKey='name' />
									<YAxis />
									<Tooltip
										formatter={(value) => [
											`₹${value.toLocaleString()}`,
											"Revenue",
										]}
									/>
									<Legend />
									<Line
										type='monotone'
										dataKey='total'
										name='Revenue (₹)'
										stroke='#82ca9d'
										activeDot={{ r: 8 }}
									/>
								</LineChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
