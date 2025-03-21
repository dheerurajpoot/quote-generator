import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
	throw new Error("STRIPE_SECRET_KEY is not defined");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default stripe;

export const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID || "";

export async function createCheckoutSession(userId: string, priceId: string) {
	const session = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		billing_address_collection: "auto",
		line_items: [
			{
				price: priceId,
				quantity: 1,
			},
		],
		mode: "subscription",
		success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
		cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
		metadata: {
			userId: userId,
		},
	});

	return session;
}

export async function createPortalSession(customerId: string) {
	const session = await stripe.billingPortal.sessions.create({
		customer: customerId,
		return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
	});

	return session;
}
