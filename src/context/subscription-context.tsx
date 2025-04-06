"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from "react";
import { useAuth } from "./auth-context";

export type SubscriptionTier = "free" | "premium";

export interface SubscriptionPlan {
	id: string;
	name: string;
	description: string;
	price: number;
	features: string[];
	tier: SubscriptionTier;
	recommended?: boolean;
}

export interface Subscription {
	id: string;
	userId: string;
	planId: string;
	tier: SubscriptionTier;
	status: "active" | "canceled" | "expired" | "pending";
	currentPeriodEnd: Date;
	createdAt: Date;
	razorpaySubscriptionId?: string;
}

interface SubscriptionContextType {
	subscription: Subscription | null;
	loading: boolean;
	warning: string | null;
	plans: SubscriptionPlan[];
	subscribe: (planId: string) => Promise<boolean>;
	cancelSubscription: () => Promise<boolean>;
	isSubscribed: () => boolean;
	canPost: () => boolean;
	canSearchImages: () => boolean;
}

export const subscriptionPlans: SubscriptionPlan[] = [
	{
		id: "free",
		name: "Free",
		description: "Basic quote creation with limited features",
		price: 0,
		tier: "free",
		features: [
			"Create unlimited quotes",
			"Basic backgrounds",
			"Download as PNG",
			"Basic fonts",
		],
	},
	{
		id: "premium",
		name: "Premium",
		description: "Enhanced features for serious creators",
		price: 99,
		tier: "premium",
		recommended: true,
		features: [
			"All Free features",
			"Premium backgrounds",
			"Social Media Auto Poster",
			"Unlimited AI Motivational Quotes",
			"Posts on Facebook and Instagram",
			"Unlimited Social Media Posts",
			"Custom watermark",
			"Priority support",
		],
	},
];

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
	undefined
);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth();
	const [subscription, setSubscription] = useState<Subscription | null>(null);
	const [loading, setLoading] = useState(true);
	const [warning, setWarning] = useState<string | null>(null);

	useEffect(() => {
		// Check if user has a subscription
		const checkSubscription = async () => {
			if (!user) {
				setSubscription(null);
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				setWarning(null);

				const response = await fetch(
					`/api/subscriptions?userId=${user._id}`
				);

				if (!response.ok) {
					const errorData = await response.json();
					console.error("Subscription check failed:", errorData);

					// Only create free subscription if user is completely new (404)
					if (response.status === 404) {
						const createResponse = await fetch(
							"/api/subscriptions",
							{
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									userId: user._id,
									planId: "free",
								}),
							}
						);

						if (createResponse.ok) {
							const newSubscription = await createResponse.json();
							setSubscription({
								...newSubscription,
								currentPeriodEnd: new Date(
									newSubscription.currentPeriodEnd
								),
								createdAt: new Date(newSubscription.createdAt),
							});
						}
					}
					setLoading(false);
					return;
				}

				const data = await response.json();

				// Handle empty subscription array
				if (!data || data.length === 0) {
					setSubscription(null);
					setLoading(false);
					return;
				}

				// Get the most recent subscription
				const latestSubscription = data[0];

				// Check subscription status and show warnings
				if (latestSubscription) {
					if (latestSubscription.status === "expired") {
						setWarning(
							"Your premium subscription has expired. You have been moved to the free plan."
						);
						// Automatically convert to free plan
						const convertResponse = await fetch(
							"/api/subscriptions",
							{
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									userId: user._id,
									planId: "free",
								}),
							}
						);

						if (convertResponse.ok) {
							const freeSubscription =
								await convertResponse.json();
							setSubscription({
								...freeSubscription,
								currentPeriodEnd: new Date(
									freeSubscription.currentPeriodEnd
								),
								createdAt: new Date(freeSubscription.createdAt),
							});
						}
					} else if (latestSubscription.status === "canceled") {
						setWarning(
							"Your premium subscription has been canceled. You have been moved to the free plan."
						);
						// Automatically convert to free plan
						const convertResponse = await fetch(
							"/api/subscriptions",
							{
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									userId: user._id,
									planId: "free",
								}),
							}
						);

						if (convertResponse.ok) {
							const freeSubscription =
								await convertResponse.json();
							setSubscription({
								...freeSubscription,
								currentPeriodEnd: new Date(
									freeSubscription.currentPeriodEnd
								),
								createdAt: new Date(freeSubscription.createdAt),
							});
						}
					} else {
						setSubscription({
							...latestSubscription,
							currentPeriodEnd: new Date(
								latestSubscription.currentPeriodEnd
							),
							createdAt: new Date(latestSubscription.createdAt),
						});
					}
				} else {
					setSubscription(null);
				}
			} catch (error) {
				console.error("Subscription check failed:", error);
				setSubscription(null);
			} finally {
				setLoading(false);
			}
		};

		checkSubscription();
	}, [user]);

	const subscribe = async (planId: string): Promise<boolean> => {
		if (!user) return false;

		try {
			setLoading(true);
			setWarning(null);

			const response = await fetch("/api/subscriptions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: user._id,
					planId,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				setWarning(errorData.error || "Failed to create subscription");
				return false;
			}

			const data = await response.json();

			// For free plan, update subscription state
			if (planId === "free") {
				setSubscription({
					...data,
					currentPeriodEnd: new Date(data.currentPeriodEnd),
					createdAt: new Date(data.createdAt),
				});
				return true;
			}

			// For premium plan, Razorpay checkout will be handled in the component
			return true;
		} catch (error) {
			console.error("Subscribe failed:", error);
			setWarning("Failed to process subscription");
			return false;
		} finally {
			setLoading(false);
		}
	};

	const cancelSubscription = async (): Promise<boolean> => {
		if (!user || !subscription) return false;

		try {
			setLoading(true);
			setWarning(null);

			const response = await fetch("/api/subscriptions", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					subscriptionId: subscription.id,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				setWarning(errorData.error || "Failed to cancel subscription");
				return false;
			}

			const data = await response.json();

			setSubscription({
				...data,
				currentPeriodEnd: new Date(data.currentPeriodEnd),
				createdAt: new Date(data.createdAt),
			});

			setWarning(
				"Your premium subscription has been canceled. You will be moved to the free plan at the end of your billing period."
			);
			return true;
		} catch (error) {
			console.error("Cancel subscription failed:", error);
			setWarning("Failed to cancel subscription");
			return false;
		} finally {
			setLoading(false);
		}
	};

	const isSubscribed = (): boolean => {
		return (
			!!subscription &&
			subscription.status === "active" &&
			subscription.tier === "premium"
		);
	};

	const canPost = (): boolean => {
		return isSubscribed();
	};

	const canSearchImages = (): boolean => {
		return isSubscribed();
	};

	return (
		<SubscriptionContext.Provider
			value={{
				subscription,
				loading,
				warning,
				plans: subscriptionPlans,
				subscribe,
				cancelSubscription,
				isSubscribed,
				canPost,
				canSearchImages,
			}}>
			{children}
		</SubscriptionContext.Provider>
	);
}

export function useSubscription() {
	const context = useContext(SubscriptionContext);
	if (context === undefined) {
		throw new Error(
			"useSubscription must be used within a SubscriptionProvider"
		);
	}
	return context;
}
