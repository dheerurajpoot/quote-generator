import AutoQuotePoster from "@/components/auto-quote-poster";

export default function AutoPosterPage() {
	return (
		<main className='container mx-auto py-16'>
			<div className='max-w-4xl mx-auto space-y-8'>
				<div className='text-center space-y-4'>
					<h1 className='text-4xl font-bold'>
						Automatic Quote Poster
					</h1>
					<p className='text-muted-foreground text-lg'>
						Automatically generate and post Hindi quotes to your
						social media accounts
					</p>
				</div>

				<AutoQuotePoster />
			</div>
		</main>
	);
}
