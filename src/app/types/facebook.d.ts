export interface FacebookLoginResponse {
	authResponse: {
		accessToken: string;
		expiresIn: number;
		signedRequest: string;
		userID: string;
	} | null;
	status: string;
}

export interface FacebookPage {
	access_token: string;
	id: string;
	name: string;
	picture?: {
		data: {
			url: string;
		};
	};
	instagram_business_account?: InstagramBusinessAccount;
}

export interface FacebookPagesResponse {
	data: FacebookPage[];
	error?: FacebookError;
}

export interface FacebookError {
	message: string;
	type: string;
	code: number;
	error_subcode?: number;
}

export interface FacebookUserResponse {
	id: string;
	name: string;
	error?: FacebookError;
}

export interface InstagramBusinessAccount {
	id: string;
	name: string;
	username: string;
	profile_picture_url: string;
}

export interface FacebookPageResponse {
	id: string;
	name: string;
	access_token: string;
	instagram_business_account?: InstagramBusinessAccount;
	error?: FacebookError;
}

export interface InstagramAccount {
	pageId: string;
	pageName: string;
	pageAccessToken: string;
	instagramAccountId: string;
	username: string;
	profilePicture: string;
}

export interface SocialConnection {
	id: string;
	platform: "facebook" | "instagram";
	profileId: string;
	profileName: string;
	profileImage: string;
	connected: boolean;
}

declare global {
	interface Window {
		FB: {
			init(options: {
				appId: string;
				cookie: boolean;
				xfbml: boolean;
				version: string;
			}): void;
			login(
				callback: (response: FacebookLoginResponse) => void,
				options?: { scope: string; return_scopes?: boolean }
			): void;
			api<T>(
				path: string,
				callback: (response: T & { error?: FacebookError }) => void
			): void;
		};
	}
}
