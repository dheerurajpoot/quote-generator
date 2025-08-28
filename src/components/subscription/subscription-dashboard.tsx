"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useSubscription } from "@/context/subscription-context";
import axios from "axios";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
	CreditCard,
	Zap,
	Crown,
	CheckCircle,
	AlertCircle,
	Clock,
	XCircle,
	Loader2,
	RefreshCw,
} from "lucide-react";
import { format } from "date-fns";

interface Transaction {
	id: string;
	amount: number;
	currency: string;
	status: "pending" | "success" | "failed" | "cancelled";
	paymentMethod: string;
	description: string;
	planName: string;
	billingCycle: "monthly" | "annually";
	planDuration: string;
	createdAt: string;
	paidAt?: string;
}

interface PlanDetails {
	id: string;
	name: string;
	price: number;
	features: string[];
	icon: any;
	color: string;
}

const planDetails: Record<string, PlanDetails> = {
	free: {
		id: "free",
		name: "Free Plan",
		price: 0,
		features: [
			"Basic quote creation",
			"Limited backgrounds",
			"Community support",
		],
		icon: Zap,
		color: "text-yellow-500",
	},
	premium: {
		id: "premium",
		name: "Premium Plan",
		price: 299,
		features: [
			"Unlimited quotes",
			"Social media posting",
			"AI quotes",
			"Priority support",
		],
		icon: Crown,
		color: "text-blue-500",
	},
};

