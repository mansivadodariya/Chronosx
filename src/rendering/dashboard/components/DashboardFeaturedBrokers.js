'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { fetchBrokers } from '@/lib/brokersData';
import BrokerCard from '@/components/brokerCard';
import { BrokerCardSkeleton } from '@/components/brokerSkeleton';
import styles from '../dashboard.module.scss';

export default function DashboardFeaturedBrokers() {
    const { t } = useLanguage();
    const [brokers, setBrokers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        async function load() {
            try {
                const data = await fetchBrokers();
                if (isMounted) {
                    setBrokers(Array.isArray(data) ? data.filter((b) => b && b.is_active !== false) : []);
                }
            } catch (err) {
                console.error('Failed to fetch brokers:', err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }
        load();
        return () => { isMounted = false; };
    }, []);

    if (!isLoading && brokers.length === 0) {
        return null;
    }

    return (
        <div className={styles.featuredBrokersSection}>
            {/* Header: Title & Subtitle with SVG lightning bolt icon */}
            <div className={styles.featuredBrokersHeader}>
                <div className={styles.featuredBrokersHeaderLeft}>
                    <h2 className={styles.featuredBrokersTitle}>
                        {t('dashboard.featuredBrokers', 'Featured brokers')}
                    </h2>
                    <div className={styles.featuredBrokersSubtitle}>
                        <span className={styles.boltIcon}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="#18C98B" stroke="#18C98B" strokeWidth="1">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                        </span>
                        <span>
                            {t('dashboard.exclusiveIntegration', 'Exclusive integration — faster execution and a more reliable connection.')}
                        </span>
                    </div>
                </div>

                <Link href="/brokers" className={styles.viewAllBrokersLink}>
                    <span>{t('dashboard.viewAllBrokers', 'View all brokers')}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </Link>
            </div>

            {/* Dynamic Brokers Grid using exact BrokerCard component */}
            <div className={styles.featuredBrokersGrid}>
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                        <BrokerCardSkeleton key={idx} />
                    ))
                ) : (
                    brokers.slice(0, 3).map((b) => (
                        <BrokerCard
                            key={b.id}
                            broker={b}
                            detailHref={`/broker/${b.id}`}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
