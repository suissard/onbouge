import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  return {
    root: 'public',
    base: command === 'serve' ? '/' : '/onbouge/public/',
    server: {
      proxy: {
        '/socket': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
