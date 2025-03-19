"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuoteIcon } from "lucide-react";

export function Header() {
	return (
		<header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
			<div className='container mx-auto flex h-16 px-5 items-center'>
				<div className='flex items-center gap-2 mr-4'>
					<QuoteIcon className='h-6 w-6' />
					<Link href='/' className='font-bold text-xl'>
						QuoteArt
					</Link>
				</div>
				<nav className='flex items-center justify-center gap-4 md:gap-6 mx-6 flex-1'>
					<Link
						href='/'
						className='text-sm font-medium flex items-center gap-1 transition-colors hover:text-primary'>
						<span className='hidden md:inline'>Home</span>
					</Link>
					<Link
						href='/about'
						className='text-sm font-medium flex items-center gap-1 transition-colors hover:text-primary'>
						<span className='hidden md:inline'>About</span>
					</Link>
					<Link
						href='/contact'
						className='text-sm font-medium flex items-center gap-1 transition-colors hover:text-primary'>
						<span className='hidden md:inline'>Contact</span>
					</Link>
				</nav>
				<div className='flex items-center gap-2'>
					<Button asChild size='sm'>
						<Link href='/donate'>Donate</Link>
					</Button>
				</div>
			</div>
		</header>
	);
}
