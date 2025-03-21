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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, AlertCircle, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [success, setSuccess] = useState("");
	const [error, setError] = useState("");

	// General settings
	const [siteName, setSiteName] = useState("QuoteArt");
	const [siteDescription, setSiteDescription] = useState(
		"Create beautiful quote images in seconds"
	);
	const [contactEmail, setContactEmail] = useState("support@quoteart.com");
	const [maintenanceMode, setMaintenanceMode] = useState(false);

	// Payment settings
	const [razorpayKeyId, setRazorpayKeyId] = useState("rzp_test_123456789");
	const [razorpayKeySecret, setRazorpayKeySecret] =
		useState("••••••••••••••••");
	const [premiumPrice, setPremiumPrice] = useState("499");
	const [currency, setCurrency] = useState("INR");

	// Social settings
	const [facebookAppId, setFacebookAppId] = useState("123456789");
	const [facebookAppSecret, setFacebookAppSecret] =
		useState("••••••••••••••••");
	const [enableFacebookSharing, setEnableFacebookSharing] = useState(true);
	const [enableInstagramSharing, setEnableInstagramSharing] = useState(true);

	// Email settings
	const [smtpHost, setSmtpHost] = useState("smtp.example.com");
	const [smtpPort, setSmtpPort] = useState("587");
	const [smtpUser, setSmtpUser] = useState("notifications@quoteart.com");
	const [smtpPassword, setSmtpPassword] = useState("••••••••••••••••");
	const [emailFromName, setEmailFromName] = useState("QuoteArt Team");

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

			<Tabs defaultValue='general'>
				<TabsList>
					<TabsTrigger value='general'>General</TabsTrigger>
					<TabsTrigger value='payment'>Payment</TabsTrigger>
					<TabsTrigger value='social'>Social Media</TabsTrigger>
					<TabsTrigger value='email'>Email</TabsTrigger>
				</TabsList>

				<TabsContent value='general' className='space-y-4'>
					<Card>
						<CardHeader>
							<CardTitle>General Settings</CardTitle>
							<CardDescription>
								Configure basic site settings
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='site-name'>Site Name</Label>
								<Input
									id='site-name'
									value={siteName}
									onChange={(e) =>
										setSiteName(e.target.value)
									}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='site-description'>
									Site Description
								</Label>
								<Textarea
									id='site-description'
									value={siteDescription}
									onChange={(e) =>
										setSiteDescription(e.target.value)
									}
									rows={3}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='contact-email'>
									Contact Email
								</Label>
								<Input
									id='contact-email'
									type='email'
									value={contactEmail}
									onChange={(e) =>
										setContactEmail(e.target.value)
									}
								/>
							</div>
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
				</TabsContent>

				<TabsContent value='payment' className='space-y-4'>
					<Card>
						<CardHeader>
							<CardTitle>Payment Settings</CardTitle>
							<CardDescription>
								Configure Razorpay and subscription settings
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='razorpay-key-id'>
									Razorpay Key ID
								</Label>
								<Input
									id='razorpay-key-id'
									value={razorpayKeyId}
									onChange={(e) =>
										setRazorpayKeyId(e.target.value)
									}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='razorpay-key-secret'>
									Razorpay Key Secret
								</Label>
								<Input
									id='razorpay-key-secret'
									type='password'
									value={razorpayKeySecret}
									onChange={(e) =>
										setRazorpayKeySecret(e.target.value)
									}
								/>
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='premium-price'>
										Premium Price
									</Label>
									<Input
										id='premium-price'
										type='number'
										value={premiumPrice}
										onChange={(e) =>
											setPremiumPrice(e.target.value)
										}
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='currency'>Currency</Label>
									<Select
										value={currency}
										onValueChange={setCurrency}>
										<SelectTrigger id='currency'>
											<SelectValue placeholder='Select currency' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='INR'>
												Indian Rupee (₹)
											</SelectItem>
											<SelectItem value='USD'>
												US Dollar ($)
											</SelectItem>
											<SelectItem value='EUR'>
												Euro (€)
											</SelectItem>
											<SelectItem value='GBP'>
												British Pound (£)
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</CardContent>
						<CardFooter>
							<Button
								onClick={() => handleSaveSettings("Payment")}
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
				</TabsContent>

				<TabsContent value='social' className='space-y-4'>
					<Card>
						<CardHeader>
							<CardTitle>Social Media Settings</CardTitle>
							<CardDescription>
								Configure social media integration
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='facebook-app-id'>
									Facebook App ID
								</Label>
								<Input
									id='facebook-app-id'
									value={facebookAppId}
									onChange={(e) =>
										setFacebookAppId(e.target.value)
									}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='facebook-app-secret'>
									Facebook App Secret
								</Label>
								<Input
									id='facebook-app-secret'
									type='password'
									value={facebookAppSecret}
									onChange={(e) =>
										setFacebookAppSecret(e.target.value)
									}
								/>
							</div>
							<div className='flex items-center space-x-2'>
								<Switch
									id='enable-facebook'
									checked={enableFacebookSharing}
									onCheckedChange={setEnableFacebookSharing}
								/>
								<Label htmlFor='enable-facebook'>
									Enable Facebook Sharing
								</Label>
							</div>
							<div className='flex items-center space-x-2'>
								<Switch
									id='enable-instagram'
									checked={enableInstagramSharing}
									onCheckedChange={setEnableInstagramSharing}
								/>
								<Label htmlFor='enable-instagram'>
									Enable Instagram Sharing
								</Label>
							</div>
						</CardContent>
						<CardFooter>
							<Button
								onClick={() =>
									handleSaveSettings("Social Media")
								}
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
				</TabsContent>

				<TabsContent value='email' className='space-y-4'>
					<Card>
						<CardHeader>
							<CardTitle>Email Settings</CardTitle>
							<CardDescription>
								Configure email server settings for
								notifications
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='smtp-host'>SMTP Host</Label>
								<Input
									id='smtp-host'
									value={smtpHost}
									onChange={(e) =>
										setSmtpHost(e.target.value)
									}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='smtp-port'>SMTP Port</Label>
								<Input
									id='smtp-port'
									value={smtpPort}
									onChange={(e) =>
										setSmtpPort(e.target.value)
									}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='smtp-user'>SMTP Username</Label>
								<Input
									id='smtp-user'
									value={smtpUser}
									onChange={(e) =>
										setSmtpUser(e.target.value)
									}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='smtp-password'>
									SMTP Password
								</Label>
								<Input
									id='smtp-password'
									type='password'
									value={smtpPassword}
									onChange={(e) =>
										setSmtpPassword(e.target.value)
									}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='email-from-name'>
									From Name
								</Label>
								<Input
									id='email-from-name'
									value={emailFromName}
									onChange={(e) =>
										setEmailFromName(e.target.value)
									}
								/>
							</div>
						</CardContent>
						<CardFooter>
							<Button
								onClick={() => handleSaveSettings("Email")}
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
				</TabsContent>
			</Tabs>
		</div>
	);
}
