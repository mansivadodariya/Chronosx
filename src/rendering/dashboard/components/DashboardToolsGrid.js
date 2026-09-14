'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import styles from '../dashboard.module.scss';

export default function DashboardToolsGrid() {
    const { t } = useLanguage();

    const tools = [
        {
            id: 'scanner',
            title: t('dashboard.toolScanner', 'AI Chart Scanner'),
            desc: t('dashboard.scannerDesc', 'Neural pattern recognition & OCR chart vision'),
            badge: 'AI VISION',
            cta: t('dashboard.launchScanner', 'Launch Scanner'),
            href: '/chart-scanner',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                </svg>
            )
        },
        {
            id: 'assistant',
            title: t('dashboard.toolAssistant', 'AI Market Assistant'),
            desc: t('dashboard.assistantDesc', '24/7 neural market & real-time trade copilot'),
            badge: '24/7 COPILOT',
            cta: t('dashboard.startChatting', 'Start Chatting'),
            href: '/market-assistant',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="8" width="18" height="12" rx="4" />
                    <path d="M12 2v6" />
                    <circle cx="8.5" cy="13.5" r="1.5" fill="currentColor" />
                    <circle cx="15.5" cy="13.5" r="1.5" fill="currentColor" />
                    <path d="M9 17h6" />
                </svg>
            )
        },
        {
            id: 'terminal',
            title: t('dashboard.toolLiveScanner', 'Signal Terminal'),
            desc: t('dashboard.terminalDesc', 'Live institutional setups & order flow triggers'),
            badge: 'LIVE TERMINAL',
            cta: t('dashboard.openTerminal', 'Open Terminal'),
            href: '/signal-terminal',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                    <polyline points="16 7 22 7 22 13" />
                </svg>
            )
        },
        {
            id: 'advisor',
            title: t('dashboard.toolTradeAudit', 'AI Trade Advisor'),
            desc: t('dashboard.advisorDesc', 'Statistical win-rate, R:R & performance audit'),
            badge: 'TRADE AUDIT',
            cta: t('dashboard.auditStatements', 'Audit Statements'),
            href: '/trade-advisor',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18" />
                    <path d="M7 16l4-5 4 3 6-8" />
                    <polyline points="15 6 21 6 21 12" />
                </svg>
            )
        },
        {
            id: 'calculators',
            title: t('nav.forexCalculator', 'Forex Calculator'),
            desc: t('dashboard.calculatorsDesc', 'Lot sizing, position risk & margin calculator'),
            badge: 'RISK DESK',
            cta: t('dashboard.openCalculators', 'Open Calculators'),
            href: '/calculator',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="3" />
                    <line x1="8" y1="6" x2="16" y2="6" />
                    <line x1="8" y1="10" x2="10" y2="10" />
                    <line x1="14" y1="10" x2="16" y2="10" />
                    <line x1="8" y1="14" x2="10" y2="14" />
                    <line x1="14" y1="14" x2="16" y2="14" />
                    <line x1="8" y1="18" x2="16" y2="18" />
                </svg>
            )
        },
        {
            id: 'calendar',
            title: t('dashboard.toolEconomicCalendar', 'Economic Calendar'),
            desc: t('dashboard.calendarDesc', 'High-impact macroeconomic data releases'),
            badge: 'MACRO NEWS',
            cta: t('dashboard.viewCalendar', 'View Calendar'),
            href: '/calendar',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="17" rx="3" />
                    <path d="M16 2v4M8 2v4M3 9h18" />
                    <circle cx="8" cy="13" r="1" fill="currentColor" />
                    <circle cx="12" cy="13" r="1" fill="currentColor" />
                    <circle cx="16" cy="13" r="1" fill="currentColor" />
                    <circle cx="8" cy="17" r="1" fill="currentColor" />
                    <circle cx="12" cy="17" r="1" fill="currentColor" />
                </svg>
            )
        }
    ];

    return (
        <div className={styles.quickHubColumn}>
            <div className={styles.hubHeader}>
                <div className={styles.hubHeaderLeft}>
                    <div className={styles.hubHeaderIcon}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2.2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </div>
                    <h3>{t('dashboard.quickActionsTitle', 'Quick Actions & AI Suite')}</h3>
                </div>
            </div>

            <div className={styles.toolsGrid2x3}>
                {tools.map((tool) => (
                    <Link key={tool.id} href={tool.href} className={styles.modernToolCard}>
                        {/* Top: Icon + Badge */}
                        <div className={styles.toolCardTop}>
                            <div className={styles.toolIconBadge}>
                                {tool.icon}
                            </div>
                            <span className={styles.toolBadgeTag}>{tool.badge}</span>
                        </div>

                        {/* Mid: Title & Description */}
                        <div className={styles.toolCardBody}>
                            <h4 className={styles.toolTitle}>{tool.title}</h4>
                            <p className={styles.toolDescription}>{tool.desc}</p>
                        </div>

                        {/* Bottom: Interactive CTA with Arrow */}
                        <div className={styles.toolCardFooter}>
                            <span className={styles.toolCtaText}>{tool.cta}</span>
                            <div className={styles.toolCtaArrow}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
