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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import {
	Facebook,
	Instagram,
	Twitter,
	Linkedin,
	TrendingUp,
	Users,
	MessageSquare,
	Loader2,
} from "lucide-react";

interface PlatformMetric {
	platform: string;
	profileName: string;
	status: string;
	followers: number;
	metrics: {
		totalPosts: number;
		publishedPosts: number;
		scheduledPosts: number;
		draftPosts: number;
		failedPosts: number;
		avgEngagement: number;
		avgReach: number;
		avgLikes: number;
		avgComments: number;
		avgShares: number;
	};
}

interface PlatformSummary {
	totalPosts: number;
	totalPublished: number;
	totalFollowers: number;
	avgEngagement: number;
	platformCount: number;
}

const platformIcons = {
	facebook: Facebook,
	instagram: Instagram,
	twitter: Twitter,
	linkedin: Linkedin,
};

const platformColors = {
	facebook: "#1877F2",
	instagram: "#E1306C",
	twitter: "#1DA1F2",
	linkedin: "#0A66C2",
};

export function PlatformPerformance() {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [platformMetrics, setPlatformMetrics] = useState<PlatformMetric[]>(
		[]
	);
	const [summary, setSummary] = useState<PlatformSummary | null>(null);

	useEffect(() => {
		if (user?._id) {
			fetchPlatformMetrics();
		}
	}, [user?._id]);

	const fetchPlatformMetrics = async () => {
		try {
			setLoading(true);
			const response = await axios.get("/api/dashboard/platform-metrics");
			if (response.data.success) {
				setPlatformMetrics(response.data.platformMetrics);
				setSummary(response.data.summary);
			}
		} catch (error) {
			console.error("Error fetching platform metrics:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<Loader2 className='h-8 w-8 animate-spin' />
			</div>
		);
	}

	if (platformMetrics.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Platform Performance</CardTitle>
					<CardDescription>
						Connect your social media accounts to see performance
						metrics
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='text-center py-8 text-muted-foreground'>
						No platforms connected yet. Connect your accounts to get
						started!
					</div>
				</CardContent>
			</Card>
		);
	}

	// Prepare data for engagement chart
	const engagementData = platformMetrics.map((platform) => ({
		name:
			platform.platform.charAt(0).toUpperCase() +
			platform.platform.slice(1),
		engagement: platform.metrics.avgEngagement,
		posts: platform.metrics.totalPosts,
		color:
			platformColors[platform.platform as keyof typeof platformColors] ||
			"#666",
	}));

	return (
		<div className='space-y-6'>
			{/* Summary Cards */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Total Platforms
						</CardTitle>
						<Users className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{summary?.platformCount || 0}
						</div>
						<p className='text-xs text-muted-foreground'>
							Connected accounts
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Total Followers
						</CardTitle>
						<Users className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{summary?.totalFollowers.toLocaleString() || 0}
						</div>
						<p className='text-xs text-muted-foreground'>
							Across all platforms
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Published Posts
						</CardTitle>
						<MessageSquare className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{summary?.totalPublished || 0}
						</div>
						<p className='text-xs text-muted-foreground'>
							Successfully posted
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Avg Engagement
						</CardTitle>
						<TrendingUp className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{summary?.avgEngagement || 0}
						</div>
						<p className='text-xs text-muted-foreground'>
							Per post average
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Platform Performance Chart */}
			<Card>
				<CardHeader>
					<CardTitle>Platform Performance Overview</CardTitle>
					<CardDescription>
						Average engagement and post count by platform
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width='100%' height={300}>
						<BarChart data={engagementData}>
							<CartesianGrid strokeDasharray='3 3' />
							<XAxis dataKey='name' />
							<YAxis />
							<Tooltip />
							<Bar
								dataKey='engagement'
								fill='var(--color-chart-1)'
								name='Avg Engagement'
							/>
							<Bar
								dataKey='posts'
								fill='var(--color-chart-2)'
								name='Total Posts'
							/>
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			{/* Individual Platform Cards */}
			<div className='grid gap-4 md:grid-cols-2'>
				{platformMetrics.map((platform) => {
					const PlatformIcon =
						platformIcons[
							platform.platform as keyof typeof platformIcons
						] || Users;
					const platformColor =
						platformColors[
							platform.platform as keyof typeof platformColors
						] || "#666";
					const successRate =
						platform.metrics.totalPosts > 0
							? (
									(platform.metrics.publishedPosts /
										platform.metrics.totalPosts) *
									100
							  ).toFixed(1)
							: "0";

					return (
						<Card key={platform.platform}>
							<CardHeader>
								<div className='flex items-center space-x-3'>
									<PlatformIcon
										className='h-6 w-6'
										style={{ color: platformColor }}
									/>
									<div>
										<CardTitle className='text-lg capitalize'>
											{platform.platform}
										</CardTitle>
										<CardDescription>
											{platform.profileName}
										</CardDescription>
									</div>
									<Badge
										variant={
											platform.status === "connected"
												? "default"
												: "secondary"
										}
										className='ml-auto'>
										{platform.status}
									</Badge>
								</div>
							</CardHeader>
							<CardContent className='space-y-4'>
								{/* Followers */}
								<div className='flex justify-between items-center'>
									<span className='text-sm text-muted-foreground'>
										Followers
									</span>
									<span className='font-medium'>
										{platform.followers.toLocaleString()}
									</span>
								</div>

								{/* Post Statistics */}
								<div className='space-y-2'>
									<div className='flex justify-between text-sm'>
										<span>Total Posts</span>
										<span>
											{platform.metrics.totalPosts}
										</span>
									</div>
									<div className='flex justify-between text-sm'>
										<span>Published</span>
										<span className='text-green-600'>
											{platform.metrics.publishedPosts}
										</span>
									</div>
									<div className='flex justify-between text-sm'>
										<span>Scheduled</span>
										<span className='text-blue-600'>
											{platform.metrics.scheduledPosts}
										</span>
									</div>
									<div className='flex justify-between text-sm'>
										<span>Drafts</span>
										<span className='text-yellow-600'>
											{platform.metrics.draftPosts}
										</span>
									</div>
									{platform.metrics.failedPosts > 0 && (
										<div className='flex justify-between text-sm'>
											<span>Failed</span>
											<span className='text-red-600'>
												{platform.metrics.failedPosts}
											</span>
										</div>
									)}
								</div>

								{/* Success Rate */}
								<div className='space-y-2'>
									<div className='flex justify-between text-sm'>
										<span>Success Rate</span>
										<span>{successRate}%</span>
									</div>
									<Progress
										value={parseFloat(successRate)}
										className='h-2'
									/>
								</div>

								{/* Engagement Metrics */}
								<div className='grid grid-cols-2 gap-4 pt-2'>
									<div className='text-center'>
										<div className='text-lg font-bold'>
											{platform.metrics.avgEngagement}
										</div>
										<div className='text-xs text-muted-foreground'>
											Avg Engagement
										</div>
									</div>
									<div className='text-center'>
										<div className='text-lg font-bold'>
											{platform.metrics.avgReach}
										</div>
										<div className='text-xs text-muted-foreground'>
											Avg Reach
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
