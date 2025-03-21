"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
	useSubscription,
	type SubscriptionPlan,
} from "@/context/subscription-context";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, AlertCircle, Loader2, ImageIcon, Share2 } from "lucide-react";

export default function PricingPage() {
	const router = useRouter();
	const { user } = useAuth();
	const { plans, subscription, loading, isSubscribed } = useSubscription();
	const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
		null
	);
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Check URL for success or canceled params
	useEffect(() => {
		if (typeof window !== "undefined") {
			const urlParams = new URLSearchParams(window.location.search);
			const successParam = urlParams.get("success");
			const canceledParam = urlParams.get("cancelled");

			if (successParam) {
				setSuccess(
					"Your subscription has been successfully processed!"
				);
				// Remove the query params
				window.history.replaceState(
					{},
					document.title,
					window.location.pathname
				);
			}

			if (canceledParam) {
				setError("Your subscription process was canceled.");
				// Remove the query params
				window.history.replaceState(
					{},
					document.title,
					window.location.pathname
				);
			}
		}
	}, []);

	const handleSubscribe = async (plan: SubscriptionPlan) => {
		if (!user) {
			router.push("/login?redirect=/pricing");
			return;
		}

		if (plan.id === "free" && subscription?.tier === "free") {
			setError("You are already on the free plan");
			return;
		}

		if (
			subscription?.planId === plan.id &&
			subscription.status === "active"
		) {
			setError("You are already subscribed to this plan");
			return;
		}

		setSelectedPlan(plan);
		setError("");
		setSuccess("");
		setIsProcessing(true);

		try {
			const response = await fetch("/api/subscriptions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: user._id,
					planId: plan.id,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Failed to process subscription"
				);
			}

			const data = await response.json();

			// For free plan, redirect to dashboard
			if (plan.id === "free") {
				setSuccess("Successfully switched to free plan!");
				setTimeout(() => {
					router.push("/dashboard");
				}, 2000);
			}
			// For premium plan, redirect to Stripe checkout
			else if (data.url) {
				window.location.href = data.url;
			} else {
				throw new Error("No checkout URL returned");
			}
		} catch (err: any) {
			setError(
				err.message ||
					"An error occurred during subscription. Please try again."
			);
		} finally {
			setIsProcessing(false);
		}
	};

	const getCurrentPlan = () => {
		if (!subscription) return null;
		return plans.find((p) => p.id === subscription.planId) || null;
	};

	const currentPlan = getCurrentPlan();

	return (
		<div className='container py-12 md:py-16 lg:py-24'>
			<div className='max-w-5xl mx-auto'>
				<div className='text-center mb-12'>
					<h1 className='text-4xl font-bold tracking-tight mb-4'>
						Choose Your Plan
					</h1>
					<p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
						Unlock premium features including image search and
						social media posting with our premium plan.
					</p>
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

				{currentPlan && subscription?.status === "active" && (
					<div className='mb-8 p-4 border rounded-lg bg-muted/30'>
						<p className='text-center'>
							You are currently on the{" "}
							<strong>{currentPlan.name}</strong> plan.
							{subscription.tier !== "free" && (
								<>
									{" "}
									Your subscription will{" "}
									{subscription.status === "active"
										? "end"
										: "renew"}{" "}
									on{" "}
									{new Date(
										subscription.currentPeriodEnd
									).toLocaleDateString()}
									.
								</>
							)}
						</p>
					</div>
				)}

				<div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto'>
					{plans.map((plan) => (
						<Card
							key={plan.id}
							className={`flex flex-col ${
								plan.recommended
									? "border-primary shadow-lg"
									: ""
							}`}>
							<CardHeader>
								<div className='flex justify-between items-start'>
									<div>
										<CardTitle>{plan.name}</CardTitle>
										<CardDescription className='mt-1'>
											{plan.description}
										</CardDescription>
									</div>
									{plan.recommended && (
										<Badge className='bg-primary hover:bg-primary'>
											Recommended
										</Badge>
									)}
								</div>
								<div className='mt-4'>
									<span className='text-3xl font-bold'>
										${plan.price}
									</span>
									{plan.price > 0 && (
										<span className='text-muted-foreground ml-1'>
											/month
										</span>
									)}
								</div>
							</CardHeader>
							<CardContent className='flex-grow'>
								<ul className='space-y-2'>
									{plan.features.map((feature, i) => (
										<li
											key={i}
											className='flex items-start'>
											<Check className='h-5 w-5 text-primary shrink-0 mr-2' />
											<span>{feature}</span>
										</li>
									))}
								</ul>
							</CardContent>
							<CardFooter>
								<Button
									className='w-full'
									variant={
										plan.recommended ? "default" : "outline"
									}
									disabled={
										isProcessing ||
										loading ||
										(subscription?.planId === plan.id &&
											subscription.status === "active")
									}
									onClick={() => handleSubscribe(plan)}>
									{isProcessing &&
									selectedPlan?.id === plan.id ? (
										<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											Processing...
										</>
									) : subscription?.planId === plan.id &&
									  subscription.status === "active" ? (
										"Current Plan"
									) : plan.id === "free" ? (
										"Continue with Free"
									) : (
										"Upgrade to Premium"
									)}
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>

				<div className='mt-16 max-w-3xl mx-auto'>
					<h2 className='text-2xl font-bold tracking-tight mb-6 text-center'>
						Premium Features
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
						<div className='flex flex-col items-center text-center p-6 border rounded-lg'>
							<div className='bg-primary/10 p-3 rounded-full mb-4'>
								<ImageIcon className='h-6 w-6 text-primary' />
							</div>
							<h3 className='text-xl font-bold mb-2'>
								Image Search
							</h3>
							<p className='text-muted-foreground'>
								Search for the perfect background image from our
								extensive library of high-quality photos.
							</p>
						</div>
						<div className='flex flex-col items-center text-center p-6 border rounded-lg'>
							<div className='bg-primary/10 p-3 rounded-full mb-4'>
								<Share2 className='h-6 w-6 text-primary' />
							</div>
							<h3 className='text-xl font-bold mb-2'>
								Social Media Posting
							</h3>
							<p className='text-muted-foreground'>
								Share your quotes directly to Facebook and
								Instagram with just a few clicks.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
