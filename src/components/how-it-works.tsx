import React from "react";
import { Card, CardContent } from "./ui/card";
import { PenTool, Palette, Share2, ArrowRight } from "lucide-react";

const HowItWorks = () => {
	const steps = [
		{
			icon: <PenTool className='w-6 h-6' />,
			title: "Enter Your Quote",
			description:
				"Type or paste your favorite quote and add the author's name if desired.",
			gradient: "from-blue-500/20 to-cyan-500/20",
		},
		{
			icon: <Palette className='w-6 h-6' />,
			title: "Customize Design",
			description:
				"Choose a background, adjust colors, fonts, and layout to match your style.",
			gradient: "from-purple-500/20 to-pink-500/20",
		},
		{
			icon: <Share2 className='w-6 h-6' />,
			title: "Download or Share",
			description:
				"Download your creation as a high-quality image or share directly to social media.",
			gradient: "from-orange-500/20 to-red-500/20",
		},
	];

	return (
		<section className='w-full py-16 md:py-20 relative overflow-hidden'>
			<div className='absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent' />
			<div className='container relative mx-auto px-4 md:px-6'>
				<div className='flex flex-col items-center space-y-6 text-center mb-16'>
					<div className='inline-flex items-center rounded-full border px-3 py-1 text-sm bg-primary/10 text-primary mb-4'>
						Simple Process
					</div>
					<h2 className='text-4xl font-bold tracking-tighter sm:text-5xl text-foreground mb-6'>
						How It Works
					</h2>
					<p className='mx-auto max-w-[700px] text-foreground/80 text-lg md:text-xl'>
						Create stunning quote images in just three simple steps
					</p>
				</div>

				<div className='grid gap-8 md:grid-cols-3 relative'>
					{/* Connection Lines */}
					<div className='hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 -translate-y-1/2' />

					{steps.map((step, index) => (
						<Card
							key={index}
							className={`relative group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br ${step.gradient} backdrop-blur-sm border-primary/20`}>
							<div className='absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-lg group-hover:scale-110 transition-transform duration-300'>
								{step.icon}
							</div>
							<CardContent className='pt-12 pb-8 px-6'>
								<h3 className='text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary'>
									{step.title}
								</h3>
								<p className='text-muted-foreground text-lg'>
									{step.description}
								</p>
							</CardContent>
							{index < steps.length - 1 && (
								<div className='hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-primary/40'>
									<ArrowRight className='w-8 h-8' />
								</div>
							)}
						</Card>
					))}
				</div>
			</div>
		</section>
	);
};

export default HowItWorks;
