import React from "react";
import { Card, CardContent } from "./ui/card";
import { Quote } from "lucide-react";

const Testimonial = () => {
	const testimonials = [
		{
			initial: "S",
			name: "Sarah J.",
			role: "Social Media Manager",
			quote: "QuoteArt has revolutionized my content creation process. I can create stunning quote images in seconds that get amazing engagement on Instagram.",
			gradient: "from-blue-500/20 to-cyan-500/20",
		},
		{
			initial: "R",
			name: "Rahul M.",
			role: "Content Creator",
			quote: "I love that I can create quotes in Hindi with beautiful typography. The image search feature saves me so much time finding the perfect background.",
			gradient: "from-purple-500/20 to-pink-500/20",
		},
		{
			initial: "J",
			name: "Jessica T.",
			role: "Blogger",
			quote: "The direct social sharing feature is a game-changer. I can create and post to both Facebook and Instagram with just a few clicks. Highly recommended!",
			gradient: "from-orange-500/20 to-red-500/20",
		},
	];

	return (
		<section className='w-full py-16 md:py-20 relative overflow-hidden'>
			<div className='absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent' />
			<div className='container relative mx-auto px-4 md:px-6'>
				<div className='flex flex-col items-center space-y-6 text-center mb-16'>
					<div className='inline-flex items-center rounded-full border bg-gray-200 px-3 py-1 text-sm mb-4'>
						User Stories
					</div>
					<h2 className='text-4xl font-bold tracking-tighter sm:text-5xl text-foreground mb-6'>
						What Our Users Say
					</h2>
					<p className='mx-auto max-w-[700px] text-foreground/80 text-lg md:text-xl'>
						Join thousands of satisfied users creating beautiful
						quote images
					</p>
				</div>

				<div className='grid gap-8 md:grid-cols-3'>
					{testimonials.map((testimonial, index) => (
						<Card
							key={index}
							className={`group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br ${testimonial.gradient} backdrop-blur-sm border-secondary/20`}>
							<CardContent className='pt-8 pb-6 px-6'>
								<Quote className='w-8 h-8 text-secondary/60 mb-4' />
								<div className='flex items-center mb-6'>
									<div className='mr-4 h-14 w-14 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
										<span className='text-xl font-bold text-white'>
											{testimonial.initial}
										</span>
									</div>
									<div>
										<h4 className='font-semibold text-lg text-foreground'>
											{testimonial.name}
										</h4>
										<p className='text-sm text-foreground/70'>
											{testimonial.role}
										</p>
									</div>
								</div>
								<p className='text-lg italic text-foreground/90'>
									&quot;{testimonial.quote}&quot;
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
};

export default Testimonial;
