import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbconfig";
import { User } from "@/models/user.model";
import jwt from "jsonwebtoken";

// Helper function to get user from token
async function getUserFromToken(token: string) {
	try {
		const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as {
			userId: string;
		};
		console.log("decoded", decoded);

		await connectDb();
		const user = await User.findById(decoded.userId);
		console.log("user", user);

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
		const platform = searchParams.get("platform") || "facebook";
		const token = request.headers
			.get("cookie")
			?.split("; ")
			.find((row) => row.startsWith("token="))
			?.split("=")[1];
		console.log("token", token);

		if (!accessToken) {
			return NextResponse.json(
				{ error: "Access token is required" },
				{ status: 400 }
			);
		}

		if (!token) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		// Get user from token
		const user = await getUserFromToken(token);
		console.log("user", user);
		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 401 }
			);
		}

		// Check if user has Facebook credentials
		if (!user.facebookAppId || !user.facebookAppSecret) {
			return NextResponse.json(
				{
					error: "Facebook credentials not found. Please set up your Facebook app credentials first.",
				},
				{ status: 400 }
			);
		}

		// Log the values for debugging
		console.log("Attempting to exchange token with:", {
			platform,
			appId: user.facebookAppId,
			hasSecret: !!user.facebookAppSecret,
			accessToken: accessToken.substring(0, 10) + "...", // Log only first 10 chars for security
		});

		// Exchange short-lived token for long-lived token
		const response = await fetch(
			`https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${user.facebookAppId}&client_secret=${user.facebookAppSecret}&fb_exchange_token=${accessToken}`
		);

		if (!response.ok) {
			const error = await response.json();
			console.error(`${platform} token exchange error:`, error);
			return NextResponse.json(
				{ error: error.error?.message || "Failed to exchange token" },
				{ status: 500 }
			);
		}

		const data = await response.json();
		console.log(
			`Successfully exchanged ${platform} token, expires in:`,
			data.expires_in
		);

		// For Instagram, we need to get the long-lived user access token
		if (platform === "instagram") {
			// Get the Instagram Business Account ID
			const accountResponse = await fetch(
				`https://graph.facebook.com/v18.0/me/accounts?access_token=${data.access_token}`
			);

			if (!accountResponse.ok) {
				const error = await accountResponse.json();
				console.error("Error getting Instagram account:", error);
				return NextResponse.json(
					{
						error:
							error.error?.message ||
							"Failed to get Instagram account",
					},
					{ status: 500 }
				);
			}

			const accountData = await accountResponse.json();
			if (!accountData.data?.[0]?.id) {
				return NextResponse.json(
					{ error: "No Instagram Business Account found" },
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
						error:
							error.error?.message ||
							"Failed to get Instagram business account",
					},
					{ status: 500 }
				);
			}

			const instagramData = await instagramTokenResponse.json();
			if (!instagramData.instagram_business_account?.id) {
				return NextResponse.json(
					{ error: "No Instagram Business Account ID found" },
					{ status: 400 }
				);
			}

			return NextResponse.json({
				longLivedToken: data.access_token,
				expiresIn: data.expires_in,
				instagramAccountId: instagramData.instagram_business_account.id,
				pageAccessToken: accountData.data[0].access_token,
			});
		}

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
