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
} from "lucide-react";

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
		<div className='space-y-4'>
			{posts.map((post) => {
				const platform = post.platforms[0]; // Show first platform icon
				const PlatformIcon =
					platformIcons[platform as keyof typeof platformIcons];
				const platformColor =
					platformColors[platform as keyof typeof platformColors];
				const TypeIcon =
					typeIcons[post.postType as keyof typeof typeIcons];
				const statusConfig_ =
					statusConfig[post.status as keyof typeof statusConfig];
				const StatusIcon = statusConfig_.icon;

				return (
					<Card key={post._id}>
						<CardContent className='p-6'>
							<div className='flex items-start justify-between'>
								<div className='flex items-start gap-4 flex-1'>
									<div className='flex items-center gap-2'>
										<PlatformIcon
											className='h-5 w-5'
											style={{ color: platformColor }}
										/>
										<TypeIcon className='h-4 w-4 text-muted-foreground' />
									</div>

									<div className='flex-1 space-y-2'>
										<div className='flex items-center gap-2'>
											<h3 className='font-medium'>
												{post.title}
											</h3>
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
										</div>

										<p className='text-sm text-muted-foreground line-clamp-2'>
											{post.content}
										</p>

										<div className='flex items-center gap-4 text-xs text-muted-foreground'>
											<span>
												Created:{" "}
												{format(
													new Date(post.createdAt),
													"MMM d, yyyy"
												)}
											</span>
											{post.status === "scheduled" &&
												post.scheduledAt && (
													<span>
														Scheduled:{" "}
														{format(
															new Date(
																post.scheduledAt
															),
															"MMM d, yyyy 'at' h:mm a"
														)}
													</span>
												)}
											{post.status === "published" &&
												post.scheduledAt && (
													<span>
														Published:{" "}
														{format(
															new Date(
																post.scheduledAt
															),
															"MMM d, yyyy 'at' h:mm a"
														)}
													</span>
												)}
										</div>
									</div>
								</div>

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
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
