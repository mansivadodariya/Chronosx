'use client';
import dynamic from 'next/dynamic';

const PageLoader = dynamic(() => import('@/components/pageLoader'), { ssr: false });
const BackToTop = dynamic(() => import('@/components/backToTop'), { ssr: false });
const WhatsappButton = dynamic(() => import('@/components/whatsappButton'), { ssr: false });

export default function ClientOnlyWidgets() {
    return (
        <>
            <PageLoader />
            <BackToTop />
            <WhatsappButton />
        </>
    );
}
