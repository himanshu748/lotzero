import {defineConfig} from '@playwright/test';
import base from './playwright.config';

// Keep this pass away from other chats using the normal development port.
export default defineConfig({
  ...base,
  outputDir: 'test-results/rovo-2026-10-30',
  use: {...base.use, baseURL: 'http://127.0.0.1:4317'},
  webServer: {
    command: 'npm run dev -- --port 4317',
    url: 'http://127.0.0.1:4317',
    reuseExistingServer: false,
    timeout: 30000,
  },
  reporter: [['list'], ['json', {outputFile: 'evidence/rovo-2026-10-30/browser-results.json'}]],
});
