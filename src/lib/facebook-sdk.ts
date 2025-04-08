declare global {
	interface Window {
		fbAsyncInit: () => void;
	}
}

async function getFacebookCredentials() {
	const response = await fetch("/api/users/facebook-credentials");
	const data = await response.json();
	console.log("data", data);
	return data;
}

export async function initializeFacebookSDK(): Promise<void> {
	const { appId } = await getFacebookCredentials();
	if (!window.FB) {
		return new Promise<void>((resolve) => {
			window.fbAsyncInit = function () {
				window.FB.init({
					appId: appId,
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
