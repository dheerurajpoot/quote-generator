"use client";

import type React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
	return (
		<div className='container mx-auto py-12 md:py-16 lg:py-24'>
			<div className='max-w-5xl mx-auto'>
				<h1 className='text-4xl font-bold tracking-tight mb-6 text-center'>
					Donate Us
				</h1>
				<p className='text-lg text-center text-muted-foreground mb-12 max-w-2xl mx-auto'>
					Donation details given below
				</p>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
					<div className='md:col-span-1 space-y-6'>
						<Card>
							<CardHeader>
								<CardTitle>Contact Information</CardTitle>
								<CardDescription>
									Reach out to us directly
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='flex items-start space-x-3'>
									<Mail className='h-5 w-5 text-primary mt-0.5' />
									<div>
										<h3 className='font-medium'>
											Paypal Email
										</h3>
										<p className='text-sm text-muted-foreground'>
											rajpootdheeru90@gmail.com
										</p>
									</div>
								</div>
								<div className='flex items-start space-x-3'>
									<Phone className='h-5 w-5 text-primary mt-0.5' />
									<div>
										<h3 className='font-medium'>UPI</h3>
										<p className='text-sm text-muted-foreground'>
											adsenseservices90@axl
										</p>
									</div>
								</div>
								<div className='flex items-start space-x-3'>
									<MapPin className='h-5 w-5 text-primary mt-0.5' />
									<div>
										<h3 className='font-medium'>Office</h3>
										<p className='text-sm text-muted-foreground'>
											232, Bamba Road, Kalyanpur
											<br />
											Kanpur Nagar, Uttar Pradesh
											<br />
											India
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
