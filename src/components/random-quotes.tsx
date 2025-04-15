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
import { Label } from "@/components/ui/label";
import {
	getRandomEnglishQuote,
	getRandomHindiQuote,
} from "@/lib/quote-service";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadQuoteImage } from "@/lib/download-utils";
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

export default function RamdomQuotes() {
	const [quote, setQuote] = useState<Quote | null>(null);
	const [englishQuote, setEnglishQuote] = useState<Quote | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isEnglishLoading, setIsEnglishLoading] = useState(false);
	const canvasRef = useRef<HTMLDivElement>(null);

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

	const fetchNewEnglishQuote = useCallback(async () => {
		setIsEnglishLoading(true);
		try {
			const newEnglishQuote = await getRandomEnglishQuote();
			setEnglishQuote(newEnglishQuote);
			setIsEnglishLoading(false);
		} catch (error) {
			console.error("Error fetching English quote:", error);
		} finally {
			setIsEnglishLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchNewQuote();
		fetchNewEnglishQuote();
	}, []);

	const handleDownload = async () => {
		if (!canvasRef.current) return;
		await downloadQuoteImage(canvasRef.current, "quote-art.png");
		toast.success("Quote Downloaded!");
	};

	return (
		<div className='flex gap-5'>
			<Card className='w-full max-w-2xl mx-auto'>
				<CardHeader>
					<CardTitle>Hindi Quotes</CardTitle>
					<CardDescription>
						Automatically generated Hindi quotes
					</CardDescription>
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
											backgroundColor:
												quote.backgroundColor,
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
													(quote?.fontSize || 24) *
													0.5
												}px`,
												letterSpacing: "0.025em",
												wordSpacing: "0.05em",
												textRendering:
													"optimizeLegibility",
												WebkitFontSmoothing:
													"antialiased",
												MozOsxFontSmoothing:
													"grayscale",
											}}>
											— {quote.author}
										</p>
									)}
								</div>
							</div>
						)}
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
						<Button onClick={handleDownload} className='flex-1'>
							Download
						</Button>
					</div>
				</CardContent>
			</Card>
			<Card className='w-full max-w-2xl mx-auto'>
				<CardHeader>
					<CardTitle>English Quotes</CardTitle>
					<CardDescription>
						Automatically generated English quotes
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='space-y-2'>
						<Label>Current Quote</Label>
						{isEnglishLoading ? (
							<div className='flex items-center justify-center h-[600px] bg-muted rounded-lg'>
								<Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
							</div>
						) : !englishQuote ? (
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
									backgroundImage: `url(${englishQuote?.backgroundImage})`,
									backgroundSize: "cover",
									backgroundPosition: "center",
								}}>
								{englishQuote?.backgroundColor && (
									<div
										className='absolute inset-0'
										style={{
											backgroundColor:
												englishQuote.backgroundColor,
										}}></div>
								)}

								<div className='relative z-10 flex flex-col items-center justify-center h-full w-full'>
									<p
										className={cn(
											"mb-4 px-4 font-semibold whitespace-pre-line text-center",
											englishQuote?.fontFamily
										)}
										style={{
											color: englishQuote?.textColor,
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
										{englishQuote?.text}
									</p>

									{englishQuote?.author && (
										<p
											className={cn(
												"mt-2 text-center",
												englishQuote?.fontFamily
											)}
											style={{
												color: englishQuote?.textColor,
												fontSize: `${
													(englishQuote?.fontSize ||
														24) * 0.5
												}px`,
												letterSpacing: "0.025em",
												wordSpacing: "0.05em",
												textRendering:
													"optimizeLegibility",
												WebkitFontSmoothing:
													"antialiased",
												MozOsxFontSmoothing:
													"grayscale",
											}}>
											— {englishQuote.author}
										</p>
									)}
								</div>
							</div>
						)}
					</div>

					<div className='flex gap-4'>
						<Button
							onClick={fetchNewEnglishQuote}
							disabled={isEnglishLoading}
							className='flex-1'>
							{isEnglishLoading ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Loading...
								</>
							) : (
								"Generate New Quote"
							)}
						</Button>
						<Button onClick={handleDownload} className='flex-1'>
							Download
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
