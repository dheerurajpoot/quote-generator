"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuoteIcon, HomeIcon } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
	const { user, signOut } = useAuth();

	return (
		<header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
			<div className='container mx-auto flex h-16 items-center'>
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
						<HomeIcon className='h-4 w-4' />
						<span className='hidden md:inline'>Home</span>
					</Link>
					<Link
						href='/templates'
						className='text-sm font-medium flex items-center gap-1 transition-colors hover:text-primary'>
						<span className='hidden md:inline'>About</span>
					</Link>
					<Link
						href='/gallery'
						className='text-sm font-medium flex items-center gap-1 transition-colors hover:text-primary'>
						<span className='hidden md:inline'>Contact</span>
					</Link>
				</nav>
				<div className='flex items-center gap-2'>
					{user ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant='ghost'
									className='relative h-8 w-8 rounded-full'>
									<Avatar className='h-8 w-8'>
										<AvatarImage
											src={user.image || ""}
											alt={user.name || ""}
										/>
										<AvatarFallback>
											{user.name?.charAt(0) ||
												user.email.charAt(0)}
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								<div className='flex items-center justify-start gap-2 p-2'>
									<div className='flex flex-col space-y-1 leading-none'>
										{user.name && (
											<p className='font-medium'>
												{user.name}
											</p>
										)}
										<p className='w-[200px] truncate text-sm text-muted-foreground'>
											{user.email}
										</p>
									</div>
								</div>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href='/profile'>Profile</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href='/settings'>Settings</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className='cursor-pointer'
									onSelect={(e) => {
										e.preventDefault();
										signOut();
									}}>
									Log out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Button asChild size='sm'>
							<Link href='/login'>Sign In</Link>
						</Button>
					)}
				</div>
			</div>
		</header>
	);
}
