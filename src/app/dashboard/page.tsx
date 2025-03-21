"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/context/subscription-context";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle, Loader2, ImageIcon } from "lucide-react";
import { SocialConnections } from "@/components/social-connection";

export default function DashboardPage() {
	const router = useRouter();
	const { subscription, plans, cancelSubscription, isSubscribed } =
		useSubscription();
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const currentPlan = plans.find((p) => p.id === subscription?.planId);

	const handleCancelSubscription = async () => {
		if (!subscription || subscription.tier === "free") return;

		setError("");
		setSuccess("");
		setIsProcessing(true);

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
			setError("An error occurred. Please try again.");
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<div className='container py-12'>
			<div className='max-w-5xl mx-auto'>
				<h1 className='text-3xl font-bold tracking-tight mb-6'>
					Dashboard
				</h1>

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
								{subscription?.status === "cancelled" && (
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
						<TabsTrigger value='social'>Social Media</TabsTrigger>
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

										<div>
											<h3 className='text-sm font-medium text-muted-foreground mb-2'>
												Features
											</h3>
											<ul className='grid grid-cols-1 md:grid-cols-2 gap-2'>
												{currentPlan.features.map(
													(feature, i) => (
														<li
															key={i}
															className='flex items-start'>
															<Check className='h-5 w-5 text-primary shrink-0 mr-2' />
															<span>
																{feature}
															</span>
														</li>
													)
												)}
											</ul>
										</div>
									</div>
								) : (
									<p>
										You don't have an active subscription.
									</p>
								)}
							</CardContent>
							<CardFooter className='flex flex-col sm:flex-row gap-4'>
								<Button
									onClick={() => router.push("/pricing")}
									variant={
										subscription?.tier === "free"
											? "default"
											: "outline"
									}>
									{subscription?.tier === "free"
										? "Upgrade Plan"
										: "Change Plan"}
								</Button>

								{subscription?.tier !== "free" &&
									subscription?.status === "active" && (
										<Button
											variant='outline'
											className='border-destructive text-destructive hover:bg-destructive/10'
											onClick={handleCancelSubscription}
											disabled={isProcessing}>
											{isProcessing ? (
												<>
													<Loader2 className='mr-2 h-4 w-4 animate-spin' />
													Processing...
												</>
											) : (
												"Cancel Subscription"
											)}
										</Button>
									)}
							</CardFooter>
						</Card>
					</TabsContent>

					<TabsContent value='social'>
						<Card>
							<CardHeader>
								<CardTitle>Social Media Integration</CardTitle>
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
										<Button
											onClick={() =>
												router.push("/pricing")
											}>
											View Plans
										</Button>
									</div>
								) : (
									<SocialConnections />
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value='images'>
						<Card>
							<CardHeader>
								<CardTitle>Image Search</CardTitle>
								<CardDescription>
									Access premium backgrounds for your quotes
								</CardDescription>
							</CardHeader>
							<CardContent>
								{!isSubscribed() ? (
									<div className='text-center py-6'>
										<h3 className='text-lg font-semibold mb-2'>
											Upgrade to Access Image Search
										</h3>
										<p className='text-muted-foreground mb-4'>
											Subscribe to our Premium plan to
											unlock image search functionality.
										</p>
										<Button
											onClick={() =>
												router.push("/pricing")
											}>
											View Plans
										</Button>
									</div>
								) : (
									<div className='space-y-6'>
										<div className='border rounded-lg p-4'>
											<div className='flex items-center justify-between mb-4'>
												<div className='flex items-center'>
													<ImageIcon className='h-5 w-5 text-primary mr-2' />
													<h3 className='font-medium'>
														Image Search
													</h3>
												</div>
												<Badge
													variant='outline'
													className='bg-green-100 text-green-800 border-green-200'>
													Active
												</Badge>
											</div>
											<p className='text-sm text-muted-foreground mb-4'>
												Search for the perfect
												background image from our
												extensive library of
												high-quality photos.
											</p>
											<Button
												variant='outline'
												size='sm'
												onClick={() =>
													router.push("/#generator")
												}>
												Create Quote
											</Button>
										</div>
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
