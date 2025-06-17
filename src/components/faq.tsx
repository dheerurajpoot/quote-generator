import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "./ui/accordion";

const Faq = () => {
	return (
		<div>
			<section className='w-full py-16 md:py-20 relative overflow-hidden'>
				<div className='absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent' />
				<div className='container relative mx-auto px-4 md:px-6'>
					<div className='flex flex-col items-center space-y-6 text-center mb-16'>
						<div className='inline-flex items-center rounded-full border px-3 py-1 text-sm bg-primary/10 text-primary mb-4'>
							FAQ
						</div>
						<h2 className='text-4xl font-bold tracking-tighter sm:text-5xl text-foreground mb-6'>
							Frequently Asked Questions
						</h2>
						<p className='mx-auto max-w-[700px] text-foreground/80 text-lg md:text-xl'>
							Find answers to common questions about QuoteArt
						</p>
					</div>

					<div className='max-w-3xl mx-auto'>
						<Accordion
							type='single'
							collapsible
							className='w-full space-y-4'>
							<AccordionItem
								value='item-1'
								className='border rounded-lg px-4 bg-gradient-to-br from-primary/5 to-transparent'>
								<AccordionTrigger className='text-lg font-semibold text-foreground hover:text-primary transition-colors'>
									What is QuoteArt?
								</AccordionTrigger>
								<AccordionContent className='text-foreground/80'>
									QuoteArt is an online tool that allows you
									to create beautiful quote images with custom
									backgrounds, fonts, and styles. You can use
									it to create visually appealing quotes for
									social media, blogs, presentations, and
									more.
								</AccordionContent>
							</AccordionItem>

							<AccordionItem
								value='item-2'
								className='border rounded-lg px-4 bg-gradient-to-br from-primary/5 to-transparent'>
								<AccordionTrigger className='text-lg font-semibold text-foreground hover:text-primary transition-colors'>
									Is QuoteArt free to use?
								</AccordionTrigger>
								<AccordionContent className='text-foreground/80'>
									Yes, QuoteArt offers a free plan that allows
									you to create and download quote images with
									basic features. We also offer a Premium plan
									with advanced features like image search and
									social media sharing for ₹99/month.
								</AccordionContent>
							</AccordionItem>

							<AccordionItem
								value='item-3'
								className='border rounded-lg px-4 bg-gradient-to-br from-primary/5 to-transparent'>
								<AccordionTrigger className='text-lg font-semibold text-foreground hover:text-primary transition-colors'>
									What payment methods do you accept?
								</AccordionTrigger>
								<AccordionContent className='text-foreground/80'>
									We accept all major credit and debit cards,
									UPI, and net banking through our secure
									payment processor, Razorpay. All
									transactions are encrypted and secure.
								</AccordionContent>
							</AccordionItem>

							<AccordionItem
								value='item-4'
								className='border rounded-lg px-4 bg-gradient-to-br from-primary/5 to-transparent'>
								<AccordionTrigger className='text-lg font-semibold text-foreground hover:text-primary transition-colors'>
									Can I cancel my subscription anytime?
								</AccordionTrigger>
								<AccordionContent className='text-foreground/80'>
									Yes, you can cancel your Premium
									subscription at any time from your
									dashboard. You&apos;ll continue to have
									access to Premium features until the end of
									your current billing period.
								</AccordionContent>
							</AccordionItem>

							<AccordionItem
								value='item-5'
								className='border rounded-lg px-4 bg-gradient-to-br from-primary/5 to-transparent'>
								<AccordionTrigger className='text-lg font-semibold text-foreground hover:text-primary transition-colors'>
									What social media platforms can I share to?
								</AccordionTrigger>
								<AccordionContent className='text-foreground/80'>
									Premium users can share their quote images
									directly to Facebook and Instagram.
									We&apos;re working on adding more platforms
									in the future.
								</AccordionContent>
							</AccordionItem>

							<AccordionItem
								value='item-6'
								className='border rounded-lg px-4 bg-gradient-to-br from-primary/5 to-transparent'>
								<AccordionTrigger className='text-lg font-semibold text-foreground hover:text-primary transition-colors'>
									Do you support languages other than English?
								</AccordionTrigger>
								<AccordionContent className='text-foreground/80'>
									Yes, QuoteArt supports multiple languages
									including Hindi and other languages that use
									the Devanagari script. Our fonts are
									selected to ensure proper display of various
									character sets.
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className='w-full py-20 md:py-32 relative overflow-hidden'>
				<div className='absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-90' />
				<div className='container relative mx-auto px-4 md:px-6'>
					<div className='flex flex-col items-center space-y-6 text-center'>
						<h2 className='text-4xl font-bold tracking-tighter sm:text-5xl text-white'>
							Ready to Create Beautiful Quotes?
						</h2>
						<p className='mx-auto max-w-[700px] text-white/90 text-lg md:text-xl'>
							Join thousands of users creating stunning quote
							images with QuoteArt
						</p>
						<div className='flex flex-col sm:flex-row gap-4 pt-4'>
							<Button
								asChild
								size='lg'
								variant='secondary'
								className='px-8 py-6 text-lg bg-white text-primary hover:bg-white/90'>
								<Link
									href='#generator'
									className='flex items-center'>
									Start Creating{" "}
									<ArrowRight className='ml-2 h-5 w-5' />
								</Link>
							</Button>
							<Button
								asChild
								size='lg'
								variant='outline'
								className='px-8 py-6 text-lg border-2 bg-primary border-white text-white hover:bg-white/10'>
								<Link href='/pricing'>View Pricing</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Faq;
