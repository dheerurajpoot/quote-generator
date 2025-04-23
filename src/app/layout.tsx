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
			<head>
				<meta
					name='google-site-verification'
					content='3dFjjtklPvrI81RGWHubCGvKPwP0xFOD1FcHb3tZBng'
				/>
				{/* Google Analytics Script */}
				<script
					async
					src='https://www.googletagmanager.com/gtag/js?id=G-3TRBTMGL5N'
				/>
				<script
					dangerouslySetInnerHTML={{
						__html: `
							window.dataLayer = window.dataLayer || [];
							function gtag(){dataLayer.push(arguments);}
							gtag('js', new Date());
							gtag('config', 'G-3TRBTMGL5N');
						`,
					}}
				/>
				<script
					async
					src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3138751846532107'
					crossOrigin='anonymous'
				/>
			</head>
			<body
				className={`${inter.variable} ${poppins.variable} font-sans min-h-screen flex flex-col`}
				suppressHydrationWarning>
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
