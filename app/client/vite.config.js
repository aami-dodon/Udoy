import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sharedComponentsPath = path.resolve(__dirname, '../shared/components');
const sharedUiEntryPath = path.resolve(sharedComponentsPath, 'ui/index.js');

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

  const projectRoot = path.resolve(__dirname);

  const clientNodeModules = path.resolve(__dirname, 'node_modules');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': sharedComponentsPath,
        '@components/ui': sharedUiEntryPath,
        'lucide-react': path.resolve(clientNodeModules, 'lucide-react'),
        '@radix-ui/react-slot': path.resolve(clientNodeModules, '@radix-ui/react-slot'),
        '@radix-ui/react-accordion': path.resolve(clientNodeModules, '@radix-ui/react-accordion'),
      },
    },
    server: {
      ...baseServerConfig,
      fs: {
        allow: [projectRoot, sharedComponentsPath],
      },
    },
    preview: { ...baseServerConfig },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: path.resolve(__dirname, './src/test/setup.js'),
      css: true,
      coverage: {
        reporter: ['text', 'lcov'],
        include: ['src/**/*.{js,jsx}'],
        exclude: ['src/main.jsx', 'src/test/**'],
      },
    },
  };
});
