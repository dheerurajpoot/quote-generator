"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuoteIcon } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useSubscription } from "@/context/subscription-context";
import { useSubscriptionControl } from "@/hooks/useSubscriptionControl";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Header() {
	const { user, signOut, isAdmin } = useAuth();
	const { isSubscribed } = useSubscription();
	const { isEnabled: isSubscriptionEnabled } = useSubscriptionControl();

	return (
		<header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
			<div className='container mx-auto px-5 flex h-16 items-center'>
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
					{isSubscriptionEnabled && (
						<Link
							href='/pricing'
							className='text-sm font-medium flex items-center gap-1 transition-colors hover:text-primary'>
							<span className='hidden md:inline'>Pricing</span>
						</Link>
					)}
					{isAdmin() && (
						<Link
							href='/admin'
							className='text-sm font-medium flex items-center gap-1 transition-colors hover:text-primary'>
							<span className='hidden md:inline'>
								Admin Panel
							</span>
						</Link>
					)}
				</nav>
				<div className='flex items-center gap-2'>
					{isSubscriptionEnabled ? (
						user ? (
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
										{isSubscribed() && (
											<Badge
												variant='outline'
												className='absolute -top-2 -right-2 h-4 px-1 text-[10px] bg-primary text-primary-foreground border-none'>
												PRO
											</Badge>
										)}
										{isAdmin() && (
											<Badge
												variant='outline'
												className='absolute -bottom-2 -right-2 h-4 px-1 text-[10px] bg-destructive text-destructive-foreground border-none'>
												ADMIN
											</Badge>
										)}
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
										<Link href='/dashboard'>Dashboard</Link>
									</DropdownMenuItem>
									{isAdmin() && (
										<>
											<DropdownMenuSeparator />
											<DropdownMenuItem asChild>
												<Link href='/admin'>
													Admin Dashboard
												</Link>
											</DropdownMenuItem>
										</>
									)}
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
						)
					) : (
						<>
							{isAdmin() ? (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant='ghost'
											className='relative h-8 w-8 rounded-full'>
											<Avatar className='h-8 w-8'>
												<AvatarImage
													src={user?.image || ""}
													alt={user?.name || ""}
												/>
												<AvatarFallback>
													{user?.name?.charAt(0) ||
														user?.email.charAt(0)}
												</AvatarFallback>
											</Avatar>
											<Badge
												variant='outline'
												className='absolute -bottom-2 -right-2 h-4 px-1 text-[10px] bg-destructive text-destructive-foreground border-none'>
												ADMIN
											</Badge>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align='end'>
										<div className='flex items-center justify-start gap-2 p-2'>
											<div className='flex flex-col space-y-1 leading-none'>
												{user?.name && (
													<p className='font-medium'>
														{user.name}
													</p>
												)}
												<p className='w-[200px] truncate text-sm text-muted-foreground'>
													{user?.email}
												</p>
											</div>
										</div>
										<DropdownMenuSeparator />
										<DropdownMenuItem asChild>
											<Link href='/admin'>
												Admin Dashboard
											</Link>
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
									<Link href='/contact'>Contact</Link>
								</Button>
							)}
						</>
					)}
				</div>
			</div>
		</header>
	);
}
