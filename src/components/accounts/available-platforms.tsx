"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	MessageCircle,
	CheckCircle,
	Plus,
	Facebook,
	Instagram,
	Twitter,
	Linkedin,
} from "lucide-react";

// Available platforms data
const availablePlatforms = [
	{
		id: "facebook",
		name: "Facebook",
		icon: Facebook,
		color: "#000000",
		description: "Share posts on Facebook",
		features: [
			"Posts",
			"Images",
			"Video posts",
			"Stories",
			"Analytics",
			"Scheduling",
		],
		status: "available",
		popularity: "high",
		userBase: "1B+ users",
	},
	{
		id: "instagram",
		name: "Instagram",
		icon: Instagram,
		color: "#FF0000",
		description: "Share posts on Instagram",
		features: [
			"Posts",
			"Images",
			"Video uploads",
			"Shorts",
			"Community posts",
			"Analytics",
		],
		status: "available",
		popularity: "high",
		userBase: "2B+ users",
	},
	{
		id: "twitter",
		name: "Twitter",
		icon: Twitter,
		color: "#BD081C",
		description: "Share posts on Twitter",
		features: [
			"Posts",
			"Images",
			"Video posts",
			"Stories",
			"Analytics",
			"Scheduling",
		],
		status: "coming-soon",
		popularity: "medium",
		userBase: "450M+ users",
	},
	{
		id: "linkedin",
		name: "LinkedIn",
		icon: Linkedin,
		color: "#FFFC00",
		description: "Share posts on LinkedIn",
		features: [
			"Posts",
			"Images",
			"Video posts",
			"Stories",
			"Analytics",
			"Scheduling",
		],
		status: "coming-soon",
		popularity: "medium",
		userBase: "750M+ users",
	},
	{
		id: "reddit",
		name: "Reddit",
		icon: MessageCircle,
		color: "#FF4500",
		description:
			"Engage with communities and share content across subreddits",
		features: [
			"Posts",
			"Images",
			"Video posts",
			"Stories",
			"Analytics",
			"Scheduling",
		],
		status: "coming-soon",
		popularity: "medium",
		userBase: "430M+ users",
	},
];

const getStatusBadge = (status: string) => {
	switch (status) {
		case "available":
			return (
				<Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
					<CheckCircle className='mr-1 h-3 w-3' />
					Available
				</Badge>
			);
		case "coming-soon":
			return <Badge variant='outline'>Coming Soon</Badge>;
		default:
			return <Badge variant='outline'>Unknown</Badge>;
	}
};

const getPopularityColor = (popularity: string) => {
	switch (popularity) {
		case "high":
			return "text-green-600";
		case "medium":
			return "text-yellow-600";
		case "low":
			return "text-gray-600";
		default:
			return "text-gray-600";
	}
};

export function AvailablePlatforms() {
	return (
		<div className='space-y-6'>
			{/* Header */}
			<Card>
				<CardHeader>
					<CardTitle>Add New Platform</CardTitle>
					<CardDescription>
						Connect additional social media platforms to expand your
						reach and streamline your content management.
					</CardDescription>
				</CardHeader>
			</Card>

			{/* Platforms Grid */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				{availablePlatforms.map((platform) => (
					<Card
						key={platform.id}
						className='group hover:shadow-md transition-shadow'>
						<CardHeader>
							<div className='flex items-start justify-between'>
								<div className='flex items-center gap-3'>
									<div className='p-2 rounded-lg bg-muted'>
										<platform.icon
											className='h-6 w-6'
											style={{ color: platform.color }}
										/>
									</div>
									<div>
										<CardTitle className='text-lg'>
											{platform.name}
										</CardTitle>
										<div className='flex items-center gap-2 mt-1'>
											{getStatusBadge(platform.status)}
											<span
												className={`text-xs ${getPopularityColor(
													platform.popularity
												)}`}>
												{platform.popularity} popularity
											</span>
										</div>
									</div>
								</div>
							</div>
							<CardDescription className='mt-2'>
								{platform.description}
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							{/* User Base */}
							<div className='flex items-center justify-between text-sm'>
								<span className='text-muted-foreground'>
									User base:
								</span>
								<span className='font-medium'>
									{platform.userBase}
								</span>
							</div>

							{/* Features */}
							<div className='space-y-2'>
								<span className='text-sm font-medium'>
									Features:
								</span>
								<div className='flex flex-wrap gap-1'>
									{platform.features.map((feature) => (
										<Badge
											key={feature}
											variant='outline'
											className='text-xs'>
											{feature}
										</Badge>
									))}
								</div>
							</div>

							{/* Action Button */}
							<div className='pt-2'>
								{platform.status === "available" ? (
									<Button className='w-full cursor-pointer'>
										<Plus className='mr-2 h-4 w-4' />
										Connect {platform.name}
									</Button>
								) : (
									<Button
										variant='outline'
										className='w-full bg-transparent cursor-not-allowed'
										disabled>
										Coming Soon
									</Button>
								)}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Integration Request */}
			<Card>
				<CardHeader>
					<CardTitle>Don&apos;t see your platform?</CardTitle>
					<CardDescription>
						Request integration for additional social media
						platforms or business tools.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button variant='outline'>
						<Plus className='mr-2 h-4 w-4' />
						Request Integration
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
