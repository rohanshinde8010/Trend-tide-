import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', ['VITE_', 'NEXT_PUBLIC_']);
  return {
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    plugins: [react()],
    server: {
      port: 3001,
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:5001',
          changeOrigin: true,
        },
      },
    },
  };
});
