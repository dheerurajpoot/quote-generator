"use client";

import { useState } from "react";
import { useSubscription } from "@/context/subscription-context";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle, ImageIcon, Lock } from "lucide-react";
import { SocialConnections } from "@/components/social-connection";
import Link from "next/link";
import { useSocialSharing } from "@/hooks/useSocialSharing";

export default function DashboardPage() {
	const {
		subscription,
		plans,
		cancelSubscription,
		isSubscribed,
		canSearchImages,
	} = useSubscription();
	const { isEnabled: isSocialSharingEnabled } = useSocialSharing();
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const currentPlan = plans.find((p) => p.id === subscription?.planId);

	const handleCancelSubscription = async () => {
		if (!subscription || subscription.tier === "free") return;

		setError("");
		setSuccess("");

		try {
			const result = await cancelSubscription();
			if (result) {
				setSuccess(
					"Your subscription has been cancelled. You will have access until the end of your billing period."
				);
			} else {
				setError("Failed to cancel subscription. Please try again.");
			}
		} catch (err) {
			console.log(err);
			setError("An error occurred. Please try again.");
		}
	};

	return (
		<div className='container mx-auto py-12'>
			<div className='max-w-5xl mx-auto'>
				<div className='flex justify-between items-center mb-8'>
					<h1 className='text-3xl font-bold'>Dashboard</h1>
				</div>

				{error && (
					<Alert variant='destructive' className='mb-6'>
						<AlertCircle className='h-4 w-4' />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{success && (
					<Alert className='mb-6 bg-primary/10 border-primary/20'>
						<Check className='h-4 w-4 text-primary' />
						<AlertDescription>{success}</AlertDescription>
					</Alert>
				)}

				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
					<Card>
						<CardHeader className='pb-2'>
							<CardTitle className='text-sm font-medium'>
								Total Quotes Created
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>12</div>
						</CardContent>
					</Card>
					{isSocialSharingEnabled && (
						<Card>
							<CardHeader className='pb-2'>
								<CardTitle className='text-sm font-medium'>
									Social Media Posts
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>
									{isSubscribed() ? "5" : "0"}
								</div>
							</CardContent>
						</Card>
					)}
					<Card>
						<CardHeader className='pb-2'>
							<CardTitle className='text-sm font-medium'>
								Subscription Status
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='flex items-center gap-2'>
								<div className='text-2xl font-bold'>
									{currentPlan?.name || "None"}
								</div>
								{subscription?.status === "active" && (
									<Badge variant='outline' className='ml-2'>
										Active
									</Badge>
								)}
								{subscription?.status === "canceled" && (
									<Badge
										variant='outline'
										className='bg-yellow-100 text-yellow-800 border-yellow-200'>
										Cancelled
									</Badge>
								)}
								{subscription?.status === "expired" && (
									<Badge
										variant='outline'
										className='bg-red-100 text-red-800 border-red-200'>
										Expired
									</Badge>
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				<Tabs defaultValue='subscription'>
					<TabsList className='mb-4'>
						<TabsTrigger value='subscription'>
							Subscription
						</TabsTrigger>
						{isSocialSharingEnabled && (
							<TabsTrigger value='social'>
								Social Media
							</TabsTrigger>
						)}
						<TabsTrigger value='images'>Image Search</TabsTrigger>
					</TabsList>

					<TabsContent value='subscription'>
						<Card>
							<CardHeader>
								<CardTitle>Your Subscription</CardTitle>
								<CardDescription>
									Manage your subscription plan and billing
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								{currentPlan ? (
									<div className='space-y-4'>
										<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
											<div>
												<h3 className='text-sm font-medium text-muted-foreground mb-1'>
													Current Plan
												</h3>
												<p className='text-lg font-semibold'>
													{currentPlan.name}
												</p>
											</div>
											<div>
												<h3 className='text-sm font-medium text-muted-foreground mb-1'>
													Billing Period
												</h3>
												<p className='text-lg font-semibold'>
													{subscription?.tier ===
													"free"
														? "N/A"
														: `${new Date(
																subscription?.createdAt ||
																	""
														  ).toLocaleDateString()} - ${new Date(
																subscription?.currentPeriodEnd ||
																	""
														  ).toLocaleDateString()}`}
												</p>
											</div>
										</div>
										{subscription?.tier === "premium" &&
											subscription?.status ===
												"active" && (
												<div className='pt-4'>
													<Button
														variant='destructive'
														onClick={
															handleCancelSubscription
														}
														className='w-full md:w-auto'>
														Cancel Subscription
													</Button>
												</div>
											)}
									</div>
								) : (
									<div className='text-center py-8'>
										<h3 className='text-lg font-medium mb-2'>
											No Active Subscription
										</h3>
										<p className='text-muted-foreground mb-4'>
											Upgrade to Premium to access all
											features
										</p>
										<Button asChild>
											<Link href='/pricing'>
												View Plans
											</Link>
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{isSocialSharingEnabled && (
						<TabsContent value='social'>
							<Card>
								<CardHeader>
									<CardTitle>
										Social Media Integration
									</CardTitle>
									<CardDescription>
										Connect and manage your social media
										accounts
									</CardDescription>
								</CardHeader>
								<CardContent>
									{!isSubscribed() ? (
										<div className='text-center py-6'>
											<h3 className='text-lg font-semibold mb-2'>
												Upgrade to Post to Social Media
											</h3>
											<p className='text-muted-foreground mb-4'>
												Subscribe to our Premium plan to
												unlock social media posting
												features.
											</p>
											<Button asChild>
												<Link href='/pricing'>
													View Plans
												</Link>
											</Button>
										</div>
									) : (
										<SocialConnections />
									)}
								</CardContent>
							</Card>
						</TabsContent>
					)}

					<TabsContent value='images'>
						<Card>
							<CardHeader>
								<CardTitle>Image Search</CardTitle>
								<CardDescription>
									Search and use high-quality images for your
									quotes
								</CardDescription>
							</CardHeader>
							<CardContent>
								{canSearchImages() ? (
									<div className='text-center py-8'>
										<ImageIcon className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
										<h3 className='text-lg font-medium mb-2'>
											Image Search Enabled
										</h3>
										<p className='text-muted-foreground mb-4'>
											You can now search for images in the
											quote generator
										</p>
									</div>
								) : (
									<div className='text-center py-8'>
										<Lock className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
										<h3 className='text-lg font-medium mb-2'>
											Premium Feature
										</h3>
										<p className='text-muted-foreground mb-4'>
											Upgrade to Premium to access image
											search functionality
										</p>
										<Button asChild>
											<Link href='/pricing'>
												Upgrade Now
											</Link>
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
