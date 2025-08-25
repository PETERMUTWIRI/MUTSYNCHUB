/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "organic-space-parakeet-q7x55vrxx7v526xv-3000.app.github.dev",
      ],
    },
  },
};

module.exports = nextConfig;