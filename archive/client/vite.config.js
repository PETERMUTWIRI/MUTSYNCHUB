import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    svgr({
      svgrOptions: {
        icon: true,
        svgo: true,
        svgoConfig: {
          plugins: [
            { 
              name: 'preset-default', 
              params: { overrides: { removeViewBox: false } } 
            },
            'removeXMLNS'
          ],
        },
      },
    }),
  ],
  optimizeDeps: {
    exclude: [
      '@radix-ui/react-*',
      'vaul',
      'cmdk',
      'embla-carousel-react'
    ],
    include: [
      'react',
      'react-dom',
      'recharts'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@lib': path.resolve(__dirname, './src/lib'),
      
      // Force single React version
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'recharts': path.resolve(__dirname, 'node_modules/recharts'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      // Prevent duplicate React in bundle
      external: ['react', 'react-dom'],
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://verbose-robot-97475jqg6j9v3xqwr-5000.app.github.dev',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});