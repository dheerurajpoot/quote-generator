import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const metadata = {
	title: "About Us - QuoteArt",
	description:
		"Learn about the QuoteArt platform and our mission to help you create beautiful quote images",
};

export default function AboutPage() {
	return (
		<div className='container mx-auto py-12 md:py-16 lg:py-24'>
			<div className='max-w-3xl mx-auto'>
				<h1 className='text-4xl font-bold tracking-tight mb-6'>
					About QuoteArt
				</h1>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>Our Mission</CardTitle>
						<CardDescription>
							Empowering creativity through words and images
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<p>
							QuoteArt was founded with a simple mission: to make
							it easy for anyone to create beautiful, shareable
							quote images without needing design skills or
							expensive software.
						</p>
						<p>
							We believe that words have power, and when combined
							with striking visuals, they can inspire, motivate,
							and connect people across the world.
						</p>
					</CardContent>
				</Card>

				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>Our Story</CardTitle>
						<CardDescription>
							How QuoteArt came to be
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<p>
							QuoteArt began as a passion project in 2023 when our
							founder, a social media manager, was frustrated with
							the lack of easy-to-use tools for creating quote
							images for multiple platforms.
						</p>
						<p>
							What started as a simple tool for personal use
							quickly grew into a platform used by content
							creators, social media managers, educators, and
							individuals who wanted to share meaningful quotes in
							a visually appealing way.
						</p>
						<p>
							Today, QuoteArt is used by thousands of people
							around the world to create quote images for social
							media, blogs, presentations, and personal projects.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Our Values</CardTitle>
						<CardDescription>
							What drives us every day
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ul className='space-y-4'>
							<li className='flex flex-col'>
								<strong className='text-lg'>
									Accessibility
								</strong>
								<span>
									Making design tools available to everyone,
									regardless of technical skill.
								</span>
							</li>
							<li className='flex flex-col'>
								<strong className='text-lg'>Creativity</strong>
								<span>
									Empowering users to express themselves
									through customization and flexibility.
								</span>
							</li>
							<li className='flex flex-col'>
								<strong className='text-lg'>Simplicity</strong>
								<span>
									Creating intuitive interfaces that
									don&apos;t sacrifice functionality.
								</span>
							</li>
							<li className='flex flex-col'>
								<strong className='text-lg'>
									Global Perspective
								</strong>
								<span>
									Supporting multiple languages and cultural
									expressions through our platform.
								</span>
							</li>
						</ul>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
