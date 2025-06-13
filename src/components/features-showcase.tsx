import React from "react";
import { Card, CardContent } from "./ui/card";
import { ImageIcon, Type, Download, Share2, Sparkles, Zap } from "lucide-react";

const FeaturesShowcase = () => {
	const features = [
		{
			icon: <Sparkles className='w-6 h-6' />,
			title: "AI-Powered Design",
			description:
				"Smart suggestions for perfect typography and layout combinations",
			gradient: "from-purple-500/20 to-pink-500/20",
		},
		{
			icon: <ImageIcon className='w-6 h-6' />,
			title: "Beautiful Backgrounds",
			description:
				"Access to millions of high-quality images from Pexels",
			gradient: "from-blue-500/20 to-cyan-500/20",
		},
		{
			icon: <Type className='w-6 h-6' />,
			title: "Rich Typography",
			description:
				"Extensive font library with support for multiple languages",
			gradient: "from-green-500/20 to-emerald-500/20",
		},
		{
			icon: <Share2 className='w-6 h-6' />,
			title: "Social Integration",
			description: "Direct sharing to Instagram, Facebook, and more",
			gradient: "from-orange-500/20 to-red-500/20",
		},
		{
			icon: <Zap className='w-6 h-6' />,
			title: "Auto Posting",
			description: "Schedule and automate your quote posts",
			gradient: "from-yellow-500/20 to-amber-500/20",
		},
		{
			icon: <Download className='w-6 h-6' />,
			title: "Quick Export",
			description: "Download in multiple formats and resolutions",
			gradient: "from-indigo-500/20 to-violet-500/20",
		},
	];

	return (
		<section className='w-full py-16 md:py-20 relative overflow-hidden'>
			<div className='absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent' />
			<div className='container relative mx-auto px-4 md:px-6'>
				<div className='flex flex-col items-center space-y-6 text-center mb-16'>
					<div className='inline-flex items-center rounded-full border px-3 py-1 text-sm bg-primary/10 text-primary mb-4'>
						Powerful Features
					</div>
					<h2 className='text-4xl font-bold tracking-tighter sm:text-5xl text-foreground mb-6'>
						Everything You Need
					</h2>
					<p className='mx-auto max-w-[700px] text-foreground/80 text-lg md:text-xl'>
						Create stunning quote images with our powerful features
					</p>
				</div>

				<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
					{features.map((feature, index) => (
						<Card
							key={index}
							className={`group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br ${feature.gradient} backdrop-blur-sm border-primary/20`}>
							<CardContent className='p-6'>
								<div className='flex items-start space-x-4'>
									<div className='p-3 rounded-xl bg-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300'>
										{feature.icon}
									</div>
									<div className='space-y-2'>
										<h3 className='text-xl font-bold text-foreground'>
											{feature.title}
										</h3>
										<p className='text-muted-foreground'>
											{feature.description}
										</p>
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

export default FeaturesShowcase;
