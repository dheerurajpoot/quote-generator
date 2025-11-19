"use client";

import type React from "react";

import { DashboardSidebar } from "./dashboard-sidebar";
import MobileBottomNav from "./mobile-nav";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
	return (
		<div className='min-h-screen bg-background'>
			<div className='md:hidden'>
				<MobileBottomNav />
			</div>
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
