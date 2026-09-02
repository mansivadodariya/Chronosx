'use client';

import React from 'react';
import styles from '../profile.module.scss';

export default function ProfileActivityLogTab({
    displayLogins,
    t
}) {
    return (
        <div className={styles.tabContentPanel}>
            <div className={styles.panelHeaderRow}>
                <h3>{t('profile.activityLogTitle', 'Recent Activity & Login Sessions')}</h3>
            </div>
            {displayLogins.length > 0 ? (
                <div className={styles.activityTimeline}>
                    {displayLogins.map((entry, idx) => (
                        <div key={idx} className={styles.timelineItem}>
                            <div className={styles.timelineDot} />
                            <div className={styles.timelineContent}>
                                <div className={styles.timelineHeader}>
                                    <span className={styles.timelineTitle}>
                                        {entry.status === 'Active'
                                            ? t('profile.currentSession', 'Current Active Session')
                                            : t('profile.successfulLogin', 'Successful Login')}
                                    </span>
                                    <span className={styles.timelineTime}>{entry.time}</span>
                                </div>
                                <div className={styles.timelineDetails}>
                                    <span>{entry.device}</span>
                                    <span>•</span>
                                    <span>{entry.location}</span>
                                    <span>•</span>
                                    <span className={styles.ipBadge}>{entry.ip}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyActivityState}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <p>{t('profile.noActivityLogs', 'No recent activity logs available')}</p>
                </div>
            )}
        </div>
    );
}
