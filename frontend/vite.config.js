import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Set VITE_BASE_PATH env var when deploying to a non-root GitHub Pages URL,
// e.g. VITE_BASE_PATH=/roman-emperors/ npm run build
const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    port: 5173,
  },
});
