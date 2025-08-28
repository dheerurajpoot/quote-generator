"use client";

import type React from "react";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
	Users,
	CreditCard,
	BarChart3,
	LogOut,
	Home,
	Clock,
} from "lucide-react";
import {
	SidebarProvider,
	Sidebar,
	SidebarHeader,
	SidebarContent,
	SidebarFooter,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarInset,
	SidebarTrigger,
} from "@/components/ui/sidebar";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user, isAdmin, signOut } = useAuth();
	const router = useRouter();

	const handleSignOut = async () => {
		await signOut();
		router.push("/login");
	};

	if (!user || !isAdmin()) {
		return null;
	}

	return (
		<SidebarProvider>
			<Sidebar>
				<SidebarHeader className='border-b mt-18 px-6 py-3'>
					<div className='flex items-center gap-2'>
						<h1 className='text-xl font-bold'>QuoteArt Admin</h1>
					</div>
				</SidebarHeader>
				<SidebarContent className='ml-5 mt-2'>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link href='/admin'>
									<BarChart3 className='h-4 w-4 mr-2' />
									Dashboard
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link href='/admin/users'>
									<Users className='h-4 w-4 mr-2' />
									Users
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link href='/admin/subscriptions'>
									<CreditCard className='h-4 w-4 mr-2' />
									Subscriptions
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link href='/admin/pending-payments'>
									<Clock className='h-4 w-4 mr-2' />
									Pending Payments
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarContent>
				<SidebarFooter className='border-t p-4'>
					<div className='flex flex-col gap-2'>
						<Button
							variant='outline'
							asChild
							className='justify-start'>
							<Link href='/'>
								<Home className='h-4 w-4 mr-2' />
								Back to Site
							</Link>
						</Button>
						<Button
							variant='outline'
							className='justify-start'
							onClick={handleSignOut}>
							<LogOut className='h-4 w-4 mr-2' />
							Sign Out
						</Button>
					</div>
				</SidebarFooter>
			</Sidebar>
			<SidebarInset>
				<header className='flex h-16 items-center gap-4 border-b bg-background px-6'>
					<SidebarTrigger />
					<div className='flex-1'>
						<h1 className='text-lg font-semibold'>
							Admin Dashboard
						</h1>
					</div>
					<div className='flex items-center gap-4'>
						<div className='text-sm'>
							Logged in as{" "}
							<span className='font-medium'>
								{user.name || user.email}
							</span>
						</div>
					</div>
				</header>
				<main className='flex-1 overflow-auto p-6'>{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
