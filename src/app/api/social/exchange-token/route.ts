import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbconfig";
import { User } from "@/models/user.model";
import { SocialConnection } from "@/models/socialConnection.model";
import jwt from "jsonwebtoken";

// Helper function to get user from token
async function getUserFromToken(token: string) {
	try {
		const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as {
			userId: string;
		};
		await connectDb();
		const user = await User.findById(decoded.userId);
		return user;
	} catch (error) {
		console.error("Error getting user from token:", error);
		return null;
	}
}

export const GET = async (request: Request) => {
	try {
		const { searchParams } = new URL(request.url);
		const accessToken = searchParams.get("access_token");
		const facebookAppId = searchParams.get("appId");
		const facebookAppSecret = searchParams.get("appSecret");
		const platform = searchParams.get("platform") || "facebook";
		const token = request.headers
			.get("cookie")
			?.split("; ")
			.find((row) => row.startsWith("token="))
			?.split("=")[1];

		if (!accessToken) {
			return NextResponse.json(
				{ message: "Access token is required", success: false },
				{ status: 400 }
			);
		}

		if (!token) {
			return NextResponse.json(
				{ message: "Authentication required" },
				{ status: 401 }
			);
		}

		// Get user from token
		const user = await getUserFromToken(token);
		if (!user) {
			return NextResponse.json(
				{ message: "User not found", success: false },
				{ status: 401 }
			);
		}

		if (!facebookAppId || !facebookAppSecret) {
			return NextResponse.json(
				{
					message: "Facebook app credentials not configured",
					success: false,
				},
				{ status: 500 }
			);
		}

		// Exchange short-lived token for long-lived token
		const response = await fetch(
			`https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${facebookAppId}&client_secret=${facebookAppSecret}&fb_exchange_token=${accessToken}`
		);

		if (!response.ok) {
			const error = await response.json();
			console.error(`${platform} token exchange error:`, error);
			return NextResponse.json(
				{
					message: error.error?.message || "Failed to exchange token",
					success: false,
				},
				{ status: 500 }
			);
		}

		const data = await response.json();

		// Default expiration time for Facebook tokens is 60 days (5184000 seconds)
		const DEFAULT_EXPIRATION = 5184000;
		const expiresIn = data.expires_in || DEFAULT_EXPIRATION;

		// Calculate expiration date
		const expiresAt = new Date();
		expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

		// For Instagram, we need to get the long-lived user access token
		if (platform === "instagram") {
			// First, exchange the short-lived token for a long-lived one
			const igTokenResponse = await fetch(
				`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${facebookAppSecret}&access_token=${accessToken}`
			);

			if (!igTokenResponse.ok) {
				const error = await igTokenResponse.json();
				return NextResponse.json(
					{
						message:
							error.error?.message ||
							"Failed to exchange Instagram token",
						success: false,
					},
					{ status: 500 }
				);
			}

			const igTokenData = await igTokenResponse.json();

			// Update the access token and expiration with the long-lived token data
			data.access_token = igTokenData.access_token;
			expiresAt.setSeconds(
				expiresAt.getSeconds() +
					(igTokenData.expires_in || DEFAULT_EXPIRATION)
			);

			// Get the Instagram Business Account ID
			const accountResponse = await fetch(
				`https://graph.facebook.com/v18.0/me/accounts?access_token=${data.access_token}`
			);

			if (!accountResponse.ok) {
				const error = await accountResponse.json();
				console.error("Error getting Instagram account:", error);
				return NextResponse.json(
					{
						message:
							error.error?.message ||
							"Failed to get Instagram account",
						success: false,
					},
					{ status: 500 }
				);
			}

			const accountData = await accountResponse.json();
			if (!accountData.data?.[0]?.id) {
				return NextResponse.json(
					{
						message: "No Instagram Business Account found",
						success: false,
					},
					{ status: 400 }
				);
			}

			// Get the Instagram Business Account access token
			const instagramTokenResponse = await fetch(
				`https://graph.facebook.com/v18.0/${accountData.data[0].id}?fields=instagram_business_account&access_token=${data.access_token}`
			);

			if (!instagramTokenResponse.ok) {
				const error = await instagramTokenResponse.json();
				console.error(
					"Error getting Instagram business account:",
					error
				);
				return NextResponse.json(
					{
						message:
							error.error?.message ||
							"Failed to get Instagram business account",
						success: false,
					},
					{ status: 500 }
				);
			}

			const instagramData = await instagramTokenResponse.json();
			if (!instagramData.instagram_business_account?.id) {
				return NextResponse.json(
					{
						message: "No Instagram Business Account ID found",
						success: false,
					},
					{ status: 400 }
				);
			}

			// Update or create social connection with expiration
			await SocialConnection.findOneAndUpdate(
				{
					userId: user._id,
					platform: "instagram",
				},
				{
					accessToken: data.access_token,
					pageAccessToken: accountData.data[0].access_token,
					instagramAccountId:
						instagramData.instagram_business_account.id,
					expiresAt: expiresAt,
					updatedAt: new Date(),
				},
				{ upsert: true, new: true }
			);

			return NextResponse.json({
				longLivedToken: data.access_token,
				expiresIn: data.expires_in,
				expiresAt: expiresAt,
				instagramAccountId: instagramData.instagram_business_account.id,
				pageAccessToken: accountData.data[0].access_token,
			});
		}

		// For Facebook, update the social connection with expiration
		await SocialConnection.findOneAndUpdate(
			{
				userId: user._id,
				platform: "facebook",
			},
			{
				accessToken: data.access_token,
				expiresAt: expiresAt,
				updatedAt: new Date(),
			},
			{ upsert: true, new: true }
		);

		return NextResponse.json({
			longLivedToken: data.access_token,
			expiresIn: data.expires_in,
			expiresAt: expiresAt,
		});
	} catch (error) {
		console.error("Error exchanging token:", error);
		return NextResponse.json(
			{ message: "Failed to exchange token", success: false },
			{ status: 500 }
		);
	}
};
