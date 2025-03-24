"use client";

import { useState } from "react";
import Link from "next/link";

interface ApiResponse {
	message: string;
	success: boolean;
}

export default function ForgotPassword() {
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setMessage("");

		try {
			const response = await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			const data: ApiResponse = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Something went wrong");
			}

			setMessage(data.message);
			setEmail("");
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

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
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
							<label htmlFor='email' className='sr-only'>
								Email address
							</label>
							<input
								id='email'
								name='email'
								type='email'
								autoComplete='email'
								required
								className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm'
								placeholder='Email address'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
					</div>

					{error && (
						<div className='text-red-500 text-sm text-center'>
							{error}
						</div>
					)}

					{message && (
						<div className='text-green-500 text-sm text-center'>
							{message}
						</div>
					)}

					<div>
						<button
							type='submit'
							disabled={loading}
							className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'>
							{loading ? "Sending..." : "Send reset link"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
