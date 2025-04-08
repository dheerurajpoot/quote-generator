"use client";

import { useState, useEffect } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

const gradients = [
	"from-blue-500 to-purple-500",
	"from-pink-500 to-orange-500",
	"from-green-500 to-teal-500",
	"from-yellow-500 to-red-500",
	"from-indigo-500 to-purple-500",
	"from-rose-500 to-pink-500",
	"from-cyan-500 to-blue-500",
	"from-emerald-500 to-teal-500",
	"from-amber-500 to-orange-500",
	"from-violet-500 to-purple-500",
	"from-fuchsia-500 to-pink-500",
	"from-sky-500 to-indigo-500",
];

export default function TrendingQuotes() {
	const [quotes, setQuotes] = useState<string[]>([]);
	const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchQuotes = async () => {
		setLoading(true);
		try {
			const quotePromises = Array(12)
				.fill(null)
				.map(() =>
					axios.get("https://hindi-quotes.vercel.app/random/success")
				);

			const responses = await Promise.all(quotePromises);
			const quotesArray = responses.map(
				(response) => response.data.quote
			);
			setQuotes(quotesArray);
		} catch (error) {
			console.error("Error fetching quotes:", error);
			setQuotes([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchQuotes();
	}, []);

	const copyToClipboard = async (text: string, index: number) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedIndex(index);
			setTimeout(() => setCopiedIndex(null), 2000);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	if (loading) {
		return (
			<div className='flex justify-center items-center min-h-[400px]'>
				<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
			</div>
		);
	}

	return (
		<div className='space-y-8'>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				{Array.isArray(quotes) &&
					quotes.map((quote, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							className={`bg-gradient-to-br ${
								gradients[index % gradients.length]
							} rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}>
							<div className='relative'>
								<p className='text-lg font-medium mb-4 text-white'>
									&quot;{quote}&quot;
								</p>
								<p className='text-sm text-white/80 mb-4'>
									- QuoteArt
								</p>
								<button
									onClick={() =>
										copyToClipboard(
											`"${quote}" - QuoteArt`,
											index
										)
									}
									className='absolute bottom-0 right-0 p-2 hover:bg-white/10 rounded-full transition-colors duration-200'
									aria-label='Copy quote'>
									{copiedIndex === index ? (
										<Check className='h-5 w-5 text-white' />
									) : (
										<Copy className='h-5 w-5 text-white/80' />
									)}
								</button>
							</div>
						</motion.div>
					))}
			</div>
			<div className='flex justify-center'>
				<button
					onClick={fetchQuotes}
					className='inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors duration-200'>
					<RefreshCw className='h-5 w-5' />
					Get New Quotes
				</button>
			</div>
		</div>
	);
}
