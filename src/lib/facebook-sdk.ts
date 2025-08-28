declare global {
	interface Window {
		fbAsyncInit: () => void;
	}
}

export async function initializeFacebookSDK(): Promise<void> {
	if (!window.FB) {
		return new Promise<void>((resolve) => {
			window.fbAsyncInit = function () {
				window.FB.init({
					appId: "995595962511563",
					cookie: true,
					xfbml: true,
					version: "v18.0",
				});
				resolve();
			};
			(function (d, s, id) {
				const fjs = d.getElementsByTagName(s)[0];
				if (d.getElementById(id)) return;
				const js = d.createElement(s) as HTMLScriptElement;
				js.id = id;
				js.src = "https://connect.facebook.net/en_US/sdk.js";
				fjs.parentNode?.insertBefore(js, fjs);
			})(document, "script", "facebook-jssdk");
		});
	}
}
