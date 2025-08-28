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
	monthlyPrice: number;
	annualPrice: number;
	monthlyOriginalPrice?: number;
	annualOriginalPrice?: number;
	features: string[];
	tier: SubscriptionTier;
	popular?: boolean;
}

export interface Subscription {
	_id: string;
	userId: string;
	planId: string;
	planName: string;
	tier: SubscriptionTier;
	status: "active" | "pending" | "canceled" | "expired";

	// UPI Payment fields
	transactionId?: string;
	paymentMethod: string;
	amount: number;
	billingCycle: "monthly" | "annually";

	// Subscription details
	currentPeriodStart: Date;
	currentPeriodEnd: Date;
	planDuration: string;
	autoRenew: boolean;

	// Timestamps
	createdAt: Date;
	updatedAt: Date;
	cancelledAt?: Date;
}

interface SubscriptionContextType {
	subscription: Subscription | null;
	loading: boolean;
	warning: string | null;
	subscribe: (
		planId: string,
		billingCycle: "monthly" | "annually",
		transactionId: string,
		amount: number
	) => Promise<boolean>;
	cancelSubscription: () => Promise<boolean>;
	isSubscribed: () => boolean;
	refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
	undefined
);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth();
	const [subscription, setSubscription] = useState<Subscription | null>(null);
	const [loading, setLoading] = useState(true);
	const [warning, setWarning] = useState<string | null>(null);

	const fetchSubscription = async () => {
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

			if (!response.data || !response.data.success) {
				throw new Error("Failed to fetch subscription data");
			}

			const subscriptions = response.data.subscriptions;

			// Handle empty subscription array
			if (!subscriptions || subscriptions.length === 0) {
				setSubscription(null);
				setLoading(false);
				return;
			}

			// Get the most recent active subscription
			const latestSubscription =
				subscriptions.find((sub: any) => sub.status === "active") ||
				subscriptions[0];

			if (latestSubscription) {
				// Check subscription status and show warnings
				if (latestSubscription.status === "expired") {
					setWarning(
						"Your premium subscription has expired. You have been moved to the free plan."
					);
					// Automatically convert to free plan
					await convertToFreePlan();
				} else if (latestSubscription.status === "canceled") {
					setWarning(
						"Your premium subscription has been canceled. You have been moved to the free plan."
					);
					// Automatically convert to free plan
					await convertToFreePlan();
				} else {
					setSubscription({
						...latestSubscription,
						currentPeriodStart: new Date(
							latestSubscription.currentPeriodStart
						),
						currentPeriodEnd: new Date(
							latestSubscription.currentPeriodEnd
						),
						createdAt: new Date(latestSubscription.createdAt),
						updatedAt: new Date(latestSubscription.updatedAt),
						cancelledAt: latestSubscription.cancelledAt
							? new Date(latestSubscription.cancelledAt)
							: undefined,
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

	const convertToFreePlan = async () => {
		if (!user) return;

		try {
			const convertResponse = await axios.post("/api/subscriptions", {
				userId: user._id,
				planId: "free",
			});

			if (
				convertResponse.status === 200 &&
				convertResponse.data.success
			) {
				const freeSubscription = convertResponse.data.subscription;
				setSubscription({
					...freeSubscription,
					currentPeriodStart: new Date(
						freeSubscription.currentPeriodStart
					),
					currentPeriodEnd: new Date(
						freeSubscription.currentPeriodEnd
					),
					createdAt: new Date(freeSubscription.currentPeriodStart),
					updatedAt: new Date(freeSubscription.updatedAt),
				});
			}
		} catch (error) {
			console.error("Failed to convert to free plan:", error);
		}
	};

	useEffect(() => {
		fetchSubscription();
	}, [user]);

	const subscribe = async (
		planId: string,
		billingCycle: "monthly" | "annually",
		transactionId: string,
		amount: number
	): Promise<boolean> => {
		if (!user) return false;

		try {
			setLoading(true);
			setWarning(null);

			// For free plan, create subscription directly
			if (planId === "free") {
				const response = await axios.post("/api/subscriptions", {
					userId: user._id,
					planId: "free",
				});

				if (response.data && response.data.success) {
					const freeSubscription = response.data.subscription;
					setSubscription({
						...freeSubscription,
						currentPeriodStart: new Date(
							freeSubscription.currentPeriodStart
						),
						currentPeriodEnd: new Date(
							freeSubscription.currentPeriodEnd
						),
						createdAt: new Date(freeSubscription.createdAt),
						updatedAt: new Date(freeSubscription.updatedAt),
					});
					return true;
				}
				return false;
			}

			// For paid plans, submit UPI payment
			const paymentResponse = await axios.post(
				"/api/subscriptions/upi-payment",
				{
					userId: user._id,
					planId,
					planName: getPlanName(planId),
					amount,
					billingCycle,
					transactionId: transactionId,
					upiId: "adsenseservices90@axl",
				}
			);

			if (paymentResponse.data && paymentResponse.data.success) {
				setWarning(
					"Payment submitted successfully! Your subscription will be activated after admin verification."
				);
				// Refresh subscription data to show pending status
				await fetchSubscription();
				return true;
			}

			return false;
		} catch (error) {
			console.error("Subscribe failed:", error);
			setWarning("Failed to process subscription. Please try again.");
			return false;
		} finally {
			setLoading(false);
		}
	};

	const getPlanName = (planId: string): string => {
		switch (planId) {
			case "basic":
				return "Basic Plan";
			case "premium":
				return "Premium Plan";
			case "enterprise":
				return "Enterprise Plan";
			default:
				return "Unknown Plan";
		}
	};

	const cancelSubscription = async (): Promise<boolean> => {
		if (!user || !subscription) return false;

		try {
			setLoading(true);
			setWarning(null);

			const response = await axios.put("/api/subscriptions", {
				subscriptionId: subscription._id,
				action: "cancel",
			});

			if (!response.data || !response.data.success) {
				throw new Error("Failed to cancel subscription");
			}

			const data = response.data;

			setSubscription({
				...data.subscription,
				currentPeriodStart: new Date(
					data.subscription.currentPeriodStart
				),
				currentPeriodEnd: new Date(data.subscription.currentPeriodEnd),
				createdAt: new Date(data.subscription.createdAt),
				updatedAt: new Date(data.subscription.updatedAt),
				cancelledAt: data.subscription.cancelledAt
					? new Date(data.subscription.cancelledAt)
					: undefined,
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
		if (subscription.tier === "free") return false;
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

	const refreshSubscription = async () => {
		await fetchSubscription();
	};

	return (
		<SubscriptionContext.Provider
			value={{
				subscription,
				loading,
				warning,
				subscribe,
				cancelSubscription,
				isSubscribed,
				refreshSubscription,
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
