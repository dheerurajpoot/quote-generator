import type React from "react";
import type { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export const metadata: Metadata = {
	title: "QuoteArt - Social Media Dashboard",
	description:
		"Schedule and manage your social media posts across all platforms",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<DashboardLayout>{children}</DashboardLayout>
		</>
	);
}
