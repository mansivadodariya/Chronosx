'use client';

import React from 'react';
import Link from 'next/link';
import styles from '../dashboard.module.scss';

export default function DashboardToolsGrid() {
    return (
        <div className={styles.quickHubColumn}>
            <div className={styles.hubHeader}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <h3>Quick Actions</h3>
            </div>

            <div className={styles.toolsGrid3x2}>
                {/* Tool 1: TradeSnap Vision */}
                <Link href="/trade-snap" className={styles.hubFeatureCard}>
                    <div className={styles.hubIconCircleGold}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2B1A05" strokeWidth="2.2">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                        </svg>
                    </div>
                    <h4>TradeSnap Vision</h4>
                    <div className={styles.hubCta}>
                        <span>Launch Scanner</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </div>
                </Link>

                {/* Tool 2: AI Copilot Chat */}
                <Link href="/ai-assistant" className={styles.hubFeatureCard}>
                    <div className={styles.hubIconCircleGold}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2B1A05" strokeWidth="2.2">
                            <rect x="3" y="8" width="18" height="12" rx="4" />
                            <path d="M12 2v6" />
                            <circle cx="8.5" cy="13.5" r="1.5" fill="#2B1A05" />
                            <circle cx="15.5" cy="13.5" r="1.5" fill="#2B1A05" />
                            <path d="M9 17h6" />
                        </svg>
                    </div>
                    <h4>AI Copilot Chat</h4>
                    <div className={styles.hubCta}>
                        <span>Start Chatting</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </div>
                </Link>

                {/* Tool 3: Live Strategy Terminal */}
                <Link href="/ai-strategy/live" className={styles.hubFeatureCard}>
                    <div className={styles.hubIconCircleGold}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2B1A05" strokeWidth="2.2">
                            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                            <polyline points="16 7 22 7 22 13" />
                        </svg>
                    </div>
                    <h4>Live Strategy Desk</h4>
                    <div className={styles.hubCta}>
                        <span>Open Terminal</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </div>
                </Link>

                {/* Tool 4: AI Trade Analysis */}
                <Link href="/trade-analysis" className={styles.hubFeatureCard}>
                    <div className={styles.hubIconCircleGold}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2B1A05" strokeWidth="2.2">
                            <path d="M3 3v18h18" />
                            <path d="M7 16l4-5 4 3 6-8" />
                            <polyline points="15 6 21 6 21 12" />
                        </svg>
                    </div>
                    <h4>AI Trade Analysis</h4>
                    <div className={styles.hubCta}>
                        <span>Audit Statements</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </div>
                </Link>

                {/* Tool 5: Forex & Risk Calculators */}
                <Link href="/calculator" className={styles.hubFeatureCard}>
                    <div className={styles.hubIconCircleGold}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2B1A05" strokeWidth="2.2">
                            <rect x="4" y="2" width="16" height="20" rx="3" />
                            <line x1="8" y1="6" x2="16" y2="6" />
                            <line x1="8" y1="10" x2="10" y2="10" />
                            <line x1="14" y1="10" x2="16" y2="10" />
                            <line x1="8" y1="14" x2="10" y2="14" />
                            <line x1="14" y1="14" x2="16" y2="14" />
                            <line x1="8" y1="18" x2="16" y2="18" />
                        </svg>
                    </div>
                    <h4>Forex & Risk Tools</h4>
                    <div className={styles.hubCta}>
                        <span>Open Calculators</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </div>
                </Link>

                {/* Tool 6: Economic Calendar */}
                <Link href="/calendar" className={styles.hubFeatureCard}>
                    <div className={styles.hubIconCircleGold}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2B1A05" strokeWidth="2.2">
                            <rect x="3" y="4" width="18" height="17" rx="3" />
                            <path d="M16 2v4M8 2v4M3 9h18" />
                            <circle cx="8" cy="13" r="0.8" fill="#2B1A05" />
                            <circle cx="12" cy="13" r="0.8" fill="#2B1A05" />
                            <circle cx="16" cy="13" r="0.8" fill="#2B1A05" />
                            <circle cx="8" cy="17" r="0.8" fill="#2B1A05" />
                            <circle cx="12" cy="17" r="0.8" fill="#2B1A05" />
                        </svg>
                    </div>
                    <h4>Economic Calendar</h4>
                    <div className={styles.hubCta}>
                        <span>View Calendar</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </div>
                </Link>
            </div>
        </div>
    );
}
