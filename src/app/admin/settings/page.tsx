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

export default function AdminSettingsPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [success, setSuccess] = useState("");
	const [error, setError] = useState("");

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
		<div className='container mx-auto py-8'>
			<h1 className='text-3xl font-bold mb-8'>Admin Settings</h1>

			<div className='space-y-8'>
				{/* General Settings */}
				<Card>
					<CardHeader>
						<CardTitle>General Settings</CardTitle>
						<CardDescription>
							Configure general site settings
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='flex items-center justify-between'>
							<div className='space-y-0.5'>
								<Label>Maintenance Mode</Label>
								<p className='text-sm text-muted-foreground'>
									Enable maintenance mode to temporarily
									disable access to the site
								</p>
							</div>
							<Switch
								checked={maintenanceMode}
								onCheckedChange={setMaintenanceMode}
							/>
						</div>
					</CardContent>
					<CardFooter>
						<Button
							onClick={() => handleSaveSettings("General")}
							disabled={isLoading}>
							{isLoading ? (
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							) : null}
							Save Changes
						</Button>
					</CardFooter>
				</Card>
			</div>

			{error && (
				<Alert variant='destructive' className='mt-4'>
					<AlertCircle className='h-4 w-4' />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{success && (
				<Alert className='mt-4'>
					<Check className='h-4 w-4' />
					<AlertDescription>{success}</AlertDescription>
				</Alert>
			)}
		</div>
	);
}
