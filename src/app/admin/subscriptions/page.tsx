"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Search, Edit, Ban, Calendar } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Subscription {
	_id: string;
	userId: {
		_id: string;
		name: string;
		email: string;
	};
	planId: string;
	tier: string;
	status: string;
	currentPeriodEnd: string;
	createdAt: string;
	razorpaySubscriptionId?: string;
}

export default function SubscriptionsPage() {
	const { user } = useAuth();
	const router = useRouter();
	const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [isEditSubOpen, setIsEditSubOpen] = useState(false);
	const [currentSubscription, setCurrentSubscription] =
		useState<Subscription | null>(null);
	const [activeTab, setActiveTab] = useState("subscriptions");

	useEffect(() => {
		if (!user || user.role !== "admin") {
			router.push("/unauthorized");
			return;
		}

		fetchSubscriptions();
	}, [user, router]);

	const fetchSubscriptions = async () => {
		try {
			setIsLoading(true);
			setError(null);

			// If user is admin, fetch all subscriptions
			if (user?.role === "admin") {
				const response = await fetch("/api/subscriptions?userId=all");
				if (!response.ok) {
					const data = await response.json();
					throw new Error(
						data.error || "Failed to fetch subscriptions"
					);
				}
				const data = await response.json();
				setSubscriptions(data);
			} else {
				// If user is not admin, fetch only their subscriptions
				const response = await fetch(
					`/api/subscriptions?userId=${user?._id}`
				);
				if (!response.ok) {
					const data = await response.json();
					throw new Error(
						data.error || "Failed to fetch subscriptions"
					);
				}
				const data = await response.json();
				setSubscriptions(data);
			}
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to fetch subscriptions"
			);
			toast.error("Failed to fetch subscriptions");
		} finally {
			setIsLoading(false);
		}
	};

	const handleUpdateSubscription = async (
		subscriptionId: string,
		updates: Partial<Subscription>
	) => {
		try {
			const response = await fetch("/api/subscriptions", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ subscriptionId, updates }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to update subscription");
			}

			await fetchSubscriptions();
			toast.success("Subscription updated successfully");
		} catch (err) {
			toast.error(
				err instanceof Error
					? err.message
					: "Failed to update subscription"
			);
		}
	};

	const handleDeleteSubscription = async (subscriptionId: string) => {
		if (!confirm("Are you sure you want to delete this subscription?")) {
			return;
		}

		try {
			const response = await fetch(
				`/api/subscriptions?subscriptionId=${subscriptionId}`,
				{
					method: "DELETE",
				}
			);

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to delete subscription");
			}

			await fetchSubscriptions();
			toast.success("Subscription deleted successfully");
		} catch (err) {
			toast.error(
				err instanceof Error
					? err.message
					: "Failed to delete subscription"
			);
		}
	};

	// Filter subscriptions based on search query
	const filteredSubscriptions = subscriptions.filter(
		(sub) =>
			sub.userId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			sub.userId.email
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			sub.planId.toLowerCase().includes(searchQuery.toLowerCase())
	);

	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='text-red-500'>{error}</div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h1 className='text-3xl font-bold tracking-tight'>
					Subscription Management
				</h1>
			</div>

			<div className='flex w-full max-w-sm items-center space-x-2'>
				<Input
					placeholder='Search subscriptions...'
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className='w-full'
				/>
				<Button type='submit' size='icon' variant='ghost'>
					<Search className='h-4 w-4' />
				</Button>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value='subscriptions'>
						Subscriptions
					</TabsTrigger>
				</TabsList>

				<TabsContent value='subscriptions' className='space-y-4'>
					<Card>
						<CardHeader>
							<CardTitle>Active Subscriptions</CardTitle>
							<CardDescription>
								Manage user subscriptions, extend or cancel
								plans
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>User</TableHead>
										<TableHead>Plan</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>
											Current Period End
										</TableHead>
										<TableHead>Created</TableHead>
										<TableHead className='text-right'>
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredSubscriptions.map(
										(subscription) => (
											<TableRow key={subscription._id}>
												<TableCell>
													<div>
														<div className='font-medium'>
															{
																subscription
																	.userId.name
															}
														</div>
														<div className='text-sm text-muted-foreground'>
															{
																subscription
																	.userId
																	.email
															}
														</div>
													</div>
												</TableCell>
												<TableCell>
													<Badge
														variant={
															subscription.planId ===
															"premium"
																? "secondary"
																: "outline"
														}>
														{subscription.tier}
													</Badge>
												</TableCell>
												<TableCell>
													<span
														className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
															subscription.status ===
															"active"
																? "bg-green-100 text-green-800"
																: subscription.status ===
																  "canceled"
																? "bg-yellow-100 text-yellow-800"
																: "bg-red-100 text-red-800"
														}`}>
														{subscription.status}
													</span>
												</TableCell>
												<TableCell>
													{new Date(
														subscription.currentPeriodEnd
													).toLocaleDateString()}
												</TableCell>
												<TableCell>
													{new Date(
														subscription.createdAt
													).toLocaleDateString()}
												</TableCell>
												<TableCell className='text-right'>
													<DropdownMenu>
														<DropdownMenuTrigger
															asChild>
															<Button
																variant='ghost'
																className='h-8 w-8 p-0'>
																<span className='sr-only'>
																	Open menu
																</span>
																<MoreHorizontal className='h-4 w-4' />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align='end'>
															<DropdownMenuLabel>
																Actions
															</DropdownMenuLabel>
															<DropdownMenuItem
																onClick={() => {
																	setCurrentSubscription(
																		subscription
																	);
																	setIsEditSubOpen(
																		true
																	);
																}}>
																<Edit className='mr-2 h-4 w-4' />
																Edit
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() =>
																	handleUpdateSubscription(
																		subscription._id,
																		{
																			status:
																				subscription.status ===
																				"active"
																					? "canceled"
																					: "active",
																		}
																	)
																}>
																<Calendar className='mr-2 h-4 w-4' />
																{subscription.status ===
																"active"
																	? "Cancel"
																	: "Activate"}
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() =>
																	handleDeleteSubscription(
																		subscription._id
																	)
																}>
																<Ban className='mr-2 h-4 w-4' />
																Delete
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										)
									)}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Edit Subscription Dialog */}
			<Dialog open={isEditSubOpen} onOpenChange={setIsEditSubOpen}>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Edit Subscription</DialogTitle>
						<DialogDescription>
							Make changes to the subscription. Click save when
							you&quot;re done.
						</DialogDescription>
					</DialogHeader>
					{currentSubscription && (
						<div className='grid gap-4 py-4'>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label
									htmlFor='edit-plan'
									className='text-right'>
									Plan
								</Label>
								<Select
									value={currentSubscription.planId}
									onValueChange={(value) =>
										setCurrentSubscription({
											...currentSubscription,
											planId: value,
										})
									}>
									<SelectTrigger className='col-span-3'>
										<SelectValue placeholder='Select plan' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='free'>
											Free
										</SelectItem>
										<SelectItem value='premium'>
											Premium
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label
									htmlFor='edit-status'
									className='text-right'>
									Status
								</Label>
								<Select
									value={currentSubscription.status}
									onValueChange={(value: string) =>
										setCurrentSubscription({
											...currentSubscription,
											status: value,
										})
									}>
									<SelectTrigger className='col-span-3'>
										<SelectValue placeholder='Select status' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='active'>
											Active
										</SelectItem>
										<SelectItem value='canceled'>
											Canceled
										</SelectItem>
										<SelectItem value='expired'>
											Expired
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label
									htmlFor='edit-end-date'
									className='text-right'>
									End Date
								</Label>
								<Input
									id='edit-end-date'
									type='date'
									value={currentSubscription.currentPeriodEnd}
									onChange={(e) =>
										setCurrentSubscription({
											...currentSubscription,
											currentPeriodEnd: e.target.value,
										})
									}
									className='col-span-3'
								/>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button
							type='submit'
							onClick={() => {
								if (currentSubscription) {
									handleUpdateSubscription(
										currentSubscription._id,
										currentSubscription
									);
								}
								setIsEditSubOpen(false);
							}}>
							Save changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
