import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
	title: "Cancellation Policy - QuoteArt",
	description: "Cancellation policy for QuoteArt subscriptions",
};

export default function CancellationPolicyPage() {
	return (
		<div className='container mx-auto py-12 md:py-16 lg:py-24'>
			<div className='max-w-3xl mx-auto'>
				<h1 className='text-4xl font-bold tracking-tight mb-6'>
					Cancellation Policy
				</h1>
				<p className='text-muted-foreground mb-8'>
					Last updated: March 21, 2025
				</p>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>1. Subscription Cancellation</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<p>
							You may cancel your QuoteArt Premium subscription at
							any time through your account dashboard. To cancel
							your subscription:
						</p>
						<ol className='list-decimal pl-6 space-y-2'>
							<li>Log in to your QuoteArt account</li>
							<li>Navigate to the Dashboard</li>
							<li>Select the &quot;Subscription&quot; tab</li>
							<li>Click on &quot;Cancel Subscription&quot;</li>
							<li>Confirm your cancellation</li>
						</ol>
						<p>
							Upon cancellation, you will receive a confirmation
							email. Your subscription will remain active until
							the end of your current billing period, after which
							it will not renew.
						</p>
					</CardContent>
				</Card>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>2. Effect of Cancellation</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<p>When you cancel your subscription:</p>
						<ul className='list-disc pl-6 space-y-2'>
							<li>
								You will continue to have access to Premium
								features until the end of your current billing
								period.
							</li>
							<li>
								No additional charges will be made to your
								payment method after cancellation.
							</li>
							<li>
								Your account will automatically revert to the
								Free plan at the end of your billing period.
							</li>
							<li>
								Any content you created with Premium features
								will remain accessible, but Premium-only
								features will no longer be available.
							</li>
						</ul>
					</CardContent>
				</Card>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>3. Reactivation</CardTitle>
					</CardHeader>
					<CardContent>
						<p>
							You can reactivate your Premium subscription at any
							time by visiting the Pricing page and selecting a
							Premium plan. If you reactivate before your current
							subscription period ends, your existing subscription
							will continue without interruption.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>4. Contact Us</CardTitle>
					</CardHeader>
					<CardContent>
						<p>
							If you have any questions or concerns about
							cancelling your subscription, please contact our
							support team at support@quoteart.com. We&apos;re
							here to help!
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
