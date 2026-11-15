import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/landing',
  workers: 1,
  timeout: 45000,
  use: { baseURL: 'http://127.0.0.1:4180', viewport: { width: 1440, height: 1000 }, headless: true, channel: 'chromium' },
  webServer: { command: 'python3 -m http.server 4180 --bind 127.0.0.1 --directory ../lotzero-site', url: 'http://127.0.0.1:4180', reuseExistingServer: true },
  reporter: [['list'], ['json', { outputFile: '../lotzero-site/evidence/browser-results.json' }]],
});
