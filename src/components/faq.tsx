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
			<section className='w-full py-12 md:py-24 bg-background'>
				<div className='container mx-auto px-4 md:px-6'>
					<div className='flex flex-col items-center space-y-4 text-center mb-12'>
						<h2 className='text-3xl font-bold tracking-tighter sm:text-4xl'>
							Frequently Asked Questions
						</h2>
						<p className='mx-auto max-w-[700px] text-muted-foreground md:text-xl'>
							Find answers to common questions about QuoteArt
						</p>
					</div>

					<div className='max-w-3xl mx-auto'>
						<Accordion type='single' collapsible className='w-full'>
							<AccordionItem value='item-1'>
								<AccordionTrigger>
									What is QuoteArt?
								</AccordionTrigger>
								<AccordionContent>
									QuoteArt is an online tool that allows you
									to create beautiful quote images with custom
									backgrounds, fonts, and styles. You can use
									it to create visually appealing quotes for
									social media, blogs, presentations, and
									more.
								</AccordionContent>
							</AccordionItem>

							<AccordionItem value='item-2'>
								<AccordionTrigger>
									Is QuoteArt free to use?
								</AccordionTrigger>
								<AccordionContent>
									Yes, QuoteArt offers a free plan that allows
									you to create and download quote images with
									basic features. We also offer a Premium plan
									with advanced features like image search and
									social media sharing for ₹99/month.
								</AccordionContent>
							</AccordionItem>

							<AccordionItem value='item-3'>
								<AccordionTrigger>
									What payment methods do you accept?
								</AccordionTrigger>
								<AccordionContent>
									We accept all major credit and debit cards,
									UPI, and net banking through our secure
									payment processor, Razorpay. All
									transactions are encrypted and secure.
								</AccordionContent>
							</AccordionItem>

							<AccordionItem value='item-4'>
								<AccordionTrigger>
									Can I cancel my subscription anytime?
								</AccordionTrigger>
								<AccordionContent>
									Yes, you can cancel your Premium
									subscription at any time from your
									dashboard. You&apos;ll continue to have
									access to Premium features until the end of
									your current billing period.
								</AccordionContent>
							</AccordionItem>

							<AccordionItem value='item-5'>
								<AccordionTrigger>
									What social media platforms can I share to?
								</AccordionTrigger>
								<AccordionContent>
									Premium users can share their quote images
									directly to Facebook and Instagram.
									We&apos;re working on adding more platforms
									in the future.
								</AccordionContent>
							</AccordionItem>

							<AccordionItem value='item-6'>
								<AccordionTrigger>
									Do you support languages other than English?
								</AccordionTrigger>
								<AccordionContent>
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
			<section className='w-full py-12 md:py-24 bg-primary text-primary-foreground'>
				<div className='container mx-auto px-4 md:px-6'>
					<div className='flex flex-col items-center space-y-4 text-center'>
						<h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>
							Ready to Create Beautiful Quotes?
						</h2>
						<p className='mx-auto max-w-[700px] md:text-xl'>
							Join thousands of users creating stunning quote
							images with QuoteArt
						</p>
						<div className='space-x-4 pt-4'>
							<Button asChild size='lg' variant='secondary'>
								<Link href='#generator'>
									Start Creating{" "}
									<ArrowRight className='ml-2 h-4 w-4' />
								</Link>
							</Button>
							<Button
								asChild
								size='lg'
								variant='outline'
								className='bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10'>
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
