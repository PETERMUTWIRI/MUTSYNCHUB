// next.config.js
const isCodespace = process.env.CODESPACE_NAME !== undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
    serverActionsBodySizeLimit: '10mb', // <- bigger CSV
    // 1.  disable the origin / host check that causes digest 1556847683
    serverActionsAllowedHosts: isCodespace
      ? ['.githubpreview.dev', '.app.github.dev', 'localhost:3000']
      : ['localhost:3000'],
  },

  // 2.  (Codespaces only) force x-forwarded-host to match browser origin
  ...(isCodespace && {
    headers: async () => [
      {
        source: '/:path*',
        headers: [
          { key: 'x-forwarded-host', value: 'localhost:3000' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, x-forwarded-host' },
        ],
      },
    ],
  }),

  // 3.  keep your original headers when NOT in Codespaces
  ...(!isCodespace && {
    headers: async () => [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ],
  }),

  compiler: { removeConsole: { exclude: ['error'] } },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'utfs.io', pathname: '/f/**' }],
    domains: ['localhost', 'potential-yodel-4jr5qq54gqvwh6wg-3000.app.github.dev'],
  },

  async redirects() {
    return [{ source: '/old-path', destination: '/', permanent: false }];
  },
};

module.exports = nextConfig;