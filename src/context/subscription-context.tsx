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
		price: 69,
		tier: "premium",
		recommended: true,
		features: [
			"All Free features",
			"Premium backgrounds",
			"Image search functionality",
			"Advanced text styling",
			"No watermark",
			"Post to Facebook & Instagram",
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

				const response = await fetch(
					`/api/subscriptions?userId=${user._id}`
				);

				if (!response.ok) {
					const errorData = await response.json();
					console.error("Subscription check failed:", errorData);

					// If user not found, create a free subscription
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
							setLoading(false);
							return;
						}
					}
					throw new Error(
						errorData.error || "Failed to fetch subscription"
					);
				}

				const data = await response.json();
				console.log("Subscription data:", data);

				// Handle empty subscription array
				if (!data || data.length === 0) {
					// Create a free subscription for new users
					const createResponse = await fetch("/api/subscriptions", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							userId: user._id,
							planId: "free",
						}),
					});

					if (createResponse.ok) {
						const newSubscription = await createResponse.json();
						setSubscription({
							...newSubscription,
							currentPeriodEnd: new Date(
								newSubscription.currentPeriodEnd
							),
							createdAt: new Date(newSubscription.createdAt),
						});
					} else {
						setSubscription(null);
					}
					setLoading(false);
					return;
				}

				// Get the most recent subscription
				const latestSubscription = data[0];
				setSubscription({
					...latestSubscription,
					currentPeriodEnd: new Date(
						latestSubscription.currentPeriodEnd
					),
					createdAt: new Date(latestSubscription.createdAt),
				});
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
				throw new Error("Failed to create subscription");
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
			return false;
		} finally {
			setLoading(false);
		}
	};

	const cancelSubscription = async (): Promise<boolean> => {
		if (!user || !subscription) return false;

		try {
			setLoading(true);

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
				throw new Error("Failed to cancel subscription");
			}

			const data = await response.json();

			setSubscription({
				...data,
				currentPeriodEnd: new Date(data.currentPeriodEnd),
				createdAt: new Date(data.createdAt),
			});

			return true;
		} catch (error) {
			console.error("Cancel subscription failed:", error);
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
