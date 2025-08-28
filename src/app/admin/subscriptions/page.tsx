"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Users, Crown, Zap } from "lucide-react";

interface Subscription {
	_id: string;
	userId: {
		_id: string;
		name: string;
		email: string;
	};
	planId: string;
	planName: string;
	tier: "free" | "premium";
	status: "active" | "pending" | "canceled" | "expired";
	amount: number;
	billingCycle: "monthly" | "annually";
	currentPeriodStart: string;
	currentPeriodEnd: string;
	createdAt: string;
}

export default function AdminSubscriptionsPage() {
	const { user } = useAuth();
	const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		if (user) {
			fetchSubscriptions();
		}
	}, [user]);

	const fetchSubscriptions = async () => {
		try {
			// For now, we'll fetch from the pending payments to show what's available
			// In a real app, you'd have a dedicated subscriptions endpoint
			const response = await fetch(
				"/api/admin/verify-payment?status=all"
			);
			if (response.ok) {
				const data = await response.json();
				// Convert pending payments to subscription-like format
				const subscriptionData = data.payments.map((payment: any) => ({
					_id: payment._id,
					userId: payment.userId,
					planId: payment.planId,
					planName: payment.planName,
					tier: payment.planId === "free" ? "free" : "premium",
					status:
						payment.status === "verified"
							? "active"
							: payment.status,
					amount: payment.amount,
					billingCycle: payment.billingCycle,
					currentPeriodStart: payment.createdAt,
					currentPeriodEnd: payment.createdAt, // Simplified for demo
					createdAt: payment.createdAt,
				}));
				setSubscriptions(subscriptionData);
			} else {
				throw new Error("Failed to fetch subscriptions");
			}
		} catch (err: any) {
			setError(err.message || "Failed to fetch subscriptions");
		} finally {
			setLoading(false);
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return (
					<Badge className='bg-green-100 text-green-800'>
						Active
					</Badge>
				);
			case "pending":
				return (
					<Badge className='bg-yellow-100 text-yellow-800'>
						Pending
					</Badge>
				);
			case "canceled":
				return (
					<Badge className='bg-red-100 text-red-800'>Canceled</Badge>
				);
			case "expired":
				return (
					<Badge className='bg-gray-100 text-gray-800'>Expired</Badge>
				);
			default:
				return (
					<Badge className='bg-gray-100 text-gray-800'>
						{status}
					</Badge>
				);
		}
	};

	const getTierIcon = (tier: string) => {
		switch (tier) {
			case "premium":
				return <Crown className='h-4 w-4 text-blue-500' />;
			case "free":
				return <Zap className='h-4 w-4 text-yellow-500' />;
			default:
				return <Users className='h-4 w-4 text-gray-500' />;
		}
	};

	if (!user) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<Card className='w-full max-w-md'>
					<CardHeader>
						<CardTitle>Access Denied</CardTitle>
						<CardDescription>
							You need to be logged in to access this page.
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50 py-8'>
			<div className='container mx-auto px-4'>
				<div className='mb-8'>
					<h1 className='text-3xl font-bold text-gray-900 mb-2'>
						All Subscriptions
					</h1>
					<p className='text-gray-600'>
						View and manage all user subscriptions
					</p>
				</div>

				{/* Stats */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
					<Card>
						<CardContent className='p-6'>
							<div className='flex items-center space-x-2'>
								<Users className='h-8 w-8 text-blue-500' />
								<div>
									<p className='text-2xl font-bold'>
										{subscriptions.length}
									</p>
									<p className='text-sm text-gray-600'>
										Total Subscriptions
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className='p-6'>
							<div className='flex items-center space-x-2'>
								<Crown className='h-8 w-8 text-blue-500' />
								<div>
									<p className='text-2xl font-bold'>
										{
											subscriptions.filter(
												(s) => s.tier === "premium"
											).length
										}
									</p>
									<p className='text-sm text-gray-600'>
										Premium Users
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className='p-6'>
							<div className='flex items-center space-x-2'>
								<Zap className='h-8 w-8 text-yellow-500' />
								<div>
									<p className='text-2xl font-bold'>
										{
											subscriptions.filter(
												(s) => s.tier === "free"
											).length
										}
									</p>
									<p className='text-sm text-gray-600'>
										Free Users
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Error Alert */}
				{error && (
					<Alert variant='destructive' className='mb-6'>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* Subscriptions List */}
				{loading ? (
					<div className='flex items-center justify-center py-12'>
						<Loader2 className='h-8 w-8 animate-spin text-blue-600' />
					</div>
				) : subscriptions.length === 0 ? (
					<Card>
						<CardContent className='py-12 text-center'>
							<p className='text-gray-500'>
								No subscriptions found.
							</p>
						</CardContent>
					</Card>
				) : (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{subscriptions.map((subscription) => (
							<Card
								key={subscription._id}
								className='hover:shadow-lg transition-shadow'>
								<CardHeader className='pb-3'>
									<div className='flex items-start justify-between'>
										<div className='flex items-center space-x-2'>
											{getTierIcon(subscription.tier)}
											<div>
												<CardTitle className='text-lg'>
													{subscription.planName}
												</CardTitle>
												<CardDescription className='text-sm'>
													{subscription.billingCycle ===
													"monthly"
														? "Monthly"
														: "Annual"}{" "}
													Plan
												</CardDescription>
											</div>
										</div>
										{getStatusBadge(subscription.status)}
									</div>
								</CardHeader>

								<CardContent className='space-y-3'>
									<div className='grid grid-cols-2 gap-2 text-sm'>
										<div>
											<span className='text-gray-500'>
												Amount:
											</span>
											<p className='font-semibold'>
												₹{subscription.amount}
											</p>
										</div>
										<div>
											<span className='text-gray-500'>
												User:
											</span>
											<p className='font-semibold'>
												{subscription.userId.name}
											</p>
										</div>
										<div>
											<span className='text-gray-500'>
												Email:
											</span>
											<p className='font-semibold text-xs'>
												{subscription.userId.email}
											</p>
										</div>
										<div>
											<span className='text-gray-500'>
												Tier:
											</span>
											<p className='font-semibold capitalize'>
												{subscription.tier}
											</p>
										</div>
									</div>

									<div className='pt-2 border-t'>
										<div className='text-xs text-gray-500'>
											Created:{" "}
											{new Date(
												subscription.createdAt
											).toLocaleDateString()}
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
