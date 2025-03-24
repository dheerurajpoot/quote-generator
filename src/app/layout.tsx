import type React from "react";
import "@/app/globals.css";
import { Inter, Poppins } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { AuthProvider } from "@/context/auth-context";
import { SubscriptionProvider } from "@/context/subscription-context";
import { Toaster } from "react-hot-toast";
import { defaultMetadata } from "@/lib/metadata";

// Load Inter for Latin text
const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});

// Load Poppins which has better Devanagari support
const poppins = Poppins({
	weight: ["400", "500", "600", "700"],
	subsets: ["latin"],
	variable: "--font-poppins",
});

export const metadata = defaultMetadata;

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body
				className={`${inter.variable} ${poppins.variable} font-sans min-h-screen flex flex-col`}>
				<AuthProvider>
					<SubscriptionProvider>
						<Header />
						<main className='flex-1'>{children}</main>
						<Footer />
						<Toaster position='top-right' />
					</SubscriptionProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
