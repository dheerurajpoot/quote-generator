"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from "react";
import { useAuth } from "./auth-context";
import axios from "axios";

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

				const response = await axios.get(
					`/api/subscriptions?userId=${user._id}`
				);

				// Ensure response.data exists before proceeding
				if (!response.data) {
					throw new Error(
						"API returned no data for subscription check."
					);
				}

				if (response.status !== 200) {
					console.error(
						"Subscription check failed with status",
						response.status,
						response.data
					);
					setLoading(false);
					return;
				}

				const data = response.data;

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
						const convertResponse = await axios.post(
							"/api/subscriptions",
							{
								userId: user._id,
								planId: "free",
							}
						);
						if (
							convertResponse.status === 200 &&
							convertResponse.data
						) {
							const freeSubscription = convertResponse.data;
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
						const convertResponse = await axios.post(
							"/api/subscriptions",
							{
								userId: user._id,
								planId: "free",
							}
						);

						if (
							convertResponse.status === 200 &&
							convertResponse.data
						) {
							const freeSubscription = convertResponse.data;
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

			const response = await axios.post("/api/subscriptions", {
				userId: user._id,
				planId,
			});

			// Ensure response.data exists
			if (!response.data) {
				throw new Error("API returned no data for subscription.");
			}

			if (response.status !== 200) {
				setWarning("Failed to create subscription");
				return false;
			}

			const data = response.data;

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

			const response = await axios.put("/api/subscriptions", {
				subscriptionId: subscription.id,
			});

			// Ensure response.data exists
			if (!response.data) {
				throw new Error(
					"API returned no data for subscription cancellation."
				);
			}

			if (response.status !== 200) {
				setWarning("Failed to cancel subscription");
				return false;
			}

			const data = response.data;

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
		if (!subscription) return false;
		if (subscription.tier !== "premium") return false;
		if (subscription.status === "active") return true;
		// Allow access if canceled but still within the current period
		if (
			subscription.status === "canceled" &&
			new Date() < new Date(subscription.currentPeriodEnd)
		) {
			return true;
		}
		return false;
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
