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
import { Loader2 } from "lucide-react";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const { signIn, loading } = useAuth();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!email || !password) {
			setError("Please fill in all fields");
			return;
		}

		const success = await signIn(email, password);
		if (success) {
			router.push("/");
		}
	};

	return (
		<div className='flex items-center justify-center min-h-[calc(100vh-8rem)] p-4'>
			<Card className='w-full max-w-md'>
				<CardHeader className='space-y-1'>
					<CardTitle className='text-2xl font-bold'>Login</CardTitle>
					<CardDescription>
						Enter your email and password to login to your account
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					{error && (
						<Alert variant='destructive'>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<form onSubmit={handleSubmit} className='space-y-4'>
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
							<div className='flex items-center justify-between'>
								<Label htmlFor='password'>Password</Label>
								<Link
									href='/forgot-password'
									className='text-sm text-primary hover:underline'>
									Forgot password?
								</Link>
							</div>
							<Input
								id='password'
								type='password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								placeholder='Enter Password'
							/>
						</div>
						<Button
							type='submit'
							className='w-full'
							disabled={loading}>
							{loading ? (
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							) : null}
							Login
						</Button>
					</form>
				</CardContent>
				<CardFooter className='flex justify-center'>
					<p className='text-sm text-center text-muted-foreground'>
						Don&apos;t have an account?{" "}
						<Link
							href='/signup'
							className='text-primary hover:underline'>
							Sign up
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
