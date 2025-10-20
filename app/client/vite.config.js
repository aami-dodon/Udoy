import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const allowedHosts = env.CLIENT_ALLOWED_HOSTS
    ? env.CLIENT_ALLOWED_HOSTS.split(',').map((host) => host.trim()).filter(Boolean)
    : [];

  const baseServerConfig = {
    port: Number(env.CLIENT_PORT) || 6004,
    host: '0.0.0.0',
  };

  if (allowedHosts.length > 0) {
    baseServerConfig.allowedHosts = allowedHosts;
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: { ...baseServerConfig },
    preview: { ...baseServerConfig },
  };
});
