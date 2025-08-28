"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Loader2, Zap, Crown } from "lucide-react";
import { UPIPaymentModal } from "@/components/upi-payment-modal";

interface PricingPlan {
	id: string;
	name: string;
	description: string;
	monthlyPrice: number;
	annualPrice: number;
	monthlyOriginalPrice?: number;
	annualOriginalPrice?: number;
	features: string[];
	popular?: boolean;
	badge?: string;
}

const pricingPlans: PricingPlan[] = [
	{
		id: "free",
		name: "Free Plan",
		description: "Perfect for getting started with quote creation",
		monthlyPrice: 0,
		annualPrice: 0,
		features: [
			"Create unlimited quotes",
			"Basic backgrounds and fonts",
			"Download as PNG",
			"Community support",
			"5 quotes per day",
		],
	},
	{
		id: "premium",
		name: "Premium Plan",
		description: "Unlock all features for serious creators",
		monthlyPrice: 299,
		annualPrice: 2999,
		monthlyOriginalPrice: 499,
		annualOriginalPrice: 4999,
		features: [
			"Everything in Free",
			"Unlimited quotes per day",
			"Premium backgrounds & fonts",
			"Social Media Auto Poster",
			"AI Motivational Quotes",
			"Facebook & Instagram posting",
			"Custom watermarks",
			"Priority support",
			"Advanced analytics",
		],
		popular: true,
		badge: "Most Popular",
	},
];

