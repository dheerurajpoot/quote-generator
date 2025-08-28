import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard", "/admin"];

// Define public routes that don't need authentication
const publicRoutes = [
	"/login",
	"/signup",
	"/forgot-password",
	"/reset-password",
	"/verifyemail",
];

export function middleware(request: NextRequest) {
	console.log("middleware running for:", request.nextUrl.pathname);
	const { pathname } = request.nextUrl;

	// Check if the route is protected
	const isProtectedRoute = protectedRoutes.some((route) =>
		pathname.startsWith(route)
	);

	// Check if the route is public
	const isPublicRoute = publicRoutes.some(
		(route) => pathname === route || pathname.startsWith("/api/")
	);

	// Skip middleware for public routes and API routes
	if (isPublicRoute) {
		console.log("Public route, skipping middleware");
		return NextResponse.next();
	}

	// Check for authentication token in cookies
	const token = request.cookies.get("token")?.value;
	console.log(
		"Token found:",
		!!token,
		"Path:",
		pathname,
		"Protected:",
		isProtectedRoute
	);

	// If it's a protected route and no token exists, redirect to login
	if (isProtectedRoute && !token) {
		console.log("Redirecting to login - no token for protected route");
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("redirect", pathname);
		return NextResponse.redirect(loginUrl);
	}

	// If user has token and tries to access auth pages, redirect to dashboard
	if (token && (pathname === "/login" || pathname === "/signup")) {
		console.log("Redirecting to dashboard - user already authenticated");
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// Allow access to protected routes if token exists
	console.log("Allowing access to:", pathname);
	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|public).*)",
	],
};
