import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/books': 'http://localhost:3000',
      '/genres': 'http://localhost:3000',
    },
  },
});
