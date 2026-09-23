/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'lightweight-charts',
      'react-apexcharts',
      'apexcharts',
      'technicalindicators',
      '@supabase/supabase-js',
      'react-phone-number-input',
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/chart/:path*',
        destination: 'https://thirsty-spoiler-cartel.ngrok-free.dev/api/v1/chart/:path',
      },
    ];
  },
};

export default nextConfig;

