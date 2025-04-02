"use client";

import { useState, useEffect, useRef } from "react";
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
	const [isAutoPosting, setIsAutoPosting] = useState(false);
	const canvasRef = useRef<HTMLDivElement>(null);
	const { user } = useAuth();

	const fetchNewQuote = async () => {
		setIsLoading(true);
		try {
			const newQuote = await getRandomHindiQuote();

			setQuote(newQuote);
		} catch (error) {
			console.error("Error fetching quote:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchNewQuote();
	}, []);

	const handleAutoPostingToggle = async () => {
		if (!isAutoPosting) {
			// Start auto posting
			setIsAutoPosting(true);
			const interval = parseInt(postingInterval) * 60 * 60 * 1000; // Convert hours to milliseconds

			// Initial post
			await handlePostToSocialMedia();

			// Set up interval for subsequent posts
			const intervalId = setInterval(async () => {
				await handlePostToSocialMedia();
			}, interval);

			// Store interval ID in localStorage to persist across page refreshes
			localStorage.setItem(
				"autoPostingIntervalId",
				intervalId.toString()
			);
		} else {
			// Stop auto posting
			setIsAutoPosting(false);
			const intervalId = localStorage.getItem("autoPostingIntervalId");
			if (intervalId) {
				clearInterval(parseInt(intervalId));
				localStorage.removeItem("autoPostingIntervalId");
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

	const handlePostToSocialMedia = async () => {
		if (!quote || !canvasRef.current) return;

		try {
			// Generate image from quote
			const imageUrl = await generateImageDataUrl();
			const userId = user?._id;
			const platform = "facebook";
			const caption = `${quote.text}\n\n— ${quote.author}`;
			// Post to social media
			const res = await postToSocialMedia(
				imageUrl,
				userId,
				platform,
				caption
			);
			if (res.data.success) {
				toast.success("Post Published!");
			}

			// Fetch a new quote for the next post
			await fetchNewQuote();
		} catch (error) {
			console.error("Error posting to social media:", error);
		}
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
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='space-y-2'>
					<Label>Current Quote</Label>
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
						className='flex-1'>
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
