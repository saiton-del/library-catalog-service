import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/catalog/books': {
        target: 'http://localhost:3000',
        rewrite: (path) => path.replace(/^\/catalog\/books/, '/books'),
      },
      '/catalog/genres': {
        target: 'http://localhost:3000',
        rewrite: (path) => path.replace(/^\/catalog\/genres/, '/genres'),
      },
      '/api': 'http://localhost:3000',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    clearMocks: true,
  },
});
