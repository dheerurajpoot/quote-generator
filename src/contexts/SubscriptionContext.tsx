import { useAuth } from "@/context/auth-context";
import { useConfig } from "@/context/config-context";
import React, { createContext, useContext, useState, useEffect } from "react";

interface Subscription {
	userId: string;
	planId: string;
	tier: "free" | "premium";
	status: "active" | "pending" | "canceled" | "expired";
	razorpaySubscriptionId?: string;
	razorpayOrderId?: string;
	razorpayPaymentId?: string;
	currentPeriodEnd: Date;
	createdAt: Date;
	updatedAt: Date;
}

interface SubscriptionContextType {
	isSubscribed: boolean;
	subscription: Subscription | null;
	loading: boolean;
	error: string | null;
	refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
	undefined
);

export function SubscriptionProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user } = useAuth();
	const { config } = useConfig();
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [subscription, setSubscription] = useState<Subscription | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchSubscription = async () => {
		if (!user) {
			setIsSubscribed(false);
			setSubscription(null);
			setLoading(false);
			return;
		}

		try {
			const response = await fetch(
				`/api/subscriptions?userId=${user._id}`
			);
			if (!response.ok) throw new Error("Failed to fetch subscription");

			const data = await response.json();
			const subscriptionData = data[0]; // Get the first subscription

			// If subscription control is disabled, treat all users as subscribed
			if (!config?.subscription_control) {
				setIsSubscribed(true);
				setSubscription(subscriptionData);
			} else {
				setIsSubscribed(
					!!subscriptionData && subscriptionData.status === "active"
				);
				setSubscription(subscriptionData);
			}
		} catch (err) {
			console.error("Error fetching subscription:", err);
			setError(
				err instanceof Error
					? err.message
					: "Failed to fetch subscription"
			);
			setIsSubscribed(false);
			setSubscription(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchSubscription();
	}, [user, config?.subscription_control]);

	const refreshSubscription = async () => {
		setLoading(true);
		await fetchSubscription();
	};

	return (
		<SubscriptionContext.Provider
			value={{
				isSubscribed,
				subscription,
				loading,
				error,
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
