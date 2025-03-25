"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { useSocialSharing } from "@/hooks/useSocialSharing";
import { useSubscriptionControl } from "@/hooks/useSubscriptionControl";

export default function AdminSettingsPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [success, setSuccess] = useState("");
	const [error, setError] = useState("");
	const {
		isEnabled: isSocialSharingEnabled,
		isLoading: isSocialConfigLoading,
		toggleSocialSharing,
	} = useSocialSharing();
	const {
		isEnabled: isSubscriptionEnabled,
		isLoading: isSubscriptionConfigLoading,
		toggleSubscription,
	} = useSubscriptionControl();

	const [maintenanceMode, setMaintenanceMode] = useState(false);

	const handleSaveSettings = async (section: string) => {
		setIsLoading(true);
		setSuccess("");
		setError("");

		try {
			if (section === "General") {
				// Save maintenance mode setting
				const response = await fetch("/api/config", {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						key: "maintenanceMode",
						value: maintenanceMode,
						description: "Whether the site is in maintenance mode",
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to save maintenance mode setting");
				}
			}

			setSuccess(`${section} settings saved successfully!`);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to save settings"
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='space-y-6'>
			<h1 className='text-3xl font-bold tracking-tight'>
				Admin Settings
			</h1>

			{success && (
				<Alert className='bg-primary/10 border-primary/20'>
					<Check className='h-4 w-4 text-primary' />
					<AlertDescription>{success}</AlertDescription>
				</Alert>
			)}

			{error && (
				<Alert variant='destructive'>
					<AlertCircle className='h-4 w-4' />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<Card>
				<CardHeader>
					<CardTitle>General Settings</CardTitle>
					<CardDescription>
						Configure basic site settings
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='flex items-center space-x-2'>
						<Switch
							id='maintenance-mode'
							checked={maintenanceMode}
							onCheckedChange={setMaintenanceMode}
						/>
						<Label htmlFor='maintenance-mode'>
							Maintenance Mode
						</Label>
					</div>
				</CardContent>
				<CardFooter>
					<Button
						onClick={() => handleSaveSettings("General")}
						disabled={isLoading}>
						{isLoading ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Saving...
							</>
						) : (
							"Save Settings"
						)}
					</Button>
				</CardFooter>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Social Sharing</CardTitle>
					<CardDescription>
						Control social media sharing features
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='flex items-center space-x-2'>
						<Switch
							id='social-sharing'
							checked={isSocialSharingEnabled}
							onCheckedChange={toggleSocialSharing}
							disabled={isSocialConfigLoading}
						/>
						<Label htmlFor='social-sharing'>
							Enable Social Sharing
						</Label>
					</div>
					<p className='text-sm text-muted-foreground'>
						When disabled, users won't be able to share quotes to
						social media platforms.
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Subscription Control</CardTitle>
					<CardDescription>
						Control subscription and authentication features
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='flex items-center space-x-2'>
						<Switch
							id='subscription-mode'
							checked={isSubscriptionEnabled}
							onCheckedChange={toggleSubscription}
							disabled={isSubscriptionConfigLoading}
						/>
						<Label htmlFor='subscription-mode'>
							Enable Subscription System
						</Label>
					</div>
					<p className='text-sm text-muted-foreground'>
						When disabled, all features will be free and
						authentication will be disabled. When enabled, the
						normal subscription and authentication system will be
						active.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
