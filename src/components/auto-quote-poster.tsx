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
	const [postingInterval, setPostingInterval] = useState("1");
	const [autoPostingPlatforms, setAutoPostingPlatforms] = useState<string[]>(
		[]
	);
	const [isAutoPosting, setIsAutoPosting] = useState(false);
	const canvasRef = useRef<HTMLDivElement>(null);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const { user } = useAuth();

	const fetchNewQuote = useCallback(async () => {
		setIsLoading(true);
		try {
			const newQuote = await getRandomHindiQuote();
			setQuote(newQuote);
		} catch (error) {
			console.error("Error fetching quote:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const handlePostToSocialMedia = useCallback(async () => {
		if (!quote || !canvasRef.current || !user?._id) return;

		try {
			// Generate image from quote
			const imageUrl = await generateImageDataUrl();

			const caption = `${quote.text}\n\n— ${quote.author}`;

			// Post to selected platforms
			const results = await Promise.all(
				autoPostingPlatforms.map((platform) =>
					postToSocialMedia(imageUrl, user._id, platform, caption)
				)
			);

			// Check if any post was successful
			const hasSuccess = results.some((res) => res.data.success);
			if (hasSuccess) {
				// Update last post time in backend
				await fetch("/api/auto-posting", {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						userId: user._id,
					}),
				});

				toast.success("Posts Published!");
				// Fetch a new quote for the next post
				await fetchNewQuote();
			} else {
				// If no posts were successful, stop auto-posting
				setIsAutoPosting(false);
				if (intervalRef.current) {
					clearInterval(intervalRef.current);
				}

				// Update backend settings
				await fetch("/api/auto-posting", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						userId: user._id,
						isEnabled: false,
						interval: parseInt(postingInterval),
						platforms: autoPostingPlatforms,
					}),
				});

				toast.error(
					"Failed to post to any platform. Auto-posting has been stopped."
				);
			}
		} catch (error) {
			console.error("Error posting to social media:", error);
			// Stop auto-posting on error
			setIsAutoPosting(false);
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}

			// Update backend settings
			if (user?._id) {
				await fetch("/api/auto-posting", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						userId: user._id,
						isEnabled: false,
						interval: parseInt(postingInterval),
						platforms: autoPostingPlatforms,
					}),
				});
			}

			let errorMessage = "Failed to post to social media";
			if (error instanceof Error) {
				errorMessage = error.message;
			}
			toast.error(errorMessage);
		}
	}, [
		quote,
		user?._id,
		autoPostingPlatforms,
		postingInterval,
		fetchNewQuote,
	]);

	const startAutoPosting = useCallback(
		async (interval: number, platforms: string[]) => {
			// Clear any existing interval
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
			console.log(platforms);

			// Initial post
			await handlePostToSocialMedia();

			// Set up interval for subsequent posts
			const intervalTime = interval * 60 * 60 * 1000; // Convert hours to milliseconds
			intervalRef.current = setInterval(async () => {
				await handlePostToSocialMedia();
			}, intervalTime);
		},
		[handlePostToSocialMedia]
	);

	// Load initial quote
	useEffect(() => {
		fetchNewQuote();
	}, [fetchNewQuote]);

	// Load auto-posting settings from backend
	useEffect(() => {
		let mounted = true;

		const loadSettings = async () => {
			if (!user?._id) return;

			try {
				const response = await fetch(
					`/api/auto-posting?userId=${user._id}`
				);
				if (!response.ok) {
					throw new Error("Failed to load auto-posting settings");
				}

				if (!mounted) return;

				const settings = await response.json();
				setAutoPostingPlatforms(settings.platforms || []);
				setPostingInterval(settings.interval?.toString() || "1");
				setIsAutoPosting(settings.isEnabled || false);

				// If auto-posting is enabled, start the interval
				if (settings.isEnabled && mounted) {
					startAutoPosting(settings.interval, settings.platforms);
				}
			} catch (error) {
				console.error("Error loading auto-posting settings:", error);
				if (mounted) {
					toast.error("Failed to load auto-posting settings");
				}
			}
		};

		loadSettings();

		return () => {
			mounted = false;
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [user?._id]);

	const handleAutoPostingToggle = async () => {
		if (!user?._id) {
			toast.error("Please sign in to use auto-posting");
			return;
		}

		try {
			if (!isAutoPosting) {
				// Check if any platforms are selected
				if (autoPostingPlatforms.length === 0) {
					toast.error(
						"Please select at least one platform for auto-posting"
					);
					return;
				}

				// Save settings to backend
				const response = await fetch("/api/auto-posting", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						userId: user._id,
						isEnabled: true,
						interval: parseInt(postingInterval),
						platforms: autoPostingPlatforms,
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to save auto-posting settings");
				}

				// Start auto posting
				setIsAutoPosting(true);
				startAutoPosting(
					parseInt(postingInterval),
					autoPostingPlatforms
				);
				toast.success("Auto-posting has been started");
			} else {
				// Save disabled state to backend
				const response = await fetch("/api/auto-posting", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						userId: user._id,
						isEnabled: false,
						interval: parseInt(postingInterval),
						platforms: autoPostingPlatforms,
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to save auto-posting settings");
				}

				// Stop auto posting
				setIsAutoPosting(false);
				if (intervalRef.current) {
					clearInterval(intervalRef.current);
				}
				toast.success("Auto-posting has been stopped");
			}
		} catch (error) {
			console.error("Error toggling auto-posting:", error);
			toast.error("Failed to toggle auto-posting");
		}
	};

	const handlePlatformToggle = async (platform: string) => {
		const newPlatforms = autoPostingPlatforms.includes(platform)
			? autoPostingPlatforms.filter((p) => p !== platform)
			: [...autoPostingPlatforms, platform];

		setAutoPostingPlatforms(newPlatforms);

		// Save settings to backend if user is signed in
		if (user?._id) {
			try {
				await fetch("/api/auto-posting", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						userId: user._id,
						isEnabled: isAutoPosting,
						interval: parseInt(postingInterval),
						platforms: newPlatforms,
					}),
				});
			} catch (error) {
				console.error("Error saving platform settings:", error);
			}
		}
	};

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
		const dataUrl = canvas.toDataURL("image/png", 1.0);
		return dataUrl;
	};

	// Handle download
	const handleDownload = async () => {
		if (!canvasRef.current) return;
		await downloadQuoteImage(canvasRef.current, "quote-art.png");
	};

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
							{autoPostingPlatforms
								.map(
									(p) =>
										p.charAt(0).toUpperCase() + p.slice(1)
								)
								.join(", ")}
							<br />
							Next post in: {postingInterval} hour(s)
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

								{/* {quote?.watermark && (
									<p
										className='absolute bottom-4 right-4 text-sm opacity-70'
										style={{
											color: quote?.textColor,
											letterSpacing: "0.025em",
											textRendering: "optimizeLegibility",
											WebkitFontSmoothing: "antialiased",
											MozOsxFontSmoothing: "grayscale",
										}}>
											{quote.watermark}
										</p>
									)} */}
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
							max='24'
							value={postingInterval}
							onChange={(e) => setPostingInterval(e.target.value)}
							className='w-24'
						/>
						<span className='self-center'>hours</span>
					</div>
				</div>

				<div className='space-y-2'>
					<Label>Select Platforms</Label>
					<div className='flex gap-4'>
						<div className='flex items-center space-x-2'>
							<Checkbox
								id='facebook'
								checked={autoPostingPlatforms.includes(
									"facebook"
								)}
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
								checked={autoPostingPlatforms.includes(
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
						disabled={autoPostingPlatforms.length === 0}>
						{isAutoPosting
							? "Stop Auto Posting"
							: "Start Auto Posting"}
					</Button>
					<Button onClick={handleDownload} className='flex-1'>
						Download
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
