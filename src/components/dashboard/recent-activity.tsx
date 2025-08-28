"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	MessageSquare,
	Link,
	Loader2,
	FileText,
	ImageIcon,
	Video,
} from "lucide-react";
import { format } from "date-fns";

interface Activity {
	id: string;
	type: "post" | "connection";
	title?: string;
	status?: string;
	postType?: string;
	platforms?: string[];
	platform?: string;
	profileName?: string;
	timestamp: string;
	scheduledAt?: string;
}

const typeIcons = {
	text: FileText,
	image: ImageIcon,
	video: Video,
};

export function RecentActivity() {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [activities, setActivities] = useState<Activity[]>([]);

	useEffect(() => {
		if (user?._id) {
			fetchRecentActivity();
		}
	}, [user?._id]);

	const fetchRecentActivity = async () => {
		try {
			setLoading(true);
			const response = await axios.get("/api/dashboard/recent-activity");
			if (response.data.success) {
				setActivities(response.data.activities);
			}
		} catch (error) {
			console.error("Error fetching recent activity:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<Loader2 className='h-8 w-8 animate-spin' />
			</div>
		);
	}

	if (activities.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
					<CardDescription>
						Your latest posts and account connections
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='text-center py-8 text-muted-foreground'>
						No recent activity found. Start posting to see your
						activity here!
					</div>
				</CardContent>
			</Card>
		);
	}

	const getActivityIcon = (activity: Activity) => {
		if (activity.type === "connection") {
			return <Link className='h-4 w-4' />;
		}

		if (activity.postType) {
			const TypeIcon =
				typeIcons[activity.postType as keyof typeof typeIcons] ||
				FileText;
			return <TypeIcon className='h-4 w-4' />;
		}

		return <MessageSquare className='h-4 w-4' />;
	};

	const getActivityDescription = (activity: Activity) => {
		if (activity.type === "connection") {
			return `Connected ${activity.platform} account: ${activity.profileName}`;
		}

		if (activity.type === "post") {
			const platformText =
				activity.platforms?.join(", ") || "Unknown platform";
			return `${activity.title} on ${platformText}`;
		}

		return "Unknown activity";
	};

	const getTimeAgo = (timestamp: string) => {
		const now = new Date();
		const activityTime = new Date(timestamp);
		const diffInMinutes = Math.floor(
			(now.getTime() - activityTime.getTime()) / (1000 * 60)
		);

		if (diffInMinutes < 1) return "Just now";
		if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
		if (diffInMinutes < 1440)
			return `${Math.floor(diffInMinutes / 60)}h ago`;
		return format(activityTime, "MMM d");
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent Activity</CardTitle>
				<CardDescription>
					Your latest posts and account connections
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					{activities.map((activity) => (
						<div
							key={activity.id}
							className='flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors'>
							<Avatar className='h-8 w-8'>
								<AvatarImage src='' />
								<AvatarFallback className='text-xs'>
									{getActivityIcon(activity)}
								</AvatarFallback>
							</Avatar>

							<div className='flex-1 min-w-0'>
								<div className='flex items-center space-x-2'>
									<p className='text-sm font-medium truncate'>
										{getActivityDescription(activity)}
									</p>
									{activity.type === "post" &&
										activity.status && (
											<Badge
												variant={
													activity.status === "draft"
														? "default"
														: "secondary"
												}
												className='text-xs'>
												{activity.status}
											</Badge>
										)}
								</div>

								{activity.type === "post" &&
									activity.scheduledAt && (
										<p className='text-xs text-muted-foreground mt-1'>
											Scheduled for:{" "}
											{format(
												new Date(activity.scheduledAt),
												"MMM d, yyyy h:mm a"
											)}
										</p>
									)}

								<p className='text-xs text-muted-foreground mt-1'>
									{getTimeAgo(activity.timestamp)}
								</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
