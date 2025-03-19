"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";

export default function ContactPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [subject, setSubject] = useState("");
	const [message, setMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsSubmitting(true);

		// Validate form
		if (!name || !email || !message) {
			setError("Please fill in all required fields");
			setIsSubmitting(false);
			return;
		}

		// Simulate form submission
		try {
			// In a real app, this would be an API call
			await new Promise((resolve) => setTimeout(resolve, 1500));
			setSubmitted(true);
			setName("");
			setEmail("");
			setSubject("");
			setMessage("");
		} catch (err) {
			setError("Failed to send message. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='container mx-auto py-12 md:py-16 lg:py-24'>
			<div className='max-w-5xl mx-auto'>
				<h1 className='text-4xl font-bold tracking-tight mb-6 text-center'>
					Contact Us
				</h1>
				<p className='text-lg text-center text-muted-foreground mb-12 max-w-2xl mx-auto'>
					Have questions or feedback? We had love to hear from you.
					Fill out the form below or use our contact information.
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
										<h3 className='font-medium'>Email</h3>
										<p className='text-sm text-muted-foreground'>
											support@quoteart.com
										</p>
									</div>
								</div>
								<div className='flex items-start space-x-3'>
									<Phone className='h-5 w-5 text-primary mt-0.5' />
									<div>
										<h3 className='font-medium'>Phone</h3>
										<p className='text-sm text-muted-foreground'>
											+91 7755089819
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

						<Card>
							<CardHeader>
								<CardTitle>Business Hours</CardTitle>
								<CardDescription>
									When we are available
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-2'>
									<div className='flex justify-between'>
										<span>Monday - Friday</span>
										<span>9:00 AM - 6:00 PM</span>
									</div>
									<div className='flex justify-between'>
										<span>Saturday</span>
										<span>10:00 AM - 4:00 PM</span>
									</div>
									<div className='flex justify-between'>
										<span>Sunday</span>
										<span>Closed</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					<div className='md:col-span-2'>
						<Card>
							<CardHeader>
								<CardTitle>Send us a message</CardTitle>
								<CardDescription>
									We will get back to you as soon as possible
								</CardDescription>
							</CardHeader>
							<CardContent>
								{submitted ? (
									<Alert className='bg-primary/10 border-primary/20'>
										<AlertDescription className='text-center py-4'>
											Thank you for your message! We will
											get back to you soon.
										</AlertDescription>
									</Alert>
								) : (
									<form
										onSubmit={handleSubmit}
										className='space-y-4'>
										{error && (
											<Alert variant='destructive'>
												<AlertDescription>
													{error}
												</AlertDescription>
											</Alert>
										)}

										<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
											<div className='space-y-2'>
												<Label htmlFor='name'>
													Name{" "}
													<span className='text-destructive'>
														*
													</span>
												</Label>
												<Input
													id='name'
													value={name}
													onChange={(e) =>
														setName(e.target.value)
													}
													placeholder='Your name'
													required
												/>
											</div>
											<div className='space-y-2'>
												<Label htmlFor='email'>
													Email{" "}
													<span className='text-destructive'>
														*
													</span>
												</Label>
												<Input
													id='email'
													type='email'
													value={email}
													onChange={(e) =>
														setEmail(e.target.value)
													}
													placeholder='your.email@example.com'
													required
												/>
											</div>
										</div>

										<div className='space-y-2'>
											<Label htmlFor='subject'>
												Subject
											</Label>
											<Input
												id='subject'
												value={subject}
												onChange={(e) =>
													setSubject(e.target.value)
												}
												placeholder='What is this regarding?'
											/>
										</div>

										<div className='space-y-2'>
											<Label htmlFor='message'>
												Message{" "}
												<span className='text-destructive'>
													*
												</span>
											</Label>
											<Textarea
												id='message'
												value={message}
												onChange={(e) =>
													setMessage(e.target.value)
												}
												placeholder='Your message...'
												rows={6}
												required
											/>
										</div>

										<Button
											type='submit'
											className='w-full'
											disabled={isSubmitting}>
											{isSubmitting ? (
												<>
													<Loader2 className='mr-2 h-4 w-4 animate-spin' />
													Sending...
												</>
											) : (
												<>
													<Send className='mr-2 h-4 w-4' />
													Send Message
												</>
											)}
										</Button>
									</form>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
