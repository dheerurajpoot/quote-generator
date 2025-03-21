"use client";

import { useState } from "react";
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
import {
	MoreHorizontal,
	Search,
	Edit,
	RefreshCw,
	Ban,
	Calendar,
} from "lucide-react";
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

// Sample subscription data
const sampleSubscriptions = [
	{
		id: "sub_1",
		userId: "1",
		userName: "John Doe",
		userEmail: "john@example.com",
		planId: "premium",
		status: "active",
		currentPeriodEnd: "2023-12-15",
		createdAt: "2023-01-15",
		paymentMethod: "Credit Card",
		amount: 499,
		razorpayOrderId: "order_123456",
		razorpayPaymentId: "pay_123456",
	},
	{
		id: "sub_2",
		userId: "2",
		userName: "Jane Smith",
		userEmail: "jane@example.com",
		planId: "free",
		status: "active",
		currentPeriodEnd: "2024-02-20",
		createdAt: "2023-02-20",
		paymentMethod: "N/A",
		amount: 0,
		razorpayOrderId: null,
		razorpayPaymentId: null,
	},
	{
		id: "sub_3",
		userId: "3",
		userName: "Admin User",
		userEmail: "admin@example.com",
		planId: "premium",
		status: "active",
		currentPeriodEnd: "2023-12-10",
		createdAt: "2022-12-10",
		paymentMethod: "UPI",
		amount: 499,
		razorpayOrderId: "order_789012",
		razorpayPaymentId: "pay_789012",
	},
	{
		id: "sub_4",
		userId: "4",
		userName: "Blocked User",
		userEmail: "blocked@example.com",
		planId: "free",
		status: "canceled",
		currentPeriodEnd: "2023-04-05",
		createdAt: "2023-03-05",
		paymentMethod: "N/A",
		amount: 0,
		razorpayOrderId: null,
		razorpayPaymentId: null,
	},
	{
		id: "sub_5",
		userId: "5",
		userName: "Sarah Johnson",
		userEmail: "sarah@example.com",
		planId: "premium",
		status: "expired",
		currentPeriodEnd: "2023-05-12",
		createdAt: "2023-04-12",
		paymentMethod: "Net Banking",
		amount: 499,
		razorpayOrderId: "order_345678",
		razorpayPaymentId: "pay_345678",
	},
];

// Sample payment history
const samplePayments = [
	{
		id: "pay_123456",
		subscriptionId: "sub_1",
		userId: "1",
		userName: "John Doe",
		amount: 499,
		status: "successful",
		paymentMethod: "Credit Card",
		date: "2023-01-15",
	},
	{
		id: "pay_789012",
		subscriptionId: "sub_3",
		userId: "3",
		userName: "Admin User",
		amount: 499,
		status: "successful",
		paymentMethod: "UPI",
		date: "2022-12-10",
	},
	{
		id: "pay_345678",
		subscriptionId: "sub_5",
		userId: "5",
		userName: "Sarah Johnson",
		amount: 499,
		status: "successful",
		paymentMethod: "Net Banking",
		date: "2023-04-12",
	},
	{
		id: "pay_901234",
		subscriptionId: "sub_5",
		userId: "5",
		userName: "Sarah Johnson",
		amount: 499,
		status: "failed",
		paymentMethod: "Credit Card",
		date: "2023-05-12",
	},
];

