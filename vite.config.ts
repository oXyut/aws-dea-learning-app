import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves project sites below the repository name.
  base: process.env.BASE_PATH || '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/')) return 'vendor';
          if (id.includes('/data/curriculum')) return 'curriculum';
        },
      },
    },
  },
});
