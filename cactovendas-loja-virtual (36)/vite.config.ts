
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // FIX: Replaced `process.cwd()` with `path.resolve('.')` to avoid TypeScript error.
  const env = loadEnv(mode, path.resolve('.'), '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(env.VITE_GOOGLE_MAPS_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve('.'),
      }
    }
  };
});
