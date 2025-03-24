"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface ApiResponse {
	message: string;
	success: boolean;
}

export default function VerifyEmailForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [token, setToken] = useState<string | null>(null);
	const [verified, setVerified] = useState(false);

	useEffect(() => {
		const tokenParam = searchParams.get("token");
		if (!tokenParam) {
			setError("Invalid or missing verification token");
			router.push("/login");
		} else {
			setToken(tokenParam);
			verifyEmail(tokenParam);
		}
	}, [searchParams, router]);

	const verifyEmail = async (token: string) => {
		setLoading(true);
		setError("");

		try {
			const response = await fetch("/api/auth/verify-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ token }),
			});

			const data: ApiResponse = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Something went wrong");
			}

			setVerified(true);
			// Redirect to login after 3 seconds
			setTimeout(() => {
				router.push("/login?message=Email verified successfully");
			}, 3000);
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
		<div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full space-y-8'>
				<div>
					<h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
						Email Verification
					</h2>
					<p className='mt-2 text-center text-sm text-gray-600'>
						{verified
							? "Your email has been verified successfully. Redirecting to login..."
							: "Verifying your email address..."}
					</p>
				</div>

				{error && (
					<div className='text-red-500 text-sm text-center'>
						{error}
					</div>
				)}

				{!verified && loading && (
					<div className='text-center'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto'></div>
					</div>
				)}

				<div className='text-center'>
					<Link
						href='/login'
						className='font-medium text-indigo-600 hover:text-indigo-500'>
						Back to Login
					</Link>
				</div>
			</div>
		</div>
	);
}
