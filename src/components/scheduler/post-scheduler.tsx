"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCreator } from "./post-creator";
import { ScheduleCalendar } from "./schedule-calendar";
import { PostQueue } from "./post-queue";
import { ScheduleStats } from "./schedule-stats";
import { Plus, Calendar, List, RefreshCw } from "lucide-react";

export function PostScheduler() {
	const [activeTab, setActiveTab] = useState("create");
	const [refreshKey, setRefreshKey] = useState(0);

	const handleRefresh = useCallback(() => {
		setRefreshKey((prev) => prev + 1);
	}, []);

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-foreground'>
						Schedule Posts
					</h1>
					<p className='text-muted-foreground'>
						Create and schedule your social media content across all
						platforms.
					</p>
				</div>
				<button
					onClick={handleRefresh}
					className='p-2 hover:bg-muted rounded-md transition-colors'
					title='Refresh all data'>
					<RefreshCw className='h-5 w-5' />
				</button>
			</div>

			{/* Stats Overview */}
			<ScheduleStats />

			{/* Tabs */}
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className='space-y-4'>
				<TabsList className='grid grid-cols-3'>
					<TabsTrigger
						value='create'
						className='flex items-center gap-2'>
						<Plus className='h-4 w-4' />
						Create Post
					</TabsTrigger>
					<TabsTrigger
						value='calendar'
						className='flex items-center gap-2'>
						<Calendar className='h-4 w-4' />
						Calendar View
					</TabsTrigger>
					<TabsTrigger
						value='queue'
						className='flex items-center gap-2'>
						<List className='h-4 w-4' />
						Post Queue
					</TabsTrigger>
				</TabsList>

				<TabsContent value='create' className='space-y-4'>
					<PostCreator key={`creator-${refreshKey}`} />
				</TabsContent>

				<TabsContent value='calendar' className='space-y-4'>
					<ScheduleCalendar key={`calendar-${refreshKey}`} />
				</TabsContent>

				<TabsContent value='queue' className='space-y-4'>
					<PostQueue key={`queue-${refreshKey}`} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
