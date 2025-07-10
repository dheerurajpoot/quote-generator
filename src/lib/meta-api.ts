import { SocialConnection } from "@/models/socialConnection.model";
import { User } from "@/models/user.model";
import { connectDb } from "./dbconfig";
import axios from "axios";

export interface MetaApiConfig {
	accessToken: string;
	apiVersion?: string;
	userId?: string;
	platform?: string;
}

export class MetaApi {
	private accessToken: string;
	private apiVersion: string;
	private baseUrl: string;
	private userId?: string;
	private platform?: string;

	constructor(config: MetaApiConfig) {
		this.accessToken = config.accessToken;
		this.apiVersion = config.apiVersion || "v18.0";
		this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
		this.userId = config.userId;
		this.platform = config.platform;
	}

	// Check if token is expired and refresh if needed
	private async checkTokenExpiration() {
		if (!this.userId || !this.platform) return;

		try {
			await connectDb();
			const connection = await SocialConnection.findOne({
				userId: this.userId,
				platform: this.platform,
			});

			if (!connection) return;

			// Check if token is expired or will expire in the next hour
			const now = new Date();
			const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

			if (connection.expiresAt && connection.expiresAt < oneHourFromNow) {
				// Token is expired or will expire soon, refresh it
				const user = await User.findById(this.userId);
				if (!user?.facebookAppId || !user?.facebookAppSecret) {
					throw new Error("Facebook app credentials not found");
				}

				// For Instagram, we need to use a different endpoint to exchange tokens
				if (this.platform === "instagram") {
					// Get the Instagram Business Account ID
					const igResponse = await fetch(
						`https://graph.facebook.com/${this.apiVersion}/me?fields=instagram_business_account&access_token=${this.accessToken}`
					);

					if (!igResponse.ok) {
						const error = await igResponse.json();
						throw new Error(
							`Failed to get Instagram account: ${
								error.error?.message || "Unknown error"
							}`
						);
					}

					const igData = await igResponse.json();
					if (!igData.instagram_business_account?.id) {
						throw new Error("Instagram business account not found");
					}

					// Exchange the Instagram token for a long-lived token
					const response = await fetch(
						`https://graph.facebook.com/${this.apiVersion}/${igData.instagram_business_account.id}?fields=access_token&access_token=${this.accessToken}`
					);

					if (!response.ok) {
						const error = await response.json();
						throw new Error(
							`Failed to refresh Instagram token: ${
								error.error?.message || "Unknown error"
							}`
						);
					}

					const data = await response.json();
					if (!data.access_token) {
						throw new Error(
							"No access token received from Instagram"
						);
					}

					// Update the connection with the new Instagram token
					connection.accessToken = data.access_token;
					connection.expiresAt = new Date(
						now.getTime() + 60 * 24 * 60 * 60 * 1000
					); // 60 days
					await connection.save();

					// Update the instance token
					this.accessToken = data.access_token;
				} else {
					// For Facebook, use the standard token exchange
					const response = await fetch(
						`https://graph.facebook.com/${this.apiVersion}/oauth/access_token?grant_type=fb_exchange_token&client_id=${user.facebookAppId}&client_secret=${user.facebookAppSecret}&fb_exchange_token=${this.accessToken}`
					);

					if (!response.ok) {
						const error = await response.json();
						throw new Error(
							`Failed to refresh token: ${
								error.error?.message || "Unknown error"
							}`
						);
					}

					const data = await response.json();

					// Calculate new expiration date
					const expiresAt = new Date();
					expiresAt.setSeconds(
						expiresAt.getSeconds() + data.expires_in
					);

					// Update the connection with the new token
					connection.accessToken = data.access_token;
					connection.expiresAt = expiresAt;
					await connection.save();

					// Update the instance token
					this.accessToken = data.access_token;

					// Get new page access token if needed
					const pagesResponse = await fetch(
						`${this.baseUrl}/me/accounts?access_token=${data.access_token}`
					);

					if (!pagesResponse.ok) {
						const error = await pagesResponse.json();
						throw new Error(
							`Failed to get pages: ${
								error.error?.message || "Unknown error"
							}`
						);
					}

					const pagesData = await pagesResponse.json();
					if (pagesData.data?.[0]?.access_token) {
						connection.pageAccessToken =
							pagesData.data[0].access_token;
						await connection.save();
					}
				}
			}
		} catch (error) {
			console.error("Error checking token expiration:", error);
			throw error; // Re-throw to handle it in the calling method
		}
	}

	// Get user profile information
	async getUserProfile() {
		await this.checkTokenExpiration();

		const response = await fetch(
			`${this.baseUrl}/me?fields=id,name,picture&access_token=${this.accessToken}`
		);

		if (!response.ok) {
			const error = await response.json();
			throw new Error(
				`Failed to get user profile: ${error.error.message}`
			);
		}

		return await response.json();
	}

