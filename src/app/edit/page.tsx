import QuoteGenerator from "@/components/quote-generator";

export const metadata = {
	title: "Create your desired quote - QuoteArt",
	description: "Create your desired quote using the QuoteArt platform",
};

export default function Edit() {
	return (
		<div className='container mx-auto py-10'>
			<QuoteGenerator />
		</div>
	);
}
