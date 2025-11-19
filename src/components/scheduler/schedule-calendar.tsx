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
	Plus,
	Facebook,
	Instagram,
	Twitter,
	FileText,
	ImageIcon,
	Video,
	Clock,
	CheckCircle,
	AlertCircle,
	Loader2,
} from "lucide-react";
import Link from "next/link";

interface ScheduledPost {
	_id: string;
	title: string;
	content: string;
	platforms: string[];
	scheduledAt?: string; // Updated to use scheduledAt
	status: "draft" | "scheduled" | "published" | "failed" | "cancelled";
	postType: "text" | "image" | "video";
	mediaFiles?: string[];
	hashtags?: string[];
	createdAt: string;
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

const typeIcons = {
	text: FileText,
	image: ImageIcon,
	video: Video,
};

const statusConfig = {
	draft: { color: "secondary", icon: AlertCircle },
	scheduled: { color: "default", icon: Clock },
	published: { color: "default", icon: CheckCircle },
	failed: { color: "destructive", icon: AlertCircle },
	cancelled: { color: "secondary", icon: AlertCircle },
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
			if (!post.scheduledAt) return false;
			const postDate = new Date(post.scheduledAt);
			return isSameDay(postDate, date);
		});
	};

	const selectedDatePosts = selectedDate ? getPostsForDate(selectedDate) : [];

	return (
		<div className='grid gap-6 lg:grid-cols-2'>
			{/* Calendar */}
			<div>
				<Card>
					<CardHeader>
						<CardTitle>Content Calendar</CardTitle>
						<CardDescription>
							View and manage your scheduled posts across all
							platforms
						</CardDescription>
					</CardHeader>
					<CardContent className='flex justify-center flex-col items-center'>
						{loading ? (
							<div className='flex items-center justify-center py-8'>
								<Loader2 className='animate-spin rounded-full' />
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
			<div>
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
					<CardContent className='grid gap-4 grid-cols-2'>
						{selectedDatePosts.length > 0 ? (
							selectedDatePosts.map((post) => {
								const statusConfig_ =
									statusConfig[
										post.status as keyof typeof statusConfig
									];
								const StatusIcon = statusConfig_.icon;
								const TypeIcon =
									typeIcons[
										post.postType as keyof typeof typeIcons
									];

								return (
									<Card
										key={post._id}
										className='border border-border'>
										<CardContent className='p-4'>
											{/* Header with status and type */}
											<div className='flex items-center justify-between mb-3'>
												<div className='flex items-center gap-2'>
													<TypeIcon className='h-4 w-4 text-muted-foreground' />
													<span className='text-xs text-muted-foreground capitalize'>
														{post.postType}
													</span>
												</div>
												<Badge
													variant={
														statusConfig_.color as
															| "secondary"
															| "default"
															| "destructive"
															| "outline"
													}
													className='text-xs'>
													<StatusIcon className='h-3 w-3 mr-1' />
													{post.status}
												</Badge>
											</div>

											{/* Post Title */}
											<h4 className='text-sm font-medium mb-2 line-clamp-2'>
												{post.title}
											</h4>

											{/* Post Content Preview */}
											<p className='text-xs text-muted-foreground mb-3 line-clamp-2'>
												{post.content}
											</p>

											{/* Media Preview */}
											{post.mediaFiles &&
												post.mediaFiles.length > 0 && (
													<div className='mb-3'>
														{post.postType ===
														"image" ? (
															<div className='flex gap-1'>
																{post.mediaFiles
																	.slice(0, 3)
																	.map(
																		(
																			file,
																			index
																		) => (
																			<div
																				key={
																					index
																				}
																				className='relative'>
																				<img
																					src={
																						file
																					}
																					alt={`Media ${
																						index +
																						1
																					}`}
																					className='w-full h-full object-cover rounded border'
																				/>
																				{index ===
																					2 &&
																					post.mediaFiles!
																						.length >
																						3 && (
																						<div className='absolute inset-0 bg-black/50 rounded flex items-center justify-center'>
																							<span className='text-white text-xs'>
																								+
																								{post.mediaFiles!
																									.length -
																									3}
																							</span>
																						</div>
																					)}
																			</div>
																		)
																	)}
															</div>
														) : post.postType ===
														  "video" ? (
															<div className='w-12 h-12 bg-muted rounded border flex items-center justify-center'>
																<Video className='h-4 w-4 text-muted-foreground' />
															</div>
														) : null}
													</div>
												)}

											{/* Platforms */}
											<div className='flex items-center gap-1 mb-3'>
												{post.platforms.map(
													(platform) => {
														const PlatformIcon =
															platformIcons[
																platform as keyof typeof platformIcons
															];
														const platformColor =
															platformColors[
																platform as keyof typeof platformColors
															];

														return PlatformIcon ? (
															<div
																key={platform}
																className='flex items-center gap-1 px-2 py-1 rounded border text-xs'
																style={{
																	borderColor:
																		platformColor,
																}}>
																<PlatformIcon
																	className='h-3 w-3'
																	style={{
																		color: platformColor,
																	}}
																/>
																<span className='capitalize'>
																	{platform}
																</span>
															</div>
														) : null;
													}
												)}
											</div>

											{/* Scheduled Time */}
											{post.scheduledAt && (
												<div className='flex items-center gap-1 text-xs text-muted-foreground'>
													<Clock className='h-3 w-3' />
													<span>
														{format(
															new Date(
																post.scheduledAt
															),
															"h:mm a"
														)}
													</span>
												</div>
											)}
										</CardContent>
									</Card>
								);
							})
						) : (
							<div className='text-center py-8'>
								<p className='text-sm text-muted-foreground mb-4'>
									No posts scheduled for this date
								</p>
								<Link href='/dashboard/scheduler'>
									<Button size='sm'>
										<Plus className='h-4 w-4 mr-2' />
										Schedule Post
									</Button>
								</Link>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
