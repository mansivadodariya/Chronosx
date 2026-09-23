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
  "/my-bots",
  "/ai-bot-builder",
  "/manual-bot-builder",
  "/bot-library",
  "/browse-bots",
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

// Routes excluded from maintenance mode
const MAINTENANCE_EXCLUDED_PREFIXES = [
  "/_next",
  "/assets",
  "/favicon",
  "/icon",
  "/api/health",
  "/maintenance",
];

export function proxy(request) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;
  const isLoggedIn = Boolean(token);

  // --- Dynamic Maintenance Mode Check ---
  const isMaintenanceEnv =
    process.env.MAINTENANCE_MODE === "true" ||
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
  const forceMaintenanceCookie = request.cookies.get("chronosx_maintenance")?.value === "true";
  const forceMaintenanceQuery = searchParams.get("force_maintenance") === "true";
  const isMaintenanceActive = isMaintenanceEnv || forceMaintenanceCookie || forceMaintenanceQuery;

  // Check Developer / Admin Bypass Key
  const bypassParam = searchParams.get("bypass_maintenance");
  const bypassCookie = request.cookies.get("maintenance_bypass")?.value;
  const validBypassSecret = process.env.MAINTENANCE_BYPASS_KEY || "chronosx-secret";
  const isBypassed =
    bypassCookie === "true" ||
    bypassCookie === validBypassSecret ||
    bypassParam === validBypassSecret ||
    bypassParam === "true";

  const isExcludedFromMaintenance = MAINTENANCE_EXCLUDED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(prefix)
  );

  // If site is in maintenance mode and not bypassed
  if (isMaintenanceActive && !isBypassed && !isExcludedFromMaintenance) {
    // Return 503 for API routes
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          error: "Service Temporarily Unavailable",
          status: "maintenance",
          retryAfter: 120,
        },
        {
          status: 503,
          headers: {
            "Retry-After": "120",
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    // Rewrite page requests to /maintenance with 503 status code for SEO safety
    const maintenanceUrl = new URL("/maintenance", request.url);
    return NextResponse.rewrite(maintenanceUrl, {
      status: 503,
      headers: {
        "Retry-After": "120",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

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

export const middleware = proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.png|favicon.svg|assets).*)",
  ],
};
