import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.example.com', // For subdomains
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // Removed upgrade-insecure-requests and Strict-Transport-Security for localhost compatibility to prevent "Network request failed"
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://picsum.photos https://images.unsplash.com; connect-src 'self' http://127.0.0.1:9000 http://localhost:8080 http://kyd-gateway:8080 https://*; font-src 'self' data:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=(), payment=(), usb=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' }
        ]
      }
    ]
  },
  async rewrites() {
    // FORCE FIX for Docker internal networking
    const gateway = process.env.GATEWAY_INTERNAL_URL || 'http://kyd-gateway:8080';
    console.log('[Next.js Config] GATEWAY URL:', gateway);

    return [
      {
        source: '/api/v1/:path*',
        destination: `${gateway}/api/v1/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${gateway}/api/:path*`,
      },
    ]
  }
};

export default withNextIntl(nextConfig);
