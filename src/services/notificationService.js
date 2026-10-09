import { supabase } from '@/lib/supabaseClient';
import { notificationsApi } from '@/lib/api';

/**
 * 1. Fetch Website Updates Only (Announcements & Feature Releases)
 * Use this on announcement banners, what's new modals, or changelog pages
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
 * Use this for the Notification Bell Dropdown or Notification Center
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
            // Support matching case-insensitively or normalized category slugs
            query = query.ilike('category', category.replace(/\s+/g, '_'));
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
 * Use this to display the red/green notification badge on the bell icon
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

        if (err1 && err2) return 0;

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
 * 4. Mark Single Notification As Read
 */
export async function markNotificationAsRead(notificationId, userId, isBroadcast = false) {
    if (!notificationId) return;

    // 1. Attempt backend API call
    try {
        await notificationsApi?.markAsRead?.(notificationId);
    } catch (_) {}

    // 2. Ensure Supabase is updated
    if (supabase && userId) {
        try {
            if (isBroadcast) {
                await supabase
                    .from('user_notification_reads')
                    .upsert({
                        notification_id: notificationId,
                        user_id: userId,
                        read_at: new Date().toISOString()
                    }, { onConflict: 'notification_id,user_id' });
            } else {
                await supabase
                    .from('user_notifications')
                    .update({ is_read: true })
                    .eq('id', notificationId);
            }
        } catch (err) {
            console.warn('Supabase mark read fallback notice:', err);
        }
    }
}

/**
 * 5. Mark All Notifications As Read
 */
export async function markAllNotificationsAsRead(userId, currentNotifications = []) {
    // 1. Attempt backend API call
    try {
        await notificationsApi?.markAllAsRead?.();
    } catch (_) {}

    // 2. Ensure Supabase is updated
    if (supabase && userId) {
        try {
            // Mark all private unread
            await supabase
                .from('user_notifications')
                .update({ is_read: true })
                .eq('user_id', userId)
                .eq('is_read', false);

            // Mark any unread broadcasts
            const broadcastItems = currentNotifications.filter(n => n.is_broadcast && !n.is_read);
            if (broadcastItems.length > 0) {
                const inserts = broadcastItems.map(item => ({
                    notification_id: item.id,
                    user_id: userId,
                    read_at: new Date().toISOString()
                }));
                await supabase
                    .from('user_notification_reads')
                    .upsert(inserts, { onConflict: 'notification_id,user_id' });
            }
        } catch (err) {
            console.warn('Supabase mark all read fallback notice:', err);
        }
    }
}
