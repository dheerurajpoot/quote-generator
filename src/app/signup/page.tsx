"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const { signUp, loading } = useAuth();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess(false);

		if (!name || !email || !password || !confirmPassword) {
			setError("Please fill in all fields");
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		const success = await signUp(name, email, password);
		if (success) {
			setSuccess(true);
			setTimeout(() => {
				router.push("/login");
			}, 5000);
		} else {
			setError("Failed to create account");
		}
	};

	return (
		<div className='flex items-center justify-center min-h-[calc(100vh-8rem)] p-4'>
			<Card className='w-full max-w-md'>
				<CardHeader className='space-y-1'>
					<CardTitle className='text-2xl font-bold'>
						Create an account
					</CardTitle>
					<CardDescription>
						Enter your information to create an account
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					{error && (
						<Alert variant='destructive'>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					{success && (
						<Alert className='bg-green-50 border-green-200'>
							<CheckCircle2 className='h-4 w-4 text-green-600' />
							<AlertDescription className='text-green-600'>
								Registration successful! Please check your email
								for verification. Redirecting to login...
							</AlertDescription>
						</Alert>
					)}

					<form onSubmit={handleSubmit} className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='name'>Name</Label>
							<Input
								id='name'
								placeholder='John Doe'
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								type='email'
								placeholder='m@example.com'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='password'>Password</Label>
							<Input
								id='password'
								type='password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								placeholder='Enter Password'
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='confirm-password'>
								Confirm Password
							</Label>
							<Input
								id='confirm-password'
								type='password'
								value={confirmPassword}
								onChange={(e) =>
									setConfirmPassword(e.target.value)
								}
								required
								placeholder='Confirm Password'
							/>
						</div>
						<Button
							type='submit'
							className='w-full'
							disabled={loading}>
							{loading ? (
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							) : null}
							Create Account
						</Button>
					</form>
				</CardContent>
				<CardFooter className='flex justify-center'>
					<p className='text-sm text-center text-muted-foreground'>
						Already have an account?{" "}
						<Link
							href='/login'
							className='text-primary hover:underline'>
							Login
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
