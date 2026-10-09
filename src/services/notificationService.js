import { supabase } from '@/lib/supabaseClient';
import { notificationsApi } from '@/lib/api';

/**
 * 1. Fetch Website Updates Only (Announcements & Feature Releases)
 * Use this on your announcement banner, what's new modal, or changelog page:
 */
export async function fetchWebsiteUpdates(page = 1, limit = 20) {
    if (!supabase) return { data: [], total: 0 };
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    try {
        const { data, count, error } = await supabase
            .from('user_notifications')
            .select('*', { count: 'exact' })
            .eq('category', 'website_updates')
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            console.error('Error fetching website updates:', error);
            return { data: [], total: 0 };
        }

        return { data: data || [], total: count || 0 };
    } catch (err) {
        console.error('Error fetching website updates exception:', err);
        return { data: [], total: 0 };
    }
}

/**
 * 2. Fetch User Notification Feed (User-Specific + Global Broadcasts)
 * Use this for the Notification Bell Dropdown or Notification Center page.
 * It fetches both private user alerts and global broadcasts:
 */
export async function fetchUserNotifications(userId, { page = 1, limit = 20, category = null, readStatus = null } = {}) {
    if (!supabase || !userId) return { data: [], total: 0 };
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    try {
        // Query notifications belonging to this user OR global broadcasts (user_id IS NULL)
        let query = supabase
            .from('user_notifications')
            .select(`
                id,
                user_id,
                category,
                event_type,
                title,
                message,
                data,
                priority,
                is_read,
                created_at,
                user_notification_reads!left (
                    user_id,
                    read_at
                )
            `, { count: 'exact' })
            .or(`user_id.eq.${userId},user_id.is.null`)
            .order('created_at', { ascending: false })
            .range(from, to);

        // Optional: filter by category if selected
        if (category && category !== 'all') {
            query = query.eq('category', category);
        }

        const { data, count, error } = await query;

        if (error) {
            console.error('Error fetching notifications:', error);
            return { data: [], total: 0 };
        }

        // Format read status:
        // - If private (user_id != null): read status is 'item.is_read'
        // - If broadcast (user_id == null): read status is true if record exists in user_notification_reads
        const formatted = (data || []).map((item) => {
            const isBroadcast = item.user_id === null;
            const isRead = isBroadcast
                ? Boolean(item.user_notification_reads && item.user_notification_reads.some(r => r.user_id === userId))
                : Boolean(item.is_read);

            return {
                ...item,
                is_read: isRead,
                is_broadcast: isBroadcast,
            };
        });

        const filtered = readStatus === 'unread'
            ? formatted.filter(item => !item.is_read)
            : readStatus === 'read'
                ? formatted.filter(item => item.is_read)
                : formatted;

        return { data: filtered, total: count || filtered.length };
    } catch (err) {
        console.error('Error fetching notifications exception:', err);
        return { data: [], total: 0 };
    }
}

/**
 * 3. Fetch Unread Count Badge
 * Use this to display the red notification badge on the bell icon:
 */
export async function getUnreadCount(userId) {
    if (!supabase || !userId) return 0;
    try {
        // 1. Count unread private notifications
        const { count: privateUnread, error: err1 } = await supabase
            .from('user_notifications')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        // 2. Count unread broadcast notifications
        // (All broadcasts minus the ones read by this user)
        const { data: broadcasts, error: err2 } = await supabase
            .from('user_notifications')
            .select(`
                id,
                user_notification_reads!left (user_id)
            `)
            .is('user_id', null);

        if (err1 || err2) return 0;

        const broadcastUnread = (broadcasts || []).filter(
            (b) => !b.user_notification_reads || !b.user_notification_reads.some((r) => r.user_id === userId)
        ).length;

        return (privateUnread || 0) + broadcastUnread;
    } catch (err) {
        console.error('Error getting unread count:', err);
        return 0;
    }
}

/**
 * 4. Mark Single Notification As Read via Backend API
 * Uses backend endpoint: POST /api/v1/notifications/:id/read
 */
export async function markNotificationAsRead(notificationId) {
    if (!notificationId) return;
    try {
        return await notificationsApi.markAsRead(notificationId);
    } catch (err) {
        console.error('Error marking notification as read via API:', err);
    }
}

/**
 * 5. Mark All Notifications As Read via Backend API
 * Uses backend endpoint: POST /api/v1/notifications/read-all
 */
export async function markAllNotificationsAsRead() {
    try {
        return await notificationsApi.markAllAsRead();
    } catch (err) {
        console.error('Error marking all notifications as read via API:', err);
    }
}

const SUPPORTED_LOCALES = ['en', 'ar', 'ary', 'es', 'ru', 'zh', 'vi', 'id', 'fil', 'arabic', 'spanish', 'russian', 'chinese', 'vietnamese', 'indonesian', 'filipino', 'darija'];

