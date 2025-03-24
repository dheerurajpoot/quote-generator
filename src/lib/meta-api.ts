import { downloadImage, cleanupImage, getAbsoluteUrl } from "./image-utils";

export interface MetaApiConfig {
	accessToken: string;
	apiVersion?: string;
}

export class MetaApi {
	private accessToken: string;
	private apiVersion: string;
	private baseUrl: string;

	constructor(config: MetaApiConfig) {
		this.accessToken = config.accessToken;
		this.apiVersion = config.apiVersion || "v18.0";
		this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
	}

	// Get user profile information
	async getUserProfile() {
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
		let localImageUrl: string | null = null;

		try {
			console.log("Attempting to post to Facebook:", {
				pageId,
				imageUrl,
				caption,
			});

			// Download the image to a local temp directory
			localImageUrl = await downloadImage(imageUrl);
			const absoluteImageUrl = getAbsoluteUrl(localImageUrl);

			console.log("Using local image URL:", absoluteImageUrl);

			// First, try to upload the image
			const formData = new URLSearchParams();
			formData.append("url", absoluteImageUrl);
			formData.append("caption", caption);
			formData.append("access_token", pageAccessToken);

			// Use the correct endpoint for page photos
			const response = await fetch(
				`${this.baseUrl}/${pageId}/photos?access_token=${pageAccessToken}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
					body: formData.toString(),
				}
			);

			const responseData = await response.json();
			console.log("Facebook API Response:", responseData);

			if (!response.ok) {
				const errorMessage =
					responseData.error?.message || "Unknown error";
				console.error("Facebook API Error:", errorMessage);
				throw new Error(`Failed to post to Facebook: ${errorMessage}`);
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
			console.error("Error posting to Facebook:", error);
			throw error;
		} finally {
			// Clean up the temporary image file
			if (localImageUrl) {
				cleanupImage(localImageUrl);
			}
		}
	}

	// Post to Instagram business account
	async postToInstagram(
		instagramAccountId: string,
		pageAccessToken: string,
		imageUrl: string,
		caption: string
	) {
		try {
			// First, create a container
			const containerResponse = await fetch(
				`${
					this.baseUrl
				}/${instagramAccountId}/media?image_url=${encodeURIComponent(
					imageUrl
				)}&caption=${encodeURIComponent(
					caption
				)}&access_token=${pageAccessToken}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			if (!containerResponse.ok) {
				const error = await containerResponse.json();
				throw new Error(
					`Failed to create Instagram container: ${
						error.error?.message || "Unknown error"
					}`
				);
			}

			const containerResult = await containerResponse.json();
			if (!containerResult.id) {
				throw new Error("No container ID received from Instagram");
			}

			const containerId = containerResult.id;

			// Then publish the container
			const publishResponse = await fetch(
				`${this.baseUrl}/${instagramAccountId}/media_publish?creation_id=${containerId}&access_token=${pageAccessToken}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			if (!publishResponse.ok) {
				const error = await publishResponse.json();
				throw new Error(
					`Failed to publish to Instagram: ${
						error.error?.message || "Unknown error"
					}`
				);
			}

			const publishResult = await publishResponse.json();
			if (!publishResult.id) {
				throw new Error("No post ID received from Instagram");
			}

			return {
				success: true,
				postId: publishResult.id,
				url: `https://instagram.com/p/${publishResult.id}`,
			};
		} catch (error) {
			console.error("Instagram posting error:", error);
			throw error;
		}
	}
}
