import { useState, useEffect } from "react";

interface Config {
	key: string;
	value: boolean;
	description?: string;
}

export function useSubscriptionControl() {
	const [isEnabled, setIsEnabled] = useState(true);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchConfig();
	}, []);

	const fetchConfig = async () => {
		try {
			const response = await fetch("/api/config");
			if (!response.ok) {
				throw new Error("Failed to fetch subscription config");
			}
			const configs = await response.json();
			const subscriptionConfig = configs.find(
				(config: Config) => config.key === "subscriptionEnabled"
			);
			setIsEnabled(subscriptionConfig?.value ?? true);
		} catch (error) {
			console.error("Error fetching subscription config:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const toggleSubscription = async () => {
		try {
			setIsLoading(true);
			const response = await fetch("/api/config", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					key: "subscriptionEnabled",
					value: !isEnabled,
					description: "Whether the subscription system is enabled",
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to update subscription config");
			}

			setIsEnabled(!isEnabled);
		} catch (error) {
			console.error("Error updating subscription config:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return {
		isEnabled,
		isLoading,
		toggleSubscription,
	};
}
