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
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	MoreHorizontal,
	Search,
	UserPlus,
	Edit,
	Trash,
	Ban,
	CheckCircle,
	ShieldAlert,
	Shield,
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

// Add these type definitions right after the imports
type UserRole = "user" | "admin";
type SubscriptionTier = "free" | "premium";
type SubscriptionStatus = "active" | "canceled" | "expired";

interface User {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	isBlocked: boolean;
	subscriptionStatus: SubscriptionStatus;
	subscriptionTier: SubscriptionTier;
	createdAt: string;
}

interface NewUser {
	name: string;
	email: string;
	role: UserRole;
	subscriptionTier: SubscriptionTier;
}

// Sample user data
const sampleUsers: User[] = [
	{
		id: "1",
		name: "John Doe",
		email: "john@example.com",
		role: "user",
		isBlocked: false,
		subscriptionStatus: "active",
		subscriptionTier: "premium",
		createdAt: "2023-01-15",
	},
	{
		id: "2",
		name: "Jane Smith",
		email: "jane@example.com",
		role: "user",
		isBlocked: false,
		subscriptionStatus: "active",
		subscriptionTier: "free",
		createdAt: "2023-02-20",
	},
	{
		id: "3",
		name: "Admin User",
		email: "admin@example.com",
		role: "admin",
		isBlocked: false,
		subscriptionStatus: "active",
		subscriptionTier: "premium",
		createdAt: "2022-12-10",
	},
	{
		id: "4",
		name: "Blocked User",
		email: "blocked@example.com",
		role: "user",
		isBlocked: true,
		subscriptionStatus: "canceled",
		subscriptionTier: "free",
		createdAt: "2023-03-05",
	},
	{
		id: "5",
		name: "Sarah Johnson",
		email: "sarah@example.com",
		role: "user",
		isBlocked: false,
		subscriptionStatus: "expired",
		subscriptionTier: "free",
		createdAt: "2023-04-12",
	},
];

