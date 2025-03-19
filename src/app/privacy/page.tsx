import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
	title: "Privacy Policy - QuoteArt",
	description: "Privacy policy for the QuoteArt platform",
};

export default function PrivacyPage() {
	return (
		<div className='container mx-auto py-12 md:py-16 lg:py-24'>
			<div className='max-w-3xl mx-auto'>
				<h1 className='text-4xl font-bold tracking-tight mb-6'>
					Privacy Policy
				</h1>
				<p className='text-muted-foreground mb-8'>
					Last updated: March 19, 2025
				</p>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>1. Introduction</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<p>
							At QuoteArt, we respect your privacy and are
							committed to protecting your personal data. This
							privacy policy will inform you about how we look
							after your personal data when you visit our website
							and tell you about your privacy rights and how the
							law protects you.
						</p>
						<p>
							This privacy policy applies to all users of
							QuoteArt, including registered and non-registered
							users.
						</p>
					</CardContent>
				</Card>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>2. Information We Collect</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<p>
							We may collect, use, store and transfer different
							kinds of personal data about you which we have
							grouped together as follows:
						</p>
						<ul className='list-disc pl-6 space-y-2'>
							<li>
								<strong>Identity Data</strong> includes first
								name, last name, username or similar identifier.
							</li>
							<li>
								<strong>Contact Data</strong> includes email
								address.
							</li>
							<li>
								<strong>Technical Data</strong> includes
								internet protocol (IP) address, browser type and
								version, time zone setting and location, browser
								plug-in types and versions, operating system and
								platform, and other technology on the devices
								you use to access this website.
							</li>
							<li>
								<strong>Usage Data</strong> includes information
								about how you use our website and services.
							</li>
							<li>
								<strong>Content Data</strong> includes the
								quotes and images you create using our service.
							</li>
						</ul>
					</CardContent>
				</Card>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>3. How We Use Your Information</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<p>
							We will only use your personal data when the law
							allows us to. Most commonly, we will use your
							personal data in the following circumstances:
						</p>
						<ul className='list-disc pl-6 space-y-2'>
							<li>To register you as a new user</li>
							<li>To provide and improve our services</li>
							<li>To manage our relationship with you</li>
							<li>
								To administer and protect our business and this
								website
							</li>
							<li>To deliver relevant website content to you</li>
							<li>
								To use data analytics to improve our website,
								products/services, marketing, customer
								relationships and experiences
							</li>
						</ul>
					</CardContent>
				</Card>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>4. Data Security</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<p>
							We have put in place appropriate security measures
							to prevent your personal data from being
							accidentally lost, used or accessed in an
							unauthorized way, altered or disclosed. In addition,
							we limit access to your personal data to those
							employees, agents, contractors and other third
							parties who have a business need to know.
						</p>
						<p>
							We have put in place procedures to deal with any
							suspected personal data breach and will notify you
							and any applicable regulator of a breach where we
							are legally required to do so.
						</p>
					</CardContent>
				</Card>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>5. Data Retention</CardTitle>
					</CardHeader>
					<CardContent>
						<p>
							We will only retain your personal data for as long
							as necessary to fulfill the purposes we collected it
							for, including for the purposes of satisfying any
							legal, accounting, or reporting requirements.
						</p>
					</CardContent>
				</Card>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>6. Your Legal Rights</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<p>
							Under certain circumstances, you have rights under
							data protection laws in relation to your personal
							data, including the right to:
						</p>
						<ul className='list-disc pl-6 space-y-2'>
							<li>Request access to your personal data</li>
							<li>Request correction of your personal data</li>
							<li>Request erasure of your personal data</li>
							<li>Object to processing of your personal data</li>
							<li>
								Request restriction of processing your personal
								data
							</li>
							<li>Request transfer of your personal data</li>
							<li>Right to withdraw consent</li>
						</ul>
						<p>
							If you wish to exercise any of these rights, please
							contact us at privacy@quoteart.com.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>7. Changes to This Privacy Policy</CardTitle>
					</CardHeader>
					<CardContent>
						<p>
							We may update our privacy policy from time to time.
							We will notify you of any changes by posting the new
							privacy policy on this page and updating the
							&quot;Last updated&quot; date at the top of this
							privacy policy.
						</p>
						<p>
							You are advised to review this privacy policy
							periodically for any changes. Changes to this
							privacy policy are effective when they are posted on
							this page.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
