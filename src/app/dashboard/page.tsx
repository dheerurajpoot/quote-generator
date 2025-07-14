"use client";

import { useState } from "react";
import { useSubscription } from "@/context/subscription-context";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, AlertCircle, Settings, Calendar } from "lucide-react";
import { SocialConnections } from "@/components/social-connection";
import { FacebookSettings } from "@/components/settings/facebook-settings";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
	const { subscription, plans, cancelSubscription } = useSubscription();
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

	// Format date to a readable string
	const formatDate = (date: Date | undefined) => {
		if (!date) return "N/A";
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Calculate days remaining in subscription
	const getDaysRemaining = () => {
		if (!subscription || subscription.tier === "free") return null;

		const endDate = new Date(subscription.currentPeriodEnd);
		const today = new Date();
		const diffTime = endDate.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		return diffDays;
	};

	const daysRemaining = getDaysRemaining();

	return (
		<div className='container mx-auto py-12'>
			<div className='max-w-5xl mx-auto px-4'>
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

				<Tabs defaultValue='overview'>
					<TabsList className='w-full mb-4'>
						<TabsTrigger value='overview'>Overview</TabsTrigger>
						<TabsTrigger value='settings'>
							<Settings className='h-4 w-4 mr-2' />
							Settings
						</TabsTrigger>
					</TabsList>

					<TabsContent value='overview'>
						<Card className='mb-8'>
							<CardHeader>
								<CardTitle className='flex items-center'>
									<Calendar className='h-5 w-5 mr-2' />
									Subscription Details
								</CardTitle>
								<CardDescription>
									Information about your current subscription
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div>
										<p className='text-sm text-muted-foreground'>
											Plan
										</p>
										<p className='font-medium'>
											{currentPlan?.name || "Free"}
										</p>
									</div>
									<div>
										<p className='text-sm text-muted-foreground'>
											Status
										</p>
										<p className='font-medium capitalize'>
											{subscription?.status || "Active"}
										</p>
									</div>
									<div>
										<p className='text-sm text-muted-foreground'>
											Start Date
										</p>
										<p className='font-medium'>
											{formatDate(
												subscription?.createdAt
											)}
										</p>
									</div>
									<div>
										<p className='text-sm text-muted-foreground'>
											Expiry Date
										</p>
										<p className='font-medium'>
											{subscription?.tier === "free"
												? "N/A"
												: formatDate(
														subscription?.currentPeriodEnd
												  )}
										</p>
									</div>
									{subscription?.tier !== "free" &&
										subscription?.status === "active" &&
										daysRemaining !== null && (
											<div className='md:col-span-2'>
												<p className='text-sm text-muted-foreground'>
													Time Remaining
												</p>
												<p className='font-medium'>
													{daysRemaining > 0
														? `${daysRemaining} day${
																daysRemaining !==
																1
																	? "s"
																	: ""
														  } remaining`
														: "Expires today"}
												</p>
											</div>
										)}
									{subscription?.tier === "free" && (
										<div className='md:col-span-2'>
											<p className='text-sm text-muted-foreground'>
												Time Remaining
											</p>
											<p className='font-medium'>N/A</p>
										</div>
									)}
								</div>
								{/* Cancel Subscription Button */}
								{subscription?.tier !== "free" &&
									subscription?.status === "active" && (
										<div className='mt-6 flex'>
											<Button
												className='cursor-pointer'
												variant='destructive'
												onClick={
													handleCancelSubscription
												}
												disabled={!!success}>
												Cancel Subscription
											</Button>
										</div>
									)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Social Media Connections</CardTitle>
								<CardDescription>
									Connect your social media accounts to share
									your quotes
								</CardDescription>
							</CardHeader>
							<CardContent>
								<SocialConnections />
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value='settings'>
						<FacebookSettings />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
