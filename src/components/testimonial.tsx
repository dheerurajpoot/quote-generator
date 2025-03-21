import React from "react";
import { Card, CardContent } from "./ui/card";

const Testimonial = () => {
	return (
		<section className='w-full py-12 md:py-24 bg-muted/30'>
			<div className='container mx-auto px-4 md:px-6'>
				<div className='flex flex-col items-center space-y-4 text-center mb-12'>
					<h2 className='text-3xl font-bold tracking-tighter sm:text-4xl'>
						What Our Users Say
					</h2>
					<p className='mx-auto max-w-[700px] text-muted-foreground md:text-xl'>
						Join thousands of satisfied users creating beautiful
						quote images
					</p>
				</div>

				<div className='grid gap-8 md:grid-cols-3'>
					<Card>
						<CardContent className='pt-6'>
							<div className='flex items-center mb-4'>
								<div className='mr-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center'>
									<span className='text-xl font-bold text-primary'>
										S
									</span>
								</div>
								<div>
									<h4 className='font-semibold'>Sarah J.</h4>
									<p className='text-sm text-muted-foreground'>
										Social Media Manager
									</p>
								</div>
							</div>
							<p className='italic'>
								&quot;QuoteArt has revolutionized my content
								creation process. I can create stunning quote
								images in seconds that get amazing engagement on
								Instagram.&quot;
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardContent className='pt-6'>
							<div className='flex items-center mb-4'>
								<div className='mr-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center'>
									<span className='text-xl font-bold text-primary'>
										R
									</span>
								</div>
								<div>
									<h4 className='font-semibold'>Rahul M.</h4>
									<p className='text-sm text-muted-foreground'>
										Content Creator
									</p>
								</div>
							</div>
							<p className='italic'>
								&quot;I love that I can create quotes in Hindi
								with beautiful typography. The image search
								feature saves me so much time finding the
								perfect background.&quot;
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardContent className='pt-6'>
							<div className='flex items-center mb-4'>
								<div className='mr-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center'>
									<span className='text-xl font-bold text-primary'>
										J
									</span>
								</div>
								<div>
									<h4 className='font-semibold'>
										Jessica T.
									</h4>
									<p className='text-sm text-muted-foreground'>
										Blogger
									</p>
								</div>
							</div>
							<p className='italic'>
								&quot;The direct social sharing feature is a
								game-changer. I can create and post to both
								Facebook and Instagram with just a few clicks.
								Highly recommended!&quot;
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
};

export default Testimonial;
