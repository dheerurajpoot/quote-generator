import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
	title: "Refund Policy - QuoteArt",
	description: "Refund policy for QuoteArt subscriptions",
};

export default function RefundPolicyPage() {
	return (
		<div className='container mx-auto py-12 md:py-16 lg:py-24'>
			<div className='max-w-3xl mx-auto'>
				<h1 className='text-4xl font-bold tracking-tight mb-6'>
					Refund Policy
				</h1>
				<p className='text-muted-foreground mb-8'>
					Last updated: March 21, 2025
				</p>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>1. Subscription Refunds</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<p>
							QuoteArt offers the following refund policy for
							Premium subscriptions:
						</p>
						<ul className='list-disc pl-6 space-y-2'>
							<li>
								<strong>7-Day Refund Period:</strong> If you are
								not satisfied with your Premium subscription,
								you may request a full refund within 7 days of
								your initial purchase.
							</li>
							<li>
								<strong>Subsequent Billing Cycles:</strong> We
								do not offer refunds for subscription renewals
								after the initial 7-day period. Instead, you may
								cancel your subscription to prevent future
								charges.
							</li>
							<li>
								<strong>Partial Refunds:</strong> We do not
								provide partial refunds for unused portions of
								your subscription period.
							</li>
						</ul>
					</CardContent>
				</Card>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>2. Refund Eligibility</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<p>To be eligible for a refund:</p>
						<ul className='list-disc pl-6 space-y-2'>
							<li>
								Your refund request must be made within 7 days
								of the initial subscription purchase.
							</li>
							<li>
								You must provide a valid reason for your refund
								request.
							</li>
							<li>
								Your account must not have violated our Terms of
								Service.
							</li>
						</ul>
						<p>
							We reserve the right to deny refund requests that do
							not meet these criteria or that we determine to be
							abusive of our refund policy.
						</p>
					</CardContent>
				</Card>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>3. How to Request a Refund</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<p>To request a refund:</p>
						<ol className='list-decimal pl-6 space-y-2'>
							<li>
								Email our support team at support@quoteart.com
								with the subject line &quot;Refund Request&quot;
							</li>
							<li>Include your account email address</li>
							<li>
								Provide the date of your subscription purchase
							</li>
							<li>Explain the reason for your refund request</li>
						</ol>
						<p>
							We will process eligible refund requests within 5-7
							business days. Refunds will be issued to the
							original payment method used for the purchase.
						</p>
					</CardContent>
				</Card>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>4. Technical Issues</CardTitle>
					</CardHeader>
					<CardContent>
						<p>
							If you experience technical issues with our service,
							please contact our support team before requesting a
							refund. We are committed to resolving technical
							problems and ensuring you have a positive experience
							with QuoteArt.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>5. Changes to This Policy</CardTitle>
					</CardHeader>
					<CardContent>
						<p>
							We may update our Refund Policy from time to time.
							We will notify you of any changes by posting the new
							policy on this page and updating the "Last updated"
							date.
						</p>
						<p className='mt-4'>
							If you have any questions about our Refund Policy,
							please contact us at support@quoteart.com.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
