import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	ArrowRight,
	Sparkles,
	Heart,
	Shield,
	Zap,
	Globe,
	Github,
	Linkedin,
	Twitter,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SparklesCore } from "@/components/ui/sparkles";

export const metadata = {
	title: "About Us - QuoteArt",
	description:
		"Learn about the QuoteArt platform and our mission to help you create beautiful quote images",
};

export default function AboutPage() {
	return (
		<div className='min-h-screen bg-gradient-to-b from-background via-background/95 to-muted/30'>
			{/* Hero Section */}
			<section className='relative w-full py-10 md:py-20 overflow-hidden'>
				<div className='absolute inset-0 z-0'>
					<SparklesCore
						background='transparent'
						particleColor='#a78bfa'
						particleDensity={80}
						speed={2}
						minSize={1}
						maxSize={2}
					/>
				</div>
				<div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent' />
				<div className='absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent' />
				<div className='container relative mx-auto px-4 md:px-6 z-10'>
					<div className='flex flex-col items-center space-y-8 text-center'>
						<div className='space-y-6 max-w-3xl'>
							<div className='inline-flex items-center rounded-full border px-3 py-1 text-sm bg-primary/10 text-primary mb-4 font-semibold shadow-sm'>
								<Sparkles className='w-4 h-4 mr-2' />
								Our Story
							</div>
							<h1 className='text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground drop-shadow-xl'>
								Transforming Words into Art
							</h1>
							<p className='mx-auto max-w-[700px] text-foreground/80 text-xl md:text-2xl leading-relaxed font-medium'>
								QuoteArt empowers you to create, style, and
								share beautiful quotes that inspire and connect.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Mission Section */}
			<section className='w-full py-10 md:py-16 relative'>
				<div className='container mx-auto px-4 md:px-6'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>
						<div className='space-y-6 relative z-10'>
							<div className='bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-primary/10'>
								<h2 className='text-3xl font-bold tracking-tighter sm:text-4xl text-foreground mb-2'>
									Our Mission
								</h2>
								<p className='text-foreground/80 text-lg leading-relaxed'>
									We believe that words have the power to
									inspire, motivate, and transform. Our
									mission is to make it easy for everyone to
									create beautiful quote images that capture
									the essence of meaningful messages.
								</p>
								<div className='flex flex-col sm:flex-row gap-4 mt-6'>
									<Button
										asChild
										size='lg'
										className='w-full sm:w-auto font-semibold'>
										<Link
											href='/edit'
											className='flex items-center'>
											Start Creating{" "}
											<ArrowRight className='ml-2 h-4 w-4' />
										</Link>
									</Button>
								</div>
							</div>
						</div>
						<div className='relative aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-primary/20'>
							<Image
								src='/img3.jpg'
								alt='Our Mission'
								fill
								className='object-cover scale-105'
								priority
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Values Section */}
			<section className='w-full py-10 md:py-16 relative'>
				<div className='container mx-auto px-4 md:px-6'>
					<div className='text-center mb-16'>
						<h2 className='text-3xl font-bold tracking-tighter sm:text-4xl text-foreground mb-4'>
							Our Values
						</h2>
						<p className='mx-auto max-w-[700px] text-foreground/80 text-lg'>
							The principles that guide everything we do
						</p>
					</div>
					<div className='flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible'>
						<Card className='min-w-[250px] border-none shadow-lg bg-gradient-to-br from-background to-muted/30 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300'>
							<CardContent className='p-6 space-y-4'>
								<div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
									<Heart className='w-6 h-6 text-primary' />
								</div>
								<h3 className='text-xl font-semibold'>
									Passion
								</h3>
								<p className='text-foreground/80'>
									We&apos;re passionate about helping people
									express themselves through beautiful quote
									images.
								</p>
							</CardContent>
						</Card>
						<Card className='min-w-[250px] border-none shadow-lg bg-gradient-to-br from-background to-muted/30 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300'>
							<CardContent className='p-6 space-y-4'>
								<div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
									<Shield className='w-6 h-6 text-primary' />
								</div>
								<h3 className='text-xl font-semibold'>Trust</h3>
								<p className='text-foreground/80'>
									We build trust through transparency,
									security, and reliable service.
								</p>
							</CardContent>
						</Card>
						<Card className='min-w-[250px] border-none shadow-lg bg-gradient-to-br from-background to-muted/30 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300'>
							<CardContent className='p-6 space-y-4'>
								<div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
									<Zap className='w-6 h-6 text-primary' />
								</div>
								<h3 className='text-xl font-semibold'>
									Innovation
								</h3>
								<p className='text-foreground/80'>
									We constantly innovate to provide the best
									tools for quote creation.
								</p>
							</CardContent>
						</Card>
						<Card className='min-w-[250px] border-none shadow-lg bg-gradient-to-br from-background to-muted/30 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300'>
							<CardContent className='p-6 space-y-4'>
								<div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
									<Globe className='w-6 h-6 text-primary' />
								</div>
								<h3 className='text-xl font-semibold'>
									Community
								</h3>
								<p className='text-foreground/80'>
									We foster a global community of creators and
									inspiration seekers.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Team Section */}
			<section className='w-full py-10 md:py-16 relative'>
				<div className='container mx-auto px-4 md:px-6'>
					<div className='text-center mb-16'>
						<h2 className='text-3xl font-bold tracking-tighter sm:text-4xl text-foreground mb-4'>
							Meet the Creator
						</h2>
						<p className='mx-auto max-w-[700px] text-foreground/80 text-lg'>
							The passionate mind behind QuoteArt
						</p>
					</div>
					<div className='max-w-2xl mx-auto'>
						<Card
							className='border-none shadow-lg bg-gradient-to-br from-background to-muted/30 hover:shadow-2xl transition-all duration-300 p-1 bg-clip-padding rounded-3xl'
							style={{
								borderImage:
									"linear-gradient(135deg, #a78bfa, #f472b6) 1",
							}}>
							<CardContent className='p-8 rounded-2xl bg-white/80 backdrop-blur-lg'>
								<div className='flex flex-col md:flex-row items-center gap-8'>
									<div className='relative w-48 h-48 rounded-full overflow-hidden border-4 border-primary/20'>
										<Image
											src='/quotearticon.png'
											alt='Dheeru Rajpoot'
											fill
											className='object-cover'
										/>
									</div>
									<div className='flex-1 text-center md:text-left space-y-4'>
										<div>
											<h3 className='text-2xl font-bold text-foreground'>
												Dheeru Rajpoot
											</h3>
											<p className='text-primary text-lg'>
												Founder & Developer
											</p>
										</div>
										<blockquote className='italic text-foreground/80 border-l-4 border-primary pl-4'>
											&quot;Design is the silent
											ambassador of your brand.&quot;
										</blockquote>
										<p className='text-foreground/80'>
											Passionate about creating tools that
											help people express themselves
											through beautiful designs. Building
											QuoteArt to make quote creation
											accessible to everyone.
										</p>
										<div className='flex justify-center md:justify-start gap-4 pt-4'>
											<Link
												href='https://github.com/yourusername'
												target='_blank'
												className='text-foreground/60 hover:text-primary transition-colors'>
												<Github className='w-6 h-6' />
											</Link>
											<Link
												href='https://www.linkedin.com/in/dheerurajpoot/'
												target='_blank'
												className='text-foreground/60 hover:text-primary transition-colors'>
												<Linkedin className='w-6 h-6' />
											</Link>
											<Link
												href='https://x.com/DheeruRajpoot3'
												target='_blank'
												className='text-foreground/60 hover:text-primary transition-colors'>
												<Twitter className='w-6 h-6' />
											</Link>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className='w-full py-10 md:py-16 relative overflow-hidden'>
				<div className='absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-90' />
				<div className='container relative mx-auto px-4 md:px-6'>
					<div className='flex flex-col items-center space-y-6 text-center'>
						<div className='backdrop-blur-xl bg-white/30 rounded-2xl p-8 shadow-2xl border border-white/20 max-w-2xl mx-auto'>
							<h2 className='text-3xl font-bold tracking-tighter sm:text-4xl text-primary drop-shadow'>
								Ready to Create Beautiful Quotes?
							</h2>
							<p className='mx-auto max-w-[700px] text-primary/90 text-lg'>
								Join thousands of users creating stunning quote
								images with QuoteArt
							</p>
							<div className='flex flex-col sm:flex-row gap-4 pt-4'>
								<Button
									asChild
									size='lg'
									variant='secondary'
									className='px-8 py-6 text-lg bg-white text-primary hover:bg-white/90 font-semibold shadow-lg'>
									<Link href='/edit'>Start Creating</Link>
								</Button>
								<Button
									asChild
									size='lg'
									variant='outline'
									className='px-8 py-6 text-lg border-2 border-white text-white hover:bg-white/10 font-semibold shadow-lg'>
									<Link href='/'>Learn More</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
