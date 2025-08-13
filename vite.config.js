import { defineConfig } from 'vite';

export default defineConfig({
  root: 'public',
  server: {
    proxy: {
      '/socket': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
