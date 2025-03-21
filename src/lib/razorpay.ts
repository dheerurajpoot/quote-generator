import crypto from "crypto";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
	throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be defined");
}

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export const PREMIUM_PLAN_PRICE = process.env.PREMIUM_PLAN_PRICE;

// Create a Razorpay order
export async function createRazorpayOrder(amount: number, receipt: string) {
	const response = await fetch("https://api.razorpay.com/v1/orders", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Basic ${Buffer.from(
				`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`
			).toString("base64")}`,
		},
		body: JSON.stringify({
			amount: amount * 100, // Amount in paise (₹1 = 100 paise)
			currency: "INR",
			receipt,
			payment_capture: 1,
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			`Failed to create Razorpay order: ${JSON.stringify(error)}`
		);
	}

	return await response.json();
}

// Verify Razorpay payment signature
export function verifyPaymentSignature(
	orderId: string,
	paymentId: string,
	signature: string
) {
	const generatedSignature = crypto
		.createHmac("sha256", RAZORPAY_KEY_SECRET)
		.update(`${orderId}|${paymentId}`)
		.digest("hex");

	return generatedSignature === signature;
}

// Create a Razorpay subscription
export async function createRazorpaySubscription(
	planId: string,
	customerId: string,
	totalCount = 12 // 12 months by default
) {
	const response = await fetch("https://api.razorpay.com/v1/subscriptions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Basic ${Buffer.from(
				`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`
			).toString("base64")}`,
		},
		body: JSON.stringify({
			plan_id: planId,
			customer_id: customerId,
			total_count: totalCount,
			quantity: 1,
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			`Failed to create Razorpay subscription: ${JSON.stringify(error)}`
		);
	}

	return await response.json();
}

// Create a Razorpay customer
export async function createRazorpayCustomer(name: string, email: string) {
	const response = await fetch("https://api.razorpay.com/v1/customers", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Basic ${Buffer.from(
				`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`
			).toString("base64")}`,
		},
		body: JSON.stringify({
			name,
			email,
			contact: "",
			fail_existing: 0,
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			`Failed to create Razorpay customer: ${JSON.stringify(error)}`
		);
	}

	return await response.json();
}

// Cancel a Razorpay subscription
export async function cancelRazorpaySubscription(subscriptionId: string) {
	const response = await fetch(
		`https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Basic ${Buffer.from(
					`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`
				).toString("base64")}`,
			},
			body: JSON.stringify({
				cancel_at_cycle_end: 1,
			}),
		}
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			`Failed to cancel Razorpay subscription: ${JSON.stringify(error)}`
		);
	}

	return await response.json();
}
