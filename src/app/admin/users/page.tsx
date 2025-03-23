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
import { MoreHorizontal, Search, Edit, Ban, RefreshCw } from "lucide-react";
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

interface User {
	_id: string;
	name: string;
	email: string;
	role: "user" | "admin";
	isBlocked: boolean;
	createdAt: string;
}

export default function UsersPage() {
	const { user } = useAuth();
	const router = useRouter();
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [isEditUserOpen, setIsEditUserOpen] = useState(false);
	const [currentUser, setCurrentUser] = useState<User | null>(null);

	useEffect(() => {
		if (!user || user.role !== "admin") {
			router.push("/unauthorized");
			return;
		}

		fetchUsers();
	}, [user, router]);

	const fetchUsers = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await fetch("/api/users");

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to fetch users");
			}

			const data = await response.json();
			setUsers(data);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to fetch users"
			);
			toast.error("Failed to fetch users");
		} finally {
			setIsLoading(false);
		}
	};

	const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
		try {
			const response = await fetch("/api/users", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ userId, updates }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to update user");
			}

			await fetchUsers();
			toast.success("User updated successfully");
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to update user"
			);
		}
	};

	const handleDeleteUser = async (userId: string) => {
		if (!confirm("Are you sure you want to delete this user?")) {
			return;
		}

		try {
			const response = await fetch(`/api/users?userId=${userId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to delete user");
			}

			await fetchUsers();
			toast.success("User deleted successfully");
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to delete user"
			);
		}
	};

	// Filter users based on search query
	const filteredUsers = users.filter(
		(user) =>
			user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.role.toLowerCase().includes(searchQuery.toLowerCase())
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
					User Management
				</h1>
				<Button onClick={fetchUsers} variant='outline' size='icon'>
					<RefreshCw className='h-4 w-4' />
				</Button>
			</div>

			<div className='flex w-full max-w-sm items-center space-x-2'>
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

			<Card>
				<CardHeader>
					<CardTitle>All Users</CardTitle>
					<CardDescription>
						Manage user accounts, roles, and permissions
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className='text-right'>
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredUsers.map((user) => (
								<TableRow key={user._id}>
									<TableCell>
										<div className='font-medium'>
											{user.name}
										</div>
									</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>
										<Badge
											variant={
												user.role === "admin"
													? "secondary"
													: "outline"
											}>
											{user.role}
										</Badge>
									</TableCell>
									<TableCell>
										<span
											className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
												user.isBlocked
													? "bg-red-100 text-red-800"
													: "bg-green-100 text-green-800"
											}`}>
											{user.isBlocked
												? "Blocked"
												: "Active"}
										</span>
									</TableCell>
									<TableCell>
										{new Date(
											user.createdAt
										).toLocaleDateString()}
									</TableCell>
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
														handleUpdateUser(
															user._id,
															{
																isBlocked:
																	!user.isBlocked,
															}
														)
													}>
													<Ban className='mr-2 h-4 w-4' />
													{user.isBlocked
														? "Unblock"
														: "Block"}
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() =>
														handleDeleteUser(
															user._id
														)
													}>
													<Ban className='mr-2 h-4 w-4' />
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

			{/* Edit User Dialog */}
			<Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Edit User</DialogTitle>
						<DialogDescription>
							Make changes to the user. Click save when you're
							done.
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
									onValueChange={(value: "user" | "admin") =>
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
									onValueChange={(value: string) =>
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
						<Button
							type='submit'
							onClick={() => {
								if (currentUser) {
									handleUpdateUser(
										currentUser._id,
										currentUser
									);
								}
								setIsEditUserOpen(false);
							}}>
							Save changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
