import type React from "react";
import "@/app/globals.css";
import { Inter, Poppins } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
// import { ThemeProvider } from "@/components/theme-provider";

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

export const metadata = {
	title: "QuoteArt - Create Beautiful Quote Images",
	description:
		"Create and customize beautiful quote images with custom backgrounds, fonts, and styles",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body
				className={`${inter.variable} ${poppins.variable} font-sans min-h-screen flex flex-col`}>
				<Header />
				<main className='flex-1'>{children}</main>
				<Footer />
			</body>
		</html>
	);
}
