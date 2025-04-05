"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import { getRandomHindiQuote, postToSocialMedia } from "@/lib/quote-service";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadQuoteImage } from "@/lib/download-utils";
import { useAuth } from "@/context/auth-context";
import toast from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Facebook, Instagram } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";

interface Quote {
	text: string;
	author: string;
	backgroundImage?: string;
	textColor?: string;
	backgroundColor?: string;
	fontFamily?: string;
	fontSize?: number;
	watermark?: string;
}

export default function AutoQuotePoster() {
	const [quote, setQuote] = useState<Quote | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
	const [isAutoPosting, setIsAutoPosting] = useState(false);
	const canvasRef = useRef<HTMLDivElement>(null);
	const [postingInterval, setPostingInterval] = useState("60");
	const [isPosting, setIsPosting] = useState(false);
	const { user } = useAuth();
	const autoIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const settingsLoadedRef = useRef(false);

	// Fetch a new quote
	const fetchNewQuote = useCallback(async () => {
		setIsLoading(true);
		try {
			const newQuote = await getRandomHindiQuote();
			setQuote(newQuote);
			return newQuote;
		} catch (error) {
			console.error("Error fetching quote:", error);
			toast.error("Failed to fetch a new quote");
			return null;
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Generate image data URL for social sharing
	const generateImageDataUrl = async () => {
		if (!canvasRef.current) return;

		const html2canvas = (await import("html2canvas")).default;
		const canvas = await html2canvas(canvasRef.current, {
			allowTaint: true,
			useCORS: true,
			scale: 2,
			logging: false,
			removeContainer: true,
			backgroundColor: null,
			onclone: (clonedDoc) => {
				const clonedElement = clonedDoc.querySelector(
					"[data-html2canvas-ignore]"
				);
				if (clonedElement) {
					clonedElement.remove();
				}
			},
		});
		return canvas.toDataURL("image/png", 1.0);
	};

	// Post to social media
	const handlePostToSocialMedia = useCallback(async () => {
		if (
			!canvasRef.current ||
			!user?._id ||
			selectedPlatforms.length === 0 ||
			isPosting
		)
			return;

		try {
			// Fetch a new quote before posting
			const newQuote = await fetchNewQuote();
			if (!newQuote) {
				toast.error("Failed to fetch a quote for posting");
				return;
			}
			setQuote(newQuote);

			await new Promise((resolve) => setTimeout(resolve, 100));

			// Generate image from quote
			const imageUrl = await generateImageDataUrl();
			if (!imageUrl) {
				toast.error("Failed to generate image");
				return;
			}

			const caption = `${newQuote.text}\n\n— ${newQuote.author}`;

			// Post to selected platforms
			setIsPosting(true);
			const results = await Promise.all(
				selectedPlatforms.map((platform) =>
					postToSocialMedia(imageUrl, user._id, platform, caption)
				)
			);

			// Check if any post was successful
			const hasSuccess = results.some((res) => res.data.success);
			if (hasSuccess) {
				toast.success(
					`Post successful. Next post in ${postingInterval} minutes.`
				);
			} else {
				toast.error("Failed to post to any platform.");
			}
		} catch (error) {
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
		fetchNewQuote,
		postingInterval,
		isPosting,
	]);

	// Toggle auto posting
	const handleAutoPostingToggle = useCallback(async () => {
		if (isAutoPosting) {
			// Stop auto posting
			if (autoIntervalRef.current) {
				clearInterval(autoIntervalRef.current);
				autoIntervalRef.current = null;
			}
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

			// Set auto-posting state
			setIsAutoPosting(true);

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
					console.error("Error saving auto-posting settings:", error);
				}
			}

			// Initial post
			handlePostToSocialMedia();

			// Set up interval for subsequent posts
			autoIntervalRef.current = setInterval(
				handlePostToSocialMedia,
				parseInt(postingInterval) * 60 * 1000
			);
		}
	}, [
		isAutoPosting,
		selectedPlatforms,
		postingInterval,
		handlePostToSocialMedia,
		user?._id,
	]);

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

	// Handle download
	const handleDownload = async () => {
		if (!canvasRef.current) return;
		await downloadQuoteImage(canvasRef.current, "quote-art.png");
	};

	// Load initial quote
	useEffect(() => {
		fetchNewQuote();
	}, [fetchNewQuote]);

	// Load auto-posting settings when user is available
	useEffect(() => {
		const loadSettings = async () => {
			if (!user?._id || settingsLoadedRef.current) return;

			try {
				const response = await axios.get(
					`/api/auto-posting?userId=${user._id}`
				);
				const settings = response.data;

				// Update state with fetched settings
				setIsAutoPosting(settings.isEnabled);
				setPostingInterval(settings.interval.toString());
				setSelectedPlatforms(settings.platforms);

				// If auto-posting is enabled, set up the interval
				if (settings.isEnabled) {
					// Set up interval without initial post
					autoIntervalRef.current = setInterval(
						handlePostToSocialMedia,
						settings.interval * 60 * 1000
					);
				}

				// Mark settings as loaded
				settingsLoadedRef.current = true;
			} catch (error) {
				console.error("Error fetching auto-posting settings:", error);
				settingsLoadedRef.current = true;
			}
		};

		loadSettings();
	}, [user?._id, handlePostToSocialMedia]);

	// // Clean up interval on unmount
	// useEffect(() => {
	// 	return () => {
	// 		if (autoIntervalRef.current) {
	// 			clearInterval(autoIntervalRef.current);
	// 		}
	// 	};
	// }, []);

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
					) : !quote ? (
						<div className='flex items-center justify-center h-[600px] bg-muted rounded-lg'>
							<p className='text-muted-foreground'>
								No quote generated yet
							</p>
						</div>
					) : (
						<div
							ref={canvasRef}
							className='relative w-full aspect-square max-w-2xl mx-auto overflow-hidden rounded-lg p-8 text-center'
							style={{
								backgroundImage: `url(${quote?.backgroundImage})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
							}}>
							{quote?.backgroundColor && (
								<div
									className='absolute inset-0'
									style={{
										backgroundColor: quote.backgroundColor,
									}}></div>
							)}

							<div className='relative z-10 flex flex-col items-center justify-center h-full w-full'>
								<p
									className={cn(
										"mb-4 px-4 font-semibold whitespace-pre-line text-center",
										quote?.fontFamily
									)}
									style={{
										color: quote?.textColor,
										fontSize: `18px`,
										maxWidth: "70%",
										wordWrap: "break-word",
										lineHeight: 1.4,
										letterSpacing: "0.025em",
										wordSpacing: "0.05em",
										textRendering: "optimizeLegibility",
										WebkitFontSmoothing: "antialiased",
										MozOsxFontSmoothing: "grayscale",
									}}>
									{quote?.text}
								</p>

								{quote?.author && (
									<p
										className={cn(
											"mt-2 text-center",
											quote?.fontFamily
										)}
										style={{
											color: quote?.textColor,
											fontSize: `${
												(quote?.fontSize || 24) * 0.5
											}px`,
											letterSpacing: "0.025em",
											wordSpacing: "0.05em",
											textRendering: "optimizeLegibility",
											WebkitFontSmoothing: "antialiased",
											MozOsxFontSmoothing: "grayscale",
										}}>
										— {quote.author}
									</p>
								)}
							</div>
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
					<Button onClick={handleDownload} className='flex-1'>
						Download
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
