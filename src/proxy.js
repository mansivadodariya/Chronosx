import { NextResponse } from "next/server";

// Routes that require a logged-in user
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/chart-scanner",
  "/trade-audit",
  "/market-assistant",
  "/live-scanner",
  "/strategy-hub",
  "/calendar",
  "/calculator",
  "/news",
  "/tools",
  "/credit-history",
  "/broker",
  "/brokers",
  "/profile",
  "/settings",
  "/onboarding",
  "/steper",
];

// Auth routes — already-logged-in users should be bounced to /dashboard or their intended redirect
const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;
  const isLoggedIn = Boolean(token);

  if (pathname === "/tools") {
    return NextResponse.redirect(new URL("/calendar", request.url));
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    let redirectTarget = request.nextUrl.searchParams.get("redirect") || "/dashboard";
    if (
      redirectTarget === "/onboarding" ||
      redirectTarget === "/steper" ||
      redirectTarget.startsWith("/onboarding") ||
      redirectTarget.startsWith("/steper")
    ) {
      redirectTarget = "/dashboard";
    }
    return NextResponse.redirect(new URL(redirectTarget, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chart-scanner/:path*",
    "/trade-audit/:path*",
    "/market-assistant/:path*",
    "/live-scanner/:path*",
    "/strategy-hub/:path*",
    "/calendar",
    "/calendar/:path*",
    "/calculator",
    "/calculator/:path*",
    "/news",
    "/news/:path*",
    "/tools",
    "/tools/:path*",
    "/credit-history/:path*",
    "/broker/:path*",
    "/brokers/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/onboarding",
    "/onboarding/:path*",
    "/steper",
    "/steper/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ],
};
