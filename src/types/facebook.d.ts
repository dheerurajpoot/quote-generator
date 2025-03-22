interface FacebookLoginResponse {
	authResponse: {
		accessToken: string;
		userID: string;
		expiresIn: number;
		signedRequest: string;
	};
}

interface FacebookPage {
	id: string;
	name: string;
	access_token: string;
}

interface FacebookPagesResponse {
	data: FacebookPage[];
}

interface InstagramAccount {
	pageId: string;
	pageName: string;
	pageAccessToken: string;
	instagramAccountId: string;
}

interface FacebookSDK {
	init(options: {
		appId: string;
		cookie: boolean;
		xfbml: boolean;
		version: string;
	}): void;
	login(
		callback: (response: FacebookLoginResponse) => void,
		options?: {
			scope?: string;
			return_scopes?: boolean;
		}
	): void;
	api(
		path: string,
		callback: (response: FacebookPagesResponse) => void
	): void;
}

declare global {
	interface Window {
		FB: FacebookSDK;
		fbAsyncInit: () => void;
	}
}

export type {
	FacebookLoginResponse,
	FacebookPagesResponse,
	FacebookPage,
	FacebookSDK,
	InstagramAccount,
};
