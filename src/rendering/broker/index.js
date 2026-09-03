'use client';

import CommonSectionHeader from '@/components/CommonSectionHeader';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './broker.module.scss';
import NeweraCreditsModal from '@/components/neweraCreditsModal';
import { getStoredUserId } from '@/lib/authSession';
import { fetchBrokers, brokerList } from '@/lib/brokersData';
import toast from 'react-hot-toast';

import BrokerCard from '@/components/brokerCard';
import { BrokerCardSkeleton } from '@/components/brokerSkeleton';
import { useLanguage } from '@/context/LanguageContext';
import { getBidiProps } from '@/lib/bidi';
import CommonCta from '@/components/commonCta';

const BrokerHeroGraphic = '/assets/images/broker_infrastructure_hero.jpg';

const SearchIcon = () => (
    <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

export default function BrokerPage() {
    const { t } = useLanguage();
    const [brokers, setBrokers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreditsModal, setShowCreditsModal] = useState(false);
    const userId = getStoredUserId();

    useEffect(() => {
        let isMounted = true;
        async function loadBrokers() {
            try {
                const data = await fetchBrokers();
                if (isMounted) {
                    setBrokers(data && data.length > 0 ? data : brokerList);
                }
            } catch (_) {
                if (isMounted) setBrokers(brokerList);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }
        loadBrokers();
        return () => { isMounted = false; };
    }, []);

    const categories = useMemo(() => {
        const set = new Set(brokers.map((b) => b.category).filter(Boolean));
        return ['All', ...Array.from(set)];
    }, [brokers]);

    const filteredBrokers = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return brokers.filter((broker) => {
            const matchesTab = selectedTab === 'All' || broker.category === selectedTab;
            const matchesSearch =
                !q ||
                (broker.name || '').toLowerCase().includes(q) ||
                (broker.name_ar || '').toLowerCase().includes(q) ||
                (broker.name_ph || '').toLowerCase().includes(q) ||
                (broker.subtitle || '').toLowerCase().includes(q) ||
                (broker.subtitle_ph || '').toLowerCase().includes(q) ||
                (broker.description || '').toLowerCase().includes(q) ||
                (broker.description_ph || '').toLowerCase().includes(q);
            return matchesTab && matchesSearch;
        });
    }, [brokers, selectedTab, searchQuery]);

    const handleConnectClick = (broker) => {
        if (broker.canSync) {
            setShowCreditsModal(true);
        } else {
            toast.success(`${broker.name} is fully integrated into ChronosX!`);
        }
    };

    return (
        <div className={styles.brokerPage}>
            {/* 1. Hero Infrastructure Banner */}
            <CommonSectionHeader
                badge="INSTITUTIONAL BROKER & PLATFORM HUB"
                badgeIcon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2.5">
                        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                        <line x1="6" y1="6" x2="6.01" y2="6" strokeWidth="3" />
                        <line x1="6" y1="18" x2="6.01" y2="18" strokeWidth="3" />
                    </svg>
                }
                title={t('broker.title', 'Integrated Brokerage & Trading Infrastructure')}
                subtitle={t('broker.subtitle', 'Connect your MT5 account, view verified broker partners, and earn AI credits automatically through your daily trading volume.')}
                isCard={true}
            >
                <div className={styles.heroStatsRow}>
                    <div className={styles.heroStatItem}>
                        <span className={styles.statVal}>Tier-1 Regulated</span>
                        <span className={styles.statLbl}>Verified Security</span>
                    </div>
                    <div className={styles.heroStatDivider} />
                    <div className={styles.heroStatItem}>
                        <span className={styles.statVal}>&lt; 15ms Latency</span>
                        <span className={styles.statLbl}>Ultra-Fast MT5 Bridge</span>
                    </div>
                    <div className={styles.heroStatDivider} />
                    <div className={styles.heroStatItem}>
                        <span className={styles.statVal}>Volume Cashbacks</span>
                        <span className={styles.statLbl}>Auto AI Credits per Lot</span>
                    </div>
                </div>
            </CommonSectionHeader>

            {/* 2. Controls Row: Category Tabs & Search */}
            <div className={styles.controlsRow}>
                <div className={styles.tabs}>
                    {categories.map((tab) => {
                        const count = tab === 'All' ? brokers.length : brokers.filter(b => b.category === tab).length;
                        return (
                            <button
                                key={tab}
                                className={`${styles.tabBtn} ${selectedTab === tab ? styles.active : ''}`}
                                onClick={() => setSelectedTab(tab)}
                            >
                                <span>{tab}</span>
                                <span className={styles.tabBadge}>{count}</span>
                            </button>
                        );
                    })}
                </div>

                <div className={styles.searchBox}>
                    <SearchIcon />
                    <input
                        type="text"
                        placeholder="Search brokers, regulations, or servers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button type="button" onClick={() => setSearchQuery('')} className={styles.clearSearchBtn}>
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* 3. Brokers Cards Grid */}
            {isLoading ? (
                <div className={styles.brokersGrid}>
                    {Array.from({ length: (brokers && brokers.length > 0) ? brokers.length : 3 }).map((_, idx) => (
                        <BrokerCardSkeleton key={idx} />
                    ))}
                </div>
            ) : filteredBrokers.length > 0 ? (
                <div className={styles.brokersGrid}>
                    {filteredBrokers.map((broker) => (
                        <BrokerCard
                            key={broker.id}
                            broker={broker}
                            detailHref={`/broker/${broker.id}`}
                            onConnect={handleConnectClick}
                        />
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIconBox}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="1.5">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </div>
                    <h3>No verified brokers found</h3>
                    <p>No broker or platform matching &quot;{searchQuery}&quot; in category &quot;{selectedTab}&quot;.</p>
                    <button type="button" onClick={() => { setSearchQuery(''); setSelectedTab('All'); }} className={styles.resetFiltersBtn}>
                        Reset Filters
                    </button>
                </div>
            )}

            {/* 4. Bottom Conversion CTA */}
            <CommonCta
                badge="SEAMLESS BROKER SYNC"
                title1="Connect Your MetaTrader 5 Account"
                title2="to ChronosX AI Desk"
                description="Experience zero-delay live tick streams, automated risk parameters, and instant quantitative trade execution."
                primaryBtnText="CONNECT BROKER NOW"
                primaryBtnAction="/dashboard"
            />
        </div>
    );
}
