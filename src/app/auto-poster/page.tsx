"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AutoQuotePoster from "@/components/auto-quote-poster";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/auth-context";

export default function AutoPosterPage() {
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const { user } = useAuth();

	useEffect(() => {
		async function checkAuthAndSubscription() {
			try {
				if (!user || !user._id) {
					router.replace("/login");
					return;
				}
				const subRes = await axios.get(
					`/api/subscriptions?userId=${user._id}`
				);
				const subscription = subRes.data[0];
				if (!subscription || subscription.tier !== "premium") {
					router.replace("/pricing");
					return;
				}
				setLoading(false);
			} catch {
				router.replace("/login");
			}
		}
		checkAuthAndSubscription();
	}, [router]);

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-[400px]'>
				<Loader2 className='w-10 h-10 animate-spin text-primary' />
			</div>
		);
	}

	return (
		<main className='container mx-auto py-16'>
			<div className='max-w-4xl mx-auto space-y-8'>
				<AutoQuotePoster />
			</div>
		</main>
	);
}
