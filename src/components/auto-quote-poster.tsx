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
import { postToSocialMedia } from "@/lib/quote-service";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import toast from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Facebook, Instagram } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";
import Image from "next/image";

interface Quote {
	text: string;
	author: string;
	imageUrl?: string;
}

export default function AutoQuotePoster() {
	const [quote, setQuote] = useState<Quote | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
	const [isAutoPosting, setIsAutoPosting] = useState(false);
	const [postingInterval, setPostingInterval] = useState("60");
	const [isPosting, setIsPosting] = useState(false);
	const { user } = useAuth();

	// Fetch a new quote and its server-generated image
	const fetchNewQuote = useCallback(async () => {
		setIsLoading(true);
		try {
			// Fetch quote and server-generated image
			const response = await axios.get("/api/quotes/generate");
			const { quote: newQuote, imageUrl } = response.data;

			setQuote({
				text: newQuote.text,
				author: newQuote.author,
				imageUrl: imageUrl,
			});

			return { text: newQuote.text, author: newQuote.author, imageUrl };
		} catch (error) {
			console.error("Error fetching quote:", error);
			toast.error("Failed to fetch a new quote");
			return null;
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Post to social media
	const handlePostToSocialMedia = useCallback(async () => {
		if (
			!user?._id ||
			selectedPlatforms.length === 0 ||
			isPosting ||
			!quote?.imageUrl
		)
			return;

		try {
			const caption = `${quote.text}\n\n— ${quote.author}`;

			// Post to selected platforms
			setIsPosting(true);
			const results = await Promise.all(
				selectedPlatforms.map((platform) =>
					postToSocialMedia(
						quote.imageUrl!,
						user._id,
						platform,
						caption
					)
				)
			);

			// Check if any post was successful
			const hasSuccess = results.some((res) => res.data.success);
			if (hasSuccess) {
				toast.success(
					`Post successful. Next post in ${postingInterval} minutes.`
				);
				// Fetch new quote for next time
				fetchNewQuote();
				return hasSuccess;
			} else {
				toast.error("Failed to post to any platform.");
			}
		} catch (error) {
			setIsAutoPosting(false);
			console.error("Error posting to social media:", error);
			let errorMessage = "Failed to post to social media";
			if (error instanceof Error) {
				errorMessage = error.message;
			}
			toast.error(errorMessage);
		} finally {
			setIsPosting(false);
		}
	}, [
		user?._id,
		selectedPlatforms,
		quote,
		postingInterval,
		isPosting,
		fetchNewQuote,
	]);

	// Toggle auto posting
	const handleAutoPostingToggle = useCallback(async () => {
		if (isAutoPosting) {
			// Stop auto posting
			setIsAutoPosting(false);

			// Save settings to database
			if (user?._id) {
				try {
					await axios.post("/api/auto-posting", {
						userId: user._id,
						isEnabled: false,
						interval: parseInt(postingInterval),
						platforms: selectedPlatforms,
					});
				} catch (error) {
					console.error("Error saving auto-posting settings:", error);
				}
			}

			toast.success("Auto-posting has been stopped");
		} else {
			// Start auto posting
			if (selectedPlatforms.length === 0) {
				toast.error(
					"Please select at least one platform for auto-posting"
				);
				return;
			}
			setIsAutoPosting(true);

			// Initial post
			const res = await handlePostToSocialMedia();
			if (res) {
				// Save settings to database
				if (user?._id) {
					try {
						await axios.post("/api/auto-posting", {
							userId: user._id,
							isEnabled: true,
							interval: parseInt(postingInterval),
							platforms: selectedPlatforms,
						});
					} catch (error) {
						console.error(
							"Error saving auto-posting settings:",
							error
						);
					}
				}
			}
		}
	}, [
		isAutoPosting,
		selectedPlatforms,
		postingInterval,
		handlePostToSocialMedia,
		user?._id,
	]);

	// Handle download
	const handleDownload = async () => {
		if (!quote?.imageUrl) return;
		const response = await fetch(quote.imageUrl);
		const blob = await response.blob();
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "quote-art.png";
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
	};

	// Toggle platform selection
	const handlePlatformToggle = useCallback(
		(platform: string) => {
			const newPlatforms = selectedPlatforms.includes(platform)
				? selectedPlatforms.filter((p) => p !== platform)
				: [...selectedPlatforms, platform];

			setSelectedPlatforms(newPlatforms);
		},
		[selectedPlatforms]
	);

	// Load initial quote
	useEffect(() => {
		fetchNewQuote();
	}, [fetchNewQuote]);

	// Load auto-posting settings when user is available
	useEffect(() => {
		const loadSettings = async () => {
			if (!user?._id) return;

			try {
				const response = await axios.get(
					`/api/auto-posting?userId=${user._id}`
				);
				const settings = response.data;

				setIsAutoPosting(settings.isEnabled);
				setPostingInterval(settings.interval.toString());
				setSelectedPlatforms(settings.platforms);
			} catch (error) {
				console.error("Error fetching auto-posting settings:", error);
			}
		};

		loadSettings();
	}, [user?._id]);

	return (
		<Card className='w-full max-w-2xl mx-auto'>
			<CardHeader>
				<CardTitle>Automatic Quote Poster</CardTitle>
				<CardDescription>
					Automatically generate and post Hindi quotes to your social
					media accounts
				</CardDescription>
				{isAutoPosting && (
					<Alert className='mt-2 bg-green-50 border-green-200'>
						<AlertCircle className='h-4 w-4 text-green-600' />
						<AlertDescription className='text-green-600'>
							Auto-posting is active for:{" "}
							{selectedPlatforms
								.map(
									(p) =>
										p.charAt(0).toUpperCase() + p.slice(1)
								)
								.join(", ")}
							<br />
							Next post in: {postingInterval} minutes
						</AlertDescription>
					</Alert>
				)}
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='space-y-2'>
					<Label>Current Quote</Label>
					{isLoading ? (
						<div className='flex items-center justify-center h-[600px] bg-muted rounded-lg'>
							<Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
						</div>
					) : !quote?.imageUrl ? (
						<div className='flex items-center justify-center h-[600px] bg-muted rounded-lg'>
							<p className='text-muted-foreground'>
								No quote generated yet
							</p>
						</div>
					) : (
						<div className='relative w-full aspect-square max-w-2xl mx-auto overflow-hidden rounded-lg'>
							<Image
								src={quote.imageUrl}
								alt={`Quote: ${quote.text}`}
								fill
								className='object-cover'
								priority
							/>
						</div>
					)}
				</div>

				<div className='space-y-2'>
					<Label>Posting Interval</Label>
					<div className='flex gap-2'>
						<Input
							type='number'
							min='1'
							max='1440'
							value={postingInterval}
							onChange={(e) => setPostingInterval(e.target.value)}
							className='w-24'
						/>
						<span className='self-center'>minutes</span>
					</div>
				</div>

				<div className='space-y-2'>
					<Label>Select Platforms</Label>
					<div className='flex gap-4'>
						<div className='flex items-center space-x-2'>
							<Checkbox
								id='facebook'
								checked={selectedPlatforms.includes("facebook")}
								onCheckedChange={() =>
									handlePlatformToggle("facebook")
								}
							/>
							<Label
								htmlFor='facebook'
								className='flex items-center'>
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
									handlePlatformToggle("instagram")
								}
							/>
							<Label
								htmlFor='instagram'
								className='flex items-center'>
								<Instagram className='h-4 w-4 text-pink-600 mr-2' />
								Instagram
							</Label>
						</div>
					</div>
				</div>

				<div className='flex gap-4'>
					<Button
						onClick={fetchNewQuote}
						disabled={isLoading}
						className='flex-1'>
						{isLoading ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Loading...
							</>
						) : (
							"Generate New Quote"
						)}
					</Button>
					<Button
						onClick={handleAutoPostingToggle}
						variant={isAutoPosting ? "destructive" : "default"}
						className='flex-1'
						disabled={selectedPlatforms.length === 0 || isPosting}>
						{isPosting ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Posting...
							</>
						) : isAutoPosting ? (
							"Stop Auto Posting"
						) : (
							"Start Auto Posting"
						)}
					</Button>
					<Button
						onClick={handleDownload}
						className='flex-1'
						disabled={!quote?.imageUrl}>
						Download
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
