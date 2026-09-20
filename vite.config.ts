import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves project sites below the repository name.
  base: process.env.BASE_PATH || '/',
});
