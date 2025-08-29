"use client";

import { useState, useEffect } from "react";
import { useAuth, User } from "@/context/auth-context";
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
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import {
	Search,
	MoreHorizontal,
	Trash2,
	Clock,
	CheckCircle,
	AlertCircle,
	Facebook,
	Instagram,
	Twitter,
	FileText,
	ImageIcon,
	Video,
	Loader2,
	Monitor,
} from "lucide-react";
import Link from "next/link";

interface ScheduledPost {
	_id: string;
	title: string;
	content: string;
	platforms: string[];
	postType: "text" | "image" | "video";
	status: "draft" | "scheduled" | "published" | "failed" | "cancelled";
	scheduledAt?: string; // New single datetime field
	mediaFiles?: string[];
	hashtags?: string[];
	createdAt: string;
	updatedAt: string;
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
};

export function PostQueue() {
	const { user } = useAuth();
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [platformFilter, setPlatformFilter] = useState("all");
	const [allPosts, setAllPosts] = useState<ScheduledPost[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (user?._id) {
			fetchPosts();
		}
	}, [user?._id]);

	const fetchPosts = async () => {
		try {
			setLoading(true);
			const response = await axios.get(
				`/api/users/${user?._id}/scheduled-posts`
			);
			if (response.data.success) {
				setAllPosts(response.data.posts);
			}
		} catch (error) {
			console.error("Error fetching posts:", error);
			toast.error("Failed to fetch posts");
		} finally {
			setLoading(false);
		}
	};

	const filteredPosts = allPosts.filter((post) => {
		const matchesSearch =
			post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			post.content.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus =
			statusFilter === "all" || post.status === statusFilter;
		const matchesPlatform =
			platformFilter === "all" || post.platforms.includes(platformFilter);

		return matchesSearch && matchesStatus && matchesPlatform;
	});

	const getPostsByStatus = (status: string) => {
		return allPosts.filter((post) => post.status === status);
	};

	return (
		<div className='space-y-6'>
			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle>Post Queue</CardTitle>
					<CardDescription>
						Manage all your posts across different stages
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='flex flex-col sm:flex-row gap-4'>
						<div className='relative flex-1'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
							<Input
								placeholder='Search posts...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='pl-10'
							/>
						</div>
						<Select
							value={statusFilter}
							onValueChange={setStatusFilter}>
							<SelectTrigger className='w-full sm:w-40'>
								<SelectValue placeholder='Status' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Status</SelectItem>
								<SelectItem value='draft'>Draft</SelectItem>
								<SelectItem value='scheduled'>
									Scheduled
								</SelectItem>
								<SelectItem value='published'>
									Published
								</SelectItem>
								<SelectItem value='failed'>Failed</SelectItem>
							</SelectContent>
						</Select>
						<Select
							value={platformFilter}
							onValueChange={setPlatformFilter}>
							<SelectTrigger className='w-full sm:w-40'>
								<SelectValue placeholder='Platform' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>
									All Platforms
								</SelectItem>
								<SelectItem value='facebook'>
									Facebook
								</SelectItem>
								<SelectItem value='instagram'>
									Instagram
								</SelectItem>
								<SelectItem value='twitter'>Twitter</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Status Tabs */}
			<Tabs defaultValue='all' className='space-y-4'>
				<TabsList className='grid w-full grid-cols-5'>
					<TabsTrigger value='all'>
						All ({allPosts.length})
					</TabsTrigger>
					<TabsTrigger value='draft'>
						Drafts ({getPostsByStatus("draft").length})
					</TabsTrigger>
					<TabsTrigger value='scheduled'>
						Scheduled ({getPostsByStatus("scheduled").length})
					</TabsTrigger>
					<TabsTrigger value='published'>
						Published ({getPostsByStatus("published").length})
					</TabsTrigger>
					<TabsTrigger value='failed'>
						Failed ({getPostsByStatus("failed").length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value='all' className='space-y-4'>
					{loading ? (
						<div className='flex items-center justify-center py-8'>
							<Loader2 className='animate-spin rounded-full h-8 w-8' />
						</div>
					) : (
						<PostList
							posts={filteredPosts}
							onRefresh={fetchPosts}
							user={user}
						/>
					)}
				</TabsContent>
				<TabsContent value='draft' className='space-y-4'>
					{loading ? (
						<div className='flex items-center justify-center py-8'>
							<Loader2 className='animate-spin rounded-full h-8 w-8' />
						</div>
					) : (
						<PostList
							posts={getPostsByStatus("draft")}
							onRefresh={fetchPosts}
							user={user}
						/>
					)}
				</TabsContent>
				<TabsContent value='scheduled' className='space-y-4'>
					{loading ? (
						<div className='flex items-center justify-center py-8'>
							<div className='flex items-center justify-center py-8'>
								<Loader2 className='animate-spin rounded-full h-8 w-8' />
							</div>
						</div>
					) : (
						<PostList
							posts={getPostsByStatus("scheduled")}
							onRefresh={fetchPosts}
							user={user}
						/>
					)}
				</TabsContent>
				<TabsContent value='published' className='space-y-4'>
					{loading ? (
						<div className='flex items-center justify-center py-8'>
							<Loader2 className='animate-spin rounded-full h-8 w-8' />
						</div>
					) : (
						<PostList
							posts={getPostsByStatus("published")}
							onRefresh={fetchPosts}
							user={user}
						/>
					)}
				</TabsContent>
				<TabsContent value='failed' className='space-y-4'>
					{loading ? (
						<div className='flex items-center justify-center py-8'>
							<Loader2 className='animate-spin rounded-full h-8 w-8' />
						</div>
					) : (
						<PostList
							posts={getPostsByStatus("failed")}
							onRefresh={fetchPosts}
							user={user}
						/>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}

function PostList({
	posts,
	onRefresh,
	user,
}: {
	posts: ScheduledPost[];
	onRefresh: () => void;
	user: User | null;
}) {
	const handleInstantPublish = async (
		post: ScheduledPost,
		userId: string
	) => {
		try {
			const postData = {
				title: post.title.trim(),
				content: post.content.trim(),
				postType: post.postType,
				platforms: post.platforms,
				status: "published",
				mediaFiles: post.mediaFiles,
				hashtags: post.hashtags,
			};

			// Create the post
			const createResponse = await axios.post(
				`/api/users/${userId}/scheduled-posts`,
				postData
			);

			if (createResponse.data.success) {
				toast.success("Post published in 2 minutes! Please wait");
				onRefresh(); // Refresh the list after publishing
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message || "Failed to publish post");
			} else {
				toast.error("Failed to publish post");
			}
		}
	};

	if (posts.length === 0) {
		return (
			<Card>
				<CardContent className='py-8'>
					<p className='text-center text-muted-foreground'>
						No posts found
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
			{posts.map((post) => {
				const statusConfig_ =
					statusConfig[post.status as keyof typeof statusConfig];
				const StatusIcon = statusConfig_.icon;

				return (
					<Card key={post._id} className='h-full flex flex-col'>
						<CardContent className='p-6 flex flex-col h-full'>
							{/* Header with status and actions */}
							<div className='flex items-start justify-between mb-4'>
								<Badge
									variant={
										statusConfig_.color as
											| "secondary"
											| "default"
											| "destructive"
											| "outline"
									}
									className='flex items-center gap-1'>
									<StatusIcon className='h-3 w-3' />
									{post.status}
								</Badge>

								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant='ghost' size='icon'>
											<MoreHorizontal className='h-4 w-4' />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align='end'>
										{post.status === "draft" && (
											<DropdownMenuItem
												onClick={() =>
													handleInstantPublish(
														post,
														user?._id || ""
													)
												}>
												<CheckCircle className='mr-2 h-4 w-4' />
												Publish Now
											</DropdownMenuItem>
										)}
										<Link href='/dashboard'>
											<DropdownMenuItem className='cursor-pointer'>
												<Monitor className='mr-2 h-4 w-4' />
												Dashboard
											</DropdownMenuItem>
										</Link>
										{post.status === "scheduled" && (
											<DropdownMenuItem
												className='text-destructive'
												onClick={async () => {
													if (
														confirm(
															"Are you sure you want to delete this post?"
														)
													) {
														try {
															await axios.delete(
																`/api/users/${user?._id}/scheduled-posts/${post._id}`
															);
															toast.success(
																"Post deleted successfully"
															);
															onRefresh();
														} catch (error) {
															console.error(
																"Error deleting post:",
																error
															);
															toast.error(
																"Failed to delete post"
															);
														}
													}
												}}>
												<Trash2 className='mr-2 h-4 w-4' />
												Delete
											</DropdownMenuItem>
										)}
									</DropdownMenuContent>
								</DropdownMenu>
							</div>

							{/* Post Type Icon */}
							<div className='flex items-center gap-2 mb-3'>
								{(() => {
									const TypeIcon =
										typeIcons[
											post.postType as keyof typeof typeIcons
										];
									return (
										<TypeIcon className='h-5 w-5 text-muted-foreground' />
									);
								})()}
								<span className='text-sm text-muted-foreground capitalize'>
									{post.postType} Post
								</span>
							</div>

							{/* Post Title */}
							<h3 className='font-semibold text-lg mb-2 line-clamp-2'>
								Campaign Name: {post.title}
							</h3>

							{/* Post Content */}
							<p className='text-sm text-muted-foreground line-clamp-3 mb-4 flex-1'>
								Content: {post.content}
							</p>

							{/* Media Preview */}
							{post.mediaFiles && post.mediaFiles.length > 0 && (
								<div className='mb-4'>
									{post.postType === "image" ? (
										<div className='grid'>
											{post.mediaFiles
												.slice(0, 4)
												.map((file, index) => (
													<div
														key={index}
														className='relative aspect-square'>
														<img
															src={file}
															alt={`Media ${
																index + 1
															}`}
															className='w-full h-full object-cover rounded-md border'
														/>
														{index === 3 &&
															post.mediaFiles!
																.length > 4 && (
																<div className='absolute inset-0 bg-black/50 rounded-md flex items-center justify-center'>
																	<span className='text-white text-xs font-medium'>
																		+
																		{post.mediaFiles!
																			.length -
																			4}{" "}
																		more
																	</span>
																</div>
															)}
													</div>
												))}
										</div>
									) : post.postType === "video" ? (
										<div className='space-y-2'>
											{post.mediaFiles
												.slice(0, 2)
												.map((file, index) => (
													<div
														key={index}
														className='relative'>
														<div className='w-full h-24 bg-muted rounded-md border flex items-center justify-center'>
															<Video className='h-6 w-6 text-muted-foreground' />
															<span className='text-xs text-muted-foreground ml-2'>
																Video{" "}
																{index + 1}
															</span>
														</div>
													</div>
												))}
											{post.mediaFiles.length > 2 && (
												<p className='text-xs text-muted-foreground'>
													+
													{post.mediaFiles.length - 2}{" "}
													more videos
												</p>
											)}
										</div>
									) : null}
								</div>
							)}

							{/* Hashtags */}
							{post.hashtags && post.hashtags.length > 0 && (
								<div className='mb-4'>
									<div className='flex flex-wrap gap-1'>
										{post.hashtags
											.slice(0, 6)
											.map((tag, index) => (
												<span
													key={index}
													className='text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full'>
													{tag}
												</span>
											))}
										{post.hashtags.length > 6 && (
											<span className='text-xs text-muted-foreground'>
												+{post.hashtags.length - 6} more
											</span>
										)}
									</div>
								</div>
							)}

							{/* Platforms */}
							<div className='mb-4'>
								<div className='flex items-center gap-2 flex-wrap'>
									{post.platforms.map((platform) => {
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
												className='flex items-center gap-1 px-2 py-1 rounded-md border'
												style={{
													borderColor: platformColor,
												}}>
												<PlatformIcon
													className='h-4 w-4'
													style={{
														color: platformColor,
													}}
												/>
												<span className='text-xs font-medium capitalize'>
													{platform}
												</span>
											</div>
										) : null;
									})}
								</div>
							</div>

							{/* Timestamps */}
							<div className='mt-auto space-y-2 text-xs text-muted-foreground'>
								<div className='flex items-center gap-2'>
									<Clock className='h-3 w-3' />
									<span>
										Created:{" "}
										{format(
											new Date(post.createdAt),
											"MMM d, yyyy 'at' h:mm a"
										)}
									</span>
								</div>

								{post.status === "scheduled" &&
									post.scheduledAt && (
										<div className='flex items-center gap-2'>
											<Clock className='h-3 w-3' />
											<span>
												Scheduled:{" "}
												{format(
													new Date(post.scheduledAt),
													"MMM d, yyyy 'at' h:mm a"
												)}
											</span>
										</div>
									)}

								{post.status === "published" &&
									post.scheduledAt && (
										<div className='flex items-center gap-2'>
											<CheckCircle className='h-3 w-3' />
											<span>
												Published:{" "}
												{format(
													new Date(post.scheduledAt),
													"MMM d, yyyy 'at' h:mm a"
												)}
											</span>
										</div>
									)}
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
