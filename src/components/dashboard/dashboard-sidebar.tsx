"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
	LayoutDashboard,
	Calendar,
	Users,
	Settings,
	Zap,
	Crown,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const navigation = [
	{
		name: "Dashboard",
		href: "/dashboard",
		icon: LayoutDashboard,
		current: true,
	},
	{
		name: "Schedule Posts",
		href: "/dashboard/schedule",
		icon: Calendar,
		current: false,
	},
	{
		name: "AutoPoster",
		href: "/dashboard/autoposter",
		icon: Zap,
		current: false,
	},
	{
		name: "Social Accounts",
		href: "/dashboard/accounts",
		icon: Users,
		current: false,
	},
];

const subscriptionItems = [
	{ name: "Subscription", href: "/dashboard/subscription", icon: Crown },
];

export function DashboardSidebar() {
	const [currentPage, setCurrentPage] = useState("Dashboard");

	return (
		<div className='flex h-full w-64 pt-18 flex-col bg-sidebar border-r border-sidebar-border'>
			<ScrollArea className='flex-1'>
				<div className='p-4 space-y-4'>
					<nav className='space-y-1'>
						{navigation.map((item) => (
							<Link key={item.name} href={item.href}>
								<Button
									variant={
										currentPage === item.name
											? "secondary"
											: "ghost"
									}
									className={cn(
										"w-full justify-start h-10 cursor-pointer",
										currentPage === item.name
											? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
											: "text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
									)}
									onClick={() => setCurrentPage(item.name)}>
									<item.icon className='mr-3 h-4 w-4' />
									{item.name}
								</Button>
							</Link>
						))}
					</nav>

					<Separator className='bg-sidebar-border' />

					<div>
						<h3 className='px-3 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider mb-2'>
							Account
						</h3>
						<nav className='space-y-1'>
							{subscriptionItems.map((item) => (
								<Link key={item.name} href={item.href}>
									<Button
										variant={
											currentPage === item.name
												? "secondary"
												: "ghost"
										}
										className={cn(
											"w-full justify-start h-10 cursor-pointer",
											currentPage === item.name
												? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
												: "text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
										)}
										onClick={() =>
											setCurrentPage(item.name)
										}>
										<item.icon className='mr-3 h-4 w-4' />
										{item.name}
									</Button>
								</Link>
							))}
						</nav>
					</div>

					<Separator className='bg-sidebar-border' />

					<div>
						<Link href='/dashboard/settings'>
							<Button
								variant='ghost'
								className='w-full justify-start h-10 text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground cursor-pointer'>
								<Settings className='mr-3 h-4 w-4' />
								Settings
							</Button>
						</Link>
					</div>
				</div>
			</ScrollArea>
		</div>
	);
}
