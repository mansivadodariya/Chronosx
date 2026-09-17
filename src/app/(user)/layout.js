"use client";
import Sidebar from '@/components/sidebar';
import Topbar from '@/components/topbar';
import AuthGuard from '@/components/authGuard';
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToolStateProvider } from '@/context/toolState';
import { SubscriptionProvider } from '@/context/SubscriptionContext';
import NeweraCreditsModal from '@/components/neweraCreditsModal';
import RiskDisclosureModal from '@/components/riskDisclosureModal';
import { extractAvailableCredits, CREDITS_UPDATED_EVENT, notifyCreditsUpdated, refreshCreditsFromServer } from '@/lib/credits';
import { captureUtmParameters } from '@/lib/utm';
import { getStoredUserId } from '@/lib/authSession';
import { dashboardApi, neweraApi } from '@/lib/api';
import { supabase } from '@/lib/supabaseClient';
import AccessDeniedScreen from '@/components/AccessDeniedScreen';
import './layout.scss';

const TOOL_ROUTES = [
    '/chart-scanner',
    '/ai-chart-scanner',
    '/trade-audit',
    '/ai-trade-audit',
    '/trade-advisor',
    '/ai-trade-advisor',
    '/market-assistant',
    '/ai-market-assistant',
    '/live-scanner',
    '/live-market-scanner',
    '/signal-terminal',
    '/trading-signal',
    '/ai-trading-signal',
    '/strategy-hub',
    '/ai-strategy-hub',
    '/strategy-core',
    '/ai-strategy-core',
    '/strategy-signal',
    '/strategy-studio',
    '/ai-strategy-studio',
    '/ai-bot-builder',
    '/bot-builder',
];

const ROUTE_TAB_MAP = {
    '/dashboard': 'Dashboard',
    '/chart-scanner': 'AI Chart Scanner',
    '/ai-chart-scanner': 'AI Chart Scanner',
    '/trade-audit': 'AI Past Trade Analyzer',
    '/ai-trade-audit': 'AI Past Trade Analyzer',
    '/trade-advisor': 'AI Past Trade Analyzer',
    '/ai-trade-advisor': 'AI Past Trade Analyzer',
    '/market-assistant': 'AI Market Assistant',
    '/ai-market-assistant': 'AI Market Assistant',
    '/live-scanner': 'Signal Terminal',
    '/live-market-scanner': 'Signal Terminal',
    '/signal-terminal': 'Signal Terminal',
    '/trading-signal': 'AI Trading Signal',
    '/ai-trading-signal': 'AI Trading Signal',
    '/strategy-hub': 'AI Trading Signal',
    '/ai-strategy-hub': 'AI Trading Signal',
    '/strategy-core': 'AI Trading Signal',
    '/ai-strategy-core': 'AI Trading Signal',
    '/ai-bot-builder': 'AI Bot Builder',
    '/bot-builder': 'AI Bot Builder',
    '/strategy-studio': 'AI Bot Builder',
    '/ai-strategy-studio': 'AI Bot Builder',
    '/strategy-hub/live': 'Signal Terminal',
    '/strategy-hub/strategy': 'Strategy Signal',
    '/strategy-signal': 'Strategy Signal',
    '/tools': 'Tools',
    '/calendar': 'Economic Calendar',
    '/economic-calendar': 'Economic Calendar',
    '/calculator': 'Forex Calculator',
    '/forex-calculator': 'Forex Calculator',
    '/news': 'Market News',
    '/market-news': 'Market News',
    '/credit-history': 'Credit History',
    '/plans': 'Subscription Plans',
    '/subscription-plans': 'Subscription Plans',
    '/broker': 'Associated Brokers',
    '/brokers': 'Associated Brokers',
    '/affiliate': 'Affiliate',
    '/dashboard/affiliate': 'Affiliate',
    '/profile': 'Profile',
    '/settings': 'Profile',
};

