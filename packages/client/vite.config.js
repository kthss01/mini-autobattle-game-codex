import { defineConfig } from 'vite';

export default defineConfig({
  // Use relative asset URLs so GitHub Pages works for both user sites (/) and project sites (/repo/).
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});
