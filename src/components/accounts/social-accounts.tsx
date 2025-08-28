"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { format } from "date-fns";
import {
	Facebook,
	Instagram,
	Twitter,
	Linkedin,
	Settings,
	Unlink,
	RefreshCw,
	CheckCircle,
	AlertCircle,
	Plus,
	Users,
	Shield,
	Loader2,
	Check,
	LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { initializeFacebookSDK } from "@/lib/facebook-sdk";
import axios from "axios";

// Types
interface SocialConnection {
	_id: string;
	platform: "facebook" | "instagram";
	profileId: string;
	profileName: string;
	profileImage?: string;
	accessToken: string;
	pageAccessToken?: string;
	instagramAccountId?: string;
	expiresAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

interface FacebookError {
	message: string;
	type: string;
	code: number;
}

interface FacebookPagesResponse {
	data: FacebookPage[];
	error?: FacebookError;
}

interface FacebookPage {
	id: string;
	name: string;
	access_token: string;
	instagram_business_account?: {
		id: string;
		name: string;
		username: string;
		profile_picture_url: string;
	};
}

interface InstagramAccount {
	pageId: string;
	pageName: string;
	pageAccessToken: string;
	instagramAccountId: string;
	username: string;
	profilePicture: string;
}

interface AvailablePlatform {
	id: string;
	name: string;
	icon: LucideIcon;
	color: string;
	description: string;
	features: string[];
	status: "available" | "coming-soon";
	popularity: "high" | "medium" | "low";
	userBase: string;
}

// Available platforms data
const availablePlatforms: AvailablePlatform[] = [
	{
		id: "facebook",
		name: "Facebook",
		icon: Facebook,
		color: "#1877F2",
		description: "Share posts on Facebook pages and groups",
		features: [
			"Posts",
			"Images",
			"Video posts",
			"Stories",
			"Analytics",
			"Scheduling",
		],
		status: "available",
		popularity: "high",
		userBase: "1B+ users",
	},
	{
		id: "instagram",
		name: "Instagram",
		icon: Instagram,
		color: "#E1306C",
		description: "Share posts on Instagram feed and stories",
		features: [
			"Posts",
			"Images",
			"Video uploads",
			"Shorts",
			"Community posts",
			"Analytics",
		],
		status: "available",
		popularity: "high",
		userBase: "2B+ users",
	},
	{
		id: "twitter",
		name: "Twitter",
		icon: Twitter,
		color: "#1DA1F2",
		description: "Share posts on Twitter",
		features: ["Posts", "Images", "Video posts", "Analytics", "Scheduling"],
		status: "coming-soon",
		popularity: "medium",
		userBase: "450M+ users",
	},
	{
		id: "linkedin",
		name: "LinkedIn",
		icon: Linkedin,
		color: "#0A66C2",
		description: "Share posts on LinkedIn",
		features: ["Posts", "Images", "Video posts", "Analytics", "Scheduling"],
		status: "coming-soon",
		popularity: "medium",
		userBase: "750M+ users",
	},
];

export function SocialAccounts() {
	const { user } = useAuth();
	const [connections, setConnections] = useState<SocialConnection[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [isConnecting, setIsConnecting] = useState<{
		[key: string]: boolean;
	}>({});
	const [availablePages, setAvailablePages] = useState<FacebookPage[]>([]);
	const [showPageDialog, setShowPageDialog] = useState(false);
	const [platformMetrics, setPlatformMetrics] = useState<{
		[key: string]: any;
	}>({});
	const [availableAccounts, setAvailableAccounts] = useState<
		InstagramAccount[]
	>([]);
	const [showAccountDialog, setShowAccountDialog] = useState(false);

	// Fetch user's social connections
	useEffect(() => {
		if (user) {
			fetchConnections();
		}
	}, [user]);

	// Fetch platform metrics when connections change
	useEffect(() => {
		if (connections.length > 0) {
			fetchPlatformMetrics();
		}
	}, [connections]);

	const fetchConnections = async () => {
		try {
			setLoading(true);
			const response = await axios.get(
				`/api/users/${user?._id}/social-connections`
			);
			if (response.data.success) {
				setConnections(response.data.connections);
			}
		} catch (error) {
			console.error("Failed to fetch connections:", error);
			setError("Failed to load your social connections");
		} finally {
			setLoading(false);
		}
	};

	const fetchPlatformMetrics = async () => {
		try {
			const response = await axios.get(
				`/api/users/${user?._id}/platform-metrics`
			);
			if (response.data.success) {
				const metricsMap: { [key: string]: any } = {};
				response.data.metrics.forEach((metric: any) => {
					// Find the connection this metric belongs to
					const connection = connections.find(
						(conn) => conn._id === metric.connectionId
					);
					if (connection) {
						metricsMap[connection._id] = metric;
					}
				});
				setPlatformMetrics(metricsMap);
			}
		} catch (error) {
			console.error("Failed to fetch platform metrics:", error);
			setError("Failed to load platform metrics");
		}
	};

	const handleConnectPlatform = async (platform: string) => {
		if (platform === "facebook") {
			await connectFacebook();
		} else if (platform === "instagram") {
			await connectInstagram();
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
			const loginResponse = await new Promise<any>((resolve, reject) => {
				window.FB.login(
					(response: any) => {
						if (response.authResponse) {
							resolve(response);
						} else {
							reject(
								new Error("Facebook login cancelled or failed")
							);
						}
					},
					{
						scope: "pages_manage_posts,pages_read_engagement,pages_show_list,pages_manage_metadata",
						return_scopes: true,
					}
				);
			});

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

			// Get user's Facebook pages
			const pagesResponse = await new Promise<FacebookPagesResponse>(
				(resolve, reject) => {
					window.FB.api(
						`/me/accounts?access_token=${longLivedToken}`,
						(response: FacebookPagesResponse) => {
							if (response && response.data) {
								resolve(response);
							} else {
								reject(
									new Error("Failed to get Facebook pages")
								);
							}
						}
					);
				}
			);

			if (!pagesResponse.data || pagesResponse.data.length === 0) {
				throw new Error(
					"No Facebook pages found. Please make sure you have at least one Facebook page."
				);
			}

			// Show dialog with available pages
			setAvailablePages(pagesResponse.data);
			setShowPageDialog(true);
		} catch (error: unknown) {
			if (error instanceof Error) {
				setError(error.message || "Failed to connect Facebook");
			} else {
				setError("Failed to connect Facebook");
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

			// Initialize Facebook SDK (Instagram uses Facebook's OAuth)
			await initializeFacebookSDK();

			// Request Facebook login with Instagram permissions
			const loginResponse = await new Promise<any>((resolve, reject) => {
				window.FB.login(
					(response: any) => {
						if (response.authResponse) {
							resolve(response);
						} else {
							reject(
								new Error("Instagram login cancelled or failed")
							);
						}
					},
					{
						scope: "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_metadata,business_management",
						return_scopes: true,
					}
				);
			});

			if (!loginResponse.authResponse?.accessToken) {
				throw new Error("Failed to get access token from Instagram");
			}

			// Exchange the Facebook User Access Token for a long-lived token (NO platform parameter)
			const exchangeRes = await fetch(
				`/api/social/exchange-token?access_token=${loginResponse.authResponse.accessToken}`
			);
			if (!exchangeRes.ok) {
				const errorData = await exchangeRes.json();
				throw new Error(
					errorData.error || "Failed to exchange Facebook token"
				);
			}
			const exchangeData = await exchangeRes.json();
			const longLivedUserAccessToken = exchangeData.longLivedToken;

			// Get user's Facebook pages with Instagram business accounts using the long-lived user token
			const pagesResponse = await new Promise<FacebookPagesResponse>(
				(resolve, reject) => {
					window.FB.api(
						`/me/accounts?fields=id,name,access_token,instagram_business_account{id,name,username,profile_picture_url}&access_token=${longLivedUserAccessToken}`,
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
								resolve(response as FacebookPagesResponse);
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
				pagesResponse.data.map(async (page: FacebookPage) => {
					try {
						return new Promise<InstagramAccount | null>(
							(resolve) => {
								window.FB.api(
									`/${page.id}?fields=instagram_business_account{id,name,username,profile_picture_url}&access_token=${longLivedUserAccessToken}`,
									(response: any) => {
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
												instagramAccountId: (
													response as any
												).instagram_business_account.id,
												username: (response as any)
													.instagram_business_account
													.username,
												profilePicture: (
													response as any
												).instagram_business_account
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
		} catch (error: unknown) {
			console.error("Instagram connection error:", error);
			if (error instanceof Error) {
				setError(error.message || "Failed to connect Instagram");
			} else {
				setError("Failed to connect Instagram");
			}
		} finally {
			setIsConnecting((prev) => ({ ...prev, instagram: false }));
		}
	};

	const saveInstagramConnection = async (account: InstagramAccount) => {
		try {
			setError("");
			setSuccess("");

			// Use fetch exactly like working code
			const apiResponse = await fetch("/api/social", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: user?._id,
					platform: "instagram",
					accessToken: account.pageAccessToken,
					profileId: account.instagramAccountId,
					profileName: account.username || account.pageName,
					profileImage: account.profilePicture,
					instagramAccountId: account.instagramAccountId,
					pageAccessToken: account.pageAccessToken,
				}),
			});

			if (!apiResponse.ok) {
				const errorData = await apiResponse.json();
				throw new Error(
					errorData.error || "Failed to save Instagram connection"
				);
			}

			const data = await apiResponse.json();

			if (data.connected) {
				setSuccess("Instagram connected successfully!");
				fetchConnections();
				setShowAccountDialog(false);
			} else {
				setError("Failed to save Instagram connection");
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				setError(
					error.message || "Failed to save Instagram connection"
				);
			} else {
				setError("Failed to save Instagram connection");
			}
		}
	};

	const handlePageSelection = async (page: FacebookPage) => {
		try {
			setError("");
			setSuccess("");

			// Save Facebook connection
			const connectionResponse = await axios.post("/api/social", {
				userId: user?._id,
				platform: "facebook",
				accessToken: page.access_token,
				profileName: page.name,
				profileId: page.id,
			});

			if (connectionResponse.data.connected) {
				setSuccess("Facebook connected successfully!");
				setShowPageDialog(false);
				fetchConnections();
			} else {
				setError("Failed to save Facebook connection");
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				setError(error.message || "Failed to save Facebook connection");
			} else {
				setError("Failed to save Facebook connection");
			}
		}
	};

	const disconnectAccount = async (connectionId: string) => {
		try {
			setError("");
			setSuccess("");

			// Delete the connection
			const response = await axios.delete(
				`/api/users/${user?._id}/social-connections/${connectionId}`
			);

			if (response.data.success) {
				setSuccess("Account disconnected successfully!");
				// Remove the connection from local state
				setConnections((prev) =>
					prev.filter((conn) => conn._id !== connectionId)
				);
				// Also remove the metrics for this connection
				setPlatformMetrics((prev) => {
					const newMetrics = { ...prev };
					delete newMetrics[connectionId];
					return newMetrics;
				});
			} else {
				setError("Failed to disconnect account");
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError("Failed to disconnect account");
			}
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "available":
				return (
					<Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
						<CheckCircle className='mr-1 h-3 w-3' />
						Available
					</Badge>
				);
			case "coming-soon":
				return <Badge variant='outline'>Coming Soon</Badge>;
			default:
				return <Badge variant='outline'>Unknown</Badge>;
		}
	};

	const getPopularityColor = (popularity: string) => {
		switch (popularity) {
			case "high":
				return "text-green-600";
			case "medium":
				return "text-yellow-600";
			case "low":
				return "text-gray-600";
			default:
				return "text-gray-600";
		}
	};

	// Helper function to format large numbers
	const formatNumber = (num: number): string => {
		if (num >= 1000000) {
			return (num / 1000000).toFixed(1) + "M";
		} else if (num >= 1000) {
			return (num / 1000).toFixed(1) + "K";
		}
		return num.toString();
	};

	// Check if user has any connections
	const hasConnections = connections.length > 0;

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-foreground'>
						Social Accounts
					</h1>
					<p className='text-muted-foreground'>
						{hasConnections
							? "Manage your connected social media platforms for seamless posting."
							: "Connect your social media platforms to start sharing your quotes automatically."}
					</p>
				</div>
			</div>

			{/* Quick Stats */}
			<div className='grid gap-4 md:grid-cols-4'>
				<Card>
					<CardContent className='p-4'>
						<div className='flex items-center gap-3'>
							<div className='p-2 bg-green-100 text-green-800 rounded-lg'>
								<Users className='h-5 w-5' />
							</div>
							<div>
								<p className='text-2xl font-bold'>
									{connections.length}
								</p>
								<p className='text-sm text-muted-foreground'>
									Connected
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className='p-4'>
						<div className='flex items-center gap-3'>
							<div className='p-2 bg-blue-100 text-blue-800 rounded-lg'>
								<Shield className='h-5 w-5' />
							</div>
							<div>
								<p className='text-2xl font-bold'>
									{
										availablePlatforms.filter(
											(p) => p.status === "available"
										).length
									}
								</p>
								<p className='text-sm text-muted-foreground'>
									Platforms
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className='p-4'>
						<div className='flex items-center gap-3'>
							<div className='p-2 bg-orange-100 text-orange-800 rounded-lg'>
								<Settings className='h-5 w-5' />
							</div>
							<div>
								<p className='text-2xl font-bold'>98%</p>
								<p className='text-sm text-muted-foreground'>
									Uptime
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className='p-4'>
						<div className='flex items-center gap-3'>
							<div className='p-2 bg-purple-100 text-purple-800 rounded-lg'>
								<Users className='h-5 w-5' />
							</div>
							<div>
								<p className='text-2xl font-bold'>156K</p>
								<p className='text-sm text-muted-foreground'>
									Total Reach
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Error and Success Messages */}
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

			{/* Main Content - Show connected accounts or add account interface */}
			{loading ? (
				<div className='flex items-center justify-center py-12'>
					<Loader2 className='h-8 w-8 animate-spin' />
				</div>
			) : hasConnections ? (
				// Show connected accounts
				<div className='space-y-4'>
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Users className='h-5 w-5' />
								Connected Accounts
							</CardTitle>
							<CardDescription>
								Manage your connected social media platforms
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-4'>
								{connections.map((connection) => (
									<Card
										key={connection._id}
										className='border-l-4 border-l-green-500'>
										<CardHeader>
											<div className='flex items-start justify-between'>
												<div className='flex items-center gap-4'>
													<div
														className='p-3 rounded-lg'
														style={{
															backgroundColor:
																connection.platform ===
																"facebook"
																	? "#1877F220"
																	: "#E1306C20",
														}}>
														{connection.platform ===
														"facebook" ? (
															<Facebook className='h-6 w-6 text-[#1877F2]' />
														) : (
															<Instagram className='h-6 w-6 text-[#E1306C]' />
														)}
													</div>
													<div>
														<CardTitle className='flex items-center gap-2'>
															{
																connection.profileName
															}
															<CheckCircle className='h-4 w-4 text-green-500' />
														</CardTitle>
														<CardDescription className='flex items-center gap-2'>
															{
																connection.platform
															}{" "}
															• Connected since{" "}
															{format(
																new Date(
																	connection.createdAt
																),
																"MMM yyyy"
															)}
														</CardDescription>
													</div>
												</div>
												<div className='flex items-center gap-2'>
													<Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
														Active
													</Badge>
												</div>
											</div>
										</CardHeader>
										<CardContent>
											<div className='grid gap-4 md:grid-cols-2'>
												<div className='space-y-2'>
													<div className='flex justify-between text-sm'>
														<span>Platform:</span>
														<span className='font-medium capitalize'>
															{
																connection.platform
															}
														</span>
													</div>
													<div className='flex justify-between text-sm'>
														<span>Profile ID:</span>
														<span className='font-medium font-mono text-xs'>
															{
																connection.profileId
															}
														</span>
													</div>
													<div className='flex justify-between text-sm'>
														<span>
															Connected since:
														</span>
														<span className='font-medium'>
															{format(
																new Date(
																	connection.createdAt
																),
																"MMM d, yyyy"
															)}
														</span>
													</div>
													<div className='flex justify-between text-sm'>
														<span>Last sync:</span>
														<span className='font-medium'>
															{format(
																new Date(
																	connection.updatedAt
																),
																"MMM d, h:mm a"
															)}
														</span>
													</div>
												</div>
												<div className='space-y-2'>
													<div className='flex items-center justify-between text-sm'>
														<span>Disconnect:</span>
														<Button
															variant='destructive'
															size='sm'
															className='cursor-pointer'
															onClick={() =>
																disconnectAccount(
																	connection._id
																)
															}>
															<Unlink className='mr-2 h-4 w-4' />
															Disconnect Account
														</Button>
													</div>
													<div className='flex items-center justify-between text-sm'>
														<span>Status:</span>
														<Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
															Active
														</Badge>
													</div>
													<div className='flex items-center justify-between text-sm'>
														<span>
															Token expires:
														</span>
														<span className='font-medium'>
															{connection.expiresAt
																? format(
																		new Date(
																			connection.expiresAt
																		),
																		"MMM d, yyyy"
																  )
																: "Never"}
														</span>
													</div>
												</div>
											</div>

											{/* Enhanced Metrics Section */}
											<div className='mt-6 p-4 bg-muted/50 rounded-lg'>
												<h4 className='font-medium text-sm mb-3 text-muted-foreground'>
													Platform Metrics
												</h4>
												<div className='grid gap-4 md:grid-cols-3'>
													<div className='space-y-2'>
														<div className='flex justify-between text-sm'>
															<span>
																Followers:
															</span>
															<span className='font-medium'>
																{platformMetrics[
																	connection._id.toString()
																]?.followers
																	? formatNumber(
																			platformMetrics[
																				connection._id.toString()
																			]
																				.followers
																	  )
																	: "--"}
															</span>
														</div>
														<div className='flex justify-between text-sm'>
															<span>
																Total Posts:
															</span>
															<span className='font-medium'>
																{platformMetrics[
																	connection._id.toString()
																]?.totalPosts
																	? formatNumber(
																			platformMetrics[
																				connection._id.toString()
																			]
																				.totalPosts
																	  )
																	: "--"}
															</span>
														</div>
														<div className='flex justify-between text-sm'>
															<span>
																Engagement Rate:
															</span>
															<span className='font-medium'>
																{platformMetrics[
																	connection._id.toString()
																]
																	?.engagementRate
																	? `${platformMetrics[
																			connection._id.toString()
																	  ].engagementRate.toFixed(
																			1
																	  )}%`
																	: "--"}
															</span>
														</div>
													</div>
													<div className='space-y-2'>
														<div className='flex justify-between text-sm'>
															<span>
																API Limit:
															</span>
															<span className='font-medium'>
																{platformMetrics[
																	connection._id.toString()
																]?.apiLimit
																	? formatNumber(
																			platformMetrics[
																				connection._id.toString()
																			]
																				.apiLimit
																	  )
																	: "--"}
															</span>
														</div>
														<div className='space-y-1'>
															<div className='flex justify-between text-sm'>
																<span>
																	API Used:
																</span>
																<span className='font-medium'>
																	{platformMetrics[
																		connection._id.toString()
																	]?.apiUsed
																		? formatNumber(
																				platformMetrics[
																					connection._id.toString()
																				]
																					.apiUsed
																		  )
																		: "--"}
																</span>
															</div>
															{platformMetrics[
																connection._id.toString()
															]?.apiLimit && (
																<Progress
																	value={
																		(platformMetrics[
																			connection._id.toString()
																		]
																			?.apiUsed /
																			platformMetrics[
																				connection._id.toString()
																			]
																				?.apiLimit) *
																		100
																	}
																	className='h-2'
																/>
															)}
														</div>
														<div className='flex justify-between text-sm'>
															<span>
																Posts This
																Month:
															</span>
															<span className='font-medium'>
																{platformMetrics[
																	connection._id.toString()
																]
																	?.postsThisMonth
																	? formatNumber(
																			platformMetrics[
																				connection._id.toString()
																			]
																				.postsThisMonth
																	  )
																	: "--"}
															</span>
														</div>
													</div>
													<div className='space-y-2'>
														<div className='flex justify-between text-sm'>
															<span>Reach:</span>
															<span className='font-medium'>
																{platformMetrics[
																	connection._id.toString()
																]?.reach
																	? formatNumber(
																			platformMetrics[
																				connection._id.toString()
																			]
																				.reach
																	  )
																	: "--"}
															</span>
														</div>
														<div className='flex justify-between text-sm'>
															<span>
																Impressions:
															</span>
															<span className='font-medium'>
																{platformMetrics[
																	connection._id.toString()
																]?.impressions
																	? formatNumber(
																			platformMetrics[
																				connection._id.toString()
																			]
																				.impressions
																	  )
																	: "--"}
															</span>
														</div>
														<div className='flex justify-between text-sm'>
															<span>
																Click Rate:
															</span>
															<span className='font-medium'>
																{platformMetrics[
																	connection._id.toString()
																]?.clickRate
																	? `${platformMetrics[
																			connection._id.toString()
																	  ].clickRate.toFixed(
																			1
																	  )}%`
																	: "--"}
															</span>
														</div>
													</div>
												</div>
											</div>

											{/* Recent Activity & Performance */}
											<div className='mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800'>
												<h4 className='font-medium text-sm mb-3 text-blue-700 dark:text-blue-300'>
													Recent Activity &
													Performance
												</h4>
												<div className='grid gap-4 md:grid-cols-2'>
													<div className='space-y-2'>
														<div className='flex justify-between text-sm'>
															<span className='text-blue-600 dark:text-blue-400'>
																Last Post:
															</span>
															<span className='font-medium'>
																{platformMetrics[
																	connection._id.toString()
																]?.lastPostAt
																	? format(
																			new Date(
																				platformMetrics[
																					connection._id.toString()
																				].lastPostAt
																			),
																			"MMM d, h:mm a"
																	  )
																	: "No posts yet"}
															</span>
														</div>
														<div className='flex justify-between text-sm'>
															<span className='text-blue-600 dark:text-blue-400'>
																Best Performing:
															</span>
															<span className='font-medium'>
																{platformMetrics[
																	connection._id.toString()
																]
																	?.bestPerformingPost ||
																	"N/A"}
															</span>
														</div>
														<div className='flex justify-between text-sm'>
															<span className='text-blue-600 dark:text-blue-400'>
																Growth Rate:
															</span>
															<span
																className={`font-medium ${
																	(platformMetrics[
																		connection._id.toString()
																	]
																		?.growthRate ||
																		0) > 0
																		? "text-green-600"
																		: "text-red-600"
																}`}>
																{platformMetrics[
																	connection._id.toString()
																]?.growthRate
																	? `${
																			platformMetrics[
																				connection._id.toString()
																			]
																				.growthRate >
																			0
																				? "+"
																				: ""
																	  }${platformMetrics[
																			connection._id.toString()
																	  ].growthRate.toFixed(
																			1
																	  )}% this week`
																	: "0% this week"}
															</span>
														</div>
													</div>
													<div className='space-y-2'>
														<div className='flex justify-between text-sm'>
															<span className='text-blue-600 dark:text-blue-400'>
																Response Time:
															</span>
															<span className='font-medium'>
																{platformMetrics[
																	connection._id.toString()
																]?.responseTime
																	? `~${
																			platformMetrics[
																				connection._id.toString()
																			]
																				.responseTime
																	  } hours`
																	: "Unknown"}
															</span>
														</div>
														<div className='flex justify-between text-sm'>
															<span className='text-blue-600 dark:text-blue-400'>
																Content Quality:
															</span>
															<span className='font-medium'>
																{platformMetrics[
																	connection._id.toString()
																]
																	?.contentQuality ||
																	"Unknown"}
															</span>
														</div>
														<div className='flex justify-between text-sm'>
															<span className='text-blue-600 dark:text-blue-400'>
																Next Scheduled:
															</span>
															<span className='font-medium'>
																{platformMetrics[
																	connection._id.toString()
																]
																	?.nextScheduledPost
																	? format(
																			new Date(
																				platformMetrics[
																					connection._id.toString()
																				].nextScheduledPost
																			),
																			"MMM d, h:mm a"
																	  )
																	: "No posts scheduled"}
															</span>
														</div>
													</div>
												</div>
											</div>

											{/* Quick Actions */}
											<div className='mt-4 flex gap-2'>
												<Button
													size='sm'
													variant='outline'
													onClick={() =>
														fetchPlatformMetrics()
													}>
													<RefreshCw className='mr-2 h-4 w-4' />
													Refresh Metrics
												</Button>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Add More Platforms */}
					<Card>
						<CardHeader>
							<CardTitle>Add More Platforms</CardTitle>
							<CardDescription>
								Connect additional social media platforms to
								expand your reach
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
								{availablePlatforms
									.filter(
										(platform) =>
											!connections.some(
												(conn) =>
													conn.platform ===
													platform.id
											)
									)
									.map((platform) => (
										<Card
											key={platform.id}
											className='group hover:shadow-md transition-shadow'>
											<CardHeader>
												<div className='flex items-start justify-between'>
													<div className='flex items-center gap-3'>
														<div className='p-2 rounded-lg bg-muted'>
															<platform.icon
																className='h-6 w-6'
																style={{
																	color: platform.color,
																}}
															/>
														</div>
														<div>
															<CardTitle className='text-lg'>
																{platform.name}
															</CardTitle>
															<div className='flex items-center gap-2 mt-1'>
																{getStatusBadge(
																	platform.status
																)}
																<span
																	className={`text-xs ${getPopularityColor(
																		platform.popularity
																	)}`}>
																	{
																		platform.popularity
																	}{" "}
																	popularity
																</span>
															</div>
														</div>
													</div>
												</div>
												<CardDescription className='mt-2'>
													{platform.description}
												</CardDescription>
											</CardHeader>
											<CardContent className='space-y-4'>
												<div className='flex items-center justify-between text-sm'>
													<span className='text-muted-foreground'>
														User base:
													</span>
													<span className='font-medium'>
														{platform.userBase}
													</span>
												</div>
												<div className='space-y-2'>
													<span className='text-sm font-medium'>
														Features:
													</span>
													<div className='flex flex-wrap gap-1'>
														{platform.features
															.slice(0, 3)
															.map((feature) => (
																<Badge
																	key={
																		feature
																	}
																	variant='outline'
																	className='text-xs'>
																	{feature}
																</Badge>
															))}
													</div>
												</div>
												<div className='pt-2'>
													{platform.status ===
													"available" ? (
														<Button
															className='w-full cursor-pointer'
															onClick={() =>
																handleConnectPlatform(
																	platform.id
																)
															}
															disabled={
																isConnecting[
																	platform.id
																]
															}>
															{isConnecting[
																platform.id
															] ? (
																<Loader2 className='mr-2 h-4 w-4 animate-spin' />
															) : (
																<Plus className='mr-2 h-4 w-4' />
															)}
															{isConnecting[
																platform.id
															]
																? "Connecting..."
																: `Connect ${platform.name}`}
														</Button>
													) : (
														<Button
															variant='outline'
															className='w-full bg-transparent cursor-not-allowed'
															disabled>
															Coming Soon
														</Button>
													)}
												</div>
											</CardContent>
										</Card>
									))}
							</div>
						</CardContent>
					</Card>
				</div>
			) : (
				// Show add account interface when no connections exist
				<div className='space-y-6'>
					<Card>
						<CardHeader>
							<CardTitle>Get Started</CardTitle>
							<CardDescription>
								Connect your first social media platform to
								start sharing your quotes automatically
							</CardDescription>
						</CardHeader>
					</Card>

					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
						{availablePlatforms.map((platform) => (
							<Card
								key={platform.id}
								className='group hover:shadow-md transition-shadow'>
								<CardHeader>
									<div className='flex items-start justify-between'>
										<div className='flex items-center gap-3'>
											<div className='p-2 rounded-lg bg-muted'>
												<platform.icon
													className='h-6 w-6'
													style={{
														color: platform.color,
													}}
												/>
											</div>
											<div>
												<CardTitle className='text-lg'>
													{platform.name}
												</CardTitle>
												<div className='flex items-center gap-2 mt-1'>
													{getStatusBadge(
														platform.status
													)}
													<span
														className={`text-xs ${getPopularityColor(
															platform.popularity
														)}`}>
														{platform.popularity}{" "}
														popularity
													</span>
												</div>
											</div>
										</div>
									</div>
									<CardDescription className='mt-2'>
										{platform.description}
									</CardDescription>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div className='flex items-center justify-between text-sm'>
										<span className='text-muted-foreground'>
											User base:
										</span>
										<span className='font-medium'>
											{platform.userBase}
										</span>
									</div>
									<div className='space-y-2'>
										<span className='text-sm font-medium'>
											Features:
										</span>
										<div className='flex flex-wrap gap-1'>
											{platform.features.map(
												(feature) => (
													<Badge
														key={feature}
														variant='outline'
														className='text-xs'>
														{feature}
													</Badge>
												)
											)}
										</div>
									</div>
									<div className='pt-2'>
										{platform.status === "available" ? (
											<Button
												className='w-full cursor-pointer'
												onClick={() =>
													handleConnectPlatform(
														platform.id
													)
												}
												disabled={
													isConnecting[platform.id]
												}>
												{isConnecting[platform.id] ? (
													<Loader2 className='mr-2 h-4 w-4 animate-spin' />
												) : (
													<Plus className='mr-2 h-4 w-4' />
												)}
												{isConnecting[platform.id]
													? "Connecting..."
													: `Connect ${platform.name}`}
											</Button>
										) : (
											<Button
												variant='outline'
												className='w-full bg-transparent cursor-not-allowed'
												disabled>
												Coming Soon
											</Button>
										)}
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Don&apos;t see your platform?</CardTitle>
							<CardDescription>
								Request integration for additional social media
								platforms or business tools.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button variant='outline'>
								<Plus className='mr-2 h-4 w-4' />
								Request Integration
							</Button>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Facebook Pages Selection Dialog */}
			{showPageDialog && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
					<div className='bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4'>
						<h3 className='text-lg font-semibold mb-4'>
							Select Facebook Page
						</h3>
						<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
							Choose which Facebook page you want to connect:
						</p>
						<div className='space-y-2 max-h-60 overflow-y-auto'>
							{availablePages.map((page) => (
								<button
									key={page.id}
									onClick={() => handlePageSelection(page)}
									className='w-full text-left p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer'>
									<div className='font-medium'>
										{page.name}
									</div>
								</button>
							))}
						</div>
						<div className='flex gap-2 mt-4'>
							<Button
								variant='outline'
								onClick={() => setShowPageDialog(false)}>
								Cancel
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Instagram Account Selection Dialog */}
			{showAccountDialog && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
					<div className='bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4'>
						<h3 className='text-lg font-semibold mb-4'>
							Select Instagram Account
						</h3>
						<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
							Choose which Instagram account you want to connect:
						</p>
						<div className='space-y-2 max-h-60 overflow-y-auto'>
							{availableAccounts.map((account) => (
								<button
									key={account.instagramAccountId}
									onClick={() =>
										saveInstagramConnection(account)
									}
									className='w-full text-left p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer'>
									<div className='flex items-center gap-2'>
										<img
											src={
												account.profilePicture ||
												"/placeholder.png"
											}
											alt={
												account.username ||
												"Instagram Account"
											}
											className='w-8 h-8 rounded-full object-cover'
										/>
										<div>
											<div className='font-medium'>
												{account.username ||
													account.pageName}
											</div>
											<div className='text-xs text-muted-foreground'>
												{account.pageName}
											</div>
										</div>
									</div>
								</button>
							))}
						</div>
						<div className='flex gap-2 mt-4'>
							<Button
								variant='outline'
								onClick={() => setShowAccountDialog(false)}>
								Cancel
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
