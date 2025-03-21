import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	const path = request.nextUrl.pathname;

	// Get token and userRole from cookies
	const token = request.cookies.get("token")?.value || "";
	const userRole = request.cookies.get("userRole")?.value || "";

	// Public paths (accessible without login)
	const isPublicPath =
		path === "/" ||
		path === "/login" ||
		path === "/register" ||
		path === "/verifyemail" ||
		path.startsWith("/product");

	// Protected paths (require login)
	const isProtectedPath = path.startsWith("/dashboard");

	// Admin-only paths (require login and admin role)
	const isAdminPath = path.startsWith("/admin");

	// Redirect logged-in users away from login/register pages
	if (isPublicPath && token && (path === "/login" || path === "/signup")) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	// Redirect unauthenticated users trying to access protected paths
	if ((isProtectedPath || isAdminPath) && !token) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	// Redirect non-admin users trying to access admin-only paths
	if (isAdminPath && userRole !== "admin") {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/",
		"/login",
		"/signup",
		"/logout",
		"/dashboard",
		"/admin/:path*",
		"/verifyemail",
	],
};
