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

// Language route aliases (e.g. /arabic, /spanish, /ar, /ru, /zh)
const LANGUAGE_ALIASES = {
  en: "en",
  english: "en",
  ar: "ar",
  arabic: "ar",
  ary: "ary",
  darija: "ary",
  moroccan: "ary",
  "moroccan-arabic": "ary",
  es: "es",
  spanish: "es",
  espanol: "es",
  ru: "ru",
  russian: "ru",
  zh: "zh",
  chinese: "zh",
  mandarin: "zh",
  vi: "vi",
  vietnamese: "vi",
  id: "id",
  indonesian: "id",
  fil: "fil",
  filipino: "fil",
  tagalog: "fil",
  ph: "fil",
};

export function proxy(request) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;
  const isLoggedIn = Boolean(token);

  // --- 1. Language Path Prefix Detection & Normalization ---
  const pathSegments = pathname.split("/").filter(Boolean);
  const firstSegment = pathSegments[0]?.toLowerCase();
  const matchedLocale = LANGUAGE_ALIASES[firstSegment];

  let normalizedPathname = pathname;
  if (matchedLocale && !pathname.startsWith("/api/")) {
    const remainingSegments = pathSegments.slice(1);
    normalizedPathname = remainingSegments.length > 0 ? "/" + remainingSegments.join("/") : "/";
  }


  // If no locale prefix is present on a non-API route, redirect to include the active language (e.g. /en/..., /ar/...)
  if (!matchedLocale && !pathname.startsWith("/api/")) {
    const cookieLang = request.cookies.get("app_language")?.value || request.cookies.get("NEXT_LOCALE")?.value;
    const targetLang = (cookieLang && LANGUAGE_ALIASES[cookieLang.toLowerCase()]) || "en";
    const localizedPath = pathname === "/" ? `/${targetLang}` : `/${targetLang}${pathname}`;
    const redirectUrl = new URL(localizedPath, request.url);
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl);
  }

  const prefixLang = matchedLocale ? `/${matchedLocale}` : "/en";


  // --- 2. Dynamic Maintenance Mode Check ---
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
    (prefix) => normalizedPathname === prefix || normalizedPathname.startsWith(`${prefix}/`) || normalizedPathname.startsWith(prefix)
  );

  // If site is in maintenance mode and not bypassed
  if (isMaintenanceActive && !isBypassed && !isExcludedFromMaintenance) {
    if (normalizedPathname.startsWith("/api/")) {
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

    const maintenanceUrl = new URL(`${prefixLang}/maintenance`, request.url);
    return NextResponse.rewrite(maintenanceUrl, {
      status: 503,
      headers: {
        "Retry-After": "120",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  // --- 3. Route Aliases & Standardizations ---
  if (normalizedPathname === "/broker") {
    return NextResponse.redirect(new URL(`${prefixLang}/brokers`, request.url));
  }
  if (normalizedPathname.startsWith("/broker/")) {
    return NextResponse.redirect(new URL(`${prefixLang}${normalizedPathname.replace("/broker/", "/brokers/")}`, request.url));
  }
  if (normalizedPathname === "/tools") {
    return NextResponse.redirect(new URL(`${prefixLang}/calculator`, request.url));
  }
  if (normalizedPathname === "/strategy-hub/strategy") {
    return NextResponse.redirect(new URL(`${prefixLang}/strategy-signal`, request.url));
  }
  if (normalizedPathname === "/strategy-hub/live") {
    return NextResponse.redirect(new URL(`${prefixLang}/signal-terminal`, request.url));
  }
  if (normalizedPathname === "/strategy-hub" || normalizedPathname.startsWith("/strategy-hub/")) {
    return NextResponse.redirect(new URL(`${prefixLang}${normalizedPathname.replace("/strategy-hub", "/strategy-core")}`, request.url));
  }
  if (normalizedPathname === "/ai-strategy-hub" || normalizedPathname.startsWith("/ai-strategy-hub/")) {
    return NextResponse.redirect(new URL(`${prefixLang}${normalizedPathname.replace("/ai-strategy-hub", "/ai-trading-signal")}`, request.url));
  }
  if (normalizedPathname === "/ai-strategy-core" || normalizedPathname.startsWith("/ai-strategy-core/")) {
    return NextResponse.redirect(new URL(`${prefixLang}${normalizedPathname.replace("/ai-strategy-core", "/ai-trading-signal")}`, request.url));
  }
  if (normalizedPathname === "/live-scanner" || normalizedPathname.startsWith("/live-scanner/")) {
    return NextResponse.redirect(new URL(`${prefixLang}${normalizedPathname.replace("/live-scanner", "/signal-terminal")}`, request.url));
  }
  if (normalizedPathname === "/live-market-scanner" || normalizedPathname.startsWith("/live-market-scanner/")) {
    return NextResponse.redirect(new URL(`${prefixLang}${normalizedPathname.replace("/live-market-scanner", "/signal-terminal")}`, request.url));
  }
  if (normalizedPathname === "/trade-audit" || normalizedPathname.startsWith("/trade-audit/")) {
    return NextResponse.redirect(new URL(`${prefixLang}${normalizedPathname.replace("/trade-audit", "/trade-advisor")}`, request.url));
  }
  if (normalizedPathname === "/ai-trade-audit" || normalizedPathname.startsWith("/ai-trade-audit/")) {
    return NextResponse.redirect(new URL(`${prefixLang}${normalizedPathname.replace("/ai-trade-audit", "/ai-trade-advisor")}`, request.url));
  }
  if (
    normalizedPathname === "/predefine-strategy" ||
    normalizedPathname === "/predefined-strategy" ||
    normalizedPathname === "/predefine-strategies" ||
    normalizedPathname.startsWith("/predefine-strategy/") ||
    normalizedPathname.startsWith("/predefined-strategy/") ||
    normalizedPathname.startsWith("/predefine-strategies/")
  ) {
    return NextResponse.redirect(new URL(`${prefixLang}/predefined-strategies`, request.url));
  }

  // --- 4. Protected Route & Auth Redirections ---
  const isProtected = PROTECTED_PREFIXES.some((p) => normalizedPathname === p || normalizedPathname.startsWith(`${p}/`));
  const isAuthRoute = AUTH_ROUTES.some((p) => normalizedPathname === p || normalizedPathname.startsWith(`${p}/`));

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL(`${prefixLang}/login`, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    let redirectTarget = request.nextUrl.searchParams.get("redirect") || `${prefixLang}/dashboard`;
    if (
      redirectTarget === "/onboarding" ||
      redirectTarget === "/steper" ||
      redirectTarget.startsWith("/onboarding") ||
      redirectTarget.startsWith("/steper")
    ) {
      redirectTarget = `${prefixLang}/dashboard`;
    }
    return NextResponse.redirect(new URL(redirectTarget, request.url));
  }

  // --- 5. Rewrite Localized Path to Canonical Next.js Page ---
  if (matchedLocale && !pathname.startsWith("/api/")) {
    const targetUrl = new URL(normalizedPathname, request.url);
    targetUrl.search = request.nextUrl.search;

    const response = NextResponse.rewrite(targetUrl);
    response.cookies.set("app_language", matchedLocale, { path: "/", maxAge: 31536000, sameSite: "lax" });
    response.cookies.set("NEXT_LOCALE", matchedLocale, { path: "/", maxAge: 31536000, sameSite: "lax" });
    response.headers.set("x-chronosx-lang", matchedLocale);
    return response;
  }

  return NextResponse.next();
}

export const middleware = proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.png|favicon.svg|assets).*)",
  ],
};
