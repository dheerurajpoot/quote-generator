import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";

export function useSocialSharing() {
	const [isEnabled, setIsEnabled] = useState(true);
	const [isLoading, setIsLoading] = useState(true);
	const { user } = useAuth();

	useEffect(() => {
		const fetchConfig = async () => {
			try {
				const response = await fetch("/api/config");
				if (!response.ok) throw new Error("Failed to fetch config");

				const configs = await response.json();
				const socialSharingConfig = configs.find(
					(config: any) => config.key === "socialSharingEnabled"
				);
				setIsEnabled(socialSharingConfig?.value ?? true);
			} catch (error) {
				console.error("Error fetching social sharing config:", error);
				setIsEnabled(true); // Default to enabled if there's an error
			} finally {
				setIsLoading(false);
			}
		};

		fetchConfig();
	}, []);

	const toggleSocialSharing = async (enabled: boolean) => {
		try {
			const response = await fetch("/api/config", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					key: "socialSharingEnabled",
					value: enabled,
					description:
						"Controls whether social sharing features are enabled",
				}),
			});

			if (!response.ok) throw new Error("Failed to update config");

			setIsEnabled(enabled);
			return true;
		} catch (error) {
			console.error("Error updating social sharing config:", error);
			return false;
		}
	};

	return {
		isEnabled,
		isLoading,
		toggleSocialSharing,
	};
}
