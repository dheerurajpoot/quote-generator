import React from "react";
import { Card, CardContent } from "./ui/card";
import { Users, Image, Share2, Zap } from "lucide-react";

const StatsShowcase = () => {
	const stats = [
		{
			icon: <Users className='w-6 h-6' />,
			value: "10K+",
			label: "Active Users",
			gradient: "from-blue-500/20 to-cyan-500/20",
		},
		{
			icon: <Image className='w-6 h-6' />,
			value: "50K+",
			label: "Quotes Created",
			gradient: "from-purple-500/20 to-pink-500/20",
		},
		{
			icon: <Share2 className='w-6 h-6' />,
			value: "100K+",
			label: "Social Shares",
			gradient: "from-orange-500/20 to-red-500/20",
		},
		{
			icon: <Zap className='w-6 h-6' />,
			value: "24/7",
			label: "Auto Posting",
			gradient: "from-yellow-500/20 to-amber-500/20",
		},
	];

	return (
		<section className='w-full py-16 md:py-20 relative overflow-hidden'>
			<div className='absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent' />
			<div className='container relative mx-auto px-4 md:px-6'>
				<div className='flex flex-col items-center space-y-6 text-center mb-16'>
					<div className='inline-flex items-center rounded-full border px-3 py-1 text-sm bg-primary/10 text-primary mb-4'>
						Stats & Highlights
					</div>
					<h2 className='text-4xl font-bold tracking-tighter sm:text-5xl text-foreground mb-6'>
						Stats & Highlights
					</h2>
					<p className='mx-auto max-w-[700px] text-foreground/80 text-lg md:text-xl'>
						Here are some stats about our users
					</p>
				</div>
				<div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
					{stats.map((stat, index) => (
						<Card
							key={index}
							className={`group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br ${stat.gradient} backdrop-blur-sm border-secondary/20`}>
							<CardContent className='p-6'>
								<div className='flex flex-col items-center text-center space-y-4'>
									<div className='p-4 rounded-xl bg-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300'>
										{stat.icon}
									</div>
									<div className='space-y-2'>
										<div className='text-4xl font-bold text-foreground'>
											{stat.value}
										</div>
										<div className='text-lg text-muted-foreground'>
											{stat.label}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
};

export default StatsShowcase;
