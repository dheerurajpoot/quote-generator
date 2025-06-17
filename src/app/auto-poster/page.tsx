"use client";
import AutoQuotePoster from "@/components/auto-quote-poster";
// import { useSubscription } from "@/context/subscription-context";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

export default function AutoPosterPage() {
	// const { isSubscribed } = useSubscription();
	// const router = useRouter();

	// useEffect(() => {
	// 	if (!isSubscribed()) {
	// 		router.push("/pricing");
	// 	}
	// }, [isSubscribed, router]);

	return (
		<main className='container mx-auto py-16'>
			<div className='max-w-4xl mx-auto space-y-8'>
				<AutoQuotePoster />
			</div>
		</main>
	);
}
