import { defineConfig } from 'vite';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isCi = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  // GitHub Pages serves project pages from /<repo>/.
  base: isCi && repoName ? `/${repoName}/` : '/',
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});
