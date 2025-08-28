"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DashboardSidebar } from "./dashboard-sidebar";
import { Menu } from "lucide-react";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className='min-h-screen bg-background'>
			{/* Mobile sidebar */}
			<Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
				<SheetTrigger asChild>
					<Button
						variant='ghost'
						className='fixed top-4 left-4 z-40 md:hidden'
						size='icon'>
						<Menu className='h-5 w-5' />
						<span className='sr-only'>Toggle sidebar</span>
					</Button>
				</SheetTrigger>
				<SheetContent side='left' className='p-0 w-64'>
					<DashboardSidebar />
				</SheetContent>
			</Sheet>

			{/* Desktop sidebar */}
			<div className='hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col'>
				<DashboardSidebar />
			</div>

			{/* Main content */}
			<div className='md:pl-64'>
				<main className='p-6'>{children}</main>
			</div>
		</div>
	);
}
