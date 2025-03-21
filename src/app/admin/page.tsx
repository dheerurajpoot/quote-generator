"use client";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import { Users, CreditCard, ImageIcon, MessageSquare } from "lucide-react";

// Sample data for charts
const userStats = [
	{ name: "Jan", total: 45 },
	{ name: "Feb", total: 78 },
	{ name: "Mar", total: 102 },
	{ name: "Apr", total: 145 },
	{ name: "May", total: 189 },
	{ name: "Jun", total: 235 },
	{ name: "Jul", total: 278 },
];

const revenueStats = [
	{ name: "Jan", total: 4500 },
	{ name: "Feb", total: 7800 },
	{ name: "Mar", total: 10200 },
	{ name: "Apr", total: 14500 },
	{ name: "May", total: 18900 },
	{ name: "Jun", total: 23500 },
	{ name: "Jul", total: 27800 },
];

export default function AdminDashboardPage() {
	return (
		<div className='space-y-6'>
			<h1 className='text-3xl font-bold tracking-tight'>
				Dashboard Overview
			</h1>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Total Users
						</CardTitle>
						<Users className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>1,234</div>
						<p className='text-xs text-muted-foreground'>
							+12% from last month
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Premium Subscribers
						</CardTitle>
						<CreditCard className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>278</div>
						<p className='text-xs text-muted-foreground'>
							+18% from last month
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Quotes Created
						</CardTitle>
						<MessageSquare className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>12,543</div>
						<p className='text-xs text-muted-foreground'>
							+24% from last month
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Images Searched
						</CardTitle>
						<ImageIcon className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>8,765</div>
						<p className='text-xs text-muted-foreground'>
							+32% from last month
						</p>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue='users'>
				<TabsList>
					<TabsTrigger value='users'>Users</TabsTrigger>
					<TabsTrigger value='revenue'>Revenue</TabsTrigger>
				</TabsList>

				<TabsContent value='users' className='space-y-4'>
					<Card>
						<CardHeader>
							<CardTitle>User Growth</CardTitle>
							<CardDescription>
								New user registrations over time
							</CardDescription>
						</CardHeader>
						<CardContent className='h-[300px]'>
							<ResponsiveContainer width='100%' height='100%'>
								<LineChart data={userStats}>
									<CartesianGrid strokeDasharray='3 3' />
									<XAxis dataKey='name' />
									<YAxis />
									<Tooltip />
									<Legend />
									<Line
										type='monotone'
										dataKey='total'
										name='New Users'
										stroke='#8884d8'
										activeDot={{ r: 8 }}
									/>
								</LineChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='revenue' className='space-y-4'>
					<Card>
						<CardHeader>
							<CardTitle>Revenue</CardTitle>
							<CardDescription>
								Monthly revenue from premium subscriptions
							</CardDescription>
						</CardHeader>
						<CardContent className='h-[300px]'>
							<ResponsiveContainer width='100%' height='100%'>
								<LineChart data={revenueStats}>
									<CartesianGrid strokeDasharray='3 3' />
									<XAxis dataKey='name' />
									<YAxis />
									<Tooltip
										formatter={(value) => [
											`₹${value}`,
											"Revenue",
										]}
									/>
									<Legend />
									<Line
										type='monotone'
										dataKey='total'
										name='Revenue (₹)'
										stroke='#82ca9d'
										activeDot={{ r: 8 }}
									/>
								</LineChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
