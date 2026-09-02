'use client';

import React from 'react';
import Link from 'next/link';
import { timeAgo, formatSummary } from '../utils/dashboardHelpers';
import styles from '../dashboard.module.scss';

export default function DashboardRecentActivities({
    loading,
    recents,
    activityFilter,
    setActivityFilter,
    openRecent
}) {
    return (
        <div className={styles.feedColumn}>
            <div className={styles.feedHeader}>
                <div className={styles.feedTitleWrap}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <h3>Recent Activity & Scans Feed</h3>
                </div>

                <div className={styles.filterPills}>
                    <button
                        type="button"
                        className={`${styles.filterTab} ${activityFilter === 'all' ? styles.filterTabActive : ''}`}
                        onClick={() => setActivityFilter('all')}
                    >
                        All
                    </button>
                    <button
                        type="button"
                        className={`${styles.filterTab} ${activityFilter === 'blog' ? styles.filterTabActive : ''}`}
                        onClick={() => setActivityFilter('blog')}
                    >
                        TradeSnap
                    </button>
                    <button
                        type="button"
                        className={`${styles.filterTab} ${activityFilter === 'chat' ? styles.filterTabActive : ''}`}
                        onClick={() => setActivityFilter('chat')}
                    >
                        AI Chat
                    </button>
                </div>
            </div>

            <div className={styles.feedCardContainer}>
                {loading ? (
                    <div className={styles.loadingBox}>
                        <div className={styles.miniSpinner} />
                        <span>Loading intelligence history...</span>
                    </div>
                ) : recents.length === 0 ? (
                    <div className={styles.emptyFeed}>
                        <div className={styles.emptyIconCircle}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <p>No recent activity recorded yet.</p>
                        <Link href="/trade-snap" className={styles.firstScanBtn}>
                            Upload Your First Chart →
                        </Link>
                    </div>
                ) : (
                    <div className={styles.activityItemsList}>
                        {recents.map((item) => (
                            <div
                                key={`${item.type}-${item.id}`}
                                className={styles.activityRowItem}
                                onClick={() => openRecent(item)}
                            >
                                <div className={styles.actLeft}>
                                    <div className={styles.actTypeIcon}>
                                        {item.type === 'blog' ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2">
                                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                                <circle cx="12" cy="13" r="4" />
                                            </svg>
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2">
                                                <rect x="3" y="8" width="18" height="12" rx="4" />
                                                <path d="M12 2v6" />
                                                <circle cx="8.5" cy="13.5" r="1.5" fill="#18C98B" />
                                                <circle cx="15.5" cy="13.5" r="1.5" fill="#18C98B" />
                                                <path d="M9 17h6" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className={styles.actTitles}>
                                        <div className={styles.actTitleHeader}>
                                            <strong className={styles.actMainTitle}>{item.title}</strong>
                                            <span className={styles.actTypeTag}>{item.type === 'blog' ? 'TradeSnap' : 'AI Chat'}</span>
                                        </div>
                                        <span className={styles.actTime}>{timeAgo(item.created_at)}</span>
                                    </div>
                                </div>

                                <div className={styles.actSummary}>
                                    {item.summary ? (
                                        <div dangerouslySetInnerHTML={{ __html: formatSummary(item.summary) }} />
                                    ) : (
                                        <span className={styles.noSummary}>Technical analysis details recorded</span>
                                    )}
                                </div>

                                <div className={styles.actAction}>
                                    <span>Open →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
