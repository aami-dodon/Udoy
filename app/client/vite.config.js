import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.CLIENT_PORT) || 6004,
    host: '0.0.0.0',
  },
  preview: {
    port: Number(process.env.CLIENT_PORT) || 6004,
    host: '0.0.0.0',
  },
});
