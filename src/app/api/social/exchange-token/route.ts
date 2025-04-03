import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
	try {
		const { searchParams } = new URL(request.url);
		const accessToken = searchParams.get("access_token");

		if (!accessToken) {
			return NextResponse.json(
				{ error: "Access token is required" },
				{ status: 400 }
			);
		}

		// Log the values for debugging
		console.log("Attempting to exchange token with:", {
			appId: process.env.FACEBOOK_CLIENT_ID,
			hasSecret: !!process.env.FACEBOOK_CLIENT_SECRET,
			accessToken: accessToken.substring(0, 10) + "...", // Log only first 10 chars for security
		});

		// Exchange short-lived token for long-lived token
		const response = await fetch(
			`https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_CLIENT_ID}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&fb_exchange_token=${accessToken}`
		);

		if (!response.ok) {
			const error = await response.json();
			console.error("Facebook token exchange error:", error);
			return NextResponse.json(
				{ error: error.error?.message || "Failed to exchange token" },
				{ status: 500 }
			);
		}

		const data = await response.json();
		console.log(
			"Successfully exchanged token, expires in:",
			data.expires_in
		);

		return NextResponse.json({
			longLivedToken: data.access_token,
			expiresIn: data.expires_in,
		});
	} catch (error) {
		console.error("Error exchanging token:", error);
		return NextResponse.json(
			{ error: "Failed to exchange token" },
			{ status: 500 }
		);
	}
};
