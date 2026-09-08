/**
 * Shared Authentication & Redirection Helper
 * Handles consistent checking of both localStorage and cookies,
 * and builds resilient redirect URLs that return the user to their
 * intended destination after logging in.
 */

export function isUserLoggedIn() {
    if (typeof window === 'undefined') return false;
    try {
        const localToken = localStorage.getItem('access_token');
        const hasLocalToken = Boolean(
            localToken && localToken.trim() && localToken !== 'undefined' && localToken !== 'null'
        );

        const hasCookieToken = Boolean(
            document.cookie
                .split(';')
                .some((c) => {
                    const trimmed = c.trim();
                    if (!trimmed.startsWith('auth_token=')) return false;
                    const val = trimmed.split('=')[1];
                    return Boolean(val && val.trim() && val !== 'undefined' && val !== 'null');
                })
        );

        return hasLocalToken || hasCookieToken;
    } catch {
        return false;
    }
}

/**
 * Returns the destination href for a CTA button or link.
 * If the user is logged in, returns the target path directly.
 * Otherwise returns /login?redirect=<target> so login bounces them back.
 */
export function getAuthHref(targetPath = '/dashboard') {
    const validTarget = targetPath && targetPath !== '/' ? targetPath : '/dashboard';
    if (typeof window === 'undefined') return `/login?redirect=${encodeURIComponent(validTarget)}`;
    return isUserLoggedIn() ? validTarget : `/login?redirect=${encodeURIComponent(validTarget)}`;
}

/**
 * Navigates to targetPath if logged in, otherwise to login with redirect param.
 * Pass a Next.js router instance or fallback to window.location.
 */
export function authNavigate(router, targetPath = '/dashboard') {
    const validTarget = targetPath && targetPath !== '/' ? targetPath : '/dashboard';
    const destination = getAuthHref(validTarget);
    if (router && typeof router.push === 'function') {
        router.push(destination);
    } else if (typeof window !== 'undefined') {
        window.location.assign(destination);
    }
}

/**
 * Returns the destination href for a feature link:
 * - If user is logged in: dashboardPath (e.g. /trade-snap)
 * - If user is logged out: publicPath (e.g. /ai-trade)
 */
export function getFeatureHref(publicPath, dashboardPath) {
    if (typeof window === 'undefined') return publicPath;
    return isUserLoggedIn() ? dashboardPath : publicPath;
}

/**
 * Navigates to dashboardPath if user is logged in,
 * otherwise navigates to publicPath if user is logged out.
 */
export function navigateFeature(router, publicPath, dashboardPath) {
    const destination = isUserLoggedIn() ? dashboardPath : publicPath;
    if (router && typeof router.push === 'function') {
        router.push(destination);
    } else if (typeof window !== 'undefined') {
        window.location.assign(destination);
    }
}

