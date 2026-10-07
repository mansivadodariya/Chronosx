'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const PageLoader = dynamic(() => import('@/components/pageLoader'), { ssr: false });
const BackToTop = dynamic(() => import('@/components/backToTop'), { ssr: false });
const WhatsappButton = dynamic(() => import('@/components/whatsappButton'), { ssr: false });
const MaintenanceGuard = dynamic(() => import('@/components/maintenanceGuard'), { ssr: false });

export default function ClientOnlyWidgets() {
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window !== 'undefined' && pathname && !pathname.includes('/maintenance') && !pathname.startsWith('/api/')) {
            try {
                const full = window.location.pathname + window.location.search;
                sessionStorage.setItem('chronosx_last_visited_page', full);
                localStorage.setItem('chronosx_last_visited_page', full);
            } catch (_) {}
        }
    }, [pathname]);

    return (
        <>
            <MaintenanceGuard />
            <PageLoader />
            <BackToTop />
            <WhatsappButton />
        </>
    );
}
