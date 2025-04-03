import { uploadImage } from "./image-utils";

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
		try {
			// Upload image to Cloudinary first
			const cloudinaryUrl = await uploadImage(imageUrl);

			// First, try to upload the image
			const formData = new URLSearchParams();
			formData.append("url", cloudinaryUrl);
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
			console.log("Starting Instagram post process...");
			console.log("Using account ID:", instagramAccountId);

			// First, upload image to Cloudinary to ensure HTTPS URL
			const cloudinaryUrl = await uploadImage(imageUrl);
			console.log("Image uploaded to Cloudinary:", cloudinaryUrl);

			// Create a container for the media
			const containerFormData = new URLSearchParams();
			containerFormData.append("image_url", cloudinaryUrl);
			containerFormData.append("caption", caption);
			containerFormData.append("access_token", pageAccessToken);

			console.log("Creating media container...");
			const containerResponse = await fetch(
				`${
					this.baseUrl
				}/${instagramAccountId}/media?${containerFormData.toString()}`,
				{
					method: "POST",
				}
			);

			const containerText = await containerResponse.text();
			console.log("Container response text:", containerText);

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
			console.log("Media container created with ID:", containerId);

			// Wait for the container to be ready
			let status = "IN_PROGRESS";
			let attempts = 0;
			const maxAttempts = 10;

			while (status === "IN_PROGRESS" && attempts < maxAttempts) {
				await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
				console.log(
					`Checking status attempt ${attempts + 1}/${maxAttempts}...`
				);

				const statusResponse = await fetch(
					`${this.baseUrl}/${containerId}?fields=status_code&access_token=${pageAccessToken}`
				);
				const statusData = await statusResponse.json();
				status = statusData.status_code;
				console.log("Current status:", status);
				attempts++;
			}

			if (status !== "FINISHED") {
				throw new Error(
					`Container processing failed with status: ${status}`
				);
			}

			// Publish the container
			console.log("Publishing media...");
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

			console.log("Successfully published to Instagram:", publishData);

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
