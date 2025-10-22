import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sharedComponentsPath = path.resolve(__dirname, '../shared/components');
const sharedUiEntryPath = path.resolve(sharedComponentsPath, 'ui/index.js');
const sharedIconsPath = path.resolve(__dirname, '../shared/icons');
const sharedEditorPath = path.resolve(__dirname, '../shared/editor');

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
        '@icons': sharedIconsPath,
        'lucide-react': path.resolve(clientNodeModules, 'lucide-react'),
        '@radix-ui/react-slot': path.resolve(clientNodeModules, '@radix-ui/react-slot'),
        '@radix-ui/react-accordion': path.resolve(clientNodeModules, '@radix-ui/react-accordion'),
        '@radix-ui/react-select': path.resolve(clientNodeModules, '@radix-ui/react-select'),
        '@radix-ui/react-dropdown-menu': path.resolve(clientNodeModules, '@radix-ui/react-dropdown-menu'),
        '@radix-ui/react-checkbox': path.resolve(clientNodeModules, '@radix-ui/react-checkbox'),
        '@radix-ui/react-popover': path.resolve(clientNodeModules, '@radix-ui/react-popover'),
        '@radix-ui/react-scroll-area': path.resolve(clientNodeModules, '@radix-ui/react-scroll-area'),
        '@radix-ui/react-label': path.resolve(clientNodeModules, '@radix-ui/react-label'),
        '@radix-ui/react-separator': path.resolve(clientNodeModules, '@radix-ui/react-separator'),
        '@radix-ui/react-alert-dialog': path.resolve(clientNodeModules, '@radix-ui/react-alert-dialog'),
        '@tanstack/react-table': path.resolve(clientNodeModules, '@tanstack/react-table'),
        'class-variance-authority': path.resolve(clientNodeModules, 'class-variance-authority'),
        cmdk: path.resolve(clientNodeModules, 'cmdk'),
        '@hookform/resolvers': path.resolve(clientNodeModules, '@hookform/resolvers'),
        'react-hook-form': path.resolve(clientNodeModules, 'react-hook-form'),
        'react-day-picker': path.resolve(clientNodeModules, 'react-day-picker'),
        'react-phone-number-input': path.resolve(clientNodeModules, 'react-phone-number-input'),
        'date-fns': path.resolve(clientNodeModules, 'date-fns'),
        '@tiptap/core': path.resolve(clientNodeModules, '@tiptap/core'),
        '@tiptap/starter-kit': path.resolve(clientNodeModules, '@tiptap/starter-kit'),
        '@tiptap/extension-placeholder': path.resolve(clientNodeModules, '@tiptap/extension-placeholder'),
        '@tiptap/extension-image': path.resolve(clientNodeModules, '@tiptap/extension-image'),
        '@tiptap/extension-link': path.resolve(clientNodeModules, '@tiptap/extension-link'),
        '@tiptap/extension-file-handler': path.resolve(clientNodeModules, '@tiptap/extension-file-handler'),
        '@tiptap/extension-underline': path.resolve(clientNodeModules, '@tiptap/extension-underline'),
        '@tiptap/extension-text-align': path.resolve(clientNodeModules, '@tiptap/extension-text-align'),
        '@tiptap/extension-highlight': path.resolve(clientNodeModules, '@tiptap/extension-highlight'),
        '@tiptap/extension-typography': path.resolve(clientNodeModules, '@tiptap/extension-typography'),
        '@tiptap/extension-subscript': path.resolve(clientNodeModules, '@tiptap/extension-subscript'),
        '@tiptap/extension-superscript': path.resolve(clientNodeModules, '@tiptap/extension-superscript'),
        '@tiptap/extension-task-item': path.resolve(clientNodeModules, '@tiptap/extension-task-item'),
        '@tiptap/extension-task-list': path.resolve(clientNodeModules, '@tiptap/extension-task-list'),
      },
    },
    server: {
      ...baseServerConfig,
      fs: {
        allow: [projectRoot, sharedComponentsPath, sharedIconsPath, sharedEditorPath],
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
