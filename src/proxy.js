import { NextResponse } from "next/server";

// Routes that require a logged-in user
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/chart-scanner",
  "/trade-advisor",
  "/trade-audit",
  "/market-assistant",
  "/signal-terminal",
  "/live-scanner",
  "/strategy-core",
  "/trading-signal",
  "/ai-trading-signal",
  "/strategy-signal",
  "/predefined-strategies",
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

  // Redirect /broker to /brokers
  if (pathname === "/broker") {
    return NextResponse.redirect(new URL("/brokers", request.url));
  }
  if (pathname.startsWith("/broker/")) {
    return NextResponse.redirect(new URL(pathname.replace("/broker/", "/brokers/"), request.url));
  }

  if (pathname === "/tools") {
    return NextResponse.redirect(new URL("/calculator", request.url));
  }

  // Redirect legacy / old route names to new standardized route names
  if (pathname === "/strategy-hub/strategy") {
    return NextResponse.redirect(new URL("/strategy-signal", request.url));
  }
  if (pathname === "/strategy-hub/live") {
    return NextResponse.redirect(new URL("/signal-terminal", request.url));
  }
  if (pathname === "/strategy-hub" || pathname.startsWith("/strategy-hub/")) {
    return NextResponse.redirect(new URL(pathname.replace("/strategy-hub", "/strategy-core"), request.url));
  }
  if (pathname === "/ai-strategy-hub" || pathname.startsWith("/ai-strategy-hub/")) {
    return NextResponse.redirect(new URL(pathname.replace("/ai-strategy-hub", "/ai-trading-signal"), request.url));
  }
  if (pathname === "/ai-strategy-core" || pathname.startsWith("/ai-strategy-core/")) {
    return NextResponse.redirect(new URL(pathname.replace("/ai-strategy-core", "/ai-trading-signal"), request.url));
  }
  if (pathname === "/live-scanner" || pathname.startsWith("/live-scanner/")) {
    return NextResponse.redirect(new URL(pathname.replace("/live-scanner", "/signal-terminal"), request.url));
  }
  if (pathname === "/live-market-scanner" || pathname.startsWith("/live-market-scanner/")) {
    return NextResponse.redirect(new URL(pathname.replace("/live-market-scanner", "/signal-terminal"), request.url));
  }
  if (pathname === "/trade-audit" || pathname.startsWith("/trade-audit/")) {
    return NextResponse.redirect(new URL(pathname.replace("/trade-audit", "/trade-advisor"), request.url));
  }
  if (pathname === "/ai-trade-audit" || pathname.startsWith("/ai-trade-audit/")) {
    return NextResponse.redirect(new URL(pathname.replace("/ai-trade-audit", "/ai-trade-advisor"), request.url));
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
    "/trade-advisor/:path*",
    "/ai-trade-audit/:path*",
    "/ai-trade-advisor/:path*",
    "/market-assistant/:path*",
    "/live-scanner/:path*",
    "/live-market-scanner/:path*",
    "/signal-terminal/:path*",
    "/strategy-core/:path*",
    "/strategy-signal/:path*",
    "/predefined-strategies/:path*",
    "/ai-strategy-core/:path*",
    "/trading-signal/:path*",
    "/calendar/:path*",
    "/economic-calendar",
    "/economic-calendar/:path*",
    "/calculator",
    "/calculator/:path*",
    "/forex-calculator",
    "/forex-calculator/:path*",
    "/news",
    "/news/:path*",
    "/market-news",
    "/market-news/:path*",
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
