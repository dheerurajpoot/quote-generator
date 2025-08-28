"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Clock,
	CheckCircle,
	AlertCircle,
	FileText,
	ImageIcon,
	Video,
} from "lucide-react";

interface ScheduledPost {
	_id: string;
	platforms: string[];
	postType: string;
	status: string;
}

interface ScheduleStats {
	totalPosts: number;
	scheduledPosts: number;
	publishedPosts: number;
	draftPosts: number;
	failedPosts: number;
	postsByType: {
		text: number;
		image: number;
		video: number;
	};
	postsByPlatform: {
		facebook: number;
		instagram: number;
		twitter: number;
		linkedin: number;
	};
}

export function ScheduleStats() {
	const { user } = useAuth();
	const [stats, setStats] = useState<ScheduleStats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (user?._id) {
			fetchStats();
		}
	}, [user?._id]);

	const fetchStats = async () => {
		try {
			setLoading(true);
			const response = await axios.get(
				`/api/users/${user?._id}/scheduled-posts`
			);
			if (response.data.success) {
				const posts = response.data.posts;

				// Calculate stats
				const totalPosts = posts.length;
				const scheduledPosts = posts.filter(
					(p: ScheduledPost) => p.status === "scheduled"
				).length;
				const publishedPosts = posts.filter(
					(p: ScheduledPost) => p.status === "published"
				).length;
				const draftPosts = posts.filter(
					(p: ScheduledPost) => p.status === "draft"
				).length;
				const failedPosts = posts.filter(
					(p: ScheduledPost) => p.status === "failed"
				).length;

				const postsByType = {
					text: posts.filter(
						(p: ScheduledPost) => p.postType === "text"
					).length,
					image: posts.filter(
						(p: ScheduledPost) => p.postType === "image"
					).length,
					video: posts.filter(
						(p: ScheduledPost) => p.postType === "video"
					).length,
				};

				const postsByPlatform = {
					facebook: posts.filter((p: ScheduledPost) =>
						p.platforms.includes("facebook")
					).length,
					instagram: posts.filter((p: ScheduledPost) =>
						p.platforms.includes("instagram")
					).length,
					twitter: posts.filter((p: ScheduledPost) =>
						p.platforms.includes("twitter")
					).length,
					linkedin: posts.filter((p: ScheduledPost) =>
						p.platforms.includes("linkedin")
					).length,
				};

				setStats({
					totalPosts,
					scheduledPosts,
					publishedPosts,
					draftPosts,
					failedPosts,
					postsByType,
					postsByPlatform,
				});
			}
		} catch (error) {
			console.error("Error fetching stats:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i}>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Loading...
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='animate-pulse bg-muted h-8 w-16 rounded'></div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (!stats) return null;

	return (
		<div className='space-y-6'>
			{/* Main Stats */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Total Posts
						</CardTitle>
						<FileText className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{stats.totalPosts}
						</div>
						<p className='text-xs text-muted-foreground'>
							All time posts
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Scheduled
						</CardTitle>
						<Clock className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{stats.scheduledPosts}
						</div>
						<p className='text-xs text-muted-foreground'>
							Waiting to publish
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Published
						</CardTitle>
						<CheckCircle className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{stats.publishedPosts}
						</div>
						<p className='text-xs text-muted-foreground'>
							Successfully posted
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Drafts
						</CardTitle>
						<AlertCircle className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{stats.draftPosts}
						</div>
						<p className='text-xs text-muted-foreground'>
							Work in progress
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Detailed Stats */}
			<div className='grid gap-4 md:grid-cols-2'>
				<Card>
					<CardHeader>
						<CardTitle>Posts by Type</CardTitle>
					</CardHeader>
					<CardContent className='space-y-3'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<FileText className='h-4 w-4 text-blue-500' />
								<span className='text-sm'>Text Posts</span>
							</div>
							<Badge variant='secondary'>
								{stats.postsByType.text}
							</Badge>
						</div>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<ImageIcon className='h-4 w-4 text-green-500' />
								<span className='text-sm'>Image Posts</span>
							</div>
							<Badge variant='secondary'>
								{stats.postsByType.image}
							</Badge>
						</div>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<Video className='h-4 w-4 text-purple-500' />
								<span className='text-sm'>Video Posts</span>
							</div>
							<Badge variant='secondary'>
								{stats.postsByType.video}
							</Badge>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Posts by Platform</CardTitle>
					</CardHeader>
					<CardContent className='space-y-3'>
						<div className='flex items-center justify-between'>
							<span className='text-sm'>Facebook</span>
							<Badge variant='secondary'>
								{stats.postsByPlatform.facebook}
							</Badge>
						</div>
						<div className='flex items-center justify-between'>
							<span className='text-sm'>Instagram</span>
							<Badge variant='secondary'>
								{stats.postsByPlatform.instagram}
							</Badge>
						</div>
						<div className='flex items-center justify-between'>
							<span className='text-sm'>Twitter</span>
							<Badge variant='secondary'>
								{stats.postsByPlatform.twitter}
							</Badge>
						</div>
						<div className='flex items-center justify-between'>
							<span className='text-sm'>LinkedIn</span>
							<Badge variant='secondary'>
								{stats.postsByPlatform.linkedin}
							</Badge>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
