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
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
    proxy: {
      '/libretro-cores': {
        target: 'https://web.libretro.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/libretro-cores/, ''),
      },
      '/play-cores': {
        target: 'https://playjs.purei.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/play-cores/, ''),
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
