"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Facebook, Instagram, Loader2, AlertCircle, Check } from "lucide-react";

interface SocialConnection {
	id: string;
	platform: string;
	profileId: string;
	profileName: string;
	profileImage?: string;
	connected: boolean;
}

export function SocialConnections() {
	const { user } = useAuth();
	const [connections, setConnections] = useState<SocialConnection[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [isConnecting, setIsConnecting] = useState<Record<string, boolean>>(
		{}
	);

	useEffect(() => {
		if (user) {
			fetchConnections();
		}
	}, [user]);

	const fetchConnections = async () => {
		try {
			setLoading(true);
			const response = await fetch(`/api/social?userId=${user?._id}`);

			if (!response.ok) {
				throw new Error("Failed to fetch social connections");
			}

			const data = await response.json();
			setConnections(data.connections || []);
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message || "Failed to load social connections");
			} else {
				setError("Failed to load social connections");
			}
		} finally {
			setLoading(false);
		}
	};

	const connectFacebook = async () => {
		// In a real app, this would open the Facebook OAuth flow
		// For demo purposes, we'll simulate a successful connection
		try {
			setIsConnecting((prev) => ({ ...prev, facebook: true }));
			setError("");
			setSuccess("");

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// Add Facebook connection
			const newConnection: SocialConnection = {
				id: `conn_${Math.random().toString(36).substr(2, 9)}`,
				platform: "facebook",
				profileId: "123456789",
				profileName: "Your Facebook Page",
				profileImage: "/placeholder.svg?height=50&width=50",
				connected: true,
			};

			setConnections((prev) => [
				...prev.filter((c) => c.platform !== "facebook"),
				newConnection,
			]);
			setSuccess("Successfully connected to Facebook!");
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message || "Failed to connect to facebook");
			} else {
				setError("Failed to connect to facebook");
			}
		} finally {
			setIsConnecting((prev) => ({ ...prev, facebook: false }));
		}
	};

	const connectInstagram = async () => {
		// In a real app, this would open the Instagram OAuth flow
		// For demo purposes, we'll simulate a successful connection
		try {
			setIsConnecting((prev) => ({ ...prev, instagram: true }));
			setError("");
			setSuccess("");

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// Add Instagram connection
			const newConnection: SocialConnection = {
				id: `conn_${Math.random().toString(36).substr(2, 9)}`,
				platform: "instagram",
				profileId: "987654321",
				profileName: "your_instagram",
				profileImage: "/placeholder.svg?height=50&width=50",
				connected: true,
			};

			setConnections((prev) => [
				...prev.filter((c) => c.platform !== "instagram"),
				newConnection,
			]);
			setSuccess("Successfully connected to Instagram!");
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message || "Failed to connect to instagram");
			} else {
				setError("Failed to connect to instagram");
			}
		} finally {
			setIsConnecting((prev) => ({ ...prev, instagram: false }));
		}
	};

	const disconnectAccount = async (platform: string) => {
		try {
			setIsConnecting((prev) => ({ ...prev, [platform]: true }));
			setError("");
			setSuccess("");

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Remove connection
			setConnections((prev) =>
				prev.filter((c) => c.platform !== platform)
			);
			setSuccess(`Successfully disconnected from ${platform}!`);
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(
					err.message || `Failed to disconnect from ${platform}`
				);
			} else {
				setError(`Failed to disconnect from ${platform}`);
			}
		} finally {
			setIsConnecting((prev) => ({ ...prev, [platform]: false }));
		}
	};

	if (loading) {
		return (
			<div className='flex justify-center py-8'>
				<Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{error && (
				<Alert variant='destructive'>
					<AlertCircle className='h-4 w-4' />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{success && (
				<Alert className='bg-primary/10 border-primary/20'>
					<Check className='h-4 w-4 text-primary' />
					<AlertDescription>{success}</AlertDescription>
				</Alert>
			)}

			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				{/* Facebook Card */}
				<Card>
					<CardHeader className='pb-2'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center'>
								<Facebook className='h-5 w-5 text-blue-600 mr-2' />
								<CardTitle>Facebook</CardTitle>
							</div>
							{connections.some(
								(c) => c.platform === "facebook"
							) && (
								<Badge
									variant='outline'
									className='bg-green-100 text-green-800 border-green-200'>
									Connected
								</Badge>
							)}
						</div>
						<CardDescription>
							Share your quotes on your Facebook page
						</CardDescription>
					</CardHeader>
					<CardContent>
						{connections.some((c) => c.platform === "facebook") ? (
							<div className='flex items-center space-x-3'>
								<div className='h-10 w-10 rounded-full overflow-hidden bg-muted'>
									<img
										src={
											connections.find(
												(c) => c.platform === "facebook"
											)?.profileImage ||
											"/placeholder.svg?height=40&width=40"
										}
										alt='Profile'
										className='h-full w-full object-cover'
									/>
								</div>
								<div>
									<p className='font-medium'>
										{
											connections.find(
												(c) => c.platform === "facebook"
											)?.profileName
										}
									</p>
									<p className='text-xs text-muted-foreground'>
										Facebook Page
									</p>
								</div>
							</div>
						) : (
							<p className='text-sm text-muted-foreground'>
								Connect your Facebook account to share quotes
								directly to your page.
							</p>
						)}
					</CardContent>
					<CardFooter>
						{connections.some((c) => c.platform === "facebook") ? (
							<Button
								variant='outline'
								size='sm'
								className='border-destructive text-destructive hover:bg-destructive/10'
								onClick={() => disconnectAccount("facebook")}
								disabled={isConnecting.facebook}>
								{isConnecting.facebook ? (
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								) : null}
								Disconnect
							</Button>
						) : (
							<Button
								variant='outline'
								size='sm'
								onClick={connectFacebook}
								disabled={isConnecting.facebook}>
								{isConnecting.facebook ? (
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								) : null}
								Connect Facebook
							</Button>
						)}
					</CardFooter>
				</Card>

				{/* Instagram Card */}
				<Card>
					<CardHeader className='pb-2'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center'>
								<Instagram className='h-5 w-5 text-pink-600 mr-2' />
								<CardTitle>Instagram</CardTitle>
							</div>
							{connections.some(
								(c) => c.platform === "instagram"
							) && (
								<Badge
									variant='outline'
									className='bg-green-100 text-green-800 border-green-200'>
									Connected
								</Badge>
							)}
						</div>
						<CardDescription>
							Share your quotes on your Instagram business account
						</CardDescription>
					</CardHeader>
					<CardContent>
						{connections.some((c) => c.platform === "instagram") ? (
							<div className='flex items-center space-x-3'>
								<div className='h-10 w-10 rounded-full overflow-hidden bg-muted'>
									<img
										src={
											connections.find(
												(c) =>
													c.platform === "instagram"
											)?.profileImage ||
											"/placeholder.svg?height=40&width=40"
										}
										alt='Profile'
										className='h-full w-full object-cover'
									/>
								</div>
								<div>
									<p className='font-medium'>
										{
											connections.find(
												(c) =>
													c.platform === "instagram"
											)?.profileName
										}
									</p>
									<p className='text-xs text-muted-foreground'>
										Instagram Business Account
									</p>
								</div>
							</div>
						) : (
							<p className='text-sm text-muted-foreground'>
								Connect your Instagram business account to share
								quotes directly to your profile.
							</p>
						)}
					</CardContent>
					<CardFooter>
						{connections.some((c) => c.platform === "instagram") ? (
							<Button
								variant='outline'
								size='sm'
								className='border-destructive text-destructive hover:bg-destructive/10'
								onClick={() => disconnectAccount("instagram")}
								disabled={isConnecting.instagram}>
								{isConnecting.instagram ? (
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								) : null}
								Disconnect
							</Button>
						) : (
							<Button
								variant='outline'
								size='sm'
								onClick={connectInstagram}
								disabled={isConnecting.instagram}>
								{isConnecting.instagram ? (
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								) : null}
								Connect Instagram
							</Button>
						)}
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
