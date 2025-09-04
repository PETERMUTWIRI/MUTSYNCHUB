/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: {
      exclude: ['error'], // Keep console.error in production
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: '/f/**',
      },
    ],
    domains: ['localhost', 'potential-yodel-4jr5qq54gqvwh6wg-3000.app.github.dev'],
    minimumCacheTTL: 60,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://potential-yodel-4jr5qq54gqvwh6wg-3000.app.github.dev',
          },
          {
            key: 'X-Forwarded-Host',
            value: 'potential-yodel-4jr5qq54gqvwh6wg-3000.app.github.dev',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/',
        permanent: false,
      },
    ];
  },
  trailingSlash: false,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  generateBuildId: async () => {
    return 'mutsynchub-build';
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
};

module.exports = nextConfig;