export default function PricingPage() {
	const router = useRouter();
	const { user } = useAuth();
	const { subscription, subscribe } = useSubscription();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">(
		"monthly"
	);
	const [showUPIModal, setShowUPIModal] = useState(false);
	const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

	// Check URL for success or error params
	useEffect(() => {
		if (typeof window !== "undefined") {
			const urlParams = new URLSearchParams(window.location.search);
			const successParam = urlParams.get("success");
			const errorParam = urlParams.get("error");

			if (successParam) {
				setSuccess(
					"Payment successful! Your subscription is now active."
				);
				window.history.replaceState(
					{},
					document.title,
					window.location.pathname
				);
			}

			if (errorParam) {
				setError(decodeURIComponent(errorParam));
				window.history.replaceState(
					{},
					document.title,
					window.location.pathname
				);
			}
		}
	}, []);

	const handleSubscribe = async (plan: PricingPlan) => {
		if (!user) {
			router.push("/login?redirect=/pricing");
			return;
		}

		if (plan.id === "free") {
			// Handle free plan using subscription context
			setLoading(true);
			try {
				const success = await subscribe(plan.id, "monthly", "", 0);
				if (success) {
					setSuccess("Successfully switched to free plan!");
					setTimeout(() => router.push("/dashboard"), 2000);
				} else {
					throw new Error("Failed to switch to free plan");
				}
			} catch (err) {
				console.log("switch to free plan failed:", err);
				setError("Failed to switch to free plan. Please try again.");
			} finally {
				setLoading(false);
			}
			return;
		}

		// Handle paid plans - show UPI payment modal
		setSelectedPlan(plan);
		setShowUPIModal(true);
	};

	const handleUPIPaymentSubmit = async (transactionId: string) => {
		if (!selectedPlan || !user) return;

		setLoading(true);
		try {
			const amount =
				billingCycle === "monthly"
					? selectedPlan.monthlyPrice
					: selectedPlan.annualPrice;

			const success = await subscribe(
				selectedPlan.id,
				billingCycle,
				transactionId,
				amount
			);

			if (success) {
				setSuccess(
					"Payment submitted successfully! Your subscription will be activated after admin verification."
				);
				setTimeout(() => router.push("/dashboard"), 3000);
			} else {
				throw new Error("Failed to submit payment");
			}
		} catch (err: unknown) {
			console.log("subscribe failed:", err);
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("Failed to submit payment. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	const getCurrentPlan = () => {
		if (!subscription) return null;
		return subscription.planId;
	};

	const getButtonText = (plan: PricingPlan) => {
		const currentPlan = getCurrentPlan();

		if (currentPlan === plan.id) {
			return "Current Plan";
		}

		if (plan.monthlyPrice === 0) {
			return "Get Started Free";
		}

		const price =
			billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;
		const cycle = billingCycle === "monthly" ? "month" : "year";
		return `Subscribe for ₹${price}/${cycle}`;
	};

	const isCurrentPlan = (plan: PricingPlan) => {
		const currentPlan = getCurrentPlan();
		return currentPlan === plan.id;
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12'>
			<div className='container mx-auto px-4'>
				{/* Header */}
				<div className='text-center mb-16'>
					<h1 className='text-5xl font-bold text-gray-900 mb-6'>
						Choose Your Plan
					</h1>
					<p className='text-xl text-gray-600 max-w-3xl mx-auto'>
						Start creating amazing quotes for free, or unlock
						premium features to take your content to the next level.
						All plans include our core quote creation tools.
					</p>
				</div>

				{/* Billing Cycle Toggle */}
				<div className='text-center mb-12'>
					<div className='inline-flex items-center bg-white rounded-lg p-1 shadow-md'>
						<button
							onClick={() => setBillingCycle("monthly")}
							className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
								billingCycle === "monthly"
									? "bg-blue-600 text-white shadow-sm"
									: "text-gray-600 hover:text-gray-900"
							}`}>
							Monthly
						</button>
						<button
							onClick={() => setBillingCycle("annually")}
							className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
								billingCycle === "annually"
									? "bg-blue-600 text-white shadow-sm"
									: "text-gray-600 hover:text-gray-900"
							}`}>
							Annually
							<span className='ml-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full'>
								Save 20%
							</span>
						</button>
					</div>
				</div>

				{/* Alerts */}
				{error && (
					<Alert
						variant='destructive'
						className='mb-8 max-w-2xl mx-auto'>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{success && (
					<Alert className='mb-8 max-w-2xl mx-auto bg-green-50 border-green-200'>
						<Check className='h-4 w-4 text-green-600' />
						<AlertDescription className='text-green-800'>
							{success}
						</AlertDescription>
					</Alert>
				)}

				{/* Pricing Cards */}
				<div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
					{pricingPlans.map((plan) => (
						<Card
							key={plan.id}
							className={`relative transition-all duration-300 hover:shadow-2xl ${
								plan.popular
									? "border-2 border-blue-500 shadow-xl scale-105"
									: "border border-gray-200 hover:border-gray-300"
							} ${
								isCurrentPlan(plan)
									? "ring-2 ring-green-500 ring-opacity-50"
									: ""
							}`}>
							{plan.badge && (
								<div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
									<Badge className='bg-blue-500 text-white px-4 py-2 text-sm font-semibold'>
										{plan.badge}
									</Badge>
								</div>
							)}

							{isCurrentPlan(plan) && (
								<div className='absolute -top-4 right-4'>
									<Badge className='bg-green-500 text-white px-3 py-1 text-xs font-semibold'>
										Current Plan
									</Badge>
								</div>
							)}

							<CardHeader className='text-center pb-4'>
								<div className='flex justify-center mb-4'>
									{plan.id === "free" && (
										<Zap className='h-12 w-12 text-yellow-500' />
									)}
									{plan.id === "premium" && (
										<Crown className='h-12 w-12 text-blue-500' />
									)}
								</div>
								<CardTitle className='text-2xl font-bold text-gray-900'>
									{plan.name}
								</CardTitle>
								<CardDescription className='text-gray-600 mt-2'>
									{plan.description}
								</CardDescription>
							</CardHeader>

							<CardContent className='pb-6'>
								<div className='text-center mb-6'>
									<div className='flex items-center justify-center gap-2'>
										<span className='text-4xl font-bold text-gray-900'>
											₹
											{billingCycle === "monthly"
												? plan.monthlyPrice
												: plan.annualPrice}
										</span>
										{((billingCycle === "monthly" &&
											plan.monthlyOriginalPrice) ||
											(billingCycle === "annually" &&
												plan.annualOriginalPrice)) && (
											<span className='text-xl text-gray-500 line-through'>
												₹
												{billingCycle === "monthly"
													? plan.monthlyOriginalPrice
													: plan.annualOriginalPrice}
											</span>
										)}
									</div>
									{plan.monthlyPrice > 0 && (
										<span className='text-gray-600'>
											/
											{billingCycle === "monthly"
												? "month"
												: "year"}
										</span>
									)}
									{((billingCycle === "monthly" &&
										plan.monthlyOriginalPrice) ||
										(billingCycle === "annually" &&
											plan.annualOriginalPrice)) && (
										<div className='text-sm text-green-600 font-medium mt-1'>
											Save ₹
											{billingCycle === "monthly"
												? plan.monthlyOriginalPrice! -
												  plan.monthlyPrice
												: plan.annualOriginalPrice! -
												  plan.annualPrice}
											/
											{billingCycle === "monthly"
												? "month"
												: "year"}
										</div>
									)}
								</div>

								<ul className='space-y-3'>
									{plan.features.map((feature, index) => (
										<li
											key={index}
											className='flex items-start'>
											<Check className='h-5 w-5 text-green-500 shrink-0 mr-3 mt-0.5' />
											<span className='text-gray-700'>
												{feature}
											</span>
										</li>
									))}
								</ul>
							</CardContent>

							<CardFooter>
								<Button
									className={`w-full ${
										isCurrentPlan(plan)
											? "bg-green-600 hover:bg-green-700 cursor-default"
											: plan.popular
											? "bg-blue-600 hover:bg-blue-700"
											: "bg-gray-900 hover:bg-gray-800"
									}`}
									size='lg'
									disabled={loading || isCurrentPlan(plan)}
									onClick={() => handleSubscribe(plan)}>
									{loading ? (
										<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											Processing...
										</>
									) : (
										getButtonText(plan)
									)}
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>

				{/* FAQ Section */}
				<div className='mt-20 text-center'>
					<h2 className='text-3xl font-bold text-gray-900 mb-8'>
						Frequently Asked Questions
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left'>
						<div>
							<h3 className='font-semibold text-gray-900 mb-2'>
								Can I cancel my subscription anytime?
							</h3>
							<p className='text-gray-600'>
								Yes, you can cancel your subscription at any
								time. You&apos;ll continue to have access until
								the end of your current billing period.
							</p>
						</div>
						<div>
							<h3 className='font-semibold text-gray-900 mb-2'>
								What payment methods do you accept?
							</h3>
							<p className='text-gray-600'>
								We accept UPI payments through our secure
								payment system. Simply scan the QR code with any
								UPI app (GPay, PhonePe, Paytm, etc.) and submit
								your transaction ID for verification.
							</p>
						</div>
						<div>
							<h3 className='font-semibold text-gray-900 mb-2'>
								Is there a free trial?
							</h3>
							<p className='text-gray-600'>
								Yes! Our free plan gives you access to basic
								features. You can upgrade to premium anytime to
								unlock all features.
							</p>
						</div>
						<div>
							<h3 className='font-semibold text-gray-900 mb-2'>
								Do you offer refunds?
							</h3>
							<p className='text-gray-600'>
								We offer a 7-day money-back guarantee. If
								you&apos;re not satisfied, contact us within 7
								days for a full refund.
							</p>
						</div>
					</div>
				</div>

				{/* CTA Section */}
				<div className='mt-20 text-center'>
					<div className='bg-white rounded-2xl shadow-xl p-12 max-w-4xl mx-auto'>
						<h2 className='text-3xl font-bold text-gray-900 mb-4'>
							Ready to Get Started?
						</h2>
						<p className='text-xl text-gray-600 mb-8'>
							Join thousands of creators who are already using
							QuoteArt to create amazing content.
						</p>
						<Button
							size='lg'
							className='bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4'
							onClick={() => router.push("/signup")}>
							Start Creating Now
						</Button>
					</div>
				</div>
			</div>

			{/* UPI Payment Modal */}
			{showUPIModal && selectedPlan && (
				<UPIPaymentModal
					isOpen={showUPIModal}
					onClose={() => setShowUPIModal(false)}
					amount={
						billingCycle === "monthly"
							? selectedPlan.monthlyPrice
							: selectedPlan.annualPrice
					}
					planName={selectedPlan.name}
					onPaymentSubmit={handleUPIPaymentSubmit}
				/>
			)}
		</div>
	);
}
