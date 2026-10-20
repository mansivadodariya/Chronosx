import PublicTechnicalSupport from '@/rendering/publicTechnicalSupport';

export const metadata = {
    title: 'Technical Support — Raise a Support Ticket | ChronosX',
    description:
        'Submit a ChronosX technical support ticket with your contact details and an optional screenshot. Our team responds within hours.',
    alternates: {
        canonical: 'https://chronosx.com/support-ticket',
    },
    openGraph: {
        title: 'Technical Support — Raise a Support Ticket | ChronosX',
        description:
            'Submit a ChronosX technical support ticket with your contact details and an optional screenshot. Our team responds within hours.',
        url: 'https://chronosx.com/support-ticket',
        siteName: 'ChronosX',
        images: [
            {
                url: '/assets/logo/logo.png',
                width: 1200,
                height: 630,
                alt: 'ChronosX Technical Support',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Technical Support — Raise a Support Ticket | ChronosX',
        description:
            'Submit a ChronosX technical support ticket with your contact details and an optional screenshot for faster diagnosis.',
        images: ['/assets/logo/logo.png'],
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'ChronosX Technical Support',
    url: 'https://chronosx.com/support-ticket',
    description:
        'Submit a ChronosX technical support ticket with your contact details and an optional screenshot. Our team responds within hours.',
    mainEntity: {
        '@type': 'Organization',
        name: 'ChronosX',
        url: 'https://chronosx.com',
        logo: 'https://chronosx.com/assets/logo/logo.png',
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Technical Support',
            availableLanguage: ['English', 'Arabic'],
        },
    },
};

export default function Page() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <PublicTechnicalSupport />
        </>
    );
}
