import HowItWorks from "@/components/how-it-works";
import RamdomQuotes from "@/components/random-quotes";
import Testimonial from "@/components/testimonial";
import TrendingQuotes from "@/components/trending-quotes";
import FeaturesShowcase from "@/components/features-showcase";
import { Button } from "@/components/ui/button";
import {
	Facebook,
	Instagram,
	Linkedin,
	Quote,
	Sparkles,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { Cover } from "@/components/ui/cover";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
	const content = [
		{
			title: "Create Custom Quotes",
			description:
				"Write your own quotes or choose from curated templates. Express yourself with fully customizable text, styles, and backgrounds. Whether it’s motivation, love, or humor—make every quote yours. ",
			content: (
				<div className='flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] text-white'>
					<img
						src='./quote1.png'
						width={300}
						height={300}
						className='h-full w-full object-cover'
						alt='linear board demo'
					/>
				</div>
			),
		},
		{
			title: "Beautiful Quote Designs",
			description:
				"Start creating and sharing beautiful, branded quotes in minutes. Our tool helps you stay visible, grow your audience, and make an impact with your words—without the daily grind. Sign up now and let your thoughts inspire the world, even while you sleep. Choose from a wide range of stunning templates. No design skills needed! Select from professionally designed themes, fonts, and layouts to make your quotes visually captivating.",
			content: (
				<div className='flex h-full w-full items-center justify-center text-white'>
					<img
						src='./quote3.png'
						width={300}
						height={300}
						className='h-full w-full object-cover'
						alt='linear board demo'
					/>
				</div>
			),
		},
		{
			title: "Connect Your Social Media",
			description:
				"Easily link your Instagram, Facebook, Twitter, or LinkedIn. One-time connection lets the tool post on your behalf—saving you hours of manual work and helping you grow consistently.",
			content: (
				<div className='flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] text-white'>
					<img
						src='./quote2.png'
						width={300}
						height={300}
						className='h-full w-full object-cover'
						alt='linear board demo'
					/>
				</div>
			),
		},
		{
			title: "Auto-Post & Schedule Effortlessly",
			description:
				"Set it once, and we’ll post for you—daily, weekly, or custom. Stay active and consistent without lifting a finger. Let your audience see fresh, inspiring content automatically at your preferred times. Once your quote looks perfect, you connect your social media accounts like Instagram, Facebook. Finally, you schedule when you want your quotes to go live—daily, weekly, or custom—and our tool takes care of the rest. It’s like having your own content assistant, working 24/7.",
			content: (
				<div className='flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] text-white'>
					<img
						src='./quote4.png'
						width={300}
						height={300}
						className='h-full w-full object-cover'
						alt='linear board demo'
					/>
				</div>
			),
		},
	];
	return (
		<div className='bg-gradient-to-b from-background via-background/95 to-muted/30'>
			{/* Hero Section */}
			<section className='relative w-full overflow-hidden'>
				<BackgroundBeamsWithCollision className='h-auto md:min-h-[90vh]'>
					<div className='container flex flex-col md:flex-row items-center justify-between w-full h-full py-6 px-4 md:px-12'>
						{/* Left Side: Text & Buttons */}
						<div className='flex flex-col items-start justify-center my-16 text-left space-y-6 max-w-xl z-10'>
							<span className='inline-flex items-center rounded-full border px-3 py-1 text-sm bg-primary/10 text-primary mb-2 font-semibold'>
								<Sparkles /> Automate Your Social Media
							</span>
							<h2 className='text-4xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-7xl text-foreground leading-tight'>
								No Time to Post? Let <Cover>QuoteArt</Cover> Do
								It For You.
							</h2>
							<p className='text-lg md:text-xl text-foreground/80 leading-relaxed'>
								Effortlessly create, style, and{" "}
								<span className='text-primary font-bold'>
									auto-share
								</span>{" "}
								beautiful quote images. <br />
								Let our{" "}
								<span className='font-bold text-primary'>
									Auto Share System
								</span>{" "}
								post for you—so you can inspire, engage, and
								grow your audience{" "}
								<span className='font-semibold text-primary'>
									automatically
								</span>
								.
							</p>
							<div className='flex flex-col sm:flex-row gap-4 mt-4'>
								<Button size='lg' className='px-8 py-6 text-lg'>
									<Link
										href='/edit'
										className='flex items-center'>
										Create Quote
									</Link>
								</Button>
								<Button
									size='lg'
									variant='outline'
									className='px-8 py-6 text-lg border-2'>
									<Link
										href='/auto-poster'
										className='flex items-center'>
										Auto Poster
									</Link>
								</Button>
							</div>
						</div>
						{/* Right Side: Floating Quote Cards & Dashboard */}
						<div className='relative min-h-[420px] md:min-h-[520px] lg:min-h-[650px] flex items-center justify-center'>
							<div className='relative w-full max-w-xl mx-auto py-8'>
								{/* Floating Quote Cards */}
								<div className='absolute inset-0 pointer-events-none'>
									{/* Quote Card 1 - Top Left */}
									<Card className='absolute -top-16 -left-16 w-44 sm:w-56 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white transform rotate-6 hover:rotate-12 transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-purple-500/25 animate-float'>
										<CardContent className='p-4 sm:p-6'>
											<div className='flex items-start justify-between mb-3'>
												<Quote className='w-6 h-6 sm:w-8 sm:h-8 opacity-80' />
												<div className='w-2 h-2 bg-white/50 rounded-full animate-pulse'></div>
											</div>
											<p className='text-xs sm:text-sm font-medium mb-3 leading-relaxed'>
												&quot;Success is not final,
												failure is not fatal: it is the
												courage to continue that
												counts.&quot;
											</p>
											<div className='flex items-center justify-between'>
												<span className='text-xs opacity-80'>
													Winston Churchill
												</span>
												<div className='flex items-center gap-1'>
													<Instagram className='w-3 h-3 sm:w-4 sm:h-4' />
													<div className='w-1 h-1 bg-white rounded-full animate-ping'></div>
												</div>
											</div>
										</CardContent>
									</Card>

									{/* Quote Card 2 - Top Right */}
									<Card className='absolute -top-8 -right-20 w-40 sm:w-52 bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 text-white transform -rotate-3 hover:-rotate-6 transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-pink-500/25 animate-float-delayed'>
										<CardContent className='p-4 sm:p-5'>
											<div className='flex items-start justify-between mb-3'>
												<Quote className='w-5 h-5 sm:w-7 sm:h-7 opacity-80' />
												<Sparkles className='w-3 h-3 sm:w-4 sm:h-4 animate-spin-slow' />
											</div>
											<p className='text-xs sm:text-sm font-medium mb-3 leading-relaxed'>
												&quot;The only way to do great
												work is to love what you
												do.&quot;
											</p>
											<div className='flex items-center justify-between'>
												<span className='text-xs opacity-80'>
													Steve Jobs
												</span>
												<Facebook className='w-3 h-3 sm:w-4 sm:h-4' />
											</div>
										</CardContent>
									</Card>

									{/* Quote Card 3 - Bottom Left */}
									<Card className='absolute bottom-8 -left-20 w-36 sm:w-48 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 text-white transform rotate-2 hover:rotate-4 transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-emerald-500/25 animate-float-slow'>
										<CardContent className='p-3 sm:p-4'>
											<div className='flex items-center justify-between mb-2'>
												<Quote className='w-4 h-4 sm:w-6 sm:h-6 opacity-80' />
												<div className='w-2 h-2 bg-white/60 rounded-full animate-bounce'></div>
											</div>
											<p className='text-xs font-medium mb-2 leading-relaxed'>
												&quot;Innovation distinguishes
												between a leader and a
												follower.&quot;
											</p>
											<div className='flex items-center justify-between'>
												<span className='text-xs opacity-80'>
													Steve Jobs
												</span>
												<Instagram className='w-3 h-3 sm:w-4 sm:h-4' />
											</div>
										</CardContent>
									</Card>
								</div>

								{/* Central Dashboard */}
								<Card className='relative z-10 bg-white/90 backdrop-blur-xl border-0 shadow-2xl mx-6 sm:mx-12 mt-16 sm:mt-20 max-w-xs sm:max-w-sm'>
									<CardContent className='p-3 sm:p-4'>
										<div className='flex items-center justify-between mb-3'>
											<div className='flex items-center gap-2'>
												<div className='w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center'>
													<Zap className='w-3 h-3 sm:w-4 sm:h-4 text-white' />
												</div>
												<div>
													<h3 className='font-bold text-gray-900 text-xs sm:text-sm'>
														AI Quote Engine
													</h3>
													<p className='text-xs text-gray-500'>
														24/7 Active
													</p>
												</div>
											</div>
											<Badge className='bg-green-100 text-green-700 animate-pulse text-xs'>
												<div className='w-1.5 h-1.5 bg-green-500 rounded-full mr-1'></div>
												Live
											</Badge>
										</div>

										{/* Platform Status */}
										<div className='space-y-2 mb-3'>
											{[
												{
													icon: Instagram,
													name: "Instagram",
													color: "text-pink-500",
													next: "2h 15m",
													bg: "bg-pink-50",
												},
												{
													icon: Facebook,
													name: "Facebook",
													color: "text-blue-500",
													next: "1h 45m",
													bg: "bg-blue-50",
												},
												{
													icon: Linkedin,
													name: "LinkedIn",
													color: "text-blue-600",
													next: "3h 30m",
													bg: "bg-blue-50",
												},
											].map((platform) => (
												<div
													key={platform.name}
													className='flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors'>
													<div className='flex items-center gap-2'>
														<div
															className={`w-6 h-6 sm:w-7 sm:h-7 ${platform.bg} rounded-lg flex items-center justify-center`}>
															<platform.icon
																className={`w-3 h-3 sm:w-4 sm:h-4 ${platform.color}`}
															/>
														</div>
														<div>
															<span className='text-xs font-medium text-gray-900'>
																{platform.name}
															</span>
															<div className='flex items-center gap-1'>
																<div className='w-1 h-1 bg-green-500 rounded-full animate-pulse'></div>
																<span className='text-xs text-gray-500'>
																	Scheduled
																</span>
															</div>
														</div>
													</div>
													<div className='text-right'>
														<div className='text-xs font-medium text-gray-900'>
															Next in
														</div>
														<div className='text-xs text-gray-500'>
															{platform.next}
														</div>
													</div>
												</div>
											))}
										</div>

										{/* Stats Row */}
										<div className='grid grid-cols-3 gap-2 pt-3 border-t border-gray-100'>
											<div className='text-center'>
												<div className='text-sm sm:text-base font-bold text-purple-600'>
													247%
												</div>
												<div className='text-xs text-gray-500'>
													Engagement
												</div>
											</div>
											<div className='text-center'>
												<div className='text-sm sm:text-base font-bold text-pink-600'>
													10.2K
												</div>
												<div className='text-xs text-gray-500'>
													Quotes
												</div>
											</div>
											<div className='text-center'>
												<div className='text-sm sm:text-base font-bold text-emerald-600'>
													24/7
												</div>
												<div className='text-xs text-gray-500'>
													Uptime
												</div>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Floating Elements */}
								<div className='absolute top-4 right-8 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse'></div>
								<div className='absolute bottom-8 right-4 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-30 animate-bounce'></div>
								<div className='absolute top-1/2 left-2 w-6 h-6 sm:w-10 sm:h-10 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full opacity-25 animate-ping'></div>

								{/* AI Particles */}
								<div className='absolute inset-0 pointer-events-none'>
									{[...Array(6)].map((_, i) => (
										<div
											key={i}
											className='absolute w-1 h-1 bg-purple-400 rounded-full animate-float-particle opacity-60'
											style={{
												left: `${20 + i * 15}%`,
												top: `${10 + i * 12}%`,
												animationDelay: `${i * 0.5}s`,
												animationDuration: `${
													3 + i * 0.5
												}s`,
											}}></div>
									))}
								</div>
							</div>
						</div>
					</div>
				</BackgroundBeamsWithCollision>
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
			<div className='w-full py-4'>
				<StickyScroll content={content} />
			</div>
			<Testimonial />
		</div>
	);
}
