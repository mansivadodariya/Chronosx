'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from '../styles/calendarCountdownClock.module.scss';
import { useLanguage } from '@/context/LanguageContext';

export default function CalendarCountdownClock({ subscription }) {
    const { t } = useLanguage();

    // Calculate target timestamp (in ms)
    const targetTimestamp = useMemo(() => {
        if (!subscription) return Date.now() + 30 * 24 * 60 * 60 * 1000;

        const rawEnd = subscription.end_date || subscription.expires_at;
        if (rawEnd) {
            const parsed = new Date(rawEnd).getTime();
            if (!isNaN(parsed) && parsed > Date.now()) {
                return parsed;
            }
        }

        const days = typeof subscription.days_remaining === 'number'
            ? Math.max(0, subscription.days_remaining)
            : 29;

        return Date.now() + days * 24 * 60 * 60 * 1000;
    }, [subscription?.end_date, subscription?.expires_at, subscription?.days_remaining]);

    const calculateTime = (target) => {
        const now = Date.now();
        const diff = Math.max(0, target - now);

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return {
            total: diff,
            days: String(days).padStart(2, '0'),
            hours: String(hours).padStart(2, '0'),
            minutes: String(minutes).padStart(2, '0'),
            seconds: String(seconds).padStart(2, '0'),
        };
    };

    const [timeLeft, setTimeLeft] = useState(() => calculateTime(targetTimestamp));
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setTimeLeft(calculateTime(targetTimestamp));

        const intervalId = setInterval(() => {
            setTimeLeft(calculateTime(targetTimestamp));
        }, 1000);

        return () => clearInterval(intervalId);
    }, [targetTimestamp]);

    const targetDate = useMemo(() => new Date(targetTimestamp), [targetTimestamp]);

    const monthName = useMemo(() => {
        try {
            return targetDate.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
        } catch (_) {
            return 'OCTOBER';
        }
    }, [targetDate]);

    const year = targetDate.getFullYear();

    const formattedEndDate = useMemo(() => {
        try {
            return targetDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch (_) {
            return 'Oct 9, 2026';
        }
    }, [targetDate]);

    // Total cycle days estimation
    const totalCycleDays = (Number(timeLeft.days) > 30) ? 90 : 30;
    const daysRemaining = Number(timeLeft.days);
    const progressPercent = Math.min(100, Math.max(5, Math.round((daysRemaining / totalCycleDays) * 100)));

    return (
        <div className={styles.calendarContainer}>
            {/* 1. Binder Wire Rings Hanging the Calendar */}
            <div className={styles.binderSpirals} aria-hidden="true">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={styles.spiralRing}>
                        <span className={styles.ringHole} />
                        <span className={styles.ringCoil} />
                    </div>
                ))}
            </div>

            {/* 2. Calendar Main Pad */}
            <div className={styles.calendarPad}>
                {/* Top Calendar Month Banner / Header */}
                <div className={styles.calendarHeaderStrip}>
                    <div className={styles.headerLeft}>
                        <svg className={styles.calIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span className={styles.calendarMonthText}>
                            {monthName} {year}
                        </span>
                        <span className={styles.calendarBadge}>
                            {t('plans.cycleExpiry', 'CYCLE EXPIRATION')}
                        </span>
                    </div>

                    <div className={styles.headerRight}>
                        <div className={styles.liveIndicator}>
                            <span className={styles.livePulseDot} />
                            <span className={styles.liveText}>
                                {t('plans.reverseClock', 'LIVE REVERSE COUNTDOWN')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Perforation Tear-line */}
                <div className={styles.perforatedLine} />

                {/* 3. Big Calendar Countdown Blocks */}
                <div className={styles.clockCardsRow}>
                    {/* Days */}
                    <div className={styles.calendarLeafCard}>
                        <div className={styles.leafTopHoles}>
                            <span className={styles.leafHole} />
                            <span className={styles.leafHole} />
                        </div>
                        <div className={styles.leafFace}>
                            <span className={styles.flipDivider} />
                            <div className={styles.digitDisplay}>{mounted ? timeLeft.days : '29'}</div>
                        </div>
                        <div className={styles.leafLabel}>{t('plans.days', 'DAYS')}</div>
                    </div>

                    <div className={styles.colonSeparator}>:</div>

                    {/* Hours */}
                    <div className={styles.calendarLeafCard}>
                        <div className={styles.leafTopHoles}>
                            <span className={styles.leafHole} />
                            <span className={styles.leafHole} />
                        </div>
                        <div className={styles.leafFace}>
                            <span className={styles.flipDivider} />
                            <div className={styles.digitDisplay}>{mounted ? timeLeft.hours : '00'}</div>
                        </div>
                        <div className={styles.leafLabel}>{t('plans.hours', 'HOURS')}</div>
                    </div>

                    <div className={styles.colonSeparator}>:</div>

                    {/* Minutes */}
                    <div className={styles.calendarLeafCard}>
                        <div className={styles.leafTopHoles}>
                            <span className={styles.leafHole} />
                            <span className={styles.leafHole} />
                        </div>
                        <div className={styles.leafFace}>
                            <span className={styles.flipDivider} />
                            <div className={styles.digitDisplay}>{mounted ? timeLeft.minutes : '00'}</div>
                        </div>
                        <div className={styles.leafLabel}>{t('plans.minutes', 'MINUTES')}</div>
                    </div>

                    <div className={styles.colonSeparator}>:</div>

                    {/* Seconds */}
                    <div className={`${styles.calendarLeafCard} ${styles.secondsLeaf}`}>
                        <div className={styles.leafTopHoles}>
                            <span className={styles.leafHole} />
                            <span className={styles.leafHole} />
                        </div>
                        <div className={styles.leafFace}>
                            <span className={styles.flipDivider} />
                            <div className={`${styles.digitDisplay} ${styles.secondsDigit}`}>
                                {mounted ? timeLeft.seconds : '00'}
                            </div>
                        </div>
                        <div className={styles.leafLabel}>{t('plans.seconds', 'SECONDS')}</div>
                    </div>
                </div>

                {/* 4. Calendar Footer / Progress Bar */}
                <div className={styles.calendarFooter}>
                    <div className={styles.progressRow}>
                        <div className={styles.progressBarTrack}>
                            <div 
                                className={styles.progressBarFill} 
                                style={{ width: `${progressPercent}%` }} 
                            />
                        </div>
                    </div>
                    <div className={styles.footerMetaRow}>
                        <span className={styles.expiryDateText}>
                            <strong>Expires:</strong> {formattedEndDate}
                        </span>
                        <span className={styles.cyclePercentText}>
                            {progressPercent}% cycle remaining
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
