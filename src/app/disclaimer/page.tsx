import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
	title: "Disclaimer - QuoteArt",
	description: "Disclaimer for QuoteArt services",
};

export default function DisclaimerPage() {
	return (
		<div className='container mx-auto py-12 md:py-16 lg:py-24'>
			<div className='max-w-3xl mx-auto'>
				<h1 className='text-4xl font-bold tracking-tight mb-6'>
					Disclaimer
				</h1>
				<p className='text-muted-foreground mb-8'>
					Last updated: March 21, 2025
				</p>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>1. General Disclaimer</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<p>
							The information provided by QuoteArt
							(&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
							on quoteart.com (the &quot;Site&quot;) is for
							general informational purposes only. All information
							on the Site is provided in good faith, however, we
							make no representation or warranty of any kind,
							express or implied, regarding the accuracy,
							adequacy, validity, reliability, availability, or
							completeness of any information on the Site.
						</p>
						<p>
							Under no circumstance shall we have any liability to
							you for any loss or damage of any kind incurred as a
							result of the use of the Site or reliance on any
							information provided on the Site. Your use of the
							Site and your reliance on any information on the
							Site is solely at your own risk.
						</p>
					</CardContent>
				</Card>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>2. External Links Disclaimer</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<p>
							The Site may contain (or you may be sent through the
							Site) links to other websites or content belonging
							to or originating from third parties or links to
							websites and features in banners or other
							advertising. Such external links are not
							investigated, monitored, or checked for accuracy,
							adequacy, validity, reliability, availability, or
							completeness by us.
						</p>
						<p>
							We do not warrant, endorse, guarantee, or assume
							responsibility for the accuracy or reliability of
							any information offered by third-party websites
							linked through the Site or any website or feature
							linked in any banner or other advertising. We will
							not be a party to or in any way be responsible for
							monitoring any transaction between you and
							third-party providers of products or services.
						</p>
					</CardContent>
				</Card>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>
							3. User-Generated Content Disclaimer
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<p>
							The Site may include content provided by users,
							including quotes and images. We are not responsible
							for the content of quotes entered by users or the
							images selected by users. Users are solely
							responsible for ensuring they have the right to use
							any quotes or images they select.
						</p>
						<p>
							We do not claim ownership of user-generated content.
							However, by using our service, you grant us a
							non-exclusive, royalty-free, worldwide license to
							use, store, display, reproduce, and distribute your
							content solely for the purpose of providing and
							improving our services.
						</p>
					</CardContent>
				</Card>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>4. Professional Disclaimer</CardTitle>
					</CardHeader>
					<CardContent>
						<p>
							The Site cannot and does not contain legal advice.
							The legal information is provided for general
							informational and educational purposes only and is
							not a substitute for professional advice.
							Accordingly, before taking any actions based upon
							such information, we encourage you to consult with
							the appropriate professionals.
						</p>
						<p className='mt-4'>
							We do not provide any kind of legal advice. The use
							or reliance of any information contained on the Site
							is solely at your own risk.
						</p>
					</CardContent>
				</Card>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>5. Payment Processing Disclaimer</CardTitle>
					</CardHeader>
					<CardContent>
						<p>
							We use Razorpay, a third-party payment processor, to
							process payments for our Premium subscription. We do
							not store your payment information on our servers.
							Your payment information is provided directly to our
							payment processor, whose use of your personal
							information is governed by their privacy policy.
							These payment processors adhere to the standards set
							by PCI-DSS as managed by the PCI Security Standards
							Council.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>6. Testimonials Disclaimer</CardTitle>
					</CardHeader>
					<CardContent>
						<p>
							The Site may contain testimonials by users of our
							products and/or services. These testimonials reflect
							the real-life experiences and opinions of such
							users. However, the experiences are personal to
							those particular users, and may not necessarily be
							representative of all users of our products and/or
							services. We do not claim, and you should not
							assume, that all users will have the same
							experiences.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
