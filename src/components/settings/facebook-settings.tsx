"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, AlertCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import Link from "next/link";

export function FacebookSettings() {
	const [appId, setAppId] = useState("");
	const [appSecret, setAppSecret] = useState("");
	const [author, setAuthor] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		// Fetch existing credentials
		const fetchCredentials = async () => {
			try {
				const response = await axios.get(
					"/api/users/facebook-credentials",
					{
						withCredentials: true,
					}
				);

				if (response.data.appId) {
					setAppId(response.data.appId);
				}
				if (response.data.appSecret) {
					setAppSecret(response.data.appSecret);
				}
				if (response.data.author) {
					setAuthor(response.data.author);
				}
			} catch (err) {
				console.error("Error fetching credentials:", err);
				if (axios.isAxiosError(err)) {
					console.log("Error response:", err.response?.data);
					if (err.response?.status === 401) {
						toast.error("Please log in to access this feature");
					} else {
						toast.error(
							err.response?.data?.message ||
								"Failed to fetch credentials"
						);
					}
				}
			}
		};
		fetchCredentials();
	}, []);

	const handleSave = async () => {
		setIsLoading(true);
		setError("");
		setSuccess("");

		try {
			await axios.post(
				"/api/users/facebook-credentials",
				{ appId, appSecret, author },
				{
					withCredentials: true,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			setSuccess("Facebook credentials saved successfully!");
			toast.success("Facebook credentials saved successfully!");
		} catch (err) {
			console.error("Error saving credentials:", err);
			let errorMessage = "An error occurred while saving credentials";
			if (axios.isAxiosError(err)) {
				console.log("Error response:", err.response?.data);
				if (err.response?.status === 401) {
					errorMessage = "Please log in to save credentials";
				} else {
					errorMessage = err.response?.data?.message || errorMessage;
				}
			}
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleRemove = async () => {
		setIsLoading(true);
		setError("");
		setSuccess("");

		try {
			await axios.delete("/api/users/facebook-credentials", {
				withCredentials: true,
			});

			setAppId("");
			setAppSecret("");
			setAuthor("");
			setSuccess("Facebook credentials removed successfully!");
			toast.success("Facebook credentials removed successfully!");
		} catch (err) {
			console.error("Error removing credentials:", err);
			let errorMessage = "An error occurred while removing credentials";
			if (axios.isAxiosError(err)) {
				console.log("Error response:", err.response?.data);
				if (err.response?.status === 401) {
					errorMessage = "Please log in to remove credentials";
				} else {
					errorMessage = err.response?.data?.message || errorMessage;
				}
			}
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Facebook App Settings</CardTitle>
				<CardDescription>
					Configure your Facebook App credentials for social media
					integration
				</CardDescription>
			</CardHeader>
			<CardContent>
				{error && (
					<Alert variant='destructive' className='mb-4'>
						<AlertCircle className='h-4 w-4' />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{success && (
					<Alert className='mb-4 bg-primary/10 border-primary/20'>
						<Check className='h-4 w-4 text-primary' />
						<AlertDescription>{success}</AlertDescription>
					</Alert>
				)}

				<div className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='appId'>App ID</Label>
						<Input
							id='appId'
							value={appId}
							onChange={(e) => setAppId(e.target.value)}
							placeholder='Enter your Facebook App ID'
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='appSecret'>App Secret</Label>
						<Input
							id='appSecret'
							type='password'
							value={appSecret}
							onChange={(e) => setAppSecret(e.target.value)}
							placeholder='Enter your Facebook App Secret'
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='author'>
							Author/Page Name/Watermark
						</Label>
						<Input
							id='author'
							type='text'
							value={author}
							onChange={(e) => setAuthor(e.target.value)}
							placeholder='Enter your name'
						/>
					</div>

					<div className='flex gap-2'>
						<Button
							onClick={handleSave}
							disabled={isLoading || (!appId && !appSecret)}>
							Save Credentials
						</Button>
						{(appId || appSecret) && (
							<Button
								variant='destructive'
								onClick={handleRemove}
								disabled={isLoading}>
								<Trash2 className='h-4 w-4 mr-2' />
								Remove
							</Button>
						)}
					</div>
				</div>

				<div className='mt-6 space-y-4'>
					<h3 className='font-semibold'>
						How to get Facebook App ID and Secret
					</h3>
					<ol className='list-decimal list-inside space-y-2 text-sm'>
						<li>
							Go to{" "}
							<Link
								href='https://developers.facebook.com'
								target='_blank'
								rel='noopener noreferrer'
								className='text-blue-600 hover:underline'>
								Facebook Developers
							</Link>
						</li>
						<li>
							Click on &quot;Get Started&quot; or &quot;My
							Apps&quot; and then &quot;Create App&quot;
						</li>
						<li>
							Create a meta for developer account (if you
							don&apos;t have one)
						</li>
						<li>
							Verify details like phone number, email, etc. and
							choose &quot;Developer&quot; in about section.
						</li>
						<li>Gave a name to your app &quot;QuoteArt&quot;</li>
						<li>Fill in your app details and create the app</li>
						<li>In use cases choose &quot;Other&quot;</li>
						<li>Choose app type as &quot;Consumer&quot;</li>
						<li>Once created, go to your app dashboard</li>
						<li>Find your App ID in the app settings</li>
						<li>
							To get your App Secret:
							<ul className='list-disc list-inside ml-4 mt-1'>
								<li>Go to Settings &gt; Basic</li>
								<li>
									Click &quot;Show&quot; next to App Secret
								</li>
								<li>
									Enter your Facebook password to reveal the
									secret
								</li>
							</ul>
						</li>
					</ol>
				</div>
			</CardContent>
		</Card>
	);
}
