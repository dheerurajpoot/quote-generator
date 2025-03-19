import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
	title: "Terms of Service - QuoteArt",
	description: "Terms and conditions for using the QuoteArt platform",
};

export default function TermsPage() {
	return (
		<div className='container mx-auto py-12 md:py-16 lg:py-24'>
			<div className='max-w-3xl mx-auto'>
				<h1 className='text-4xl font-bold tracking-tight mb-6'>
					Terms of Service
				</h1>
				<p className='text-muted-foreground mb-8'>
					Last updated: March 19, 2025
				</p>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>1. Acceptance of Terms</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<p>
							By accessing or using QuoteArt, you agree to be
							bound by these Terms of Service and all applicable
							laws and regulations. If you do not agree with any
							of these terms, you are prohibited from using or
							accessing this site.
						</p>
					</CardContent>
				</Card>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>2. Use License</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<p>
							Permission is granted to temporarily download one
							copy of the materials on QuoteArt for personal,
							non-commercial transitory viewing only. This is the
							grant of a license, not a transfer of title, and
							under this license you may not:
						</p>
						<ul className='list-disc pl-6 space-y-2'>
							<li>Modify or copy the materials</li>
							<li>
								Use the materials for any commercial purpose or
								for any public display
							</li>
							<li>
								Attempt to reverse engineer any software
								contained on QuoteArt
							</li>
							<li>
								Remove any copyright or other proprietary
								notations from the materials
							</li>
							<li>
								Transfer the materials to another person or
								"mirror" the materials on any other server
							</li>
						</ul>
						<p>
							This license shall automatically terminate if you
							violate any of these restrictions and may be
							terminated by QuoteArt at any time.
						</p>
					</CardContent>
				</Card>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>3. User Content</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<p>
							Our service allows you to create and download quote
							images. You retain all rights to the content you
							create. However, by using our service, you grant us
							a worldwide, non-exclusive, royalty-free license to
							use, reproduce, adapt, publish, translate, and
							distribute your content in any existing or future
							media.
						</p>
						<p>
							You are responsible for the content you create using
							our service. Content must not be illegal, harmful,
							threatening, abusive, harassing, defamatory, or
							otherwise objectionable.
						</p>
					</CardContent>
				</Card>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>4. Disclaimer</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<p>
							The materials on QuoteArt are provided on an 'as is'
							basis. QuoteArt makes no warranties, expressed or
							implied, and hereby disclaims and negates all other
							warranties including, without limitation, implied
							warranties or conditions of merchantability, fitness
							for a particular purpose, or non-infringement of
							intellectual property or other violation of rights.
						</p>
						<p>
							Further, QuoteArt does not warrant or make any
							representations concerning the accuracy, likely
							results, or reliability of the use of the materials
							on its website or otherwise relating to such
							materials or on any sites linked to this site.
						</p>
					</CardContent>
				</Card>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>5. Limitations</CardTitle>
					</CardHeader>
					<CardContent>
						<p>
							In no event shall QuoteArt or its suppliers be
							liable for any damages (including, without
							limitation, damages for loss of data or profit, or
							due to business interruption) arising out of the use
							or inability to use the materials on QuoteArt, even
							if QuoteArt or a QuoteArt authorized representative
							has been notified orally or in writing of the
							possibility of such damage.
						</p>
					</CardContent>
				</Card>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>6. Revisions and Errata</CardTitle>
					</CardHeader>
					<CardContent>
						<p>
							The materials appearing on QuoteArt could include
							technical, typographical, or photographic errors.
							QuoteArt does not warrant that any of the materials
							on its website are accurate, complete, or current.
							QuoteArt may make changes to the materials contained
							on its website at any time without notice.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>7. Governing Law</CardTitle>
					</CardHeader>
					<CardContent>
						<p>
							These terms and conditions are governed by and
							construed in accordance with the laws of the United
							States, and you irrevocably submit to the exclusive
							jurisdiction of the courts in that location.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
