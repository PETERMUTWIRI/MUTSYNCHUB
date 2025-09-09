/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
    serverActionsBodySizeLimit: '2mb',
  },
  // DEV ONLY: disable origin check (remove in production)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, x-forwarded-host' },
        ],
      },
    ];
  },
  compiler: { removeConsole: { exclude: ['error'] } },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'utfs.io', pathname: '/f/**' }],
    domains: ['localhost', 'potential-yodel-4jr5qq54gqvwh6wg-3000.app.github.dev'],
    minimumCacheTTL: 60,
  },
  async redirects() {
    return [{ source: '/old-path', destination: '/', permanent: false }];
  },
  trailingSlash: false,
  output: 'standalone',
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  generateBuildId: async () => 'mutsynchub-build',
  webpack: (config) => {
    config.module.rules.push({ test: /\.svg$/i, issuer: /\.[jt]sx?$/, use: ['@svgr/webpack'] });
    return config;
  },
};

module.exports = nextConfig;
