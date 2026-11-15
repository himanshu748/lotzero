import { defineConfig } from '@playwright/test';

process.env.LOTZERO_EVIDENCE_DIR = '../ui-evidence/design-2026-11-04';

export default defineConfig({
  workers: 1,
  timeout: 45000,
  outputDir: 'test-results/design-2026-11-04',
  use: {viewport: {width: 1440, height: 1000}, headless: true, channel: 'chromium', trace: 'off'},
  webServer: [
    {command: 'npm run dev -- --port 4321', url: 'http://127.0.0.1:4321', reuseExistingServer: true},
    {command: 'python3 -m http.server 4322 --bind 127.0.0.1 --directory ../lotzero-site', url: 'http://127.0.0.1:4322', reuseExistingServer: true},
  ],
  projects: [
    {name: 'workspace', testDir: './tests/e2e', use: {baseURL: 'http://127.0.0.1:4321'}},
    {name: 'landing', testDir: './tests/landing', use: {baseURL: 'http://127.0.0.1:4322'}},
  ],
  reporter: [['list'], ['json', {outputFile: 'evidence/design-2026-11-04/browser-results.json'}]],
});
