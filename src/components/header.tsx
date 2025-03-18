import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuoteIcon, ImageIcon, DownloadIcon, HomeIcon } from "lucide-react";

export function Header() {
	return (
		<header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
			<div className='container mx-auto flex h-16 items-center'>
				<div className='flex items-center gap-2 mr-4'>
					<QuoteIcon className='h-6 w-6' />
					<Link href='/' className='font-bold text-xl'>
						QuoteArt
					</Link>
				</div>
				<nav className='flex items-center gap-4 md:gap-6 mx-6 flex-1'>
					<Link
						href='/'
						className='text-sm font-medium flex items-center gap-1 transition-colors hover:text-primary'>
						<HomeIcon className='h-4 w-4' />
						<span className='hidden md:inline'>Home</span>
					</Link>
					<Link
						href='/templates'
						className='text-sm font-medium flex items-center gap-1 transition-colors hover:text-primary'>
						<ImageIcon className='h-4 w-4' />
						<span className='hidden md:inline'>Templates</span>
					</Link>
					<Link
						href='/gallery'
						className='text-sm font-medium flex items-center gap-1 transition-colors hover:text-primary'>
						<DownloadIcon className='h-4 w-4' />
						<span className='hidden md:inline'>Gallery</span>
					</Link>
				</nav>
				<div className='flex items-center gap-2'>
					<Button size='sm'>Sign In</Button>
				</div>
			</div>
		</header>
	);
}
