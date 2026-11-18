/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { serviceWorker } from './build/serviceWorker';

export default defineConfig({
  // GitHub Pages serves the app from /<repo-name>/; the deploy workflow sets
  // BASE_PATH. Locally (and on a root-domain host) it stays "/".
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss(), serviceWorker()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@content': fileURLToPath(new URL('./content', import.meta.url)),
    },
  },
  build: {
    // The main chunk holds the whole validated course (content is bundled at build time).
    chunkSizeWarningLimit: 900,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});
