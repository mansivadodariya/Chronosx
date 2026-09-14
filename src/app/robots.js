export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chronosx.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/privacy-policy', '/terms-and-conditions', '/risk-disclosure', '/plans', '/capabilities'],
                disallow: ['/api/', '/dashboard', '/chart-scanner', '/trade-advisor', '/trade-audit', '/market-assistant', '/signal-terminal', '/live-scanner', '/strategy-core', '/strategy-signal', '/strategy-hub', '/forex-calculator', '/economic-calendar', '/profile', '/credit-history'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
