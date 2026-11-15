import {defineConfig} from '@playwright/test';
process.env.LOTZERO_EVIDENCE_DIR='evidence/first-gap-2026-11-15/browser';
export default defineConfig({
  workers:1,timeout:45000,testDir:'./tests/e2e',outputDir:'test-results/first-gap',
  use:{viewport:{width:1440,height:1000},headless:true,channel:'chromium',trace:'retain-on-failure',baseURL:'http://127.0.0.1:4352'},
  webServer:{command:'npm run dev -- --port 4352',url:'http://127.0.0.1:4352',reuseExistingServer:true},
  reporter:[['list'],['json',{outputFile:'evidence/first-gap-2026-11-15/browser-results.json'}]],
});
