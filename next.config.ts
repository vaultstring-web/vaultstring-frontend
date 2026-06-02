import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    // Or you can use the simpler domains array (deprecated but still works):
    // domains: ['picsum.photos', 'images.unsplash.com', 'example.com'],
  },
};

export default nextConfig;