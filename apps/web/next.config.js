/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'tiredist.com'],
  },
  transpilePackages: ['@tire-distributor/ui'],
  async rewrites() {
    return [
      {
        source: '/api/trpc/:path*',
        destination: '/api/trpc/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
