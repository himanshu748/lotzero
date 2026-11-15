import { defineConfig } from "@playwright/test";
process.env.LOTZERO_EVIDENCE_DIR = "../ui-evidence/trace-2026-11-04";
export default defineConfig({
  workers: 1,
  timeout: 45000,
  outputDir: "../ui-evidence/trace-2026-11-04/test-results",
  use: {
    viewport: { width: 1440, height: 1000 },
    headless: true,
    channel: "chromium",
    trace: "off",
    baseURL: "http://127.0.0.1:4321",
  },
  testDir: "./tests/e2e",
  webServer: {
    command: "npm run dev -- --port 4321",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: true,
  },
  reporter: [
    ["list"],
    [
      "json",
      { outputFile: "../ui-evidence/trace-2026-11-04/browser-results.json" },
    ],
  ],
});
