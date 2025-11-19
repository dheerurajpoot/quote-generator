"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
} from "recharts";
import {
	Calendar,
	TrendingUp,
	Users,
	MessageSquare,
	Plus,
	Clock,
	CheckCircle,
	Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PlatformPerformance } from "./platform-performance";
import { RecentActivity } from "./recent-activity";

interface DashboardStats {
	totalPosts: number;
	scheduledPosts: number;
	totalFollowers: number;
	engagementRate: number;
	autoPostingCampaigns: number;
}

interface ChartData {
	weeklyData: Array<{
		name: string;
		posts: number;
		engagement: number;
	}>;
	platformData: Array<{
		name: string;
		value: number;
		color: string;
	}>;
}

interface UpcomingPost {
	id: string;
	title: string;
	platform: string;
	scheduledTime: string;
	status: string;
	type: string;
	platforms: string[];
}

export function DashboardOverview() {
	const { user } = useAuth();
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [charts, setCharts] = useState<ChartData | null>(null);
	const [upcomingPosts, setUpcomingPosts] = useState<UpcomingPost[]>([]);

	useEffect(() => {
		if (user?._id) {
			fetchDashboardData();
		}
	}, [user?._id]);

	const fetchDashboardData = async () => {
		try {
			setLoading(true);

			// Fetch dashboard stats and charts
			const statsResponse = await axios.get("/api/dashboard/stats");
			if (statsResponse.data.success) {
				setStats(statsResponse.data.stats);
				setCharts(statsResponse.data.charts);
			}

			// Fetch upcoming posts
			const postsResponse = await axios.get(
				"/api/dashboard/upcoming-posts"
			);
			if (postsResponse.data.success) {
				setUpcomingPosts(postsResponse.data.posts);
			}
		} catch (error) {
			console.error("Error fetching dashboard data:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleCreatePost = () => {
		router.push("/dashboard/schedule");
	};

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-foreground'>
						Dashboard
					</h1>
					<p className='text-muted-foreground'>
						Welcome back! Here&apos;s what&apos;s happening with
						your social media.
					</p>
				</div>
				<Button
					onClick={handleCreatePost}
					className='bg-primary hover:bg-primary/90 cursor-pointer'>
					<Plus className='mr-2 h-4 w-4' />
					Create Post
				</Button>
			</div>

			{/* Stats Cards */}
			<div className='grid gap-4 grid-cols-2 md:grid-cols-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Total Posts
						</CardTitle>
						<MessageSquare className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{stats?.totalPosts || 0}
						</div>
						<p className='text-xs text-muted-foreground'>
							All time posts
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Engagement Rate
						</CardTitle>
						<TrendingUp className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{stats?.engagementRate || 0}%
						</div>
						<p className='text-xs text-muted-foreground'>
							Average engagement
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Followers
						</CardTitle>
						<Users className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{stats?.totalFollowers.toLocaleString() || 0}
						</div>
						<p className='text-xs text-muted-foreground'>
							Across all platforms
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Scheduled Posts
						</CardTitle>
						<Calendar className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{stats?.scheduledPosts || 0}
						</div>
						<p className='text-xs text-muted-foreground'>
							Next 7 days
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Charts Row */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
				<Card className='col-span-4'>
					<CardHeader>
						<CardTitle>Weekly Activity</CardTitle>
						<CardDescription>
							Your posts and engagement over the last 7 days
						</CardDescription>
					</CardHeader>
					<CardContent className='pl-2'>
						<ResponsiveContainer width='100%' height={350}>
							<BarChart data={charts?.weeklyData || []}>
								<CartesianGrid strokeDasharray='3 3' />
								<XAxis dataKey='name' />
								<YAxis />
								<Tooltip />
								<Bar
									dataKey='posts'
									fill='var(--color-chart-1)'
									name='Posts'
								/>
								<Bar
									dataKey='engagement'
									fill='var(--color-chart-2)'
									name='Engagement'
								/>
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card className='col-span-3'>
					<CardHeader>
						<CardTitle>Platform Distribution</CardTitle>
						<CardDescription>
							Posts by social media platform
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width='100%' height={350}>
							<PieChart>
								<Pie
									data={charts?.platformData || []}
									cx='50%'
									cy='50%'
									labelLine={false}
									outerRadius={80}
									fill='#8884d8'
									dataKey='value'
									label={({ name, percent }) =>
										`${name} ${(percent * 100).toFixed(0)}%`
									}>
									{(charts?.platformData || []).map(
										(entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={entry.color}
											/>
										)
									)}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			{/* Platform Performance */}
			<PlatformPerformance />

			{/* Recent Activity and Upcoming Posts Row */}
			<div className=' grid gap-4 grid-cols-1 md:grid-cols-2'>
				<RecentActivity />

				{/* Upcoming Posts */}
				<Card>
					<CardHeader>
						<CardTitle>Upcoming Posts</CardTitle>
						<CardDescription>
							Your scheduled content for the next few days
						</CardDescription>
					</CardHeader>
					<CardContent>
						{loading && (
							<div className='flex items-center justify-center h-64'>
								<Loader2 className='h-8 w-8 animate-spin' />
							</div>
						)}
						{upcomingPosts.length === 0 ? (
							<div className='text-center py-8 text-muted-foreground'>
								No upcoming posts found. Create your first post
								to get started!
							</div>
						) : (
							<div className='space-y-4'>
								{upcomingPosts.map((post) => (
									<div
										key={post.id}
										className='flex items-center justify-between p-4 border border-border rounded-lg'>
										<div className='flex items-center space-x-4'>
											<div className='flex-shrink-0'>
												{post.status === "scheduled" ? (
													<CheckCircle className='h-5 w-5 text-green-500' />
												) : (
													<Clock className='h-5 w-5 text-yellow-500' />
												)}
											</div>
											<div>
												<h4 className='text-sm font-medium'>
													{post.title}
												</h4>
												<p className='text-sm text-muted-foreground'>
													{post.platform} •{" "}
													{new Date(
														post.scheduledTime
													).toLocaleString()}
												</p>
											</div>
										</div>
										<div className='flex items-center space-x-2'>
											<Badge
												variant={
													post.status === "scheduled"
														? "default"
														: "secondary"
												}>
												{post.status}
											</Badge>
											<Badge variant='outline'>
												{post.type}
											</Badge>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
