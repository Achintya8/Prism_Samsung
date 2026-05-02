import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Better Auth stores the session token in a cookie.
  // In development it's better-auth.session_token, in production it's __Secure-better-auth.session_token
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  const url = request.nextUrl.clone();

  // If the user is logged in and trying to access the landing page, redirect to dashboard
  if (sessionCookie && url.pathname === "/") {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Also protect the login and signup pages from being accessed by already logged-in users
  if (sessionCookie && (url.pathname === "/login" || url.pathname === "/signup")) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on specific routes to maximize performance
  matcher: ["/", "/login", "/signup"],
};
