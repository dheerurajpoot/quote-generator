import React from "react";
import { FeaturesSection } from "./features";

const HowItWorks = () => {
	return (
		<section className='w-full py-16 md:py-20 relative overflow-hidden'>
			<div className='absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent' />
			<div className='container relative mx-auto px-4 md:px-6'>
				<div className='flex flex-col items-center space-y-6 text-center'>
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

				<FeaturesSection />
			</div>
		</section>
	);
};

export default HowItWorks;
