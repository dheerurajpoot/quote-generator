"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Loader2,
	Clock,
	Facebook,
	Instagram,
	Plus,
	Trash2,
	Play,
	Check,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import toast from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Separator } from "../ui/separator";
import { Alert, AlertDescription } from "../ui/alert";

interface AutoPostingSettings {
	_id: string;
	userId: string;
	campaignName: string;
	isEnabled: boolean;
	interval: number;
	platforms: string[];
	lastPostTime?: string;
	language: "hindi" | "english";
	template: "classic" | "minimal" | "elegant" | "bold" | "iconic" | "neutral";
	createdAt: string;
	updatedAt: string;
}

const getTemplateImage = (template: string): string => {
	const templateImages = {
		classic: "/classic.jpg",
		minimal: "/minimal.png",
		elegant: "/elegent.png",
		bold: "/bold.png",
		iconic: "/iconic.jpg",
		neutral: "/neutral.png",
	};
	return (
		templateImages[template as keyof typeof templateImages] ||
		"/classic.jpg"
	);
};

export function AutoPosterDashboard() {
	const { user } = useAuth();
	const [campaigns, setCampaigns] = useState<AutoPostingSettings[]>([]);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
	const [postingInterval, setPostingInterval] = useState("60");
	const [selectedLanguage, setSelectedLanguage] = useState<
		"hindi" | "english"
	>("hindi");
	const [selectedTemplate, setSelectedTemplate] = useState<
		"classic" | "minimal" | "elegant" | "bold" | "iconic" | "neutral"
	>("classic");
	const [isPosting, setIsPosting] = useState(false);
	const [campaignName, setCampaignName] = useState("");
	const [isPostingActive, setIsPostingActive] = useState(false);

	const startAutoPosting = async () => {
		if (!user?._id || selectedPlatforms.length === 0) return;

		setIsPosting(true);
		try {
			const res = await axios.post(`/api/auto-posting-settings`, {
				userId: user._id,
				campaignName,
				isEnabled: true,
				interval: parseInt(postingInterval),
				platforms: selectedPlatforms,
				language: selectedLanguage,
				template: selectedTemplate,
			});

			if (res.data.success) {
				toast.success(res.data.message);
				fetchCampaigns();
				setIsPostingActive(true);
				setShowCreateDialog(false);
				resetForm();
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Failed to start auto posting");
			}
		} finally {
			setIsPosting(false);
		}
	};

	const handleAutoPostingToggle = useCallback(
		async (campaignId: string, interval: number) => {
			const campaign = campaigns.find((c) => c._id === campaignId);
			if (!campaign) return;

			try {
				const res = await axios.put(
					`/api/auto-posting-settings?campaignId=${campaignId}`,
					{
						isEnabled: !campaign.isEnabled,
						interval: interval,
					}
				);

				if (res.data.success) {
					toast.success(res.data.message);
					fetchCampaigns();
					setIsPostingActive(!campaign.isEnabled);
				}
			} catch (error: unknown) {
				if (error instanceof Error) {
					toast.error(error.message);
				} else {
					toast.error("Failed to update campaign");
				}
			}
		},
		[campaigns, postingInterval]
	);

	const handlePlatformToggle = useCallback((platform: string) => {
		setSelectedPlatforms((prev) =>
			prev.includes(platform)
				? prev.filter((p) => p !== platform)
				: [...prev, platform]
		);
	}, []);

	const fetchCampaigns = async () => {
		if (!user?._id) return;

		try {
			const response = await axios.get(
				`/api/auto-posting-settings?userId=${user._id}`
			);
			setCampaigns(response.data.settings || []);
		} catch (error) {
			console.error("Error fetching auto-posting settings:", error);
		}
	};

	const handleDeleteCampaign = async (campaignId: string) => {
		if (!confirm("Are you sure you want to delete this campaign?")) return;

		try {
			const response = await axios.delete(
				`/api/auto-posting-settings?campaignId=${campaignId}`
			);
			if (response.data.success) {
				toast.success("Campaign deleted successfully!");
				fetchCampaigns();
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message || "Failed to delete campaign");
			} else {
				toast.error("Failed to delete campaign");
			}
		}
	};

	const resetForm = () => {
		setCampaignName("");
		setSelectedPlatforms([]);
		setPostingInterval("60");
		setSelectedLanguage("hindi");
		setSelectedTemplate("classic");
	};

	useEffect(() => {
		if (user?._id) {
			fetchCampaigns();
		}
	}, [user?._id]);

	const getStatusColor = (isEnabled: boolean) => {
		return isEnabled
			? "bg-green-100 text-green-800"
			: "bg-gray-100 text-gray-800";
	};

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-foreground'>
						AutoPoster
					</h1>
					<p className='text-muted-foreground'>
						Automate your social media posting with intelligent
						scheduling
					</p>
				</div>
				<Dialog
					open={showCreateDialog}
					onOpenChange={setShowCreateDialog}>
					<DialogTrigger asChild>
						<Button className='bg-primary hover:bg-primary/90'>
							<Plus className='mr-2 h-4 w-4' />
							Create Campaign
						</Button>
					</DialogTrigger>
					<DialogContent className='w-auto max-w-7xl'>
						<DialogHeader>
							<DialogTitle>Create New Campaign</DialogTitle>
							<DialogDescription>
								Set up automated posting for your social media
								accounts
							</DialogDescription>
						</DialogHeader>

						<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
							{/* Quote Preview Section */}
							<div className='space-y-4'>
								<div className='space-y-2'>
									<Label className='flex items-center'>
										<Clock className='w-4 h-4 mr-2 text-primary' />
										Campaign Name
									</Label>
									<Input
										type='text'
										placeholder='e.g., Morning Motivation'
										value={campaignName}
										onChange={(e) =>
											setCampaignName(e.target.value)
										}
										className='w-full'
									/>
								</div>

								<Separator className='my-4' />

								<div className='space-y-2'>
									<Label className='flex items-center'>
										<Clock className='w-4 h-4 mr-2 text-primary' />
										Posting Interval
									</Label>
									<div className='flex gap-2 items-center'>
										<Input
											type='number'
											min='1'
											max='1440'
											value={postingInterval}
											onChange={(e) =>
												setPostingInterval(
													e.target.value
												)
											}
											className='w-24'
										/>
										<span className='text-foreground/80'>
											minutes
										</span>
									</div>
								</div>

								{/* Quote Preview */}

								<div className='relative w-full aspect-square max-w-xl mx-auto overflow-hidden rounded-xl shadow-lg'>
									<Image
										src={getTemplateImage(selectedTemplate)}
										alt={`Quote Template`}
										fill
										className='object-cover'
										priority
									/>
								</div>
							</div>

							{/* Controls Section */}
							<div className='space-y-6'>
								<div className='space-y-4 p-4 rounded-lg bg-muted/30'>
									{/* Language Selection */}
									<div className='space-y-2'>
										<Label>🌐 Language Selection</Label>
										<Select
											value={selectedLanguage}
											onValueChange={(
												value: "hindi" | "english"
											) => setSelectedLanguage(value)}>
											<SelectTrigger className='w-full'>
												<SelectValue placeholder='Select language' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='hindi'>
													🇮🇳 Hindi
												</SelectItem>
												<SelectItem value='english'>
													🇺🇸 English
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<Separator className='my-4' />

									{/* Template Selection */}
									<div className='space-y-2'>
										<Label>🎨 Template Selection</Label>
										<Select
											value={selectedTemplate}
											onValueChange={(
												value:
													| "classic"
													| "minimal"
													| "elegant"
													| "bold"
													| "iconic"
													| "neutral"
											) => setSelectedTemplate(value)}>
											<SelectTrigger className='w-full'>
												<SelectValue placeholder='Select template' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='classic'>
													Classic
												</SelectItem>
												<SelectItem value='minimal'>
													Minimal
												</SelectItem>
												<SelectItem value='elegant'>
													Elegant
												</SelectItem>
												<SelectItem value='bold'>
													Bold
												</SelectItem>
												<SelectItem value='iconic'>
													Iconic
												</SelectItem>
												<SelectItem value='neutral'>
													Neutral
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<Separator className='my-4' />

									{/* Platform Selection */}
									<div className='space-y-2'>
										<Label className='flex items-center'>
											<Facebook className='w-4 h-4 mr-2 text-blue-600' />
											Select Platforms
										</Label>
										<div className='flex flex-col gap-3'>
											<div className='flex items-center space-x-2'>
												<Checkbox
													id='facebook'
													checked={selectedPlatforms.includes(
														"facebook"
													)}
													onCheckedChange={() =>
														handlePlatformToggle(
															"facebook"
														)
													}
												/>
												<Label
													htmlFor='facebook'
													className='flex items-center cursor-pointer'>
													<Facebook className='h-4 w-4 text-blue-600 mr-2' />
													Facebook
												</Label>
											</div>
											<div className='flex items-center space-x-2'>
												<Checkbox
													id='instagram'
													checked={selectedPlatforms.includes(
														"instagram"
													)}
													onCheckedChange={() =>
														handlePlatformToggle(
															"instagram"
														)
													}
												/>
												<Label
													htmlFor='instagram'
													className='flex items-center cursor-pointer'>
													<Instagram className='h-4 w-4 text-pink-600 mr-2' />
													Instagram
												</Label>
											</div>
										</div>
									</div>
								</div>

								<Button
									onClick={startAutoPosting}
									variant='default'
									className='w-full py-6 text-lg'
									disabled={
										selectedPlatforms.length === 0 ||
										isPosting
									}>
									{isPosting ? (
										<>
											<Loader2 className='mr-2 h-5 w-5 animate-spin' />
											Posting...
										</>
									) : (
										"Start Auto Posting"
									)}
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{/* Stats */}
			<div className='grid gap-4 md:grid-cols-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Total Campaigns
						</CardTitle>
						<Clock className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{campaigns.length}
						</div>
						<p className='text-xs text-muted-foreground'>
							Automation campaigns
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Active Campaigns
						</CardTitle>
						<Play className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{campaigns.filter((c) => c.isEnabled).length}
						</div>
						<p className='text-xs text-muted-foreground'>
							Currently running
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Total Platforms
						</CardTitle>
						<Facebook className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{campaigns.reduce(
								(sum, c) => sum + c.platforms.length,
								0
							)}
						</div>
						<p className='text-xs text-muted-foreground'>
							Connected platforms
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Last Post
						</CardTitle>
						<Clock className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{campaigns.some((c) => c.lastPostTime) ? "✓" : "--"}
						</div>
						<p className='text-xs text-muted-foreground'>
							{campaigns.some((c) => c.lastPostTime)
								? "Posted recently"
								: "No posts yet"}
						</p>
					</CardContent>
				</Card>
			</div>

			{isPostingActive && (
				<Alert className='bg-green-50/50 border-green-200'>
					<Check className='h-4 w-4 text-green-600' />
					<AlertDescription className='text-green-600'>
						Auto posting is active, auto posting will start in 1
						minute
					</AlertDescription>
				</Alert>
			)}
			{/* Campaigns List */}
			<div className='space-y-4'>
				{campaigns.length === 0 ? (
					<Card>
						<CardContent className='text-center py-8'>
							<Clock className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
							<p className='text-muted-foreground'>
								No automation campaigns found
							</p>
							<p className='text-sm text-muted-foreground'>
								Create your first campaign to get started
							</p>
						</CardContent>
					</Card>
				) : (
					campaigns.map((campaign) => (
						<Card key={campaign._id}>
							<CardHeader>
								<div className='flex items-center justify-between'>
									<div className='flex items-center space-x-4'>
										<CardTitle className='text-lg'>
											{campaign.campaignName}
										</CardTitle>
										<Badge
											className={getStatusColor(
												campaign.isEnabled
											)}>
											{campaign.isEnabled
												? "Active"
												: "Inactive"}
										</Badge>
										<Badge variant='outline'>
											{campaign.language}
										</Badge>
										<Badge
											variant='outline'
											className='capitalize'>
											{campaign.template}
										</Badge>
									</div>
								</div>
								<CardDescription>
									Posts every {campaign.interval} minute(s) •
									Platforms:{" "}
									{campaign.platforms
										.map(
											(p) =>
												p.charAt(0).toUpperCase() +
												p.slice(1)
										)
										.join(", ")}
									{campaign.lastPostTime && (
										<>
											{" "}
											• Last post:{" "}
											{new Date(
												campaign.lastPostTime
											).toLocaleString()}
										</>
									)}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='grid grid-cols-5 items-center gap-4 text-sm'>
									<div>
										<p className='text-muted-foreground'>
											Interval
										</p>
										<p className='font-semibold'>
											{campaign.interval} minute(s)
										</p>
									</div>
									<div>
										<p className='text-muted-foreground'>
											Platforms
										</p>
										<p className='font-semibold'>
											{campaign.platforms.length}
										</p>
									</div>
									<div>
										<p className='text-muted-foreground'>
											Status
										</p>
										<p className='font-semibold'>
											{campaign.isEnabled
												? "Running"
												: "Stopped"}
										</p>
									</div>
									<div>
										<p className='text-muted-foreground'>
											Quote Image
										</p>
										<Image
											src={getTemplateImage(
												campaign.template
											)}
											alt={`${campaign.template} template`}
											width={100}
											height={100}
											className='rounded-md object-cover'
										/>
									</div>
									<div className='flex items-center flex-col gap-2 justify-end'>
										<Button
											onClick={() =>
												handleAutoPostingToggle(
													campaign._id,
													campaign.interval
												)
											}
											variant={
												campaign.isEnabled
													? "destructive"
													: "default"
											}
											className='w-full py-6 text-lg cursor-pointer hover:text-white'
											disabled={isPosting}>
											{campaign.isEnabled
												? "Stop Auto Posting"
												: "Start Auto Posting"}
										</Button>
										<Button
											variant='destructive'
											className='cursor-pointer py-6 text-lg hover:bg-destructive/90 hover:text-white w-full'
											onClick={() =>
												handleDeleteCampaign(
													campaign._id
												)
											}>
											<Trash2 className='h-4 w-4' />
											Delete Campaign
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	);
}
