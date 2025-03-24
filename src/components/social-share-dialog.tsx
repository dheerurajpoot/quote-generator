"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Facebook, Instagram, Loader2, Check, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";

interface SocialShareDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	imageUrl: string;
	quoteText: string;
	author?: string;
}

interface SocialPostResult {
	success: boolean;
	platforms: Record<
		string,
		{ success: boolean; url?: string; error?: string }
	>;
}

export function SocialShareDialog({
	open,
	onOpenChange,
	imageUrl,
	quoteText,
	author,
}: SocialShareDialogProps) {
	const { user } = useAuth();
	const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
		"facebook",
		"instagram",
	]);
	const [caption, setCaption] = useState(() => {
		// Initialize caption with quote text and author if available
		let initialCaption = quoteText || "";
		if (author) {
			initialCaption += `\n\n- ${author}`;
		}
		return initialCaption;
	});
	const [isPosting, setIsPosting] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [postResult, setPostResult] = useState<SocialPostResult | null>(null);

	const handlePlatformToggle = (platform: string) => {
		setSelectedPlatforms((prev) =>
			prev.includes(platform)
				? prev.filter((p) => p !== platform)
				: [...prev, platform]
		);
	};

	const handlePost = async () => {
		if (!user) return;

		setError("");
		setSuccess("");
		setPostResult(null);
		setIsPosting(true);

		try {
			if (selectedPlatforms.length === 0) {
				setError("Please select at least one platform");
				setIsPosting(false);
				return;
			}

			// Post to each selected platform
			const results: Record<
				string,
				{ success: boolean; url?: string; error?: string }
			> = {};

			for (const platform of selectedPlatforms) {
				try {
					const response = await fetch("/api/social", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							userId: user._id,
							platform,
							imageUrl,
							caption,
						}),
					});

					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(
							errorData.error || "Failed to post to social media"
						);
					}

					const result = await response.json();
					results[platform] = {
						success: true,
						url: result.platforms[platform].url,
					};
				} catch (err) {
					results[platform] = {
						success: false,
						error:
							err instanceof Error
								? err.message
								: "Failed to post",
					};
				}
			}

			setPostResult({
				success: Object.values(results).some((r) => r.success),
				platforms: results,
			});

			// Show success message for successful posts
			const successfulPlatforms = Object.entries(results)
				.filter(([, data]) => data.success)
				.map(([platform]) => platform);

			if (successfulPlatforms.length > 0) {
				setSuccess(
					`Successfully posted to ${successfulPlatforms.join(
						" and "
					)}!`
				);
			}

			// Show error message for failed posts
			const failedPlatforms = Object.entries(results)
				.filter(([, data]) => !data.success)
				.map(([platform]) => platform);

			if (failedPlatforms.length > 0) {
				setError(
					`Failed to post to ${failedPlatforms.join(
						" and "
					)}. Please try again.`
				);
			}
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message || "An error occurred please try again");
			} else {
				setError("An error occurred please try again");
			}
		} finally {
			setIsPosting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[600px]'>
				<DialogHeader>
					<DialogTitle>Share to Social Media</DialogTitle>
					<DialogDescription>
						Post your quote directly to your social media accounts.
					</DialogDescription>
				</DialogHeader>

				{error && (
					<Alert variant='destructive'>
						<AlertCircle className='h-4 w-4' />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{success && (
					<Alert className='bg-primary/10 border-primary/20'>
						<Check className='h-4 w-4 text-primary' />
						<AlertDescription>{success}</AlertDescription>
					</Alert>
				)}

				{postResult ? (
					<div className='space-y-4 py-4'>
						<div className='flex items-center justify-center'>
							<div className='w-full max-w-md aspect-square bg-muted rounded-md overflow-hidden'>
								<img
									src={imageUrl || "/placeholder.svg"}
									alt='Quote'
									className='w-full h-full object-contain'
									style={{ imageRendering: "crisp-edges" }}
								/>
							</div>
						</div>
						<div className='text-center'>
							<p className='font-medium'>
								Your post has been published!
							</p>
							<div className='flex flex-col gap-2 mt-2'>
								{Object.entries(postResult.platforms).map(
									([platform, data]) =>
										data.success &&
										data.url && (
											<a
												key={platform}
												href={data.url}
												target='_blank'
												rel='noopener noreferrer'
												className='text-primary hover:underline text-sm flex items-center justify-center gap-1'>
												{platform === "facebook" ? (
													<Facebook className='h-3 w-3' />
												) : (
													<Instagram className='h-3 w-3' />
												)}
												View on{" "}
												{platform
													.charAt(0)
													.toUpperCase() +
													platform.slice(1)}
											</a>
										)
								)}
							</div>
						</div>
						<Button
							className='w-full'
							onClick={() => {
								setPostResult(null);
								onOpenChange(false);
							}}>
							Done
						</Button>
					</div>
				) : (
					<>
						<div className='space-y-4 py-4'>
							<div className='space-y-2'>
								<Label>Platforms</Label>
								<div className='flex flex-col space-y-2'>
									<div className='flex items-center space-x-2'>
										<Checkbox
											id='facebook'
											checked={selectedPlatforms.includes(
												"facebook"
											)}
											onCheckedChange={() =>
												handlePlatformToggle("facebook")
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

							<div className='space-y-2'>
								<Label htmlFor='caption'>Caption</Label>
								<Textarea
									id='caption'
									value={caption}
									onChange={(e) => setCaption(e.target.value)}
									rows={4}
									placeholder='Add a caption to your post...'
								/>
							</div>

							<div className='flex items-center justify-center'>
								<div className='w-full max-w-md aspect-square bg-muted rounded-md overflow-hidden'>
									<img
										src={imageUrl || "/placeholder.svg"}
										alt='Quote'
										className='w-full h-full object-contain'
										style={{
											imageRendering: "crisp-edges",
										}}
									/>
								</div>
							</div>
						</div>

						<DialogFooter>
							<Button
								variant='outline'
								onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<Button
								onClick={handlePost}
								disabled={
									isPosting || selectedPlatforms.length === 0
								}>
								{isPosting ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Posting...
									</>
								) : (
									"Post Now"
								)}
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
