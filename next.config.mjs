/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'apexcharts',
      'lightweight-charts',
      'react-hot-toast',
      '@supabase/supabase-js',
      'lucide-react',
      'bcryptjs',
      'lenis'
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/chart/:path*',
        destination: 'https://thirsty-spoiler-cartel.ngrok-free.dev/api/v1/chart/:path*',
      },
    ];
  },
};

export default nextConfig;

