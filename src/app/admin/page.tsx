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
import {
	Users,
	CreditCard,
	DollarSign,
	TrendingUp,
	RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";

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
	status:
		| "active"
		| "inactive"
		| "pending"
		| "cancelled"
		| "canceled"
		| "expired";
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
	const [isRefreshing, setIsRefreshing] = useState(false);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		try {
			setIsRefreshing(true);
			setIsLoading(true);

			const response = await axios.get("/api/admin/dashboard");

			if (!response.data.success) {
				throw new Error(
					response.data.message || "Failed to fetch dashboard data"
				);
			}

			const { data } = response.data;

			// Set stats
			setStats(data.stats);

			// Set chart data
			setUserStats(data.userStats);
			setRevenueStats(data.revenueStats);
		} catch (error: any) {
			console.error("Error fetching dashboard data:", error);
			const errorMessage =
				error.response?.data?.message ||
				error.message ||
				"Failed to load dashboard data";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
			setIsRefreshing(false);
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
					disabled={isRefreshing}
					className='p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed'>
					<RefreshCw
						className={`w-5 h-5 ${
							isRefreshing ? "animate-spin" : ""
						}`}
					/>
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
							{stats.totalUsers.toLocaleString()}
						</div>
						<p className='text-xs text-muted-foreground'>
							{stats.userGrowth >= 0 ? "+" : ""}
							{stats.userGrowth}% from last month
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
							{stats.premiumUsers.toLocaleString()}
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
							{stats.revenueGrowth >= 0 ? "+" : ""}
							{stats.revenueGrowth}% from last month
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
							{stats.totalUsers > 0
								? (
										(stats.premiumUsers /
											stats.totalUsers) *
										100
								  ).toFixed(1)
								: "0.0"}
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
											`₹${Number(
												value
											).toLocaleString()}`,
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
