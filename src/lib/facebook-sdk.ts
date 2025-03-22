import type { FacebookSDK } from "@/types/facebook";

declare global {
	interface Window {
		FB: FacebookSDK;
		fbAsyncInit: () => void;
	}
}

export async function initializeFacebookSDK(): Promise<void> {
	if (!window.FB) {
		return new Promise<void>((resolve, reject) => {
			window.fbAsyncInit = function () {
				window.FB.init({
					appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "",
					cookie: true,
					xfbml: true,
					version: "v18.0",
				});
				resolve();
			};
			(function (d, s, id) {
				var js,
					fjs = d.getElementsByTagName(s)[0];
				if (d.getElementById(id)) return;
				js = d.createElement(s) as HTMLScriptElement;
				js.id = id;
				js.src = "https://connect.facebook.net/en_US/sdk.js";
				fjs.parentNode?.insertBefore(js, fjs);
			})(document, "script", "facebook-jssdk");
		});
	}
}
