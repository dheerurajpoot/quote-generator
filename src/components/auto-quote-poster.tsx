"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { AxiosError } from "axios";
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
import {
	Loader2,
	Clock,
	Download,
	RefreshCw,
	AlertCircle,
	Facebook,
	Instagram,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import toast from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface Quote {
	text: string;
	author: string;
	imageUrl?: string;
}

interface ApiErrorResponse {
	response: {
		data: {
			error: string;
		};
	};
}

// Helper to generate hashtags from quote text and author
function generateHashtags(text: string, author: string, count = 15): string[] {
	const trending = [
		"#motivation",
		"#inspiration",
		"#quotes",
		"#success",
		"#life",
		"#viral",
		"#trending",
		"#positivity",
		"#quoteoftheday",
		"#mindset",
		"#wisdom",
		"#selfgrowth",
		"#hindi",
		"#hindiquotes",
		"#anmolvachan",
		"#zindagi",
		"#soch",
		"#jeevan",
		"#suvichar",
		"#hindikavita",
		"#hindistatus",
		"#hindimotivation",
	];
	// Detect Hindi (Devanagari) characters
	const isHindi = /[\u0900-\u097F]/.test(text);
	if (isHindi) {
		// Shuffle trending and pick 'count' tags
		const shuffled = trending.sort(() => 0.5 - Math.random());
		return shuffled.slice(0, count);
	}
	// English/other: use keyword extraction + trending
	const stopwords = new Set([
		"the",
		"is",
		"and",
		"a",
		"to",
		"of",
		"in",
		"that",
		"it",
		"on",
		"for",
		"with",
		"as",
		"was",
		"at",
		"by",
		"an",
		"be",
		"this",
		"have",
		"from",
		"or",
		"but",
		"not",
		"are",
		"your",
		"just",
		"they",
		"want",
		"know",
		"you",
		"their",
		"all",
		"has",
		"will",
		"can",
		"we",
		"our",
		"so",
		"if",
		"do",
		"does",
		"had",
		"been",
		"more",
		"no",
		"out",
		"up",
		"who",
		"what",
		"when",
		"how",
		"why",
		"which",
		"about",
		"into",
		"than",
		"then",
		"them",
		"he",
		"she",
		"his",
		"her",
		"him",
		"i",
		"me",
		"my",
		"mine",
		"it's",
		"its",
		"too",
		"also",
		"get",
		"got",
		"let",
		"let's",
		"us",
		"because",
		"over",
		"under",
		"off",
		"this",
		"that",
		"these",
		"those",
		"such",
		"only",
		"even",
		"very",
		"much",
		"some",
		"any",
		"each",
		"every",
		"either",
		"neither",
		"both",
		"few",
		"many",
		"most",
		"other",
		"another",
		"again",
		"once",
		"here",
		"there",
		"where",
		"when",
		"why",
		"how",
		"all",
		"any",
		"both",
		"each",
		"few",
		"more",
		"most",
		"other",
		"some",
		"such",
		"no",
		"nor",
		"not",
		"only",
		"own",
		"same",
		"so",
		"than",
		"too",
		"very",
	]);
	const words = text
		.replace(/[.,!?"'’]/g, "")
		.split(/\s+/)
		.map((w) => w.toLowerCase())
		.filter((w) => w.length > 3 && !stopwords.has(w));
	const unique = Array.from(new Set(words));
	const hashtags = unique.slice(0, count).map((w) => `#${w}`);
	if (
		author &&
		author.toLowerCase() !== "unknown" &&
		hashtags.length < count
	) {
		hashtags.push(`#${author.replace(/\s+/g, "").toLowerCase()}`);
	}
	const trendingCopy = [...trending];
	while (hashtags.length < count && trendingCopy.length > 0) {
		hashtags.push(trendingCopy.shift()!);
	}
	return hashtags.slice(0, count);
}

export default function AutoQuotePoster() {
	const [quote, setQuote] = useState<Quote | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
	const [isAutoPosting, setIsAutoPosting] = useState(false);
	const [postingInterval, setPostingInterval] = useState("60");
	const [selectedLanguage, setSelectedLanguage] = useState<
		"hindi" | "english"
	>("hindi");
	const [selectedTemplate, setSelectedTemplate] = useState<
		"classic" | "minimal" | "elegant" | "bold" | "iconic" | "neutral"
	>("classic");
	const [isPosting, setIsPosting] = useState(false);
	const [settingsLoaded, setSettingsLoaded] = useState(false);
	const { user } = useAuth();

	// Fetch a new quote and its server-generated image
	const fetchNewQuote = useCallback(async () => {
		if (!user?._id || !settingsLoaded) return;
		setIsLoading(true);
		try {
			const response = await axios.get(
				`/api/quotes/generate?userId=${user._id}&language=${selectedLanguage}&template=${selectedTemplate}`
			);
			const { quote: newQuote, imageUrl } = response.data;

			setQuote({
				text: newQuote.text,
				author: newQuote.author,
				imageUrl: imageUrl,
			});

			return { text: newQuote.text, author: newQuote.author, imageUrl };
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				console.error(
					"Error fetching quote:",
					error.response?.data || error
				);
				toast.error(
					error.response?.data?.message || "Failed to fetch quote"
				);
			} else {
				console.error("Error fetching quote:", error);
				toast.error("Failed to fetch quote");
			}
			return null;
		} finally {
			setIsLoading(false);
		}
	}, [user?._id, selectedLanguage, selectedTemplate, settingsLoaded]);

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
			const hashtags = generateHashtags(quote.text, quote.author, 15);
			const caption = `${quote.text}\n\n— ${
				quote.author
			}\n\n${hashtags.join(" ")}`;

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
				setIsAutoPosting(true);

				toast.success(
					`Post successful. Next post in ${postingInterval} minutes.`
				);
				return hasSuccess;
			} else {
				toast.error("Failed to post to any platform.");
			}
		} catch (error) {
			setIsAutoPosting(false);
			console.error("Error posting to social media:", error);
			let errorMessage = "Failed to post to social media";
			if (error && typeof error === "object" && "response" in error) {
				errorMessage =
					(error as ApiErrorResponse)?.response?.data?.error ||
					errorMessage;
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
					await axios.post("/api/auto-posting-settings", {
						userId: user._id,
						isEnabled: false,
						interval: parseInt(postingInterval),
						platforms: selectedPlatforms,
						language: selectedLanguage,
						template: selectedTemplate,
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

			// Initial post
			const res = await handlePostToSocialMedia();
			if (res) {
				// Save settings to database
				if (user?._id) {
					try {
						const settingsData = {
							userId: user._id,
							isEnabled: true,
							interval: parseInt(postingInterval),
							platforms: selectedPlatforms,
							language: selectedLanguage,
							template: selectedTemplate,
						};
						await axios.post(
							"/api/auto-posting-settings",
							settingsData
						);
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
		selectedLanguage,
		selectedTemplate,
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

	// Load initial quote - only after settings are loaded
	useEffect(() => {
		if (
			user?._id &&
			selectedLanguage &&
			selectedTemplate &&
			settingsLoaded
		) {
			fetchNewQuote();
		}
	}, [user?._id, selectedLanguage, selectedTemplate, settingsLoaded]);

	// Load auto-posting settings when user is available
	useEffect(() => {
		const loadSettings = async () => {
			if (!user?._id) return;

			try {
				const response = await axios.get(
					`/api/auto-posting-settings?userId=${user._id}`
				);
				const settings = response.data;

				setIsAutoPosting(settings.isEnabled);
				setPostingInterval(settings.interval.toString());
				setSelectedPlatforms(settings.platforms);
				setSelectedLanguage(settings.language || "hindi");
				setSelectedTemplate(settings.template || "classic");
				setSettingsLoaded(true);
			} catch (error) {
				console.error("Error fetching auto-posting settings:", error);
				setSettingsLoaded(true); // Still mark as loaded to prevent infinite waiting
			}
		};

		if (user?._id) {
			loadSettings();
		}
	}, [user?._id]);

	if (!user) {
		return (
			<div className='flex items-center justify-center min-h-[300px]'>
				<Loader2 className='w-8 h-8 animate-spin' />
			</div>
		);
	}

	return (
		<div className='w-full max-w-5xl mx-auto p-4'>
			<Card className='w-full border-none shadow-lg bg-gradient-to-br from-background to-muted/30'>
				<CardHeader className='space-y-4'>
					<div className='flex items-center justify-between'>
						<div>
							<CardTitle className='text-2xl md:text-3xl font-bold'>
								Automatic Quote Poster
							</CardTitle>
							<CardDescription className='text-lg mt-2 text-foreground/80'>
								Automatically generate and post inspiring quotes
								to your social media accounts
							</CardDescription>
						</div>
						{isAutoPosting && (
							<Badge
								variant='secondary'
								className='px-4 py-2 bg-green-500/10 text-green-600 border-green-500/20'>
								<Clock className='w-4 h-4 mr-2' />
								Active
							</Badge>
						)}
					</div>
					{isAutoPosting && (
						<Alert className='bg-green-50/50 border-green-200'>
							<AlertCircle className='h-4 w-4 text-green-600' />
							<AlertDescription className='text-green-600'>
								Auto-posting is active for:{" "}
								{selectedPlatforms
									.map(
										(p) =>
											p.charAt(0).toUpperCase() +
											p.slice(1)
									)
									.join(", ")}
								<br />
								Next post in: {postingInterval} minutes
							</AlertDescription>
						</Alert>
					)}
				</CardHeader>
				<CardContent className='space-y-6'>
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
						{/* Quote Preview Section */}
						<div className='space-y-4'>
							<div className='flex items-center justify-between'>
								<Label className='text-lg font-semibold'>
									Current Quote
								</Label>
								<Button
									variant='ghost'
									size='sm'
									onClick={fetchNewQuote}
									disabled={isLoading}
									className='text-primary hover:text-primary/80'>
									<RefreshCw className='w-4 h-4 mr-2' />
									Refresh
								</Button>
							</div>
							{isLoading ? (
								<div className='flex items-center justify-center h-[400px] bg-muted/50 rounded-xl'>
									<Loader2 className='h-8 w-8 animate-spin text-primary' />
								</div>
							) : !quote?.imageUrl ? (
								<div className='flex items-center justify-center h-[400px] bg-muted/50 rounded-xl'>
									<p className='text-muted-foreground'>
										No quote generated yet
									</p>
								</div>
							) : (
								<div className='relative w-full aspect-square max-w-xl mx-auto overflow-hidden rounded-xl shadow-lg'>
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

						{/* Controls Section */}
						<div className='space-y-6'>
							<div className='space-y-4'>
								<Label className='text-lg font-semibold'>
									Posting Settings
								</Label>
								<div className='space-y-4 p-4 rounded-lg bg-muted/30'>
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

									<Separator className='my-4' />

									<div className='space-y-2'>
										<Label className='flex items-center'>
											🌐 Language Selection
										</Label>
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

									<div className='space-y-2'>
										<Label className='flex items-center'>
											🎨 Template Selection
										</Label>
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
							</div>

							<div className='flex flex-col gap-3'>
								<Button
									onClick={handleAutoPostingToggle}
									variant={
										isAutoPosting
											? "destructive"
											: "default"
									}
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
									) : isAutoPosting ? (
										"Stop Auto Posting"
									) : (
										"Start Auto Posting"
									)}
								</Button>
								<Button
									onClick={handleDownload}
									variant='outline'
									className='w-full py-6 text-lg'
									disabled={!quote?.imageUrl}>
									<Download className='w-5 h-5 mr-2' />
									Download Quote
								</Button>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
