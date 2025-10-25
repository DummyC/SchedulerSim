import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    allowedHosts: ['my-app.local', 'dev.example.com', '.trycloudflare.com'],
  },
});