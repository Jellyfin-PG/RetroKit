import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      include: ['src'],
    }),
  ],
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'RetroKit',
      fileName: (format) => `retrokit.${format === 'es' ? 'js' : 'umd.cjs'}`,
    },
    rollupOptions: {
      // Ensure external dependencies aren't bundled if any are added later
      external: [],
      output: {
        exports: 'named',
        globals: {},
      },
    },
    sourcemap: true,
    minify: 'esbuild',
  },
  server: {
    fs: {
      strict: false,
      allow: ['..'],
    },
    watch: {
      ignored: [
        '**/Little-Bookbinder/**',
        '**/*.love',
        '**/*.zip',
        '**/*.7z',
        '**/*.iso',
        '**/*.cso',
      ],
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    },
    proxy: {
      '/libretro-cores': {
        target: 'https://web.libretro.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/libretro-cores/, ''),
        headers: {
          'Cross-Origin-Resource-Policy': 'cross-origin',
        },
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            proxyRes.headers['cross-origin-resource-policy'] = 'cross-origin';
          });
        },
      },
      '/emulatorjs-cores': {
        target: 'https://cdn.emulatorjs.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/emulatorjs-cores/, ''),
        headers: {
          'Cross-Origin-Resource-Policy': 'cross-origin',
        },
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            proxyRes.headers['cross-origin-resource-policy'] = 'cross-origin';
          });
        },
      },
      '/play-cores': {
        target: 'https://playjs.purei.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/play-cores/, ''),
        headers: {
          'Cross-Origin-Resource-Policy': 'cross-origin',
        },
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            proxyRes.headers['cross-origin-resource-policy'] = 'cross-origin';
          });
        },
      },
      '/love-cores': {
        target: 'https://cdn.jsdelivr.net',
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/love-cores/, '/gh/2dengine/love.js@main/11.5'),
        headers: {
          'Cross-Origin-Resource-Policy': 'cross-origin',
        },
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            proxyRes.headers['cross-origin-resource-policy'] = 'cross-origin';
          });
        },
      },
      '/ra-api': {
        target: 'https://retroachievements.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ra-api/, ''),
        headers: {
          'User-Agent': 'RetroArch/1.19.1',
        },
      },
    },
  },
});