export function SubscriptionDashboard() {
	const { user } = useAuth();
	const {
		subscription,
		loading: subscriptionLoading,
		cancelSubscription: contextCancelSubscription,
		refreshSubscription,
	} = useSubscription();
	const [transactions, setTransactions] = useState<Transaction[]>([]);

	const [refreshing, setRefreshing] = useState(false);
	const [cancelling, setCancelling] = useState(false);

	useEffect(() => {
		if (user?._id) {
			fetchTransactionData();
		}
	}, [user?._id]);

	const fetchTransactionData = async () => {
		try {
			// Fetch transaction history
			const transResponse = await axios.get(
				`/api/subscriptions?userId=${user?._id}`
			);
			if (transResponse.data.success) {
				setTransactions(transResponse.data.subscriptions);
			}
		} catch (error) {
			console.error("Error fetching transaction data:", error);
		}
	};

	const refreshData = async () => {
		setRefreshing(true);
		await refreshSubscription();
		await fetchTransactionData();
		setRefreshing(false);
	};

	const cancelSubscription = async () => {
		if (!subscription || subscription.tier === "free") return;

		try {
			setCancelling(true);
			const success = await contextCancelSubscription();
			if (success) {
				// Refresh data
				await refreshSubscription();
				await fetchTransactionData();
			}
		} catch (error) {
			console.error("Error cancelling subscription:", error);
		} finally {
			setCancelling(false);
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "active":
				return <CheckCircle className='h-5 w-5 text-green-500' />;
			case "pending":
				return <Clock className='h-5 w-5 text-yellow-500' />;
			case "canceled":
				return <XCircle className='h-5 w-5 text-red-500' />;
			case "expired":
				return <AlertCircle className='h-5 w-5 text-red-500' />;
			default:
				return <AlertCircle className='h-5 w-5 text-gray-500' />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800";
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "canceled":
				return "bg-red-100 text-red-800";
			case "expired":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getTransactionStatusIcon = (status: string) => {
		switch (status) {
			case "success":
				return <CheckCircle className='h-4 w-4 text-green-500' />;
			case "pending":
				return <Clock className='h-4 w-4 text-yellow-500' />;
			case "failed":
				return <XCircle className='h-4 w-4 text-red-500' />;
			case "cancelled":
				return <XCircle className='h-4 w-4 text-gray-500' />;
			default:
				return <AlertCircle className='h-4 w-4 text-gray-500' />;
		}
	};

	const getValidDate = (
		dateString: string | Date | undefined
	): Date | null => {
		if (!dateString) return null;
		const date = new Date(dateString);
		return isNaN(date.getTime()) ? null : date;
	};

	const formatDate = (
		dateString: string | Date | undefined,
		formatString: string
	): string => {
		const date = getValidDate(dateString);
		return date ? format(date, formatString) : "N/A";
	};

	const currentPlan = subscription
		? planDetails[subscription.planId] || planDetails.free
		: planDetails.free;
	const daysUntilExpiry = (() => {
		const endDate = getValidDate(subscription?.currentPeriodEnd);
		if (!endDate) return 0;
		return Math.ceil(
			(endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
		);
	})();

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-foreground'>
						Subscription
					</h1>
					<p className='text-muted-foreground'>
						Manage your subscription and view payment history
					</p>
				</div>
				<Button
					onClick={refreshData}
					disabled={refreshing}
					variant='outline'>
					<RefreshCw
						className={`h-4 w-4 mr-2 ${
							refreshing ? "animate-spin" : ""
						}`}
					/>
					Refresh
				</Button>
			</div>

			{/* Current Plan Card */}
			<Card>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<div className='flex items-center space-x-3'>
							<currentPlan.icon
								className={`h-8 w-8 ${currentPlan.color}`}
							/>
							<div>
								<CardTitle className='text-2xl'>
									{currentPlan.name}
								</CardTitle>
								<CardDescription>
									{subscription?.status === "active"
										? "Your current subscription plan"
										: "Your subscription status"}
								</CardDescription>
							</div>
						</div>
						<div className='text-right'>
							<div className='text-3xl font-bold text-foreground'>
								₹{subscription?.amount || currentPlan.price}
							</div>
							<div className='text-sm text-muted-foreground'>
								{subscription?.amount === 0
									? "Free forever"
									: `per ${
											subscription?.billingCycle ===
											"annually"
												? "year"
												: "month"
									  }`}
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent className='space-y-4'>
					{/* Status and Actions */}
					<div className='flex items-center justify-between'>
						<div className='flex items-center space-x-2'>
							{getStatusIcon(subscription?.status || "inactive")}
							<Badge
								className={getStatusColor(
									subscription?.status || "inactive"
								)}>
								{(subscription?.status
									?.charAt(0)
									.toUpperCase() || "I") +
									(subscription?.status?.slice(1) ||
										"nactive")}
							</Badge>
						</div>
						<div className='flex space-x-2'>
							{subscription?.tier !== "free" &&
								subscription?.status === "active" && (
									<Button
										variant='outline'
										onClick={cancelSubscription}
										disabled={cancelling}>
										{cancelling ? (
											<>
												<Loader2 className='h-4 w-4 mr-2 animate-spin' />
												Cancelling...
											</>
										) : (
											"Cancel Subscription"
										)}
									</Button>
								)}
							<Button
								onClick={() =>
									(window.location.href = "/pricing")
								}>
								{subscription?.tier === "free"
									? "Upgrade Plan"
									: "Change Plan"}
							</Button>
						</div>
					</div>

					{/* Plan Features */}
					<div>
						<h4 className='font-semibold mb-2'>Plan Features:</h4>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
							{currentPlan.features.map((feature, index) => (
								<div
									key={index}
									className='flex items-center space-x-2'>
									<CheckCircle className='h-4 w-4 text-green-500' />
									<span className='text-sm text-muted-foreground'>
										{feature}
									</span>
								</div>
							))}
						</div>
					</div>

					{/* Subscription Details */}
					{subscription && (
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t'>
							<div>
								<div className='text-sm text-muted-foreground'>
									Started
								</div>
								<div className='font-medium'>
									{formatDate(
										subscription.createdAt,
										"MMM d, yyyy"
									)}
								</div>
							</div>
							{subscription.tier !== "free" && (
								<>
									<div>
										<div className='text-sm text-muted-foreground'>
											Current Period
										</div>
										<div className='font-medium'>
											{formatDate(
												subscription.currentPeriodStart,
												"MMM d"
											)}{" "}
											-{" "}
											{formatDate(
												subscription.currentPeriodEnd,
												"MMM d, yyyy"
											)}
										</div>
									</div>
									<div>
										<div className='text-sm text-muted-foreground'>
											Days Remaining
										</div>
										<div className='font-medium'>
											{daysUntilExpiry} days
										</div>
									</div>
								</>
							)}
						</div>
					)}

					{/* Progress Bar for Premium Plans */}
					{subscription?.tier !== "free" &&
						subscription?.currentPeriodEnd && (
							<div className='pt-4 border-t'>
								<div className='flex justify-between text-sm text-muted-foreground mb-2'>
									<span>Subscription Progress</span>
									<span>
										{daysUntilExpiry} days remaining
									</span>
								</div>
								<Progress
									value={Math.max(
										0,
										Math.min(
											100,
											(daysUntilExpiry / 30) * 100
										)
									)}
									className='h-2'
								/>
							</div>
						)}
				</CardContent>
			</Card>

			{/* Transaction History */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center space-x-2'>
						<CreditCard className='h-5 w-5' />
						<span>Payment History</span>
					</CardTitle>
					<CardDescription>
						View all your payment transactions and subscription
						history
					</CardDescription>
				</CardHeader>
				<CardContent>
					{transactions.length === 0 ? (
						<div className='text-center py-8 text-muted-foreground'>
							<CreditCard className='h-12 w-12 mx-auto mb-4 text-gray-300' />
							<p>No transactions found</p>
							<p className='text-sm'>
								Your payment history will appear here
							</p>
						</div>
					) : (
						<div className='space-y-4'>
							{transactions.map((transaction, index) => (
								<div
									key={index}
									className='flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors'>
									<div className='flex items-center space-x-3'>
										{getTransactionStatusIcon(
											transaction.status
										)}
										<div>
											<div className='font-medium'>
												{transaction.description}
											</div>
											<div className='text-sm text-muted-foreground'>
												{transaction.planName} •{" "}
												{transaction.billingCycle ===
												"monthly"
													? "1 Month"
													: "1 Year"}
											</div>
											<div className='text-xs text-muted-foreground'>
												{formatDate(
													transaction.createdAt,
													"MMM d, yyyy 'at' h:mm a"
												)}
											</div>
										</div>
									</div>
									<div className='text-right'>
										<div className='font-medium'>
											₹{transaction.amount}
										</div>
										<Badge
											variant={
												transaction.status === "success"
													? "default"
													: "secondary"
											}
											className='text-xs'>
											{transaction.status}
										</Badge>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Billing Information */}
			<Card>
				<CardHeader>
					<CardTitle>Billing Information</CardTitle>
					<CardDescription>
						Manage your billing details and payment methods
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<h4 className='font-semibold mb-2'>
								Payment Method
							</h4>
							<p className='text-sm text-muted-foreground'>
								We use UPI as our secure payment method. All
								payments are processed securely through manual
								verification.
							</p>
						</div>
						<div>
							<h4 className='font-semibold mb-2'>
								Billing Cycle
							</h4>
							<p className='text-sm text-muted-foreground'>
								{subscription?.billingCycle === "annually"
									? "Annual billing"
									: "Monthly billing"}
							</p>
						</div>
					</div>

					<Separator />

					<div className='text-center'>
						<Button
							variant='outline'
							onClick={() => (window.location.href = "/pricing")}
							className='mx-auto'>
							Manage Subscription
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
