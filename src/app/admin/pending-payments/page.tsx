"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

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
	amount: number;
	billingCycle: "monthly" | "annually";
	transactionId?: string;
	upiId?: string;
	status: "pending" | "active" | "canceled" | "expired" | "rejected";
	adminNotes?: string;
	verifiedBy?: {
		_id: string;
		name: string;
	};
	verifiedAt?: string;
	createdAt: string;
}

export default function PendingPaymentsPage() {
	const { user } = useAuth();
	const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [selectedSubscription, setSelectedSubscription] =
		useState<Subscription | null>(null);
	const [showVerifyDialog, setShowVerifyDialog] = useState(false);
	const [verifying, setVerifying] = useState(false);
	const [action, setAction] = useState<"approve" | "reject">("approve");
	const [adminNotes, setAdminNotes] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		"all" | "pending" | "active" | "rejected"
	>("pending");

	useEffect(() => {
		if (user) {
			fetchSubscriptions();
		}
	}, [user, statusFilter]);

	const fetchSubscriptions = async () => {
		try {
			const response = await fetch(
				`/api/admin/verify-payment?status=${statusFilter}`
			);
			if (response.ok) {
				const data = await response.json();
				setSubscriptions(data.payments);
			} else {
				throw new Error("Failed to fetch subscriptions");
			}
		} catch (err: unknown) {
			setError(
				(err as Error)?.message || "Failed to fetch subscriptions"
			);
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyPayment = async () => {
		if (!selectedSubscription) return;

		setVerifying(true);
		try {
			const response = await fetch("/api/admin/verify-payment", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					paymentId: selectedSubscription._id,
					action,
					adminNotes,
					adminId: user?._id,
				}),
			});

			if (response.ok) {
				const data = await response.json();
				setSuccess(data.message);
				setShowVerifyDialog(false);
				setSelectedSubscription(null);
				setAdminNotes("");
				fetchSubscriptions();
			} else {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to verify payment");
			}
		} catch (err: unknown) {
			setError((err as Error)?.message || "Failed to verify payment");
		} finally {
			setVerifying(false);
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "pending":
				return (
					<Badge className='bg-yellow-100 text-yellow-800'>
						Pending
					</Badge>
				);
			case "active":
				return (
					<Badge className='bg-green-100 text-green-800'>
						Active
					</Badge>
				);
			case "rejected":
				return (
					<Badge className='bg-red-100 text-red-800'>Rejected</Badge>
				);
			case "canceled":
				return (
					<Badge className='bg-gray-100 text-gray-800'>
						Canceled
					</Badge>
				);
			case "expired":
				return (
					<Badge className='bg-orange-100 text-orange-800'>
						Expired
					</Badge>
				);
			default:
				return (
					<Badge className='bg-gray-100 text-gray-800'>
						{status}
					</Badge>
				);
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "pending":
				return <Clock className='h-4 w-4 text-yellow-600' />;
			case "active":
				return <CheckCircle className='h-4 w-4 text-green-600' />;
			case "rejected":
				return <XCircle className='h-4 w-4 text-red-600' />;
			case "canceled":
				return <XCircle className='h-4 w-4 text-gray-600' />;
			case "expired":
				return <Clock className='h-4 w-4 text-orange-600' />;
			default:
				return <Clock className='h-4 w-4 text-gray-600' />;
		}
	};

	const getStatusText = (subscription: Subscription) => {
		switch (subscription.status) {
			case "pending":
				return "Awaiting verification";
			case "active":
				return `Active subscription verified by ${
					subscription.verifiedBy?.name || "Admin"
				}`;
			case "rejected":
				return `Rejected by ${
					subscription.verifiedBy?.name || "Admin"
				}`;
			case "canceled":
				return `Canceled by ${
					subscription.verifiedBy?.name || "Admin"
				}`;
			case "expired":
				return "Subscription expired";
			default:
				return "Unknown status";
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
						Subscription Management
					</h1>
					<p className='text-gray-600'>
						Manage and verify UPI payments for subscriptions
					</p>
				</div>

				{/* Status Filter */}
				<div className='mb-6'>
					<div className='flex gap-2'>
						{["all", "pending", "active", "rejected"].map(
							(status) => (
								<Button
									key={status}
									variant={
										statusFilter === status
											? "default"
											: "outline"
									}
									onClick={() =>
										setStatusFilter(
											status as
												| "all"
												| "pending"
												| "active"
												| "rejected"
										)
									}
									className='capitalize'>
									{status}
								</Button>
							)
						)}
					</div>
				</div>

				{/* Alerts */}
				{error && (
					<Alert variant='destructive' className='mb-6'>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{success && (
					<Alert className='mb-6 bg-green-50 border-green-200'>
						<CheckCircle className='h-4 w-4 text-green-600' />
						<AlertDescription className='text-green-800'>
							{success}
						</AlertDescription>
					</Alert>
				)}

				{/* Subscriptions Grid */}
				{loading ? (
					<div className='flex items-center justify-center py-12'>
						<Loader2 className='h-8 w-8 animate-spin text-blue-600' />
					</div>
				) : subscriptions.length === 0 ? (
					<Card>
						<CardContent className='py-12 text-center'>
							<p className='text-gray-500'>
								No subscriptions found for the selected status.
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
										<div>
											<CardTitle className='text-lg'>
												{subscription.planName}
											</CardTitle>
											<CardDescription className='text-sm'>
												{subscription.tier === "premium"
													? "Premium"
													: "Free"}{" "}
												-{" "}
												{subscription.billingCycle ===
												"monthly"
													? "Monthly"
													: "Annual"}{" "}
												Plan
											</CardDescription>
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
												Transaction ID:
											</span>
											<p className='font-semibold text-xs'>
												{subscription.transactionId ||
													"N/A"}
											</p>
										</div>
									</div>

									<div className='pt-2 border-t'>
										<div className='flex items-center gap-2 text-sm text-gray-500'>
											{getStatusIcon(subscription.status)}
											<span>
												{getStatusText(subscription)}
											</span>
										</div>
										{subscription.createdAt && (
											<p className='text-xs text-gray-400 mt-1'>
												Submitted:{" "}
												{new Date(
													subscription.createdAt
												).toLocaleDateString()}
											</p>
										)}
									</div>
								</CardContent>

								{subscription.status === "pending" && (
									<div className='px-6 pb-4'>
										<div className='flex gap-2'>
											<Button
												size='sm'
												onClick={() => {
													setSelectedSubscription(
														subscription
													);
													setAction("approve");
													setShowVerifyDialog(true);
												}}
												className='flex-1 bg-green-600 hover:bg-green-700'>
												<CheckCircle className='h-4 w-4 mr-1' />
												Approve
											</Button>
											<Button
												size='sm'
												variant='destructive'
												onClick={() => {
													setSelectedSubscription(
														subscription
													);
													setAction("reject");
													setShowVerifyDialog(true);
												}}
												className='flex-1'>
												<XCircle className='h-4 w-4 mr-1' />
												Reject
											</Button>
										</div>
									</div>
								)}
							</Card>
						))}
					</div>
				)}
			</div>

			{/* Verify Payment Dialog */}
			<Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{action === "approve" ? "Approve" : "Reject"}{" "}
							Subscription
						</DialogTitle>
					</DialogHeader>

					<div className='space-y-4'>
						{selectedSubscription && (
							<div className='bg-gray-50 p-4 rounded-lg'>
								<h4 className='font-semibold mb-2'>
									Subscription Details
								</h4>
								<div className='grid grid-cols-2 gap-2 text-sm'>
									<div>
										<span className='text-gray-500'>
											Plan:
										</span>
										<p className='font-semibold'>
											{selectedSubscription.planName}
										</p>
									</div>
									<div>
										<span className='text-gray-500'>
											Amount:
										</span>
										<p className='font-semibold'>
											₹{selectedSubscription.amount}
										</p>
									</div>
									<div>
										<span className='text-gray-500'>
											User:
										</span>
										<p className='font-semibold'>
											{selectedSubscription.userId.name}
										</p>
									</div>
									<div>
										<span className='text-gray-500'>
											Transaction ID:
										</span>
										<p className='font-semibold text-xs'>
											{selectedSubscription.transactionId ||
												"N/A"}
										</p>
									</div>
								</div>
							</div>
						)}

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Admin Notes
							</label>
							<Textarea
								placeholder={`Add notes for ${
									action === "approve"
										? "approval"
										: "rejection"
								}...`}
								value={adminNotes}
								onChange={(e) => setAdminNotes(e.target.value)}
								rows={3}
							/>
						</div>

						<div className='flex gap-3 pt-4'>
							<Button
								variant='outline'
								onClick={() => setShowVerifyDialog(false)}
								disabled={verifying}
								className='flex-1'>
								Cancel
							</Button>
							<Button
								onClick={handleVerifyPayment}
								disabled={verifying}
								className={`flex-1 ${
									action === "approve"
										? "bg-green-600 hover:bg-green-700"
										: "bg-red-600 hover:bg-red-700"
								}`}>
								{verifying ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Processing...
									</>
								) : (
									`${
										action === "approve"
											? "Approve"
											: "Reject"
									} Subscription`
								)}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
