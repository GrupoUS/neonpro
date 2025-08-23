import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
	let response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return request.cookies.get(name)?.value;
				},
				set(name: string, value: string, options: CookieOptions) {
					request.cookies.set({
						name,
						value,
						...options,
					});
					response = NextResponse.next({
						request: {
							headers: request.headers,
						},
					});
					response.cookies.set({
						name,
						value,
						...options,
					});
				},
				remove(name: string, options: CookieOptions) {
					request.cookies.set({
						name,
						value: "",
						...options,
					});
					response = NextResponse.next({
						request: {
							headers: request.headers,
						},
					});
					response.cookies.set({
						name,
						value: "",
						...options,
					});
				},
			},
		},
	);

	// Refresh session if expired - required for Server Components
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Protected routes that require authentication
	const protectedPaths = ["/dashboard", "/admin", "/settings", "/profile"];
	const isProtectedPath = protectedPaths.some((path) =>
		request.nextUrl.pathname.startsWith(path),
	);

	// Redirect to login if not authenticated and accessing protected route
	if (isProtectedPath && !user) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	// Redirect to dashboard if authenticated and accessing login/signup
	const authPaths = ["/login", "/signup"];
	const isAuthPath = authPaths.some((path) =>
		request.nextUrl.pathname.startsWith(path),
	);

	if (isAuthPath && user) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	return response;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 */
		"/((?!_next/static|_next/image|favicon.ico|public).*)",
	],
};
