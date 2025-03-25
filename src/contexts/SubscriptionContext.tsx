import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { useConfig } from "./ConfigContext";

interface SubscriptionContextType {
	isSubscribed: boolean;
	subscription: any;
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
	const [subscription, setSubscription] = useState<any>(null);
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
			const { data, error } = await supabase
				.from("subscriptions")
				.select("*")
				.eq("user_id", user.id)
				.single();

			if (error) throw error;

			// If subscription control is disabled, treat all users as subscribed
			if (!config?.subscription_control) {
				setIsSubscribed(true);
				setSubscription(data);
			} else {
				setIsSubscribed(!!data && data.status === "active");
				setSubscription(data);
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
