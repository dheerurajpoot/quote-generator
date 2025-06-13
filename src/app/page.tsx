import Faq from "@/components/faq";
import HowItWorks from "@/components/how-it-works";
import RamdomQuotes from "@/components/random-quotes";
import Testimonial from "@/components/testimonial";
import TrendingQuotes from "@/components/trending-quotes";
import FeaturesShowcase from "@/components/features-showcase";
import StatsShowcase from "@/components/stats-showcase";
import { Button } from "@/components/ui/button";
import { ImageIcon, Type, Download, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
	return (
		<div className='min-h-screen bg-gradient-to-b from-background via-background/95 to-muted/30'>
			{/* Hero Section */}
			<section className='relative w-full py-16 md:py-20 overflow-hidden'>
				<div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent' />
				<div className='absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent' />
				<div className='container relative mx-auto px-4 md:px-6'>
					<div className='flex flex-col items-center space-y-8 text-center'>
						<div className='space-y-6 max-w-3xl'>
							<div className='inline-flex items-center rounded-full border px-3 py-1 text-sm bg-primary/10 text-primary mb-4'>
								<Sparkles className='w-4 h-4 mr-2' />
								Create stunning quotes in seconds
							</div>
							<h1 className='text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-foreground'>
								Create Beautiful Quote Images in Seconds
							</h1>
							<p className='mx-auto max-w-[700px] text-foreground/80 text-lg md:text-xl leading-relaxed'>
								Design stunning quote images with custom
								backgrounds, fonts, and styles. Perfect for
								social media, blogs, and more.
							</p>
							<div className='flex flex-col sm:flex-row gap-4 justify-center items-center mt-8'>
								<Button
									size='lg'
									className='w-full sm:w-auto px-8 py-6 text-lg  hover:opacity-90 transition-all duration-300'>
									<Link
										href='/edit'
										className='flex items-center'>
										Create Quote
									</Link>
								</Button>
								<Button
									size='lg'
									variant='outline'
									className='w-full sm:w-auto px-8 py-6 text-lg border-2 hover:bg-primary/10 transition-all duration-300'>
									<Link
										href='/auto-poster'
										className='flex items-center'>
										Auto Poster
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Showcase */}
			<FeaturesShowcase />

			{/* Random Quotes Section */}
			<section className='w-full py-16 md:py-20 relative'>
				<div className='absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent' />
				<div className='container relative mx-auto px-4 md:px-6'>
					<RamdomQuotes />
				</div>
			</section>

			{/* Trending Quotes Section */}
			<section className='w-full py-16 md:py-20 relative'>
				<div className='container mx-auto px-4 md:px-6'>
					<div className='text-center mb-16'>
						<h2 className='text-4xl font-bold tracking-tighter sm:text-5xl text-foreground mb-6'>
							Trending Quotes
						</h2>
						<p className='mx-auto max-w-[700px] text-foreground/80 text-lg md:text-xl/relaxed'>
							Discover and share inspiring quotes from around the
							world
						</p>
					</div>
					<TrendingQuotes />
				</div>
			</section>

			<HowItWorks />
			<StatsShowcase />
			<Testimonial />
			<Faq />
		</div>
	);
}
