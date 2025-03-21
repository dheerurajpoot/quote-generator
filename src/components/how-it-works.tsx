import React from "react";
import { Card, CardContent } from "./ui/card";

const HowItWorks = () => {
	return (
		<section className='w-full py-12 md:py-24 bg-background'>
			<div className='container mx-auto px-4 md:px-6'>
				<div className='flex flex-col items-center space-y-4 text-center mb-12'>
					<h2 className='text-3xl font-bold tracking-tighter sm:text-4xl'>
						How It Works
					</h2>
					<p className='mx-auto max-w-[700px] text-muted-foreground md:text-xl'>
						Create stunning quote images in just three simple steps
					</p>
				</div>

				<div className='grid gap-8 md:grid-cols-3'>
					<Card className='relative'>
						<div className='absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg'>
							1
						</div>
						<CardContent className='pt-8 pb-6'>
							<h3 className='text-xl font-bold mb-2'>
								Enter Your Quote
							</h3>
							<p className='text-muted-foreground'>
								Type or paste your favorite quote and add the
								author&apos;s name if desired.
							</p>
						</CardContent>
					</Card>

					<Card className='relative'>
						<div className='absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg'>
							2
						</div>
						<CardContent className='pt-8 pb-6'>
							<h3 className='text-xl font-bold mb-2'>
								Customize Design
							</h3>
							<p className='text-muted-foreground'>
								Choose a background, adjust colors, fonts, and
								layout to match your style.
							</p>
						</CardContent>
					</Card>

					<Card className='relative'>
						<div className='absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg'>
							3
						</div>
						<CardContent className='pt-8 pb-6'>
							<h3 className='text-xl font-bold mb-2'>
								Download or Share
							</h3>
							<p className='text-muted-foreground'>
								Download your creation as a high-quality image
								or share directly to social media.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
};

export default HowItWorks;
