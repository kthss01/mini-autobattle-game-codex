import { defineConfig } from 'vite';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
export default defineConfig({
  // Prefer repository subpath when available (e.g. GitHub Pages project site).
  base: repoName ? `/${repoName}/` : '/',
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});