	// Get user's Facebook pages
	async getUserPages() {
		await this.checkTokenExpiration();

		const response = await fetch(
			`${this.baseUrl}/me/accounts?fields=id,name,access_token,picture&access_token=${this.accessToken}`
		);

		if (!response.ok) {
			const error = await response.json();
			throw new Error(`Failed to get user pages: ${error.error.message}`);
		}

		return await response.json();
	}

	// Get Instagram business accounts connected to Facebook pages
	async getInstagramAccounts(pageId: string, pageAccessToken: string) {
		await this.checkTokenExpiration();

		const response = await fetch(
			`${this.baseUrl}/${pageId}?fields=instagram_business_account{id,name,username,profile_picture_url}&access_token=${pageAccessToken}`
		);

		if (!response.ok) {
			const error = await response.json();
			throw new Error(
				`Failed to get Instagram accounts: ${error.error.message}`
			);
		}

		return await response.json();
	}

	// Post to Facebook page
	async postToFacebook(
		pageId: string,
		pageAccessToken: string,
		imageUrl: string,
		caption: string
	) {
		await this.checkTokenExpiration();

		try {
			const formData = new URLSearchParams();
			formData.append("url", imageUrl);
			formData.append("caption", caption);
			formData.append("access_token", pageAccessToken);

			// Use the correct endpoint for page photos
			const response = await axios.post(
				`${this.baseUrl}/${pageId}/photos?access_token=${pageAccessToken}`,
				formData.toString()
			);

			const responseData = response.data;

			if (response.status !== 200) {
				throw new Error(
					`Failed to post to Facebook: ${
						responseData.error?.message || "Unknown error"
					} (code: ${responseData.error?.code || "n/a"})`
				);
			}

			// Get the post ID from the response
			const postId = responseData.post_id || responseData.id;
			if (!postId) {
				throw new Error("No post ID received from Facebook");
			}

			return {
				success: true,
				postId: postId,
				url: `https://facebook.com/${pageId}/posts/${postId}`,
			};
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				console.error(
					"Facebook API Error Response:",
					error.response.data
				);
			}
			console.error("Error posting to Facebook:", error);
			throw error;
		}
	}

	// Post to Instagram business account
	async postToInstagram(
		instagramAccountId: string,
		pageAccessToken: string,
		imageUrl: string,
		caption: string
	) {
		await this.checkTokenExpiration();

		try {
			// Create a container for the media
			const containerFormData = new URLSearchParams();
			containerFormData.append("image_url", imageUrl);
			containerFormData.append("caption", caption);
			containerFormData.append("access_token", pageAccessToken);

			const containerResponse = await fetch(
				`${
					this.baseUrl
				}/${instagramAccountId}/media?${containerFormData.toString()}`,
				{
					method: "POST",
				}
			);

			const containerText = await containerResponse.text();

			let containerData;
			try {
				containerData = JSON.parse(containerText);
			} catch (e) {
				console.error("Failed to parse container response:", e);
				throw new Error(
					`Invalid response from Instagram API: ${containerText}`
				);
			}

			if (!containerResponse.ok || !containerData.id) {
				console.error(
					"Instagram container creation error:",
					containerData
				);
				throw new Error(
					`Failed to create Instagram container: ${
						containerData.error?.message || "Unknown error"
					}`
				);
			}

			const containerId = containerData.id;

			// Wait for the container to be ready
			let status = "IN_PROGRESS";
			let attempts = 0;
			const maxAttempts = 10;

			while (status === "IN_PROGRESS" && attempts < maxAttempts) {
				await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

				const statusResponse = await fetch(
					`${this.baseUrl}/${containerId}?fields=status_code&access_token=${pageAccessToken}`
				);
				const statusData = await statusResponse.json();
				status = statusData.status_code;
				attempts++;
			}

			if (status !== "FINISHED") {
				throw new Error(
					`Container processing failed with status: ${status}`
				);
			}

			// Publish the container
			const publishFormData = new URLSearchParams();
			publishFormData.append("creation_id", containerId);
			publishFormData.append("access_token", pageAccessToken);

			const publishResponse = await fetch(
				`${this.baseUrl}/${instagramAccountId}/media_publish`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
					body: publishFormData.toString(),
				}
			);

			const publishData = await publishResponse.json();

			if (!publishResponse.ok || !publishData.id) {
				console.error("Instagram publish error:", publishData);
				throw new Error(
					`Failed to publish to Instagram: ${
						publishData.error?.message || "Unknown error"
					}`
				);
			}
			return {
				success: true,
				postId: publishData.id,
				url: `https://instagram.com/p/${publishData.id}`,
			};
		} catch (error) {
			console.error("Instagram posting error:", error);
			throw error;
		}
	}
}
