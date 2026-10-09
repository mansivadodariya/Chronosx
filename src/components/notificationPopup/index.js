'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    fetchUserNotifications,
    fetchWebsiteUpdates,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from '@/services/notificationService';
import { getStoredUserId } from '@/lib/authSession';
import styles from './notificationPopup.module.scss';

function getDismissedGuestUpdates() {
    try {
        if (typeof window === 'undefined') return [];
        const raw = localStorage.getItem('chronosx_dismissed_updates');
        return raw ? JSON.parse(raw) : [];
    } catch (_) {
        return [];
    }
}

function saveDismissedGuestUpdate(id) {
    try {
        if (typeof window === 'undefined' || !id) return;
        const current = getDismissedGuestUpdates();
        if (!current.includes(id)) {
            current.push(id);
            localStorage.setItem('chronosx_dismissed_updates', JSON.stringify(current));
        }
    } catch (_) {}
}

export default function NotificationPopup({ userId: propUserId, onOpenFullModal }) {
    const [unreadQueue, setUnreadQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSlidingOut, setIsSlidingOut] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [activeUserId, setActiveUserId] = useState(propUserId || '');

    useEffect(() => {
        const uid = propUserId || getStoredUserId();
        setActiveUserId(uid || '');
    }, [propUserId]);

    const loadUnreadPopups = useCallback(async () => {
        const uid = activeUserId || getStoredUserId();
        try {
            if (uid) {
                // Logged in user: fetch unread private alerts + broadcast updates
                const { data } = await fetchUserNotifications(uid, {
                    readStatus: 'unread',
                    limit: 15
                });
                if (data && data.length > 0) {
                    setUnreadQueue(data);
                    setCurrentIndex(0);
                    setTimeout(() => {
                        setIsVisible(true);
                    }, 800);
                }
            } else {
                // Public / Guest visitor: fetch latest website updates
                const { data } = await fetchWebsiteUpdates(1, 8);
                const dismissed = getDismissedGuestUpdates();
                const fresh = (data || []).filter((item) => !dismissed.includes(item.id));
                if (fresh.length > 0) {
                    setUnreadQueue(fresh);
                    setCurrentIndex(0);
                    setTimeout(() => {
                        setIsVisible(true);
                    }, 1200);
                }
            }
        } catch (err) {
            console.warn('Failed to load popup notifications:', err);
        }
    }, [activeUserId]);

    useEffect(() => {
        loadUnreadPopups();
    }, [loadUnreadPopups]);

    useEffect(() => {
        const onNotifSync = () => {
            loadUnreadPopups();
        };
        window.addEventListener('notification:updated', onNotifSync);
        return () => window.removeEventListener('notification:updated', onNotifSync);
    }, [loadUnreadPopups]);

    const currentItem = unreadQueue[currentIndex];

    // Dismiss single unread notification with smooth slide
    const dismissCurrent = async () => {
        if (!currentItem || isSlidingOut) return;

        setIsSlidingOut(true);

        const uid = activeUserId || getStoredUserId();
        if (uid) {
            markNotificationAsRead(currentItem.id, uid, currentItem.is_broadcast)
                .then(() => {
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('notification:updated'));
                    }
                })
                .catch(() => {});
        } else {
            saveDismissedGuestUpdate(currentItem.id);
        }

        setTimeout(() => {
            if (currentIndex + 1 < unreadQueue.length) {
                setCurrentIndex((prev) => prev + 1);
                setIsSlidingOut(false);
            } else {
                setIsVisible(false);
                setUnreadQueue([]);
            }
        }, 380);
    };

    // Close all unread notifications with smooth slide
    const dismissAll = async () => {
        if (unreadQueue.length === 0 || isSlidingOut) return;

        setIsSlidingOut(true);

        const uid = activeUserId || getStoredUserId();
        const allItems = [...unreadQueue];

        if (uid) {
            markAllNotificationsAsRead(uid, allItems)
                .then(() => {
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('notification:updated'));
                    }
                })
                .catch(() => {});
        } else {
            allItems.forEach((item) => saveDismissedGuestUpdate(item.id));
        }

        setTimeout(() => {
            setIsVisible(false);
            setUnreadQueue([]);
            setIsSlidingOut(false);
        }, 400);
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        try {
            const d = new Date(isoString);
            const now = new Date();
            const diffMs = now - d;
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `${diffHours}h ago`;
            const diffDays = Math.floor(diffHours / 24);
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays}d ago`;
            return d.toLocaleDateString();
        } catch (_) {
            return '';
        }
    };

    if (!isVisible || !currentItem) return null;

    const remainingCount = unreadQueue.length - currentIndex;

    return (
        <div className={styles.popupContainer}>
            <div className={`${styles.slideCard} ${isVisible && !isSlidingOut ? styles.slideIn : styles.slideOut}`}>
                {/* Top Row: Category Tag + Queue counter + Actions */}
                <div className={styles.topRow}>
                    <div className={styles.badgeWrap}>
                        <span className={styles.categoryTag}>
                            {currentItem.category || currentItem.event_type || 'UPDATE'}
                        </span>
                        {unreadQueue.length > 1 && (
                            <span className={styles.queueBadge}>
                                {currentIndex + 1} of {unreadQueue.length}
                            </span>
                        )}
                    </div>
                    <div className={styles.actionButtons}>
                        {unreadQueue.length > 1 && (
                            <button
                                type="button"
                                className={styles.closeAllBtn}
                                onClick={dismissAll}
                                title="Close all notifications"
                            >
                                Close all
                            </button>
                        )}
                        <button
                            type="button"
                            className={styles.slideCloseBtn}
                            onClick={dismissCurrent}
                            aria-label="Close notification"
                            title="Close & slide next"
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content: Title & Message */}
                <div
                    className={styles.contentRow}
                    onClick={() => {
                        dismissCurrent();
                        onOpenFullModal?.();
                    }}
                >
                    <h4 className={styles.popupTitle}>{currentItem.title}</h4>
                    <p className={styles.popupMessage}>{currentItem.message}</p>
                </div>

                {/* Bottom Row: Timestamp + Dismiss / Next Arrow */}
                <div className={styles.bottomRow}>
                    <span className={styles.timeText}>{formatTime(currentItem.created_at)}</span>
                    <div className={styles.bottomActions}>
                        <button
                            type="button"
                            className={styles.markReadBtn}
                            onClick={dismissCurrent}
                        >
                            <span>{remainingCount > 1 ? 'Next' : 'Dismiss'}</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
