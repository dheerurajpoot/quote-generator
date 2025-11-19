"use client";

import type React from "react";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn, generateHashtags } from "@/lib/utils";
import { format } from "date-fns";
import {
	CalendarIcon,
	ImageIcon,
	Video,
	FileText,
	Facebook,
	Instagram,
	Twitter,
	Linkedin,
	Upload,
	X,
	Clock,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ConnectedAccount {
	_id: string;
	platform: string;
	profileName: string;
	profileId: string;
	status: string;
	accessToken: string;
	pageAccessToken?: string;
	pageId?: string;
	instagramAccountId?: string;
}

const socialPlatforms = [
	{
		id: "facebook",
		name: "Facebook",
		icon: Facebook,
		color: "#1877F2",
		enabled: true,
	},
	{
		id: "instagram",
		name: "Instagram",
		icon: Instagram,
		color: "#E1306C",
		enabled: true,
	},
	{
		id: "twitter",
		name: "Twitter",
		icon: Twitter,
		color: "#1DA1F2",
		enabled: true,
	},
	{
		id: "linkedin",
		name: "LinkedIn",
		icon: Linkedin,
		color: "#0A66C2",
		enabled: false,
	},
];

export function PostCreator() {
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [postContent, setPostContent] = useState("");
	const [postTitle, setPostTitle] = useState("");
	const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
	const [postType, setPostType] = useState<"text" | "image" | "video">(
		"text"
	);
	const [scheduleDate, setScheduleDate] = useState<Date>();
	const [scheduleTime, setScheduleTime] = useState("09:00");
	const [isScheduled, setIsScheduled] = useState(false);
	const [uploadedFiles, setUploadedFiles] = useState<
		Array<{ data: string; name: string }>
	>([]);
	const [hashtags, setHashtags] = useState<string[]>([]);
	const [connectedAccounts, setConnectedAccounts] = useState<
		ConnectedAccount[]
	>([]);

	// Fetch connected accounts on component mount
	useEffect(() => {
		if (user?._id) {
			fetchConnectedAccounts();
		}
	}, [user?._id]);

	const fetchConnectedAccounts = async () => {
		try {
			const response = await axios.get(
				`/api/users/${user?._id}/social-connections`
			);
			if (response.data.success) {
				setConnectedAccounts(response.data.connections);
				// Auto-select first connected platform
				if (response.data.connections.length > 0) {
					setSelectedPlatforms([
						response.data.connections[0].platform,
					]);
				}
			}
		} catch (error) {
			console.error("Error fetching connected accounts:", error);
		}
	};

	const togglePlatform = (platformId: string) => {
		setSelectedPlatforms((prev) =>
			prev.includes(platformId)
				? prev.filter((id) => id !== platformId)
				: [...prev, platformId]
		);
	};

	const getConnectedAccount = (platform: string) => {
		return connectedAccounts.find(
			(account) => account.platform === platform
		);
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files) {
			// Convert files to base64 data URLs for Cloudinary upload
			Array.from(files).forEach((file) => {
				const reader = new FileReader();
				reader.onload = (e) => {
					if (e.target?.result) {
						setUploadedFiles((prev) => [
							...prev,
							{
								data: e.target!.result as string,
								name: file.name,
							},
						]);
					}
				};
				reader.readAsDataURL(file);
			});
		}
	};

	const removeFile = (fileName: string) => {
		setUploadedFiles((prev) =>
			prev.filter((file) => file.name !== fileName)
		);
	};

	const handleSubmit = async () => {
		if (!user?._id) {
			toast.error("Please login to create posts");
			return;
		}

		if (!postTitle.trim()) {
			toast.error("Please enter a Schedule Name");
			return;
		}

		if (!postContent.trim()) {
			toast.error("Please enter post content");
			return;
		}

		if (selectedPlatforms.length === 0) {
			toast.error("Please select at least one platform");
			return;
		}

		if (isScheduled && (!scheduleDate || !scheduleTime)) {
			toast.error("Please select date and time for scheduled posts");
			return;
		}

		setLoading(true);

		try {
			const postData = {
				title: postTitle.trim(),
				content: postContent.trim(),
				postType,
				platforms: selectedPlatforms,
				status: isScheduled ? "scheduled" : "draft",
				mediaFiles: uploadedFiles.map((file) => file.data),
				hashtags,
				scheduledDate: isScheduled ? scheduleDate : undefined,
				scheduledTime: isScheduled ? scheduleTime : undefined,
			};

			const response = await axios.post(
				`/api/users/${user._id}/scheduled-posts`,
				postData
			);

			if (response.data.success) {
				toast.success(
					isScheduled
						? "Post scheduled successfully!"
						: "Post saved as draft!"
				);

				// Reset form
				setPostTitle("");
				setPostContent("");
				setSelectedPlatforms(["facebook", "instagram"]);
				setPostType("text");
				setScheduleDate(undefined);
				setScheduleTime("09:00");
				setIsScheduled(false);
				setUploadedFiles([]);
				setHashtags([]);
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error("Error creating post:", error);
				toast.error(error.message || "Failed to create post");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleInstantPublish = async () => {
		if (!user?._id) {
			toast.error("Please login to create posts");
			return;
		}

		if (!postTitle.trim()) {
			toast.error("Please enter a Schedule Name");
			return;
		}

		if (!postContent.trim()) {
			toast.error("Please enter post content");
			return;
		}

		if (selectedPlatforms.length === 0) {
			toast.error("Please select at least one platform");
			return;
		}

		setLoading(true);

		try {
			const postData = {
				title: postTitle.trim(),
				content: postContent.trim(),
				postType,
				platforms: selectedPlatforms,
				status: "published",
				mediaFiles: uploadedFiles.map((file) => file.data),
				hashtags,
			};

			// Create the post
			const createResponse = await axios.post(
				`/api/users/${user._id}/scheduled-posts`,
				postData
			);

			if (createResponse.data.success) {
				toast.success("Post published in 2 minutes! Please wait");

				// Reset form
				setPostTitle("");
				setPostContent("");
				setSelectedPlatforms(["facebook", "instagram"]);
				setPostType("text");
				setScheduleDate(undefined);
				setScheduleTime("09:00");
				setIsScheduled(false);
				setUploadedFiles([]);
				setHashtags([]);
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message || "Failed to publish post");
			} else {
				toast.error("Failed to publish post");
			}
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setPostTitle("");
		setPostContent("");
		setSelectedPlatforms(["facebook", "instagram"]);
		setPostType("text");
		setScheduleDate(undefined);
		setScheduleTime("09:00");
		setIsScheduled(false);
		setUploadedFiles([]);
		setHashtags([]);
	};

	return (
		<div className='grid gap-6 md:grid-cols-2'>
			{/* Post Creation Form */}
			<div className='space-y-6'>
				<Card>
					<CardHeader>
						<CardTitle>Create New Post</CardTitle>
						<CardDescription>
							Compose your social media post and select where to
							publish it.
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-6'>
						{/* Post Title */}
						<div className='space-y-2'>
							<Label htmlFor='title'>Schedule Name</Label>
							<input
								id='title'
								type='text'
								placeholder='Enter a name for your schedule...'
								value={postTitle}
								onChange={(e) => setPostTitle(e.target.value)}
								className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
							/>
						</div>

						{/* Post Type Selection */}
						<div className='space-y-3'>
							<Label>Post Type</Label>
							<div className='flex gap-2'>
								<Button
									variant={
										postType === "text"
											? "default"
											: "outline"
									}
									size='sm'
									onClick={() => setPostType("text")}
									className='flex items-center gap-2'>
									<FileText className='h-4 w-4' />
									Text
								</Button>
								<Button
									variant={
										postType === "image"
											? "default"
											: "outline"
									}
									size='sm'
									onClick={() => setPostType("image")}
									className='flex items-center gap-2'>
									<ImageIcon className='h-4 w-4' />
									Image
								</Button>
								<Button
									variant={
										postType === "video"
											? "default"
											: "outline"
									}
									size='sm'
									onClick={() => setPostType("video")}
									className='flex items-center gap-2'>
									<Video className='h-4 w-4' />
									Video
								</Button>
							</div>
						</div>

						{/* Content Input */}
						<div className='space-y-2'>
							<Label htmlFor='content'>Post Content</Label>
							<Textarea
								id='content'
								placeholder="What's on your mind? Share your thoughts, quotes, or inspiration..."
								value={postContent}
								onChange={(e) => setPostContent(e.target.value)}
								className='min-h-32'
							/>
							<div className='flex justify-between text-sm text-muted-foreground'>
								<span>
									{postContent.length}/2200 characters
								</span>
								<span>Optimal length: 125-150 characters</span>
							</div>
						</div>

						{/* File Upload */}
						{(postType === "image" || postType === "video") && (
							<div className='space-y-3'>
								<Label>
									Upload{" "}
									{postType === "image" ? "Images" : "Video"}
								</Label>
								<div className='border-2 border-dashed border-border rounded-lg p-6 text-center'>
									<input
										type='file'
										id='file-upload'
										className='hidden'
										accept={
											postType === "image"
												? "image/*"
												: "video/*"
										}
										multiple={postType === "image"}
										onChange={handleFileUpload}
									/>
									<label
										htmlFor='file-upload'
										className='cursor-pointer'>
										<Upload className='h-8 w-8 mx-auto mb-2 text-muted-foreground' />
										<p className='text-sm text-muted-foreground'>
											Click to upload{" "}
											{postType === "image"
												? "images"
												: "video"}{" "}
											or drag and drop
										</p>
										<p className='text-xs text-muted-foreground mt-1'>
											{postType === "image"
												? "PNG, JPG, GIF up to 10MB each"
												: "MP4, MOV up to 100MB"}
										</p>
									</label>
								</div>

								{/* Uploaded Files */}
								{uploadedFiles.length > 0 && (
									<div className='space-y-2'>
										<Label>Uploaded Files</Label>
										<div className='flex flex-wrap gap-2'>
											{uploadedFiles.map(
												(file, index) => (
													<Badge
														key={index}
														variant='secondary'
														className='flex items-center gap-1'>
														{file.name}
														<Button
															variant='ghost'
															size='sm'
															className='h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground'
															onClick={() =>
																removeFile(
																	file.name
																)
															}>
															<X className='h-3 w-3' />
														</Button>
													</Badge>
												)
											)}
										</div>
									</div>
								)}
							</div>
						)}

						{/* Platform Selection */}
						<div className='space-y-3'>
							<Label>Select Platforms</Label>
							{connectedAccounts.length === 0 ? (
								<div className='p-4 border border-dashed border-border rounded-lg text-center'>
									<p className='text-sm text-muted-foreground mb-2'>
										No social media accounts connected
									</p>
									<Button variant='outline' size='sm' asChild>
										<a href='/dashboard/accounts'>
											Connect Accounts
										</a>
									</Button>
								</div>
							) : (
								<div className='grid grid-cols-2 gap-3'>
									{connectedAccounts.map((account) => {
										const platform = socialPlatforms.find(
											(p) => p.id === account.platform
										);
										if (!platform) return null;

										const isSelected =
											selectedPlatforms.includes(
												account.platform
											);

										return (
											<div
												key={account._id}
												className={cn(
													"flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors",
													isSelected
														? "border-green-600 "
														: "border-border hover:bg-muted"
												)}
												onClick={() =>
													togglePlatform(
														account.platform
													)
												}>
												<platform.icon
													className='h-5 w-5'
													style={{
														color: platform.color,
													}}
												/>
												<div className='flex-1 min-w-0'>
													<span className='font-medium text-sm'>
														{platform.name}
													</span>
													<p className='text-xs text-muted-foreground truncate'>
														{account.profileName}
													</p>
												</div>
												{isSelected && (
													<Badge
														variant='secondary'
														className='ml-auto text-green-600'>
														Selected
													</Badge>
												)}
											</div>
										);
									})}
								</div>
							)}
						</div>

						<Separator />

						{/* Scheduling Options */}
						<div className='space-y-4'>
							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label>Schedule Post</Label>
									<p className='text-sm text-muted-foreground'>
										Choose when to publish this post
									</p>
								</div>
								<Switch
									checked={isScheduled}
									onCheckedChange={setIsScheduled}
								/>
							</div>

							{isScheduled && (
								<div className='grid gap-4 md:grid-cols-2'>
									<div className='space-y-2'>
										<Label>Date</Label>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant='outline'
													className={cn(
														"w-full justify-start text-left font-normal",
														!scheduleDate &&
															"text-muted-foreground"
													)}>
													<CalendarIcon className='mr-2 h-4 w-4' />
													{scheduleDate
														? format(
																scheduleDate,
																"PPP"
														  )
														: "Pick a date"}
												</Button>
											</PopoverTrigger>
											<PopoverContent className='w-auto p-0'>
												<Calendar
													mode='single'
													selected={scheduleDate}
													onSelect={setScheduleDate}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
									</div>

									<div className='space-y-2'>
										<Label>Time</Label>
										<div className='text-sm text-muted-foreground mb-2'>
											Selected: {scheduleTime} (
											{scheduleTime.split(":")[0]}:
											{scheduleTime.split(":")[1]}{" "}
											{parseInt(
												scheduleTime.split(":")[0]
											) >= 12
												? "PM"
												: "AM"}
											)
										</div>
										<div className='flex gap-2'>
											<Select
												value={
													scheduleTime.split(":")[0]
												}
												onValueChange={(hour) => {
													const minute =
														scheduleTime.split(
															":"
														)[1];
													setScheduleTime(
														`${hour}:${minute}`
													);
												}}>
												<SelectTrigger className='w-26'>
													<Clock className='h-4 w-4' />
													<SelectValue placeholder='Hour' />
												</SelectTrigger>
												<SelectContent>
													{Array.from(
														{ length: 24 },
														(_, i) => {
															const hour = i
																.toString()
																.padStart(
																	2,
																	"0"
																);
															return (
																<SelectItem
																	key={hour}
																	value={
																		hour
																	}>
																	{hour}
																</SelectItem>
															);
														}
													)}
												</SelectContent>
											</Select>
											<span className='text-lg font-medium text-muted-foreground'>
												:
											</span>
											<Select
												value={
													scheduleTime.split(":")[1]
												}
												onValueChange={(minute) => {
													const hour =
														scheduleTime.split(
															":"
														)[0];
													setScheduleTime(
														`${hour}:${minute}`
													);
												}}>
												<SelectTrigger className='w-20'>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{Array.from(
														{ length: 60 },
														(_, i) => {
															const minute = i
																.toString()
																.padStart(
																	2,
																	"0"
																);
															return (
																<SelectItem
																	key={minute}
																	value={
																		minute
																	}>
																	{minute}
																</SelectItem>
															);
														}
													)}
												</SelectContent>
											</Select>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Hashtags */}
						<div className='space-y-2'>
							<Label>Hashtags (optional)</Label>
							<div className='space-y-2'>
								<input
									type='text'
									placeholder='Type hashtags like: motivation inspiration success'
									value={hashtags.join(" ")}
									onChange={(e) => {
										const inputValue = e.target.value;
										// Allow typing freely, but format hashtags properly
										const tags = inputValue
											.split(" ")
											.map((tag) => {
												// Add # if not present
												const cleanTag = tag.trim();
												return cleanTag.startsWith("#")
													? cleanTag
													: `#${cleanTag}`;
											});
										setHashtags(tags);
									}}
									className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
								/>
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={() => {
										const suggestedHashtags =
											generateHashtags(postContent, 5);
										setHashtags(suggestedHashtags);
									}}
									className='text-xs'>
									Suggest Hashtags
								</Button>
							</div>
						</div>

						{/* Action Buttons */}
						<div className='flex flex-col md:flex-row gap-3'>
							<Button
								className='flex-1'
								onClick={handleSubmit}
								disabled={loading}>
								{loading
									? "Creating..."
									: isScheduled
									? "Schedule Post"
									: "Save as Draft"}
							</Button>
							{!isScheduled && (
								<Button
									variant='default'
									onClick={handleInstantPublish}
									disabled={loading}
									className='bg-green-600 hover:bg-green-700'>
									{loading ? "Publishing..." : "Publish Now"}
								</Button>
							)}
							<Button variant='outline' onClick={resetForm}>
								Reset Form
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Preview Panel */}
			<div className='md:col-span-1 space-y-6'>
				<Card>
					<CardHeader>
						<CardTitle>Preview</CardTitle>
						<CardDescription>
							See how your post will appear on selected platforms
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						{selectedPlatforms.length === 0 ? (
							<p className='text-sm text-muted-foreground text-center py-8'>
								Select platforms to see preview
							</p>
						) : (
							selectedPlatforms.map((platformId) => {
								const platform = socialPlatforms.find(
									(p) => p.id === platformId
								);
								if (!platform) return null;

								const connectedAccount =
									getConnectedAccount(platformId);
								const profileName =
									connectedAccount?.profileName ||
									platform.name;

								return (
									<div key={platformId} className='space-y-2'>
										<div className='flex items-center gap-2'>
											<platform.icon
												className='h-4 w-4'
												style={{
													color: platform.color,
												}}
											/>
											<span className='text-sm font-medium'>
												{platform.name}
											</span>
											<span className='text-xs text-muted-foreground'>
												• {profileName}
											</span>
										</div>
										<div className='border border-border rounded-lg p-3 bg-card'>
											<div className='flex items-start gap-3'>
												<div className='h-8 w-8 bg-muted rounded-full flex-shrink-0'>
													<Avatar>
														<AvatarImage src={""} />
														<AvatarFallback>
															{profileName.charAt(
																0
															)}
														</AvatarFallback>
													</Avatar>
												</div>
												<div className='flex-1 space-y-2'>
													<div className='flex items-center gap-2'>
														<span className='text-sm font-medium'>
															{profileName}
														</span>
														<span className='text-xs text-muted-foreground'>
															• now
														</span>
													</div>
													<p className='text-sm'>
														{postContent ||
															"Your post content will appear here..."}
													</p>

													{/* Media Preview */}
													{uploadedFiles.length >
														0 && (
														<div className='space-y-2'>
															{postType ===
																"image" && (
																<div className='grid gap-2'>
																	{uploadedFiles
																		.slice(
																			0,
																			4
																		)
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
																							file.data
																						}
																						alt={`Preview ${
																							index +
																							1
																						}`}
																						className='w-full object-cover rounded-md border'
																					/>
																					<div className='absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded max-w-full truncate'>
																						{
																							file.name
																						}
																					</div>
																					{index ===
																						3 &&
																						uploadedFiles.length >
																							4 && (
																							<div className='absolute inset-0 bg-black/50 rounded-md flex items-center justify-center'>
																								<span className='text-white text-xs font-medium'>
																									+
																									{uploadedFiles.length -
																										4}{" "}
																									more
																								</span>
																							</div>
																						)}
																				</div>
																			)
																		)}
																</div>
															)}

															{postType ===
																"video" && (
																<div className='space-y-2'>
																	{uploadedFiles
																		.slice(
																			0,
																			2
																		)
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
																					<div className='w-full h-32 bg-muted rounded-md border flex items-center justify-center'>
																						<Video className='h-8 w-8 text-muted-foreground' />
																						<span className='text-xs text-muted-foreground ml-2'>
																							Video{" "}
																							{index +
																								1}
																						</span>
																					</div>
																					<div className='absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded max-w-full truncate'>
																						{
																							file.name
																						}
																					</div>
																				</div>
																			)
																		)}
																	{uploadedFiles.length >
																		2 && (
																		<p className='text-xs text-muted-foreground'>
																			+
																			{uploadedFiles.length -
																				2}{" "}
																			more
																			videos
																		</p>
																	)}
																</div>
															)}

															{postType ===
																"text" &&
																uploadedFiles.length >
																	0 && (
																	<div className='bg-muted rounded p-2 text-xs text-muted-foreground'>
																		📎{" "}
																		{
																			uploadedFiles.length
																		}{" "}
																		file(s)
																		attached
																	</div>
																)}
														</div>
													)}

													{/* Hashtags Preview */}
													{hashtags.length > 0 && (
														<div className='flex flex-wrap gap-1'>
															{hashtags.map(
																(
																	tag,
																	index
																) => (
																	<span
																		key={
																			index
																		}
																		className='text-xs text-blue-600'>
																		{tag}
																	</span>
																)
															)}
														</div>
													)}
												</div>
											</div>
										</div>
									</div>
								);
							})
						)}
					</CardContent>
				</Card>

				{/* Quick Stats */}
				<Card>
					<CardHeader>
						<CardTitle>Post Insights</CardTitle>
					</CardHeader>
					<CardContent className='space-y-3'>
						<div className='flex justify-between text-sm'>
							<span>Character count:</span>
							<span>{postContent.length}/2200</span>
						</div>
						<div className='flex justify-between text-sm'>
							<span>Platforms selected:</span>
							<span>{selectedPlatforms.length}</span>
						</div>
						<div className='flex justify-between text-sm'>
							<span>Media files:</span>
							<span>{uploadedFiles.length}</span>
						</div>
						<div className='flex justify-between text-sm'>
							<span>Hashtags:</span>
							<span>{hashtags.length}</span>
						</div>
						<div className='flex justify-between text-sm'>
							<span>Estimated reach:</span>
							<span>
								~
								{(
									selectedPlatforms.length * 1250
								).toLocaleString()}
							</span>
						</div>
						{isScheduled && scheduleDate && (
							<div className='flex justify-between text-sm'>
								<span>Scheduled for:</span>
								<span>
									{format(scheduleDate, "MMM d")} at{" "}
									{scheduleTime}
								</span>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
