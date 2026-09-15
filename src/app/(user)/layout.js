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
    '/strategy-hub',
    '/ai-strategy-hub',
    '/strategy-core',
    '/ai-strategy-core',
    '/strategy-signal',
];

const ROUTE_TAB_MAP = {
    '/dashboard': 'Dashboard',
    '/chart-scanner': 'AI Chart Scanner',
    '/ai-chart-scanner': 'AI Chart Scanner',
    '/trade-audit': 'AI Trade Advisor',
    '/ai-trade-audit': 'AI Trade Advisor',
    '/trade-advisor': 'AI Trade Advisor',
    '/ai-trade-advisor': 'AI Trade Advisor',
    '/market-assistant': 'AI Market Assistant',
    '/ai-market-assistant': 'AI Market Assistant',
    '/live-scanner': 'Signal Terminal',
    '/live-market-scanner': 'Signal Terminal',
    '/signal-terminal': 'Signal Terminal',
    '/strategy-hub': 'AI Strategy Core',
    '/ai-strategy-hub': 'AI Strategy Core',
    '/strategy-core': 'AI Strategy Core',
    '/ai-strategy-core': 'AI Strategy Core',
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
    '/broker': 'Broker',
    '/brokers': 'Broker',
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
                currentTabName === 'Tools' ||
                currentTabName === 'Economic Calendar' ||
                currentTabName === 'Forex Calculator' ||
                currentTabName === 'Market News' ||
                currentTabName === 'Credit History' ||
                currentTabName === 'Affiliate' ||
                currentTabName === 'Profile'
            ) {
                setIsTabAllowed(true);
                return;
            }

            try {
                const { data, error } = await supabase.rpc('get_visible_dashboard_tabs');
                if (!error && Array.isArray(data)) {
                    const visibleNames = data.map(t => (t.name || '').toLowerCase());
                    const currentLower = currentTabName.toLowerCase();
                    const isAllowed = visibleNames.some(name => {
                        if (name === currentLower) return true;
                        if (currentLower === 'ai trade advisor' && (name.includes('trade advisor') || name.includes('trade audit') || name.includes('trade analysis') || name.includes('trade-audit') || name.includes('trade-analysis') || name.includes('ai trade'))) return true;
                        if (currentLower === 'signal terminal' && (name.includes('signal terminal') || name.includes('live market scanner') || name.includes('live-scanner') || name.includes('live analysis') || name.includes('strategy hub'))) return true;
                        if (currentLower === 'ai strategy core' && (name.includes('ai strategy core') || name.includes('strategy core') || name.includes('strategy hub') || name.includes('strategy-hub') || name.includes('ai strategy') || name.includes('strategy'))) return true;
                        if (currentLower === 'strategy signal' && (name.includes('strategy signal') || name.includes('strategy playbooks') || name.includes('strategy hub') || name.includes('ai strategy') || name.includes('strategy'))) return true;
                        if (currentLower === 'ai chart scanner' && (name.includes('chart scanner') || name.includes('market snapshot') || name.includes('chart-scanner') || name.includes('ai trade'))) return true;
                        if (currentLower === 'ai market assistant' && (name.includes('market assistant') || name.includes('trading advisor') || name.includes('ai chat') || name.includes('ai assistant'))) return true;
                        if (currentLower === 'subscription plans' && name.includes('subscription plans')) return true;
                        if (currentLower === 'broker' && name.includes('broker')) return true;
                        return false;
                    });
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
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '20px' }}>
                        <h1 style={{ fontSize: '5rem', marginBottom: '0.5rem', color: '#ef4444', fontWeight: '800' }}>404</h1>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Tab Disabled / Access Denied</h2>
                        <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>This page has been turned off by administrator.</p>
                        <a href="/dashboard" style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
                            Back to Dashboard
                        </a>
                    </div>
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
