"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import toast from "react-hot-toast";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay } from "date-fns";
import {
	ChevronLeft,
	ChevronRight,
	Plus,
	Facebook,
	Instagram,
	Twitter,
} from "lucide-react";

interface ScheduledPost {
	_id: string;
	title: string;
	content: string;
	platforms: string[];
	scheduledDate?: string;
	scheduledTime?: string;
	status: "draft" | "scheduled" | "published" | "failed" | "cancelled";
	postType: "text" | "image" | "video";
}

const platformIcons = {
	facebook: Facebook,
	instagram: Instagram,
	twitter: Twitter,
};

const platformColors = {
	facebook: "#1877F2",
	instagram: "#E1306C",
	twitter: "#1DA1F2",
};

export function ScheduleCalendar() {
	const { user } = useAuth();
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(
		new Date()
	);
	const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (user?._id) {
			fetchScheduledPosts();
		}
	}, [user?._id]);

	const fetchScheduledPosts = async () => {
		try {
			setLoading(true);
			const response = await axios.get(
				`/api/users/${user?._id}/scheduled-posts`
			);
			if (response.data.success) {
				setScheduledPosts(response.data.posts);
			}
		} catch (error) {
			console.error("Error fetching scheduled posts:", error);
			toast.error("Failed to fetch scheduled posts");
		} finally {
			setLoading(false);
		}
	};

	const getPostsForDate = (date: Date) => {
		return scheduledPosts.filter((post) => {
			if (!post.scheduledDate) return false;
			const postDate = new Date(post.scheduledDate);
			return isSameDay(postDate, date);
		});
	};

	const selectedDatePosts = selectedDate ? getPostsForDate(selectedDate) : [];

	return (
		<div className='grid gap-6 lg:grid-cols-3'>
			{/* Calendar */}
			<div className='lg:col-span-2'>
				<Card>
					<CardHeader>
						<CardTitle>Content Calendar</CardTitle>
						<CardDescription>
							View and manage your scheduled posts across all
							platforms
						</CardDescription>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className='flex items-center justify-center py-8'>
								<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
							</div>
						) : (
							<Calendar
								mode='single'
								selected={selectedDate}
								onSelect={setSelectedDate}
								className='rounded-md border'
								modifiers={{
									hasPost: (date) =>
										getPostsForDate(date).length > 0,
								}}
								modifiersStyles={{
									hasPost: {
										backgroundColor:
											"var(--color-secondary)",
										color: "var(--color-secondary-foreground)",
										fontWeight: "bold",
									},
								}}
							/>
						)}
						<div className='mt-4 flex items-center gap-4 text-sm text-muted-foreground'>
							<div className='flex items-center gap-2'>
								<div className='h-3 w-3 bg-secondary rounded-full' />
								<span>Has scheduled posts</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Selected Date Details */}
			<div className='space-y-6'>
				<Card>
					<CardHeader>
						<CardTitle>
							{selectedDate
								? format(selectedDate, "MMMM d, yyyy")
								: "Select a date"}
						</CardTitle>
						<CardDescription>
							{selectedDatePosts.length > 0
								? `${selectedDatePosts.length} post${
										selectedDatePosts.length > 1 ? "s" : ""
								  } scheduled`
								: "No posts scheduled"}
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						{selectedDatePosts.length > 0 ? (
							selectedDatePosts.map((post) => {
								const platform = post.platforms[0]; // Show first platform icon
								const PlatformIcon =
									platformIcons[
										platform as keyof typeof platformIcons
									];
								const platformColor =
									platformColors[
										platform as keyof typeof platformColors
									];

								return (
									<div
										key={post._id}
										className='flex items-start gap-3 p-3 border border-border rounded-lg'>
										<PlatformIcon
											className='h-5 w-5 mt-0.5'
											style={{ color: platformColor }}
										/>
										<div className='flex-1 space-y-1'>
											<h4 className='text-sm font-medium'>
												{post.title}
											</h4>
											<p className='text-xs text-muted-foreground'>
												{post.scheduledTime} •{" "}
												{post.platforms.join(", ")}
											</p>
											<Badge
												variant={
													post.status === "scheduled"
														? "default"
														: "secondary"
												}
												className='text-xs'>
												{post.status}
											</Badge>
										</div>
									</div>
								);
							})
						) : (
							<div className='text-center py-8'>
								<p className='text-sm text-muted-foreground mb-4'>
									No posts scheduled for this date
								</p>
								<Button size='sm'>
									<Plus className='h-4 w-4 mr-2' />
									Schedule Post
								</Button>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Quick Actions */}
				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
					</CardHeader>
					<CardContent className='space-y-3'>
						<Button className='w-full justify-start'>
							<Plus className='h-4 w-4 mr-2' />
							Create New Post
						</Button>
						<Button
							variant='outline'
							className='w-full justify-start bg-transparent'>
							<ChevronLeft className='h-4 w-4 mr-2' />
							Previous Week
						</Button>
						<Button
							variant='outline'
							className='w-full justify-start bg-transparent'>
							<ChevronRight className='h-4 w-4 mr-2' />
							Next Week
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