const layout = ({ children }) => {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showCreditsModal, setShowCreditsModal] = useState(false);
    const [showRiskModal, setShowRiskModal] = useState(false);
    const [userId, setUserId] = useState('');
    const [isTabAllowed, setIsTabAllowed] = useState(true);

    // Check Risk Disclosure acceptance when user navigates to any Tool route
    useEffect(() => {
        const isTool = TOOL_ROUTES.some(r => pathname === r || pathname.startsWith(`${r}/`));
        if (!isTool) {
            setShowRiskModal(false);
            return;
        }

        const activeUid = userId || getStoredUserId();
        try {
            const acceptedKey = activeUid ? `risk_disclosure_accepted_${activeUid}` : null;
            const hasLocalAccepted = (acceptedKey && localStorage.getItem(acceptedKey)) || localStorage.getItem('risk_disclosure_accepted_global');

            if (hasLocalAccepted) {
                setShowRiskModal(false);
                return;
            }

            if (activeUid && supabase) {
                supabase
                    .from('users')
                    .select('risk_accepted_at')
                    .eq('id', activeUid)
                    .maybeSingle()
                    .then(({ data }) => {
                        if (data?.risk_accepted_at) {
                            try {
                                if (acceptedKey) localStorage.setItem(acceptedKey, data.risk_accepted_at);
                                localStorage.setItem('risk_disclosure_accepted_global', data.risk_accepted_at);
                            } catch { /* ignore */ }
                            setShowRiskModal(false);
                        } else {
                            setShowRiskModal(true);
                        }
                    })
                    .catch(() => {
                        setShowRiskModal(true);
                    });
            } else {
                setShowRiskModal(true);
            }
        } catch {
            setShowRiskModal(true);
        }
    }, [pathname, userId]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 1200);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('sidebar_collapsed');
            if (stored === 'true') {
                setIsCollapsed(true);
            }
        } catch { /* ignore */ }
    }, []);

    const toggleCollapse = () => {
        setIsCollapsed((prev) => {
            const next = !prev;
            try {
                localStorage.setItem('sidebar_collapsed', String(next));
            } catch { /* ignore */ }
            return next;
        });
    };

    const handleMenuClick = () => {
        if (typeof window !== 'undefined' && window.innerWidth <= 1200) {
            setIsSidebarOpen(true);
        } else {
            toggleCollapse();
        }
    };

    const checkAndShowModalIfZero = (currentCredits) => {
        if (currentCredits !== undefined && currentCredits !== null) {
            if (Number(currentCredits) <= 0) {
                setShowCreditsModal(true);
            } else {
                setShowCreditsModal(false);
            }
        }
    };

    useEffect(() => {
        captureUtmParameters();
        const uid = getStoredUserId();
        setUserId(uid);

        if (uid) {
            const syncUtmToDb = async () => {
                try {
                    const { getUtmParameters } = await import('@/lib/utm');
                    const utmParams = getUtmParameters();
                    if ((utmParams.utm_source || utmParams.utm_medium || utmParams.utm_campaign) && supabase) {
                        const { data: dbUser } = await supabase
                            .from('users')
                            .select('utm_source, utm_medium, utm_campaign')
                            .eq('id', uid)
                            .maybeSingle();

                        if (dbUser && !dbUser.utm_source && !dbUser.utm_medium && !dbUser.utm_campaign) {
                            await supabase
                                .from('users')
                                .update({
                                    utm_source: utmParams.utm_source || null,
                                    utm_medium: utmParams.utm_medium || null,
                                    utm_campaign: utmParams.utm_campaign || null
                                })
                                .eq('id', uid);
                        }
                    }
                } catch (e) {
                    console.warn("Failed to sync UTM parameters:", e);
                }
            };
            syncUtmToDb();

            dashboardApi.getStats(uid)
                .then((res) => {
                    const currentCredits = res?.data?.available_credits;
                    checkAndShowModalIfZero(currentCredits);
                })
                .catch((err) => {
                    console.warn("Failed to check initial credits on layout mount:", err);
                });
        }

        const handleTabVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const activeUid = getStoredUserId();
                if (activeUid) {
                    dashboardApi.getStats(activeUid)
                        .then((res) => {
                            const currentCredits = res?.data?.available_credits;
                            checkAndShowModalIfZero(currentCredits);
                        })
                        .catch((err) => {
                            console.warn("Failed to check credits on tab switch:", err);
                        });
                }
            }
        };

        const onCreditsUpdated = (e) => {
            const currentCredits = e?.detail?.available_credits;
            checkAndShowModalIfZero(currentCredits);
        };

        window.addEventListener(CREDITS_UPDATED_EVENT, onCreditsUpdated);
        document.addEventListener('visibilitychange', handleTabVisibilityChange);
        return () => {
            window.removeEventListener(CREDITS_UPDATED_EVENT, onCreditsUpdated);
            document.removeEventListener('visibilitychange', handleTabVisibilityChange);
        };
    }, []);

    useEffect(() => {
        const checkPermission = async () => {
            if (!supabase) return;
            const currentTabName = Object.entries(ROUTE_TAB_MAP).find(([route]) =>
                pathname === route || (route !== '/' && pathname.startsWith(`${route}/`))
            )?.[1];

            if (
                !currentTabName ||
                currentTabName === 'Dashboard' ||
                currentTabName === 'Affiliate' ||
                currentTabName === 'Profile'
            ) {
                setIsTabAllowed(true);
                return;
            }

            try {
                const { data, error } = await supabase.rpc('get_visible_dashboard_tabs');
                if (!error && Array.isArray(data)) {
                    const visibleNames = new Set(data.map(t => (t.name || '').toLowerCase().trim()));
                    const currentLower = (currentTabName || '').toLowerCase().trim();

                    let isAllowed = false;

                    if (currentLower === 'ai bot builder' || currentLower === 'ai strategy builder' || currentLower === 'strategy studio') {
                        isAllowed = visibleNames.has('ai bot builder') || visibleNames.has('bot builder') || visibleNames.has('custom bot builder');
                    } else if (currentLower === 'ai chart scanner') {
                        isAllowed = visibleNames.has('ai chart scanner') || visibleNames.has('chart scanner');
                    } else if (currentLower === 'ai past trade analyzer' || currentLower === 'ai trade advisor' || currentLower === 'ai trade audit') {
                        isAllowed = visibleNames.has('ai trade audit') || visibleNames.has('ai past trade analyzer') || visibleNames.has('ai trade advisor') || visibleNames.has('trade audit') || visibleNames.has('trade advisor') || visibleNames.has('past trade analyzer');
                    } else if (currentLower === 'ai market assistant') {
                        isAllowed = visibleNames.has('ai market assistant') || visibleNames.has('market assistant');
                    } else if (currentLower === 'signal terminal') {
                        isAllowed = visibleNames.has('signal terminal') || visibleNames.has('live market scanner') || visibleNames.has('strategy hub') || visibleNames.has('ai trading signal');
                    } else if (currentLower === 'strategy signal') {
                        isAllowed = visibleNames.has('strategy signal') || visibleNames.has('strategy playbooks') || visibleNames.has('strategy hub') || visibleNames.has('ai trading signal');
                    } else if (currentLower === 'ai trading signal' || currentLower === 'ai strategy core') {
                        isAllowed = visibleNames.has('strategy hub') || visibleNames.has('ai trading signal') || visibleNames.has('trading signal') || visibleNames.has('ai strategy core');
                    } else if (currentLower === 'economic calendar') {
                        isAllowed = visibleNames.has('economic calendar') || visibleNames.has('calendar');
                    } else if (currentLower === 'forex calculator') {
                        isAllowed = visibleNames.has('forex calculator') || visibleNames.has('calculator');
                    } else if (currentLower === 'market news') {
                        isAllowed = visibleNames.has('market news') || visibleNames.has('news');
                    } else if (currentLower === 'tools') {
                        isAllowed = visibleNames.has('tools') || visibleNames.has('economic calendar') || visibleNames.has('forex calculator') || visibleNames.has('market news') || visibleNames.has('calendar') || visibleNames.has('calculator') || visibleNames.has('news');
                    } else if (currentLower === 'credit history') {
                        isAllowed = visibleNames.has('credit history') || visibleNames.has('credit_history');
                    } else if (currentLower === 'subscription plans') {
                        isAllowed = visibleNames.has('subscription plans') || visibleNames.has('plans') || visibleNames.has('subscription_plans');
                    } else if (currentLower === 'broker' || currentLower === 'brokers' || currentLower === 'associated broker' || currentLower === 'associated brokers') {
                        isAllowed = visibleNames.has('broker') || visibleNames.has('brokers') || visibleNames.has('associated brokers') || visibleNames.has('associated broker');
                    } else {
                        isAllowed = visibleNames.has(currentLower);
                    }

                    setIsTabAllowed(isAllowed);
                }
            } catch (e) {
                console.warn("Failed to check tab permissions:", e);
                setIsTabAllowed(true);
            }
        };

        checkPermission();
    }, [pathname]);

    if (!isTabAllowed) {
        return (
            <AuthGuard>
                <ThemeProvider>
                    <AccessDeniedScreen />
                </ThemeProvider>
            </AuthGuard>
        );
    }

    const effectiveCollapsed = isMobile ? false : isCollapsed;

    return (
        <AuthGuard>
            <ThemeProvider>
                <SubscriptionProvider>
                <ToolStateProvider>
                    <div className={`user-layout ${effectiveCollapsed ? 'collapsed' : ''}`}>
                        <div className={`sidebar-wrapper ${effectiveCollapsed ? 'collapsed' : ''} ${isSidebarOpen ? 'open' : ''}`}>
                            <Sidebar
                                onClose={() => setIsSidebarOpen(false)}
                                isCollapsed={effectiveCollapsed}
                                onToggleCollapse={toggleCollapse}
                            />
                        </div>
                        {isSidebarOpen && (
                            <div className='sidebar-overlay' onClick={() => setIsSidebarOpen(false)} />
                        )}
                        <div className='children-wrapper'>
                            <Topbar onMenuClick={handleMenuClick} />
                            <div className='children-spacing'>
                                {children}
                            </div>
                        </div>
                    </div>

                    {/* {showCreditsModal && (
                        <NeweraCreditsModal
                            userId={userId}
                            onClose={() => setShowCreditsModal(false)}
                            onSuccess={(creditsVal) => {
                                setShowCreditsModal(false);
                                if (creditsVal !== undefined && creditsVal !== null) {
                                    notifyCreditsUpdated(creditsVal);
                                } else {
                                    refreshCreditsFromServer();
                                }
                            }}
                        />
                    )} */}
                    <RiskDisclosureModal
                        isOpen={showRiskModal}
                        userId={userId}
                        onAccept={() => setShowRiskModal(false)}
                    />
                </ToolStateProvider>
                </SubscriptionProvider>
            </ThemeProvider>
        </AuthGuard>
    );
}

export default layout;
