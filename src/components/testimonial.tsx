import React from "react";
import { AnimatedTestimonials } from "./ui/animated-testimonials";

const Testimonial = () => {
	const testimonials = [
		{
			quote: "QuoteArt has revolutionized my content creation process. I can create stunning quote images in seconds that get amazing engagement on Instagram.",
			name: "Rahun Jain",
			designation: "Social Media Manager",
			src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
		},
		{
			quote: "I love that I can create quotes in Hindi with beautiful typography. The image search feature saves me so much time finding the perfect background.",
			name: "Jessica",
			designation: "Content Creator",
			src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
		},
		{
			quote: "The direct social sharing feature is a game-changer. I can create and post to both Facebook and Instagram with just a few clicks. Highly recommended.",
			name: "Dheeru Rajpoot",
			designation: "Social Media Manager",
			src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
		},
		{
			quote: "Outstanding support and robust features. It's rare to find a product that delivers on all its promises.",
			name: "James Kim",
			designation: "Social Media Influencer",
			src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
		},
		{
			quote: "The scalability and performance have been game-changing for our organization. Highly recommend to any growing business.",
			name: "Anjum Gupta",
			designation: "Entrepreneur",
			src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
		},
	];

	return (
		<section className='w-full py-16 md:py-20 relative overflow-hidden'>
			<div className='absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent' />
			<div className='container relative mx-auto px-4 md:px-6'>
				<div className='flex flex-col items-center space-y-6 text-center'>
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

				<AnimatedTestimonials testimonials={testimonials} />
			</div>
		</section>
	);
};

export default Testimonial;
