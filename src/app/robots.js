export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chronosx.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/privacy-policy', '/terms-and-conditions', '/risk-disclosure', '/plans', '/capabilities'],
                disallow: ['/api/', '/dashboard', '/chart-scanner', '/trade-audit', '/market-assistant', '/live-scanner', '/strategy-hub', '/profile', '/credit-history'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
