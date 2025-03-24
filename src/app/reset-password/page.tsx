"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [validToken, setValidToken] = useState(false);

	useEffect(() => {
		const token = searchParams.get("token");
		if (!token) {
			toast.error("Invalid reset link");
			router.push("/forgot-password");
		}
	}, [searchParams, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		try {
			setLoading(true);
			const token = searchParams.get("token");

			const response = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token,
					password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Something went wrong");
			}

			toast.success("Password reset successfully");
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
						Reset Password
					</h2>
					<p className='mt-2 text-center text-sm text-gray-600'>
						Please enter your new password below.
					</p>
				</div>
				<form className='mt-8 space-y-6' onSubmit={handleSubmit}>
					<div className='-space-y-px rounded-md shadow-sm'>
						<div className='mb-3'>
							<label htmlFor='password' className='sr-only'>
								New Password
							</label>
							<Input
								id='password'
								name='password'
								type='password'
								required
								placeholder='New Password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
						<div>
							<label
								htmlFor='confirm-password'
								className='sr-only'>
								Confirm Password
							</label>
							<Input
								id='confirm-password'
								name='confirm-password'
								type='password'
								required
								placeholder='Confirm Password'
								value={confirmPassword}
								onChange={(e) =>
									setConfirmPassword(e.target.value)
								}
							/>
						</div>
					</div>

					<div>
						<Button
							type='submit'
							disabled={loading}
							className='w-full'>
							{loading ? "Resetting..." : "Reset Password"}
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
