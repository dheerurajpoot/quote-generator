"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
	role: string;
	createdAt: string;
	isVerified: boolean;
	isBlocked: boolean;
}

export default function UsersPage() {
	const { user } = useAuth();
	const router = useRouter();
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery] = useState("");
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

	const handleEditUser = (user: User) => {
		setCurrentUser(user);
		setIsEditUserOpen(true);
	};

	const handleBlockUser = async (userId: string, isBlocked: boolean) => {
		try {
			await handleUpdateUser(userId, { isBlocked });
			toast.success(
				`User ${isBlocked ? "blocked" : "unblocked"} successfully`
			);
		} catch (err) {
			toast.error("Failed to update user status");
		}
	};

	// Filter users based on search query
	const filteredUsers = users.filter(
		(user) =>
			user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.email.toLowerCase().includes(searchQuery.toLowerCase())
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
		<div className='container mx-auto px-4 py-8'>
			<h1 className='text-3xl font-bold mb-8'>Users</h1>

			<div className='bg-white rounded-lg shadow overflow-hidden'>
				<table className='min-w-full divide-y divide-gray-200'>
					<thead className='bg-gray-50'>
						<tr>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Name
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Email
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Role
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Status
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Joined
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Actions
							</th>
						</tr>
					</thead>
					<tbody className='bg-white divide-y divide-gray-200'>
						{filteredUsers.map((user) => (
							<tr key={user._id}>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='text-sm font-medium text-gray-900'>
										{user.name}
									</div>
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='text-sm text-gray-500'>
										{user.email}
									</div>
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800'>
										{user.role}
									</span>
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='flex space-x-2'>
										<span
											className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
												user.isVerified
													? "bg-green-100 text-green-800"
													: "bg-yellow-100 text-yellow-800"
											}`}>
											{user.isVerified
												? "Verified"
												: "Pending"}
										</span>
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
									</div>
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
									{new Date(
										user.createdAt
									).toLocaleDateString()}
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
									<div className='flex space-x-2'>
										<button
											onClick={() => handleEditUser(user)}
											className='text-indigo-600 hover:text-indigo-900'>
											Edit
										</button>
										<button
											onClick={() =>
												handleUpdateUser(user._id, {
													isVerified:
														!user.isVerified,
												})
											}
											className='text-indigo-600 hover:text-indigo-900'>
											{user.isVerified
												? "Unverify"
												: "Verify"}
										</button>
										<button
											onClick={() =>
												handleBlockUser(
													user._id,
													!user.isBlocked
												)
											}
											className={`${
												user.isBlocked
													? "text-green-600 hover:text-green-900"
													: "text-red-600 hover:text-red-900"
											}`}>
											{user.isBlocked
												? "Unblock"
												: "Block"}
										</button>
										<button
											onClick={() =>
												handleDeleteUser(user._id)
											}
											className='text-red-600 hover:text-red-900'>
											Delete
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

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
								<Label htmlFor='name' className='text-right'>
									Name
								</Label>
								<Input
									id='name'
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
								<Label htmlFor='email' className='text-right'>
									Email
								</Label>
								<Input
									id='email'
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
								<Label htmlFor='role' className='text-right'>
									Role
								</Label>
								<Select
									value={currentUser.role}
									onValueChange={(value) =>
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
						</div>
					)}
					<DialogFooter>
						<Button
							type='submit'
							onClick={() => {
								if (currentUser) {
									handleUpdateUser(currentUser._id, {
										name: currentUser.name,
										email: currentUser.email,
										role: currentUser.role,
									});
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
