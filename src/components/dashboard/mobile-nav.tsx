"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, Facebook, Calendar, Zap } from "lucide-react";

export default function MobileBottomNav() {
	const pathname = usePathname();

	// Hide on admin pages and auth pages
	if (
		pathname?.includes("/admin") ||
		pathname?.includes("/login") ||
		pathname?.includes("/signup")
	) {
		return null;
	}

	const navItems = [
		{ icon: Home, label: "Dashboard", href: "/dashboard" },
		{ icon: Zap, label: "Autoposter", href: "/dashboard/autoposter" },
		{
			icon: Calendar,
			label: "Schedule",
			href: "/dashboard/schedule",
		},
		{
			icon: Facebook,
			label: "Connect",
			href: "/dashboard/accounts",
		},
		{
			icon: Settings,
			label: "Settings",
			href: "/dashboard/settings",
		},
	];

	return (
		<nav className='fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 md:hidden z-40'>
			<div className='flex justify-around items-center h-16'>
				{navItems.map((item, index) => {
					const Icon = item.icon;
					const isActive = pathname === item.href;
					return (
						<Link
							key={index}
							href={item.href}
							className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
								isActive
									? "text-blue-500 bg-slate-800/50"
									: "text-slate-400 hover:text-white"
							}`}>
							<Icon size={24} />
							<span className='text-xs'>{item.label}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
