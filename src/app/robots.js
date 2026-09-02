export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chronosx.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/privacy-policy', '/terms-and-conditions', '/risk-disclosure', '/plans', '/capabilities'],
                disallow: ['/api/', '/dashboard', '/trade-snap', '/ai-assistant', '/ai-strategy', '/profile', '/credit-history'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
