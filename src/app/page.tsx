import Faq from "@/components/faq";
import HowItWorks from "@/components/how-it-works";
import QuoteGenerator from "@/components/quote-generator";
import Testimonial from "@/components/testimonial";
import { ImageIcon, Type, Download } from "lucide-react";

export default function Home() {
	return (
		<div className='flex flex-col min-h-[calc(100vh-8rem)]'>
			<section
				id='generator'
				className='w-full py-12 md:py-24 bg-muted/50'>
				<div className='container mx-auto px-4 md:px-6'>
					<QuoteGenerator />
				</div>
			</section>

			<section className='w-full py-12 md:py-24 lg:py-32'>
				<div className='container mx-auto px-4 md:px-6'>
					<div className='grid gap-6 lg:grid-cols-3 lg:gap-12 items-start'>
						<div className='flex flex-col items-center space-y-4 text-center'>
							<div className='bg-primary/10 p-3 rounded-full'>
								<ImageIcon className='h-6 w-6 text-primary' />
							</div>
							<div className='space-y-2'>
								<h3 className='text-xl font-bold'>
									Beautiful Backgrounds
								</h3>
								<p className='text-muted-foreground'>
									Choose from our collection of backgrounds or
									search for the perfect image from Pexels.
								</p>
							</div>
						</div>
						<div className='flex flex-col items-center space-y-4 text-center'>
							<div className='bg-primary/10 p-3 rounded-full'>
								<Type className='h-6 w-6 text-primary' />
							</div>
							<div className='space-y-2'>
								<h3 className='text-xl font-bold'>
									Custom Typography
								</h3>
								<p className='text-muted-foreground'>
									Customize fonts, sizes, weights, and colors.
									Full support for Hindi and other languages.
								</p>
							</div>
						</div>
						<div className='flex flex-col items-center space-y-4 text-center'>
							<div className='bg-primary/10 p-3 rounded-full'>
								<Download className='h-6 w-6 text-primary' />
							</div>
							<div className='space-y-2'>
								<h3 className='text-xl font-bold'>
									Easy Download
								</h3>
								<p className='text-muted-foreground'>
									Download your creation with one click and
									share it on social media or anywhere else.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>
			<HowItWorks />
			<Testimonial />
			<Faq />
		</div>
	);
}
