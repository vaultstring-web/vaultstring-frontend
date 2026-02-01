import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin(
    './src/i18n/request.ts'
);
 
/** @type {import('next').NextConfig} */
const nextConfig = {
    // Other Next.js configuration ...
    typescript: {
        ignoreBuildErrors: true, // Often needed in dev/prototyping
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    async rewrites() {
        const gateway = process.env.GATEWAY_INTERNAL_URL || 'http://kyd-gateway:8080';
        console.log('[Next.js Config] GATEWAY URL:', gateway);
        return [
            {
                source: '/api/:path*',
                destination: `${gateway}/api/:path*`,
            },
        ];
    },
};
 
export default withNextIntl(nextConfig);
