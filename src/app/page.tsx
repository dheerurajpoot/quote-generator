import QuoteGenerator from "@/components/quote-generator";
import { ImageIcon, Type, Download } from "lucide-react";

export default function Home() {
	return (
		<div className='flex flex-col min-h-[calc(100vh-8rem)]'>
			<section className='w-full py-8 md:py-12 lg:py-24 bg-gradient-to-b from-background to-muted'>
				<div className='container mx-auto px-4 md:px-6'>
					<div className='flex flex-col items-center space-y-4 text-center'>
						<div className='space-y-2'>
							<h1 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl'>
								Create Beautiful Quote Images in Seconds
							</h1>
							<p className='mx-auto max-w-[700px] text-muted-foreground md:text-xl'>
								Design stunning quote images with custom
								backgrounds, fonts, and styles. Perfect for
								social media, blogs, and more.
							</p>
						</div>
					</div>
				</div>
			</section>

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
		</div>
	);
}
