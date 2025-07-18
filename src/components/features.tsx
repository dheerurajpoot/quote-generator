import { cn } from "@/lib/utils";
import {
	CreditCard,
	HelpCircle,
	IndianRupee,
	Paintbrush,
	PenTool,
	Quote,
	SaveOff,
	TowerControl,
} from "lucide-react";

export function FeaturesSection() {
	const features = [
		{
			title: "Design Your Quote",
			description:
				"Type or paste your favorite quote and add the author's name if desired.",
			icon: <PenTool />,
		},
		{
			title: "Ease of use",
			description: "It's easy to use, Just like a simple image editor.",
			icon: <TowerControl />,
		},
		{
			title: "Download or Share",
			description:
				"Download your creation as a high-quality image or share directly to social media.",
			icon: <SaveOff />,
		},
		{
			title: "Customize Design",
			description:
				"Choose a background, adjust colors, fonts, and layout to match your style.",
			icon: <Paintbrush />,
		},
		{
			title: "24/7 Customer Support",
			description:
				"We are available a 100% of the time. Atleast our AI Agents are.",
			icon: <HelpCircle />,
		},
		{
			title: "Pricing like no other",
			description:
				"Our prices are best in the market. No cap, no lock, no credit card required.",
			icon: <IndianRupee />,
		},
		{
			title: "Money back guarantee",
			description:
				"If you donot like Anything, we will convince you to like us.",
			icon: <CreditCard />,
		},
		{
			title: "Auto Quote Poster",
			description: "Connect your social media and Run Auto Quote Poster.",
			icon: <Quote />,
		},
	];
	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  relative z-10 py-5 max-w-7xl mx-auto'>
			{features.map((feature, index) => (
				<Feature key={feature.title} {...feature} index={index} />
			))}
		</div>
	);
}

const Feature = ({
	title,
	description,
	icon,
	index,
}: {
	title: string;
	description: string;
	icon: React.ReactNode;
	index: number;
}) => {
	return (
		<div
			className={cn(
				"flex flex-col lg:border-r  py-10 relative group/feature dark:border-neutral-800",
				(index === 0 || index === 4) &&
					"lg:border-l dark:border-neutral-800",
				index < 4 && "lg:border-b dark:border-neutral-800"
			)}>
			{index < 4 && (
				<div className='opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none' />
			)}
			{index >= 4 && (
				<div className='opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none' />
			)}
			<div className='mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400'>
				{icon}
			</div>
			<div className='text-lg font-bold mb-2 relative z-10 px-10'>
				<div className='absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center' />
				<span className='group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100'>
					{title}
				</span>
			</div>
			<p className='text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10'>
				{description}
			</p>
		</div>
	);
};
