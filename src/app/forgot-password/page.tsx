"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setLoading(true);
			const response = await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Something went wrong");
			}

			toast.success("Password reset link sent to your email");
			router.push("/login");
		} catch (error: any) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex min-h-[80vh] items-center justify-center'>
			<div className='w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-lg'>
				<div>
					<h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-900'>
						Forgot Password
					</h2>
					<p className='mt-2 text-center text-sm text-gray-600'>
						Enter your email address and we'll send you a link to
						reset your password.
					</p>
				</div>
				<form className='mt-8 space-y-6' onSubmit={handleSubmit}>
					<div className='-space-y-px rounded-md shadow-sm'>
						<div>
							<label htmlFor='email' className='sr-only'>
								Email address
							</label>
							<Input
								id='email'
								name='email'
								type='email'
								required
								placeholder='Email address'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
					</div>

					<div>
						<Button
							type='submit'
							disabled={loading}
							className='w-full'>
							{loading ? "Sending..." : "Send Reset Link"}
						</Button>
					</div>

					<div className='text-sm text-center'>
						<Link
							href='/login'
							className='font-medium text-indigo-600 hover:text-indigo-500'>
							Back to Login
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
