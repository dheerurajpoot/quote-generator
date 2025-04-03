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
import { initializeFacebookSDK } from "@/lib/facebook-sdk";
import {
	FacebookLoginResponse,
	FacebookPageResponse,
	FacebookPagesResponse,
	InstagramAccount,
	FacebookPage,
} from "@/app/types/facebook";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface SocialConnection {
	id: string;
	platform: string;
	profileId: string;
	profileName: string;
	profileImage?: string;
	connected: boolean;
}

interface SocialConnectionResponse {
	_id: string;
	platform: string;
	profileId: string;
	profileName: string;
	profileImage?: string;
}

interface SocialConnectionsProps {
	onPlatformsUpdate?: (platforms: string[]) => void;
}

export function SocialConnections({
	onPlatformsUpdate,
}: SocialConnectionsProps) {
	const { user } = useAuth();
	const [connections, setConnections] = useState<SocialConnection[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [isConnecting, setIsConnecting] = useState<Record<string, boolean>>(
		{}
	);
	const [selectedAccount, setSelectedAccount] =
		useState<InstagramAccount | null>(null);
	const [showAccountDialog, setShowAccountDialog] = useState(false);
	const [availableAccounts, setAvailableAccounts] = useState<
		InstagramAccount[]
	>([]);
	const [showPageDialog, setShowPageDialog] = useState(false);
	const [availablePages, setAvailablePages] = useState<FacebookPage[]>([]);
	const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);

	console.log(selectedAccount, selectedPage);

	useEffect(() => {
		if (user) {
			fetchConnections();
		}
	}, [user]);

	useEffect(() => {
		// Notify parent component about connected platforms
		if (onPlatformsUpdate) {
			const connectedPlatforms = connections
				.filter((conn) => conn.connected)
				.map((conn) => conn.platform);
			onPlatformsUpdate(connectedPlatforms);
		}
	}, [connections, onPlatformsUpdate]);

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
				? data.map((conn: SocialConnectionResponse) => ({
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

	const handlePageSelection = async (page: FacebookPage) => {
		setSelectedPage(page);
		setShowPageDialog(false);
		try {
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
		} catch (error) {
			console.error("Error saving Facebook connection:", error);
			if (error instanceof Error) {
				setError(error.message || "Failed to save Facebook connection");
			} else {
				setError("Failed to save Facebook connection");
			}
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
			const loginResponse = await new Promise<FacebookLoginResponse>(
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

			if (!loginResponse.authResponse?.accessToken) {
				throw new Error("Failed to get access token from Facebook");
			}

			// Exchange short-lived token for long-lived token
			const longLivedTokenResponse = await fetch(
				`/api/social/exchange-token?access_token=${loginResponse.authResponse.accessToken}`
			);
			if (!longLivedTokenResponse.ok) {
				throw new Error("Failed to get long-lived access token");
			}
			const { longLivedToken } = await longLivedTokenResponse.json();

			// Get user's Facebook pages with long-lived token
			const pagesResponse = await new Promise<FacebookPagesResponse>(
				(resolve, reject) => {
					(window.FB.api as any)(
						"/me/accounts",
						{ access_token: longLivedToken },
						(response: FacebookPagesResponse) => {
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
								resolve(response);
							} else {
								reject(
									new Error(
										"No Facebook pages found. Please make sure you have at least one Facebook page."
									)
								);
							}
						}
					);
				}
			);

			// Show dialog with available pages
			setAvailablePages(pagesResponse.data);
			setShowPageDialog(true);
		} catch (err: unknown) {
			console.error("Facebook connection error:", err);
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
			await new Promise<FacebookLoginResponse>((resolve, reject) => {
				window.FB.login(
					(response: FacebookLoginResponse) => {
						if (response.authResponse) {
							resolve(response);
						} else {
							reject(
								new Error("Facebook login cancelled or failed")
							);
						}
					},
					{
						scope: "instagram_basic,instagram_content_publish,instagram_manage_insights,pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_metadata,business_management",
						return_scopes: true,
					}
				);
			});

			// Get user's Facebook pages with Instagram business accounts
			const pagesResponse = await new Promise<FacebookPagesResponse>(
				(resolve, reject) => {
					window.FB.api<FacebookPagesResponse>(
						"/me/accounts?fields=id,name,access_token,instagram_business_account{id,name,username,profile_picture_url}",
						(response) => {
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
								resolve(response);
							} else {
								reject(
									new Error(
										"No Facebook pages found. Please make sure you have at least one Facebook page."
									)
								);
							}
						}
					);
				}
			);

			// Get Instagram business accounts for each page
			const instagramAccounts = await Promise.all(
				pagesResponse.data.map(async (page) => {
					try {
						return new Promise<InstagramAccount | null>(
							(resolve) => {
								window.FB.api<FacebookPageResponse>(
									`/${page.id}?fields=instagram_business_account{id,name,username,profile_picture_url}`,
									(response) => {
										console.log(
											`Instagram account response for page ${page.name}:`,
											response
										);
										if (response.error) {
											console.error(
												`Error fetching Instagram account for page ${page.name}:`,
												response.error
											);
											resolve(null);
											return;
										}
										if (
											response.instagram_business_account
										) {
											resolve({
												pageId: page.id,
												pageName: page.name,
												pageAccessToken:
													page.access_token,
												instagramAccountId:
													response
														.instagram_business_account
														.id,
												username:
													response
														.instagram_business_account
														.username,
												profilePicture:
													response
														.instagram_business_account
														.profile_picture_url,
											});
										} else {
											console.log(
												`No Instagram business account found for page ${page.name}`
											);
											resolve(null);
										}
									}
								);
							}
						);
					} catch (error) {
						console.error(
							`Error processing page ${page.name}:`,
							error
						);
						return null;
					}
				})
			);

			// Filter out null accounts and create a list of valid Instagram accounts
			const validAccounts = instagramAccounts.filter(
				(account): account is InstagramAccount => account !== null
			);

			console.log("Valid Instagram accounts:", validAccounts);

			if (validAccounts.length === 0) {
				throw new Error(
					"No Instagram Business Accounts found. Please make sure:\n1. Your Facebook page is connected to an Instagram Business Account\n2. You have granted all necessary permissions\n3. You are an admin of both the Facebook page and Instagram account"
				);
			}

			// If there's only one account, use it directly
			if (validAccounts.length === 1) {
				const instagramAccount = validAccounts[0];
				await saveInstagramConnection(instagramAccount);
				return;
			}

			// If there are multiple accounts, show the dialog
			setAvailableAccounts(validAccounts);
			setShowAccountDialog(true);
			setSelectedAccount(null);
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

	const saveInstagramConnection = async (
		instagramAccount: InstagramAccount
	) => {
		try {
			console.log("Saving Instagram connection with data:", {
				userId: user?._id,
				platform: "instagram",
				accessToken: instagramAccount.pageAccessToken,
				profileId: instagramAccount.instagramAccountId,
				profileName: instagramAccount.username,
				profileImage: instagramAccount.profilePicture,
			});

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
					profileName:
						instagramAccount.username || instagramAccount.pageName,
					profileImage: instagramAccount.profilePicture,
					instagramAccountId: instagramAccount.instagramAccountId,
					pageAccessToken: instagramAccount.pageAccessToken,
				}),
			});

			if (!apiResponse.ok) {
				const errorData = await apiResponse.json();
				throw new Error(
					errorData.error || "Failed to save Instagram connection"
				);
			}

			const data = await apiResponse.json();
			console.log("Instagram connection saved successfully:", data);

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
		} catch (error) {
			console.error("Error saving Instagram connection:", error);
			if (error instanceof Error) {
				setError(
					error.message || "Failed to save Instagram connection"
				);
			} else {
				setError("Failed to save Instagram connection");
			}
		}
	};

	const disconnectAccount = async (platform: string) => {
		try {
			setIsConnecting((prev) => ({ ...prev, [platform]: true }));
			setError("");
			setSuccess("");

			// Make API call to remove the connection
			const response = await fetch(
				`/api/social?userId=${user?._id}&platform=${platform}`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					data.error || `Failed to disconnect from ${platform}`
				);
			}

			// Remove connection from state
			setConnections((prev) =>
				prev.filter((c) => c.platform !== platform)
			);

			// Refresh connections to ensure UI is in sync with backend
			await fetchConnections();

			setSuccess(
				data.message || `Successfully disconnected from ${platform}!`
			);
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

	const handleAccountSelection = (account: InstagramAccount) => {
		setSelectedAccount(account);
		setShowAccountDialog(false);
		saveInstagramConnection(account);
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
			<Dialog
				open={showAccountDialog}
				onOpenChange={setShowAccountDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Select Instagram Account</DialogTitle>
					</DialogHeader>
					<div className='space-y-4'>
						{availableAccounts.map((account) => (
							<div
								key={account.instagramAccountId}
								className='flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50'
								onClick={() => handleAccountSelection(account)}>
								<img
									src={account.profilePicture}
									alt={account.username}
									className='w-10 h-10 rounded-full'
								/>
								<div>
									<p className='font-medium'>
										{account.username}
									</p>
									<p className='text-sm text-gray-500'>
										{account.pageName}
									</p>
								</div>
							</div>
						))}
					</div>
				</DialogContent>
			</Dialog>
			<Dialog open={showPageDialog} onOpenChange={setShowPageDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Select Facebook Page</DialogTitle>
					</DialogHeader>
					<div className='space-y-4'>
						{availablePages.map((page) => (
							<div
								key={page.id}
								className='flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50'
								onClick={() => handlePageSelection(page)}>
								{page.picture?.data?.url && (
									<img
										src={page.picture.data.url}
										alt={page.name}
										className='w-10 h-10 rounded-full'
									/>
								)}
								<div>
									<p className='font-medium'>{page.name}</p>
									<p className='text-sm text-gray-500'>
										Facebook Page
									</p>
								</div>
							</div>
						))}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