export default function AdminSubscriptionsPage() {
	const [subscriptions, setSubscriptions] = useState(sampleSubscriptions);
	const [payments, setPayments] = useState(samplePayments);
	const [searchQuery, setSearchQuery] = useState("");
	const [isEditSubOpen, setIsEditSubOpen] = useState(false);
	const [currentSubscription, setCurrentSubscription] = useState<any>(null);
	const [activeTab, setActiveTab] = useState("subscriptions");

	// Filter subscriptions based on search query
	const filteredSubscriptions = subscriptions.filter(
		(sub) =>
			sub.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			sub.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
			sub.planId.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Filter payments based on search query
	const filteredPayments = payments.filter(
		(payment) =>
			payment.userName
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			payment.paymentMethod
				.toLowerCase()
				.includes(searchQuery.toLowerCase())
	);

	// Handle editing a subscription
	const handleEditSubscription = () => {
		if (!currentSubscription) return;

		const updatedSubscriptions = subscriptions.map((sub) =>
			sub.id === currentSubscription.id ? currentSubscription : sub
		);
		setSubscriptions(updatedSubscriptions);
		setIsEditSubOpen(false);
		setCurrentSubscription(null);
	};

	// Handle canceling a subscription
	const handleCancelSubscription = (subscription: any) => {
		const updatedSubscriptions = subscriptions.map((sub) =>
			sub.id === subscription.id ? { ...sub, status: "canceled" } : sub
		);
		setSubscriptions(updatedSubscriptions);
	};

	// Handle extending a subscription
	const handleExtendSubscription = (subscription: any) => {
		// Add 30 days to the current period end
		const currentDate = new Date(subscription.currentPeriodEnd);
		const newDate = new Date(
			currentDate.setDate(currentDate.getDate() + 30)
		);
		const formattedDate = newDate.toISOString().split("T")[0];

		const updatedSubscriptions = subscriptions.map((sub) =>
			sub.id === subscription.id
				? {
						...sub,
						currentPeriodEnd: formattedDate,
						status: "active", // Also reactivate if it was expired or canceled
				  }
				: sub
		);
		setSubscriptions(updatedSubscriptions);
	};

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
					<TabsTrigger value='payments'>Payment History</TabsTrigger>
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
										<TableHead>Payment Method</TableHead>
										<TableHead className='text-right'>
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredSubscriptions.map(
										(subscription) => (
											<TableRow key={subscription.id}>
												<TableCell>
													<div>
														<div className='font-medium'>
															{
																subscription.userName
															}
														</div>
														<div className='text-sm text-muted-foreground'>
															{
																subscription.userEmail
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
														{subscription.planId}
													</Badge>
												</TableCell>
												<TableCell>
													{subscription.status ===
													"active" ? (
														<Badge
															variant='outline'
															className='bg-green-100 text-green-800 border-green-200'>
															Active
														</Badge>
													) : subscription.status ===
													  "canceled" ? (
														<Badge
															variant='outline'
															className='bg-yellow-100 text-yellow-800 border-yellow-200'>
															Canceled
														</Badge>
													) : (
														<Badge
															variant='outline'
															className='bg-red-100 text-red-800 border-red-200'>
															Expired
														</Badge>
													)}
												</TableCell>
												<TableCell>
													{
														subscription.currentPeriodEnd
													}
												</TableCell>
												<TableCell>
													{subscription.createdAt}
												</TableCell>
												<TableCell>
													{subscription.paymentMethod}
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
																	handleExtendSubscription(
																		subscription
																	)
																}>
																<Calendar className='mr-2 h-4 w-4' />
																Extend 30 Days
															</DropdownMenuItem>
															{subscription.status ===
																"active" && (
																<DropdownMenuItem
																	onClick={() =>
																		handleCancelSubscription(
																			subscription
																		)
																	}>
																	<Ban className='mr-2 h-4 w-4' />
																	Cancel
																	Subscription
																</DropdownMenuItem>
															)}
															{subscription.status !==
																"active" && (
																<DropdownMenuItem
																	onClick={() => {
																		const updatedSubscriptions =
																			subscriptions.map(
																				(
																					sub
																				) =>
																					sub.id ===
																					subscription.id
																						? {
																								...sub,
																								status: "active",
																						  }
																						: sub
																			);
																		setSubscriptions(
																			updatedSubscriptions
																		);
																	}}>
																	<RefreshCw className='mr-2 h-4 w-4' />
																	Reactivate
																</DropdownMenuItem>
															)}
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

				<TabsContent value='payments' className='space-y-4'>
					<Card>
						<CardHeader>
							<CardTitle>Payment History</CardTitle>
							<CardDescription>
								View all payment transactions
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Payment ID</TableHead>
										<TableHead>User</TableHead>
										<TableHead>Amount</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Payment Method</TableHead>
										<TableHead>Date</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredPayments.map((payment) => (
										<TableRow key={payment.id}>
											<TableCell className='font-medium'>
												{payment.id}
											</TableCell>
											<TableCell>
												<div>
													<div>
														{payment.userName}
													</div>
													<div className='text-sm text-muted-foreground'>
														Subscription:{" "}
														{payment.subscriptionId}
													</div>
												</div>
											</TableCell>
											<TableCell>
												₹{payment.amount}
											</TableCell>
											<TableCell>
												{payment.status ===
												"successful" ? (
													<Badge
														variant='outline'
														className='bg-green-100 text-green-800 border-green-200'>
														Successful
													</Badge>
												) : (
													<Badge
														variant='outline'
														className='bg-red-100 text-red-800 border-red-200'>
														Failed
													</Badge>
												)}
											</TableCell>
											<TableCell>
												{payment.paymentMethod}
											</TableCell>
											<TableCell>
												{payment.date}
											</TableCell>
										</TableRow>
									))}
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
							you're done.
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
									onValueChange={(value) =>
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
						<Button type='submit' onClick={handleEditSubscription}>
							Save changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
