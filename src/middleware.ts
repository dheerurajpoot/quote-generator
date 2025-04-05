import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
	const path = request.nextUrl.pathname;

	// Get token and userRole from cookies
	const token = request.cookies.get("token")?.value || "";
	const userRole = request.cookies.get("user_role")?.value || "";
	const isAdmin = userRole === "admin";
	const isBlocked = request.cookies.get("is_blocked")?.value === "true";

	// Public paths (accessible without login)
	const isPublicPath =
		path === "/" ||
		path === "/login" ||
		path === "/signup" ||
		path === "/verifyemail" ||
		path === "/blocked" ||
		path === "/about";

	// Protected paths (require login)
	const isProtectedPath =
		path.startsWith("/dashboard") ||
		path.startsWith("/api/subscriptions") ||
		path.startsWith("/api/settings") ||
		path.startsWith("/api/users/facebook-credentials");

	// Admin-only paths (require login and admin role)
	const isAdminPath = path.startsWith("/admin");

	// Redirect blocked users to blocked page
	if (isBlocked && !isPublicPath) {
		return NextResponse.redirect(new URL("/blocked", request.url));
	}

	// Redirect logged-in users away from login/register pages
	if (isPublicPath && token && (path === "/login" || path === "/signup")) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	// Redirect unauthenticated users trying to access protected paths
	if ((isProtectedPath || isAdminPath) && !token) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	// Redirect non-admin users trying to access admin-only paths
	if (isAdminPath && !isAdmin) {
		return NextResponse.redirect(new URL("/unauthorized", request.url));
	}

	// Check if it's a settings API route (excluding Facebook credentials)
	if (
		path.startsWith("/api/settings") &&
		!path.includes("facebook-credentials")
	) {
		// If no user role or not admin, return unauthorized
		if (!isAdmin) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/",
		"/login",
		"/signup",
		"/logout",
		"/admin/:path*",
		"/verifyemail",
		"/api/settings/:path*",
		"/api/users/facebook-credentials",
		"/dashboard/:path*",
		"/api/subscriptions/:path*",
		"/about",
	],
};
