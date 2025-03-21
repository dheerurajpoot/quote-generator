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
	status: "active" | "cancelled" | "expired";
	currentPeriodEnd: Date;
	createdAt: Date;
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
		price: 99,
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
				// In a real app, this would be an API call to check subscription
				// Simulating subscription check for demo
				const storedSubscription = localStorage.getItem(
					`subscription_${user._id}`
				);
				if (storedSubscription) {
					const parsedSubscription = JSON.parse(storedSubscription);
					// Check if subscription is expired
					if (
						new Date(parsedSubscription.currentPeriodEnd) <
						new Date()
					) {
						parsedSubscription.status = "expired";
						localStorage.setItem(
							`subscription_${user._id}`,
							JSON.stringify(parsedSubscription)
						);
					}
					setSubscription(parsedSubscription);
				} else {
					// Create a free subscription for all users
					const freeSubscription: Subscription = {
						id: `sub_${Math.random().toString(36).substr(2, 9)}`,
						userId: user._id,
						planId: "free",
						tier: "free",
						status: "active",
						currentPeriodEnd: new Date(
							Date.now() + 365 * 24 * 60 * 60 * 1000
						), // 1 year from now
						createdAt: new Date(),
					};
					localStorage.setItem(
						`subscription_${user._id}`,
						JSON.stringify(freeSubscription)
					);
					setSubscription(freeSubscription);
				}
			} catch (error) {
				console.error("Subscription check failed:", error);
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
			// In a real app, this would be an API call to create a subscription
			// Simulating subscription creation for demo
			const plan = subscriptionPlans.find((p) => p.id === planId);
			if (!plan) return false;

			const newSubscription: Subscription = {
				id: `sub_${Math.random().toString(36).substr(2, 9)}`,
				userId: user._id,
				planId: plan.id,
				tier: plan.tier,
				status: "active",
				currentPeriodEnd: new Date(
					Date.now() + 30 * 24 * 60 * 60 * 1000
				), // 30 days from now
				createdAt: new Date(),
			};

			localStorage.setItem(
				`subscription_${user._id}`,
				JSON.stringify(newSubscription)
			);
			setSubscription(newSubscription);
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
			// In a real app, this would be an API call to cancel a subscription
			// Simulating subscription cancellation for demo
			const updatedSubscription = {
				...subscription,
				status: "cancelled" as const,
			};
			localStorage.setItem(
				`subscription_${user._id}`,
				JSON.stringify(updatedSubscription)
			);
			setSubscription(updatedSubscription);
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
