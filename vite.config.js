import { defineConfig } from 'vite';

export default defineConfig({
  // Build output goes to dist/
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  // Dev server settings (local only)
  server: {
    port: 5173,
  },
  // Preview server (vite preview) — used when testing dist/ locally
  // Reads PORT env variable for Railway compatibility
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT) || 4173,
    allowedHosts: [
      'localhost',
      '*.railway.app',
      // Add your custom domain here if you have one, e.g.:
      // 'aura-weather.yourdomain.com',
    ],
  },
});
