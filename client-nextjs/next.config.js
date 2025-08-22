// next.config.js
/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: isProd ? 'export' : undefined, // Static export only in production
  basePath: isProd ? '/MUTSYNCHUB' : '', // No basePath in dev
  assetPrefix: isProd ? 'https://PETERMUTWIRI.github.io/MUTSYNCHUB' : '', // No assetPrefix in dev
  images: {
    unoptimized: true, // Disable image optimization
  },
  trailingSlash: true, // GitHub Pages compatibility
  reactStrictMode: true,
  experimental: {
    forceSwcTransforms: true, // Faster builds
  },
};

module.exports = nextConfig;