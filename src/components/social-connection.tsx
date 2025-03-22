"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Facebook, Instagram, Loader2, AlertCircle, Check } from "lucide-react";
import type {
	FacebookLoginResponse,
	FacebookPagesResponse,
	InstagramAccount,
} from "@/types/facebook";
import { initializeFacebookSDK } from "@/lib/facebook-sdk";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface SocialConnection {
	id: string;
	platform: string;
	profileId: string;
	profileName: string;
	profileImage?: string;
	connected: boolean;
}

export function SocialConnections() {
	const { user } = useAuth();
	const [connections, setConnections] = useState<SocialConnection[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [isConnecting, setIsConnecting] = useState<Record<string, boolean>>(
		{}
	);
	const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

	useEffect(() => {
		if (user) {
			fetchConnections();
		}
	}, [user]);

	const fetchConnections = async () => {
		try {
			setLoading(true);
			const response = await fetch(`/api/social?userId=${user?._id}`);

			if (!response.ok) {
				throw new Error("Failed to fetch social connections");
			}

			const data = await response.json();

			// Transform the data to match our SocialConnection interface
			const transformedConnections: SocialConnection[] = Array.isArray(
				data
			)
				? data.map((conn: any) => ({
						id: conn._id,
						platform: conn.platform,
						profileId: conn.profileId,
						profileName: conn.profileName,
						profileImage: conn.profileImage,
						connected: true,
				  }))
				: [];

			setConnections(transformedConnections);
		} catch (err: unknown) {
			console.error("Error fetching connections:", err);
			if (err instanceof Error) {
				setError(err.message || "Failed to load social connections");
			} else {
				setError("Failed to load social connections");
			}
		} finally {
			setLoading(false);
		}
	};

	const connectFacebook = async () => {
		try {
			setIsConnecting((prev) => ({ ...prev, facebook: true }));
			setError("");
			setSuccess("");

			// Initialize Facebook SDK
			await initializeFacebookSDK();

			// Request Facebook login
			const response = await new Promise<FacebookLoginResponse>(
				(resolve, reject) => {
					window.FB.login(
						(response: FacebookLoginResponse) => {
							if (response.authResponse) {
								resolve(response);
							} else {
								reject(
									new Error(
										"Facebook login cancelled or failed"
									)
								);
							}
						},
						{
							scope: "pages_manage_posts,pages_read_engagement,pages_show_list,pages_messaging,pages_manage_metadata,pages_read_user_content,pages_manage_ads",
							return_scopes: true,
						}
					);
				}
			);

			// Get user's Facebook pages
			const pagesResponse = await new Promise<FacebookPagesResponse>(
				(resolve, reject) => {
					window.FB.api("/me/accounts", (response: any) => {
						console.log("Facebook pages response:", response); // Debug log
						if (response.error) {
							reject(
								new Error(
									response.error.message ||
										"Failed to fetch Facebook pages"
								)
							);
							return;
						}
						if (response.data && response.data.length > 0) {
							resolve(response as FacebookPagesResponse);
						} else {
							// Try to get more information about why no pages were found
							window.FB.api("/me", (userResponse: any) => {
								console.log("User response:", userResponse);
								reject(
									new Error(
										"No Facebook pages found. Please make sure you have at least one Facebook page and have granted the necessary permissions."
									)
								);
							});
						}
					});
				}
			);

			// Get the first page (you might want to let users choose which page to connect)
			const page = pagesResponse.data[0];
			console.log("Selected Facebook page:", page); // Debug log

			// Send the connection data to your backend
			const apiResponse = await fetch("/api/social", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: user?._id,
					platform: "facebook",
					accessToken: page.access_token,
					profileId: page.id,
					profileName: page.name,
				}),
			});

			if (!apiResponse.ok) {
				const errorData = await apiResponse.json();
				throw new Error(
					errorData.error || "Failed to save Facebook connection"
				);
			}

			const data = await apiResponse.json();
			console.log("Backend response:", data); // Debug log

			// Add Facebook connection to state
			const newConnection: SocialConnection = {
				id: data.id,
				platform: "facebook",
				profileId: data.profileId,
				profileName: data.profileName,
				profileImage: data.profileImage,
				connected: true,
			};

			setConnections((prev) => [
				...prev.filter((c) => c.platform !== "facebook"),
				newConnection,
			]);
			setSuccess("Successfully connected to Facebook!");
		} catch (err: unknown) {
			console.error("Facebook connection error:", err); // Debug log
			if (err instanceof Error) {
				setError(err.message || "Failed to connect to Facebook");
			} else {
				setError("Failed to connect to Facebook");
			}
		} finally {
			setIsConnecting((prev) => ({ ...prev, facebook: false }));
		}
	};

	const connectInstagram = async () => {
		try {
			setIsConnecting((prev) => ({ ...prev, instagram: true }));
			setError("");
			setSuccess("");

			// Initialize Facebook SDK
			await initializeFacebookSDK();

			// Request Facebook login with Instagram permissions
			const response = await new Promise<FacebookLoginResponse>(
				(resolve, reject) => {
					window.FB.login(
						(response: FacebookLoginResponse) => {
							if (response.authResponse) {
								resolve(response);
							} else {
								reject(
									new Error(
										"Facebook login cancelled or failed"
									)
								);
							}
						},
						{
							scope: "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_metadata,pages_read_user_content,pages_manage_ads",
							return_scopes: true,
						}
					);
				}
			);

			// Get user's Facebook pages
			const pagesResponse = await new Promise<FacebookPagesResponse>(
				(resolve, reject) => {
					window.FB.api("/me/accounts", (response: any) => {
						if (response.error) {
							reject(
								new Error(
									response.error.message ||
										"Failed to fetch Facebook pages"
								)
							);
							return;
						}
						if (response.data && response.data.length > 0) {
							resolve(response as FacebookPagesResponse);
						} else {
							reject(
								new Error(
									"No Facebook pages found. Please make sure you have at least one Facebook page."
								)
							);
						}
					});
				}
			);

			// Get Instagram business accounts for each page
			const instagramAccounts = await Promise.all(
				pagesResponse.data.map(async (page) => {
					return new Promise<InstagramAccount>((resolve, reject) => {
						window.FB.api(
							`/${page.id}?fields=instagram_business_account`,
							(response: any) => {
								if (response.error) {
									reject(
										new Error(
											response.error.message ||
												"Failed to fetch Instagram account"
										)
									);
									return;
								}
								if (response.instagram_business_account) {
									resolve({
										pageId: page.id,
										pageName: page.name,
										pageAccessToken: page.access_token,
										instagramAccountId:
											response.instagram_business_account
												.id,
									});
								} else {
									reject(
										new Error(
											"No Instagram business account found for this Facebook page."
										)
									);
								}
							}
						);
					});
				})
			);

			// Get the first Instagram account
			const instagramAccount = instagramAccounts[0] as InstagramAccount;

			// Send the connection data to your backend
			const apiResponse = await fetch("/api/social", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: user?._id,
					platform: "instagram",
					accessToken: instagramAccount.pageAccessToken,
					profileId: instagramAccount.instagramAccountId,
					profileName: instagramAccount.pageName,
				}),
			});

			if (!apiResponse.ok) {
				const errorData = await apiResponse.json();
				throw new Error(
					errorData.error || "Failed to save Instagram connection"
				);
			}

			const data = await apiResponse.json();

			// Add Instagram connection to state
			const newConnection: SocialConnection = {
				id: data.id,
				platform: "instagram",
				profileId: data.profileId,
				profileName: data.profileName,
				profileImage: data.profileImage,
				connected: true,
			};

			setConnections((prev) => [
				...prev.filter((c) => c.platform !== "instagram"),
				newConnection,
			]);
			setSuccess("Successfully connected to Instagram!");
		} catch (err: unknown) {
			console.error("Instagram connection error:", err);
			if (err instanceof Error) {
				setError(err.message || "Failed to connect to Instagram");
			} else {
				setError("Failed to connect to Instagram");
			}
		} finally {
			setIsConnecting((prev) => ({ ...prev, instagram: false }));
		}
	};

	const disconnectAccount = async (platform: string) => {
		try {
			setIsConnecting((prev) => ({ ...prev, [platform]: true }));
			setError("");
			setSuccess("");

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Remove connection
			setConnections((prev) =>
				prev.filter((c) => c.platform !== platform)
			);
			setSuccess(`Successfully disconnected from ${platform}!`);
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(
					err.message || `Failed to disconnect from ${platform}`
				);
			} else {
				setError(`Failed to disconnect from ${platform}`);
			}
		} finally {
			setIsConnecting((prev) => ({ ...prev, [platform]: false }));
		}
	};

	const handlePlatformToggle = (platform: string) => {
		if (selectedPlatforms.includes(platform)) {
			setSelectedPlatforms(
				selectedPlatforms.filter((p) => p !== platform)
			);
		} else {
			setSelectedPlatforms([...selectedPlatforms, platform]);
		}
	};

	if (loading) {
		return (
			<div className='flex justify-center py-8'>
				<Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
			</div>
		);
	}

	return (
		<div className='space-y-6'>
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

			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				{/* Facebook Card */}
				<Card>
					<CardHeader className='pb-2'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center'>
								<Facebook className='h-5 w-5 text-blue-600 mr-2' />
								<CardTitle>Facebook</CardTitle>
							</div>
							{connections.some(
								(c) => c.platform === "facebook"
							) && (
								<Badge
									variant='outline'
									className='bg-green-100 text-green-800 border-green-200'>
									Connected
								</Badge>
							)}
						</div>
						<CardDescription>
							Share your quotes on your Facebook page
						</CardDescription>
					</CardHeader>
					<CardContent>
						{connections.some((c) => c.platform === "facebook") ? (
							<div className='flex items-center space-x-3'>
								<div className='h-10 w-10 rounded-full overflow-hidden bg-muted'>
									<img
										src={
											connections.find(
												(c) => c.platform === "facebook"
											)?.profileImage ||
											"/placeholder.svg?height=40&width=40"
										}
										alt='Profile'
										className='h-full w-full object-cover'
									/>
								</div>
								<div>
									<p className='font-medium'>
										{
											connections.find(
												(c) => c.platform === "facebook"
											)?.profileName
										}
									</p>
									<p className='text-xs text-muted-foreground'>
										Facebook Page
									</p>
								</div>
							</div>
						) : (
							<p className='text-sm text-muted-foreground'>
								Connect your Facebook account to share quotes
								directly to your page.
							</p>
						)}
					</CardContent>
					<CardFooter>
						{connections.some((c) => c.platform === "facebook") ? (
							<Button
								variant='outline'
								size='sm'
								className='border-destructive text-destructive hover:bg-destructive/10'
								onClick={() => disconnectAccount("facebook")}
								disabled={isConnecting.facebook}>
								{isConnecting.facebook ? (
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								) : null}
								Disconnect
							</Button>
						) : (
							<Button
								variant='outline'
								size='sm'
								onClick={connectFacebook}
								disabled={isConnecting.facebook}>
								{isConnecting.facebook ? (
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								) : null}
								Connect Facebook
							</Button>
						)}
					</CardFooter>
				</Card>

				{/* Instagram Card */}
				<Card>
					<CardHeader className='pb-2'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center'>
								<Instagram className='h-5 w-5 text-pink-600 mr-2' />
								<CardTitle>Instagram</CardTitle>
							</div>
							{connections.some(
								(c) => c.platform === "instagram"
							) && (
								<Badge
									variant='outline'
									className='bg-green-100 text-green-800 border-green-200'>
									Connected
								</Badge>
							)}
						</div>
						<CardDescription>
							Share your quotes on your Instagram business account
						</CardDescription>
					</CardHeader>
					<CardContent>
						{connections.some((c) => c.platform === "instagram") ? (
							<div className='flex items-center space-x-3'>
								<div className='h-10 w-10 rounded-full overflow-hidden bg-muted'>
									<img
										src={
											connections.find(
												(c) =>
													c.platform === "instagram"
											)?.profileImage ||
											"/placeholder.svg?height=40&width=40"
										}
										alt='Profile'
										className='h-full w-full object-cover'
									/>
								</div>
								<div>
									<p className='font-medium'>
										{
											connections.find(
												(c) =>
													c.platform === "instagram"
											)?.profileName
										}
									</p>
									<p className='text-xs text-muted-foreground'>
										Instagram Business Account
									</p>
								</div>
							</div>
						) : (
							<p className='text-sm text-muted-foreground'>
								Connect your Instagram business account to share
								quotes directly to your profile.
							</p>
						)}
					</CardContent>
					<CardFooter>
						{connections.some((c) => c.platform === "instagram") ? (
							<Button
								variant='outline'
								size='sm'
								className='border-destructive text-destructive hover:bg-destructive/10'
								onClick={() => disconnectAccount("instagram")}
								disabled={isConnecting.instagram}>
								{isConnecting.instagram ? (
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								) : null}
								Disconnect
							</Button>
						) : (
							<Button
								variant='outline'
								size='sm'
								onClick={connectInstagram}
								disabled={isConnecting.instagram}>
								{isConnecting.instagram ? (
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								) : null}
								Connect Instagram
							</Button>
						)}
					</CardFooter>
				</Card>
			</div>

			<div className='flex flex-col space-y-2'>
				{connections.some((c) => c.platform === "facebook") && (
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
							className='flex items-center cursor-pointer'>
							<Facebook className='h-4 w-4 text-blue-600 mr-2' />
							Facebook
						</Label>
					</div>
				)}
				{connections.some((c) => c.platform === "instagram") && (
					<div className='flex items-center space-x-2'>
						<Checkbox
							id='instagram'
							checked={selectedPlatforms.includes("instagram")}
							onCheckedChange={() =>
								handlePlatformToggle("instagram")
							}
						/>
						<Label
							htmlFor='instagram'
							className='flex items-center cursor-pointer'>
							<Instagram className='h-4 w-4 text-pink-600 mr-2' />
							Instagram
						</Label>
					</div>
				)}
			</div>
		</div>
	);
}