const PROTECTED_PREFIXES = [
    '/dashboard',
    '/chart-scanner',
    '/trade-advisor',
    '/trade-audit',
    '/market-assistant',
    '/signal-terminal',
    '/live-scanner',
    '/strategy-core',
    '/trading-signal',
    '/ai-trading-signal',
    '/strategy-signal',
    '/predefined-strategies',
    '/strategy-hub',
    '/my-bots',
    '/ai-bot-builder',
    '/manual-bot-builder',
    '/bot-library',
    '/browse-bots',
    '/calendar',
    '/calculator',
    '/news',
    '/tools',
    '/credit-history',
    '/broker',
    '/brokers',
    '/profile',
    '/settings',
    '/onboarding',
    '/steper',
];

function stripLocalePrefix(path) {
    if (!path) return '/';
    const clean = path.split('?')[0].replace(/\/$/, '') || '/';
    const parts = clean.split('/').filter(Boolean);
    if (parts.length > 0 && SUPPORTED_LOCALES.includes(parts[0].toLowerCase())) {
        const withoutLocale = '/' + parts.slice(1).join('/');
        return withoutLocale === '' ? '/' : withoutLocale;
    }
    return clean;
}

export function getLocalizedHref(href, lang) {
    if (!href || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) return href;
    const [pathname, search] = href.split('?');
    const clean = stripLocalePrefix(pathname);
    const currentLang = lang || 'en';
    const localizedPath = clean === '/' ? `/${currentLang}` : `/${currentLang}${clean}`;
    return search ? `${localizedPath}?${search}` : localizedPath;
}

export function isProtectedRoute(path) {
    if (!path || path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) return false;
    const clean = stripLocalePrefix(path.split('?')[0]);
    return PROTECTED_PREFIXES.some(prefix => clean === prefix || clean.startsWith(`${prefix}/`));
}

export function getNotificationRedirectUrl(notification) {
    if (!notification) return null;

    // 1. Direct properties on notification object
    const direct = notification.redirect_url || notification.url || notification.link || notification.route || notification.action_url || notification.href;
    if (direct && typeof direct === 'string' && direct.trim()) {
        return direct.trim();
    }

    // 2. Properties in data payload
    let data = notification.data;
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch (_) {
            data = null;
        }
    }
    if (data && typeof data === 'object') {
        const dataUrl = data.redirect_url || data.url || data.link || data.route || data.action_url || data.href || data.target || data.path;
        if (dataUrl && typeof dataUrl === 'string' && dataUrl.trim()) {
            return dataUrl.trim();
        }
    }

    // 3. Fallback based on category or event_type
    const cat = String(notification.category || notification.event_type || '').toLowerCase().trim();
    if (cat === 'trade_signals' || cat === 'trade_signal') return '/trading-signal';
    if (cat === 'ai_strategy' || cat === 'strategy') return '/my-bots';
    if (cat === 'chart_scanner' || cat === 'scanner') return '/chart-scanner';
    if (cat === 'trade_advisor' || cat === 'trade_audit') return '/trade-advisor';
    if (cat === 'market_assistant') return '/market-assistant';
    if (cat === 'brokers' || cat === 'associated_brokers') return '/brokers';
    if (cat === 'plans' || cat === 'subscription_plans') return '/subscription-plans';
    if (cat === 'affiliate' || cat === 'affiliate_program') return '/affiliate';
    if (cat === 'profile' || cat === 'settings') return '/profile';
    if (cat === 'tools' || cat === 'economic_calendar') return '/calendar';
    if (cat === 'forex_calculator') return '/calculator';

    return null;
}

/**
 * Executes proper redirection for a notification click:
 * - If external URL: opens safely in a new tab.
 * - If logged in and internal route: navigates directly to localized destination.
 * - If NOT logged in and protected route: redirects to /login?redirect=<target> so user lands on target after login.
 */
export function executeNotificationRedirect(notification, { router, language, isLoggedIn, onComplete } = {}) {
    if (!notification) return;

    const targetUrl = getNotificationRedirectUrl(notification);
    if (!targetUrl) {
        onComplete?.();
        return;
    }

    // External link handling
    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://') || targetUrl.startsWith('//')) {
        onComplete?.();
        if (typeof window !== 'undefined') {
            window.open(targetUrl, '_blank', 'noopener,noreferrer');
        }
        return;
    }

    const isUserLoggedIn = typeof isLoggedIn === 'boolean'
        ? isLoggedIn
        : Boolean(typeof window !== 'undefined' && (localStorage.getItem('user') || localStorage.getItem('user_id') || localStorage.getItem('access_token') || sessionStorage.getItem('access_token')));

    const isProtected = isProtectedRoute(targetUrl);

    let destination = targetUrl;
    if (isProtected && !isUserLoggedIn) {
        destination = `/login?redirect=${encodeURIComponent(targetUrl)}`;
    }

    const localizedDestination = getLocalizedHref(destination, language);

    onComplete?.();

    if (router && typeof router.push === 'function') {
        router.push(localizedDestination);
    } else if (typeof window !== 'undefined') {
        window.location.href = localizedDestination;
    }
}

