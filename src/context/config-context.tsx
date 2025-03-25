import React, { createContext, useContext, useState, useEffect } from "react";

interface Config {
	subscription_control: boolean;
	social_sharing: boolean;
}

interface ConfigContextType {
	config: Config | null;
	loading: boolean;
	error: string | null;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
	const [config, setConfig] = useState<Config | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchConfig = async () => {
			try {
				const response = await fetch("/api/config");
				if (!response.ok) throw new Error("Failed to fetch config");

				const configs = await response.json();
				const subscriptionConfig = configs.find(
					(c: { key: string; value: boolean }) =>
						c.key === "subscriptionEnabled"
				);
				const socialSharingConfig = configs.find(
					(c: { key: string; value: boolean }) =>
						c.key === "socialSharingEnabled"
				);

				setConfig({
					subscription_control: subscriptionConfig?.value ?? true,
					social_sharing: socialSharingConfig?.value ?? true,
				});
			} catch (err) {
				console.error("Error fetching config:", err);
				setError(
					err instanceof Error
						? err.message
						: "Failed to fetch config"
				);
			} finally {
				setLoading(false);
			}
		};

		fetchConfig();
	}, []);

	return (
		<ConfigContext.Provider
			value={{
				config,
				loading,
				error,
			}}>
			{children}
		</ConfigContext.Provider>
	);
}

export function useConfig() {
	const context = useContext(ConfigContext);
	if (context === undefined) {
		throw new Error("useConfig must be used within a ConfigProvider");
	}
	return context;
}