export default function AdminUsersPage() {
	const [users, setUsers] = useState<User[]>(sampleUsers);
	const [searchQuery, setSearchQuery] = useState("");
	const [isAddUserOpen, setIsAddUserOpen] = useState(false);
	const [isEditUserOpen, setIsEditUserOpen] = useState(false);
	const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [newUser, setNewUser] = useState<NewUser>({
		name: "",
		email: "",
		role: "user",
		subscriptionTier: "free",
	});

	// Filter users based on search query
	const filteredUsers = users.filter(
		(user) =>
			user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.email.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Handle adding a new user
	const handleAddUser = () => {
		const id = Math.random().toString(36).substr(2, 9);
		const newUserData: User = {
			id,
			...newUser,
			isBlocked: false,
			subscriptionStatus: "active" as const,
			createdAt: new Date().toISOString().split("T")[0],
		};
		setUsers([...users, newUserData]);
		setIsAddUserOpen(false);
		setNewUser({
			name: "",
			email: "",
			role: "user",
			subscriptionTier: "free",
		});
	};

	// Handle editing a user
	const handleEditUser = () => {
		if (!currentUser) return;

		const updatedUsers = users.map((user) =>
			user.id === currentUser.id ? currentUser : user
		);
		setUsers(updatedUsers);
		setIsEditUserOpen(false);
		setCurrentUser(null);
	};

	// Handle deleting a user
	const handleDeleteUser = () => {
		if (!currentUser) return;

		const updatedUsers = users.filter((user) => user.id !== currentUser.id);
		setUsers(updatedUsers);
		setIsDeleteUserOpen(false);
		setCurrentUser(null);
	};

	// Handle blocking/unblocking a user
	const handleToggleBlock = (user: User) => {
		const updatedUsers = users.map((u) =>
			u.id === user.id ? { ...u, isBlocked: !u.isBlocked } : u
		);
		setUsers(updatedUsers);
	};

	// Handle changing user role
	const handleToggleAdmin = (user: User) => {
		const updatedUsers = users.map((u) =>
			u.id === user.id
				? {
						...u,
						role: (u.role === "admin"
							? "user"
							: "admin") as UserRole,
				  }
				: u
		);
		setUsers(updatedUsers);
	};

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h1 className='text-3xl font-bold tracking-tight'>
					User Management
				</h1>
				<Button onClick={() => setIsAddUserOpen(true)}>
					<UserPlus className='mr-2 h-4 w-4' />
					Add User
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Users</CardTitle>
					<CardDescription>
						Manage user accounts, roles, and subscription status
					</CardDescription>
					<div className='flex w-full max-w-sm items-center space-x-2 mt-4'>
						<Input
							placeholder='Search users...'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='w-full'
						/>
						<Button type='submit' size='icon' variant='ghost'>
							<Search className='h-4 w-4' />
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Subscription</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className='text-right'>
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredUsers.map((user) => (
								<TableRow key={user.id}>
									<TableCell className='font-medium'>
										{user.name}
									</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>
										<Badge
											variant={
												user.role === "admin"
													? "default"
													: "outline"
											}>
											{user.role === "admin" ? (
												<ShieldAlert className='mr-1 h-3 w-3' />
											) : null}
											{user.role}
										</Badge>
									</TableCell>
									<TableCell>
										{user.isBlocked ? (
											<Badge variant='destructive'>
												Blocked
											</Badge>
										) : (
											<Badge
												variant='outline'
												className='bg-green-100 text-green-800 border-green-200'>
												Active
											</Badge>
										)}
									</TableCell>
									<TableCell>
										<Badge
											variant={
												user.subscriptionTier ===
												"premium"
													? "secondary"
													: "outline"
											}>
											{user.subscriptionTier}
										</Badge>
									</TableCell>
									<TableCell>{user.createdAt}</TableCell>
									<TableCell className='text-right'>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
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
														setCurrentUser(user);
														setIsEditUserOpen(true);
													}}>
													<Edit className='mr-2 h-4 w-4' />
													Edit
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() =>
														handleToggleAdmin(user)
													}>
													{user.role === "admin" ? (
														<>
															<Shield className='mr-2 h-4 w-4' />
															Remove Admin
														</>
													) : (
														<>
															<ShieldAlert className='mr-2 h-4 w-4' />
															Make Admin
														</>
													)}
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() =>
														handleToggleBlock(user)
													}>
													{user.isBlocked ? (
														<>
															<CheckCircle className='mr-2 h-4 w-4' />
															Unblock User
														</>
													) : (
														<>
															<Ban className='mr-2 h-4 w-4' />
															Block User
														</>
													)}
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className='text-destructive focus:text-destructive'
													onClick={() => {
														setCurrentUser(user);
														setIsDeleteUserOpen(
															true
														);
													}}>
													<Trash className='mr-2 h-4 w-4' />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Add User Dialog */}
			<Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Add New User</DialogTitle>
						<DialogDescription>
							Create a new user account. Click save when
							you&quot;re done.
						</DialogDescription>
					</DialogHeader>
					<div className='grid gap-4 py-4'>
						<div className='grid grid-cols-4 items-center gap-4'>
							<Label htmlFor='name' className='text-right'>
								Name
							</Label>
							<Input
								id='name'
								value={newUser.name}
								onChange={(e) =>
									setNewUser({
										...newUser,
										name: e.target.value,
									})
								}
								className='col-span-3'
							/>
						</div>
						<div className='grid grid-cols-4 items-center gap-4'>
							<Label htmlFor='email' className='text-right'>
								Email
							</Label>
							<Input
								id='email'
								type='email'
								value={newUser.email}
								onChange={(e) =>
									setNewUser({
										...newUser,
										email: e.target.value,
									})
								}
								className='col-span-3'
							/>
						</div>
						<div className='grid grid-cols-4 items-center gap-4'>
							<Label htmlFor='role' className='text-right'>
								Role
							</Label>
							<Select
								value={newUser.role}
								onValueChange={(value: UserRole) =>
									setNewUser({ ...newUser, role: value })
								}>
								<SelectTrigger className='col-span-3'>
									<SelectValue placeholder='Select role' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='user'>User</SelectItem>
									<SelectItem value='admin'>Admin</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className='grid grid-cols-4 items-center gap-4'>
							<Label
								htmlFor='subscription'
								className='text-right'>
								Subscription
							</Label>
							<Select
								value={newUser.subscriptionTier}
								onValueChange={(value: SubscriptionTier) =>
									setNewUser({
										...newUser,
										subscriptionTier: value,
									})
								}>
								<SelectTrigger className='col-span-3'>
									<SelectValue placeholder='Select subscription' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='free'>Free</SelectItem>
									<SelectItem value='premium'>
										Premium
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button type='submit' onClick={handleAddUser}>
							Save
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit User Dialog */}
			<Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Edit User</DialogTitle>
						<DialogDescription>
							Make changes to the user account. Click save when
							you&quot;re done.
						</DialogDescription>
					</DialogHeader>
					{currentUser && (
						<div className='grid gap-4 py-4'>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label
									htmlFor='edit-name'
									className='text-right'>
									Name
								</Label>
								<Input
									id='edit-name'
									value={currentUser.name}
									onChange={(e) =>
										setCurrentUser({
											...currentUser,
											name: e.target.value,
										})
									}
									className='col-span-3'
								/>
							</div>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label
									htmlFor='edit-email'
									className='text-right'>
									Email
								</Label>
								<Input
									id='edit-email'
									type='email'
									value={currentUser.email}
									onChange={(e) =>
										setCurrentUser({
											...currentUser,
											email: e.target.value,
										})
									}
									className='col-span-3'
								/>
							</div>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label
									htmlFor='edit-role'
									className='text-right'>
									Role
								</Label>
								<Select
									value={currentUser.role}
									onValueChange={(value: UserRole) =>
										setCurrentUser({
											...currentUser,
											role: value,
										})
									}>
									<SelectTrigger className='col-span-3'>
										<SelectValue placeholder='Select role' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='user'>
											User
										</SelectItem>
										<SelectItem value='admin'>
											Admin
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label
									htmlFor='edit-subscription'
									className='text-right'>
									Subscription
								</Label>
								<Select
									value={currentUser.subscriptionTier}
									onValueChange={(value: SubscriptionTier) =>
										setCurrentUser({
											...currentUser,
											subscriptionTier: value,
										})
									}>
									<SelectTrigger className='col-span-3'>
										<SelectValue placeholder='Select subscription' />
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
									value={
										currentUser.isBlocked
											? "blocked"
											: "active"
									}
									onValueChange={(value) =>
										setCurrentUser({
											...currentUser,
											isBlocked: value === "blocked",
										})
									}>
									<SelectTrigger className='col-span-3'>
										<SelectValue placeholder='Select status' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='active'>
											Active
										</SelectItem>
										<SelectItem value='blocked'>
											Blocked
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button type='submit' onClick={handleEditUser}>
							Save changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete User Dialog */}
			<Dialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Delete User</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this user? This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					{currentUser && (
						<div className='py-4'>
							<p>
								You are about to delete the user{" "}
								<strong>{currentUser.name}</strong> (
								{currentUser.email}).
							</p>
						</div>
					)}
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setIsDeleteUserOpen(false)}>
							Cancel
						</Button>
						<Button
							variant='destructive'
							onClick={handleDeleteUser}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
