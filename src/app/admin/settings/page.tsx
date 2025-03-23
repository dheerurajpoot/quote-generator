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

	const handleSaveSettings = (section: string) => {
		setIsLoading(true);
		setSuccess("");
		setError("");

		// Simulate API call
		setTimeout(() => {
			setIsLoading(false);
			setSuccess(`${section} settings saved successfully!`);
		}, 1500);
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
		</div>
	);
}
