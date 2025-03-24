"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ApiResponse {
	message: string;
	success: boolean;
}

export default function ResetPasswordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [token, setToken] = useState<string | null>(null);

	useEffect(() => {
		const tokenParam = searchParams.get("token");
		if (!tokenParam) {
			setError("Invalid or missing reset token");
			router.push("/forgot-password");
		} else {
			setToken(tokenParam);
		}
	}, [searchParams, router]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ token, password }),
			});

			const data: ApiResponse = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Something went wrong");
			}

			router.push("/login?message=Password reset successful");
		} catch (error: unknown) {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError("An unexpected error occurred");
			}
		} finally {
			setLoading(false);
		}
	};

	if (!token) {
		return null;
	}

	return (
		<div className='min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full space-y-8'>
				<div>
					<h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
						Reset your password
					</h2>
					<p className='mt-2 text-center text-sm text-gray-600'>
						Or{" "}
						<Link
							href='/login'
							className='font-medium text-indigo-600 hover:text-indigo-500'>
							sign in to your account
						</Link>
					</p>
				</div>
				<form className='mt-8 space-y-6' onSubmit={handleSubmit}>
					<div className='rounded-md shadow-sm -space-y-px'>
						<div>
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

					{error && (
						<div className='text-red-500 text-sm text-center'>
							{error}
						</div>
					)}

					<div>
						<Button
							type='submit'
							disabled={loading}
							className='w-full'>
							{loading ? "Resetting..." : "Reset Password"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
