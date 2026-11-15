import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile } from "node:fs/promises";
const evidence = process.env.LOTZERO_EVIDENCE_DIR ?? "../ui-evidence";
async function seed(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Recall readiness", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Load synthetic dataset", exact: true })
    .last()
    .click();
  await expect(
    page.getByText(
      "Synthetic records loaded. No real customer or supplier data is used.",
    ),
  ).toBeVisible();
}
async function drill(page: import("@playwright/test").Page) {
  await seed(page);
  await page
    .getByRole("button", { name: "New drill", exact: true })
    .last()
    .click();
  await page.getByRole("button", { name: "Run recall rehearsal" }).click();
  await expect(
    page.getByRole("heading", { name: "Impact explorer", exact: true }),
  ).toBeVisible();
}
test("complete local rehearsal, evidence, intervention, preview, export and reload", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await mkdir(evidence, { recursive: true });
  await seed(page);
  await expect(page).toHaveTitle("LotZero — Recall rehearsal");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `${evidence}/readiness-desktop.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "New drill", exact: true })
    .last()
    .click();
  await page.getByRole("button", { name: "Run recall rehearsal" }).click();
  await expect(
    page.getByRole("heading", { name: "Impact explorer", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Record table" }).click();
  await page.locator("table").getByRole("button").first().click();
  await expect(
    page.getByRole("complementary", { name: "Selected record evidence" }),
  ).toContainText("Supporting path");
  await page.getByRole("button", { name: "Flow map" }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `${evidence}/impact-desktop.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Inspect evidence gaps" }).click();
  await expect(
    page.getByRole("heading", { name: "Evidence gaps", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".badge.fail").first()).toBeVisible();
  await expect(page.locator(".badge.unknown").first()).toBeVisible();
  await page.getByRole("button", { name: "Rehearse a response" }).click();
  await page
    .getByRole("combobox", { name: /^Supporting evidence/ })
    .selectOption({ index: 1 });
  await page
    .getByRole("button", { name: "Add simulated intervention" })
    .click();
  await expect(
    page.getByRole("heading", { name: "1 proposed intervention" }),
  ).toBeVisible();
  await expect(page.locator(".simulated-column")).toContainText("SHIP-002");
  await expect(page.locator(".history-preserved")).toContainText("SHIP-001");
  await expect(page.locator(".simulated-column")).not.toContainText("SHIP-001");
  await expect(
    page.getByText(/historical shipment remains in the impact report/),
  ).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `${evidence}/simulator-desktop.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Save & review Jira actions" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Jira action review", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Create \d+ Jira issues/ }),
  ).toBeDisabled();
  await expect(
    page.getByText("Preview available; Jira writes disabled."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open drill report" }).click();
  await expect(
    page.getByRole("heading", { name: "Drill report", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", {name: "Ask about this rehearsal"})).toBeVisible();
  await expect(page.getByText(/Rovo is unavailable in browser rehearsal/)).toBeVisible();
  await expect(page.getByRole("button", {name: "Ask Recall rehearsal analyst", exact: true})).toHaveCount(0);
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "JSON", exact: true }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toMatch(/^lotzero-LOCAL-.*\.json$/);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `${evidence}/report-desktop.png`,
    fullPage: true,
  });
  for (const format of ["Markdown", "CSV"]) {
    const pending = page.waitForEvent("download");
    await page.getByRole("button", { name: format, exact: true }).click();
    expect((await pending).suggestedFilename()).toContain("lotzero-LOCAL-");
  }
  await page.getByText("View or copy export", { exact: true }).click();
  const reportText = page.getByRole("textbox", { name: "Report export contents" });
  const exported = JSON.parse(await reportText.inputValue());
  expect(exported.result.affectedShipmentIds).toContain("SHIP-001");
  expect(exported.result.simulation.preventableShipmentIds).toEqual(["SHIP-002"]);
  await page.getByRole("combobox", { name: "Export format" }).selectOption("md");
  await expect(reportText).toHaveValue(/ING-A19/);
  await page.getByRole("combobox", { name: "Export format" }).selectOption("csv");
  await expect(reportText).toHaveValue(/SHIP-002/);
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "Copy export", exact: true }).click();
  await expect(page.getByText("Report copied to clipboard.", { exact: true })).toBeVisible();
  // Native clipboard CSV retains CRLF; HTML textareas normalize line endings to LF.
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText.replace(/\r\n/g, "\n")).toEqual(await reportText.inputValue());
  const a11y = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(a11y.violations).toEqual([]);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Open", exact: true }),
  ).toHaveCount(1);
  expect(errors).toEqual([]);
});
test("mobile keyboard flow and reduced motion remain usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await drill(page);
  await page.getByRole("button", { name: "Record table" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("table").first()).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `${evidence}/impact-mobile.png`,
    fullPage: true,
  });
  const width = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.client);
  const a11y = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(a11y.violations).toEqual([]);
  const transition = await page
    .getByRole("button", { name: "Record table" })
    .evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(transition).toBe("0s");
});
test("malformed import rejects without overwriting the dataset; reset is confirmed", async ({
  page,
}) => {
  await seed(page);
  await page
    .getByLabel("Import traceability dataset")
    .setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"version":"bad"}'),
    });
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByText("Activity & data controls").click();
  await page
    .getByRole("button", { name: "Delete LotZero workspace data" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Delete data", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("Type DELETE to confirm").fill("DELETE");
  await page.getByRole("button", { name: "Delete data", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "No dataset loaded", exact: true }),
  ).toBeVisible();
});

test("corrected dataset rerun compares compatible saved scenarios", async ({
  page,
}) => {
  await drill(page);
  await page.getByRole("button", { name: "Drill report", exact: true }).click();
  await page
    .getByRole("button", { name: "Save snapshot", exact: true })
    .click();
  await expect(
    page.getByText("Snapshot saved with full source dataset"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Recall readiness", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Load corrected fixture", exact: true })
    .click();
  await expect(
    page.getByText(
      "Corrected synthetic dataset loaded. Rerun ING-A19 and compare your saved reports.",
    ),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "New drill", exact: true })
    .last()
    .click();
  await page.getByRole("button", { name: "Run recall rehearsal" }).click();
  await page.getByRole("button", { name: "Drill report", exact: true }).click();
  await page
    .getByRole("button", { name: "Save snapshot", exact: true })
    .click();
  await page.getByLabel("Baseline snapshot").selectOption({ index: 1 });
  await expect(page.locator(".comparison-summary")).toContainText(
    "ingredient-origin",
  );
  await expect(page.locator(".comparison-summary")).toContainText(
    "shipment-destination",
  );
  await expect(page.locator(".comparison-summary")).toContainText(
    "warehouse-owner",
  );
  await expect(page.locator(".comparison-summary")).toContainText(
    "shipment-lot",
  );
  await expect(page.locator(".report-assertions .badge.pass")).toHaveCount(4);
  const pendingComparison = page.waitForEvent("download");
  await page.getByRole("button", { name: "JSON", exact: true }).click();
  const comparisonFile = await pendingComparison;
  const exported = JSON.parse(await readFile((await comparisonFile.path())!, "utf8"));
  expect(exported.comparison.baselineSnapshot.dataset.version).toBe("synthetic-v1");
  expect(exported.comparison.result.improved).toHaveLength(4);
  const pendingMarkdown = page.waitForEvent("download");
  await page.getByRole("button", { name: "Markdown", exact: true }).click();
  const markdownFile = await pendingMarkdown;
  expect(await readFile((await markdownFile.path())!, "utf8")).toContain("## Before and after");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `${evidence}/comparison-desktop.png`,
    fullPage: true,
  });
});
test("concurrent browser dataset changes reject stale snapshot saves", async ({
  page,
}) => {
  await drill(page);
  await page.evaluate(() => {
    const key = "lotzero.local.v1";
    const state = JSON.parse(localStorage.getItem(key)!);
    state.dataset.name = "Concurrent edited dataset";
    localStorage.setItem(key, JSON.stringify(state));
  });
  await page.getByRole("button", { name: "Drill report", exact: true }).click();
  await page
    .getByRole("button", { name: "Save snapshot", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("dataset changed");
  await expect(
    page.getByRole("button", { name: "JSON", exact: true }),
  ).toBeDisabled();
});

test("all seven screens pass automated accessibility checks", async ({
  page,
}) => {
  test.setTimeout(120000);
  async function check(name: string) {
    const width = await page.evaluate(() => ({scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth}));
    expect.soft(width.scroll, `${name} page width`).toBeLessThanOrEqual(width.client);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect
      .soft(
        results.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
        name,
      )
      .toEqual([]);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `${evidence}/${name}-viewport.png`,
      fullPage: false,
    });
  }
  await seed(page);
  await check("readiness");
  await page
    .getByRole("button", { name: "New drill", exact: true })
    .last()
    .click();
  await check("new-drill");
  await page.getByRole("button", { name: "Run recall rehearsal" }).click();
  await check("impact");
  await page.getByRole("button", { name: "Inspect evidence gaps" }).click();
  await check("evidence-gaps");
  await page.getByRole("button", { name: "Rehearse a response" }).click();
  await check("simulator");
  await page
    .getByRole("button", { name: "Save & review Jira actions" })
    .click();
  await check("jira-preview");
  await page.getByRole("button", { name: "Open drill report" }).click();
  await check("report");
});
