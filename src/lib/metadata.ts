import { Metadata } from "next";
import {
	SITE_NAME,
	SITE_DESCRIPTION,
	SITE_URL,
	SITE_IMAGE,
	SITE_TWITTER,
	SITE_AUTHOR,
	SITE_KEYWORDS,
	SITE_ICON,
} from "./constant";

export const defaultMetadata: Metadata = {
	title: {
		default: SITE_NAME,
		template: `%s | ${SITE_NAME}`,
	},
	description: SITE_DESCRIPTION,
	metadataBase: new URL(SITE_URL),
	keywords: SITE_KEYWORDS,
	icons: {
		icon: SITE_ICON,
	},
	authors: [{ name: SITE_AUTHOR }],
	creator: SITE_AUTHOR,
	openGraph: {
		type: "website",
		locale: "en_US",
		url: SITE_URL,
		title: SITE_NAME,
		description: SITE_DESCRIPTION,
		siteName: SITE_NAME,
		images: [
			{
				url: SITE_IMAGE,
				width: 1200,
				height: 630,
				alt: SITE_NAME,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: SITE_NAME,
		description: SITE_DESCRIPTION,
		images: [SITE_IMAGE],
		creator: SITE_TWITTER,
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	verification: {
		google: "your-google-site-verification", // Add your Google site verification code
	},
};
