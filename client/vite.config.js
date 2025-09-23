import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devServerPort = Number(env.VITE_DEV_SERVER_PORT || 5173);
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:5000';
  const allowedHosts = (env.VITE_ALLOWED_HOSTS || '')
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, '../shared')
      }
    },
    server: {
      port: devServerPort,
      allowedHosts: allowedHosts.length > 0 ? allowedHosts : undefined,
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true
        }
      }
    }
  };
});
