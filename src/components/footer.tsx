import React from "react";
import Link from "next/link";
import { QuoteIcon } from "lucide-react";
import { TextHoverEffect } from "./ui/text-hover-effect";

export function Footer() {
	return (
		<footer className='border-t pt-10'>
			<div className='container mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8'>
				<div className='flex items-center gap-2'>
					<QuoteIcon className='h-5 w-5' />
					<span className='font-semibold'>QuoteArt</span>
				</div>
				<nav className='flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground'>
					<Link
						href='/about'
						className='transition-colors hover:text-foreground'>
						About
					</Link>
					<Link
						href='/pricing'
						className='transition-colors hover:text-foreground'>
						Pricing
					</Link>
					<Link
						href='/contact'
						className='transition-colors hover:text-foreground'>
						Contact
					</Link>
					<Link
						href='/privacy'
						className='transition-colors hover:text-foreground'>
						Privacy
					</Link>
					<Link
						href='/terms'
						className='transition-colors hover:text-foreground'>
						Terms
					</Link>
					<Link
						href='/refund-policy'
						className='transition-colors hover:text-foreground'>
						Refund Policy
					</Link>
					<Link
						href='/cancellation-policy'
						className='transition-colors hover:text-foreground'>
						Cancellation Policy
					</Link>
					<Link
						href='/disclaimer'
						className='transition-colors hover:text-foreground'>
						Disclaimer
					</Link>
				</nav>
				<div className='text-sm text-muted-foreground'>
					© {new Date().getFullYear()} QuoteArt. All rights reserved.
				</div>
			</div>
			<div className='h-[5rem] md:h-[18rem] flex items-center justify-center'>
				<TextHoverEffect text='QUOTEART' />
			</div>
		</footer>
	);
}
