import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile, mkdir } from "node:fs/promises";
const evidence =
  process.env.LOTZERO_EVIDENCE_DIR ?? "evidence/first-gap-2026-11-15/browser";
async function sample(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "Run Northstar sample (synthetic)",
      exact: true,
    })
    .click();
}
async function home(page: Page) {
  await page.getByRole("button", { name: "LotZero Home", exact: true }).click();
}
async function exports(page: Page) {
  await page.getByText("Exports and saved inputs", { exact: true }).click();
}
test("complete rehearsal, explicit warehouse control, prioritised follow-up and exports", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await mkdir(evidence, { recursive: true });
  await sample(page);
  await page
    .getByRole("button", { name: "Rehearse a hold", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Target record", exact: true }),
  ).toHaveValue("WH-NORTH");
  await expect(
    page.getByRole("heading", {
      name: "0 proposed interventions",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Add simulated intervention", exact: false })
    .click();
  await expect(
    page.getByRole("heading", { name: "1 proposed intervention", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".simulated-column")).toContainText("SHIP-002");
  await expect(page.locator(".simulated-column")).not.toContainText("SHIP-001");
  await expect(page.locator(".history-preserved")).toContainText("SHIP-001");
  await page.screenshot({
    path: `${evidence}/rehearse-desktop.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Save and follow up", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Follow-up", exact: true }),
  ).toBeVisible();
  const groups = page.locator(".action-group");
  await expect(groups.first()).toContainText("SHIP-002");
  await expect(groups.first()).toContainText("FAIL");
  await expect(page.getByRole("checkbox", { checked: true })).toHaveCount(0);
  await groups.first().getByRole("checkbox").check();
  await expect(
    page.getByRole("button", { name: "Create 1 Jira issues", exact: false }),
  ).toBeDisabled();
  await expect(
    page.getByRole("combobox", { name: "Jira project", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("heading", { name: "Ask the analyst", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", {name: "Explain the missing destination", exact: true})).toBeVisible();
  await expect(page.getByLabel("Saved evidence fallback")).toContainText(
    "SHIP-002",
  );
  await page
    .getByRole("button", {
      name: "Which origins need more evidence?",
      exact: true,
    })
    .click();
  await expect(page.getByLabel("Saved evidence fallback")).toContainText(
    "FG-102",
  );
  await expect(page.getByLabel("Saved evidence fallback")).toContainText(
    "UNKNOWN",
  );
  await page
    .getByRole("button", {
      name: "What did the WH-NORTH hold change?",
      exact: true,
    })
    .click();
  await expect(page.getByLabel("Saved evidence fallback")).toContainText(
    "SHIP-001",
  );
  await expect(page.getByLabel("Saved evidence fallback")).toContainText(
    "EV-DRILL",
  );
  await expect(
    page.getByText("Rovo is unavailable in browser preview.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open question in Rovo" }),
  ).toHaveCount(0);
  await page.screenshot({
    path: `${evidence}/follow-up-desktop.png`,
    fullPage: true,
  });
  await exports(page);
  for (const format of ["JSON", "Markdown", "CSV"]) {
    const pending = page.waitForEvent("download");
    await page.getByRole("button", { name: format, exact: true }).click();
    const file = await pending;
    expect(file.suggestedFilename()).toMatch(/^lotzero-LOCAL-/);
    if (format === "JSON") {
      const report = JSON.parse(await readFile((await file.path())!, "utf8"));
      expect(report.result.simulation.preventableShipmentIds).toEqual([
        "SHIP-002",
      ]);
      expect(report.result.affectedShipmentIds).toContain("SHIP-001");
    }
  }
  await page.getByText("View or copy export", { exact: true }).click();
  await page
    .getByRole("combobox", { name: "Export format", exact: true })
    .selectOption("csv");
  const contents = page.getByRole("textbox", {
    name: "Report export contents",
  });
  await expect(contents).toHaveValue(/SHIP-002/);
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "Copy export", exact: true }).click();
  await expect(
    page.getByText("Report copied to clipboard.", { exact: true }),
  ).toBeVisible();
  expect(
    (await page.evaluate(() => navigator.clipboard.readText())).replace(
      /\r\n/g,
      "\n",
    ),
  ).toBe(await contents.inputValue());
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
test("malformed import preserves records; destructive dialog traps focus and supports Escape", async ({
  page,
}) => {
  await sample(page);
  await home(page);
  await page
    .getByLabel("Import traceability dataset")
    .setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"version":"bad"}'),
    });
  await expect(page.getByRole("alert")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("lotzero.local.v1")!).dataset.version,
    ),
  ).toBe("synthetic-v1");
  await page
    .getByText("Records and workspace controls", { exact: true })
    .click();
  const trigger = page.getByRole("button", {
    name: "Delete LotZero workspace data",
  });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(
    page.getByRole("button", { name: "Delete data", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Cancel", exact: true }).focus();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByLabel("Type DELETE to confirm")).toBeFocused();
  await page.getByLabel("Type DELETE to confirm").fill("DELETE");
  await page.getByRole("button", { name: "Delete data", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: "Run Northstar sample (synthetic)",
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("lotzero.local.v1")),
  ).toBeNull();
});
test("corrected records preserve baseline and export an exact compatible comparison", async ({
  page,
}) => {
  await sample(page);
  await page
    .getByRole("button", { name: "Save and follow up", exact: true })
    .click();
  await home(page);
  await page
    .getByText("Records and workspace controls", { exact: true })
    .click();
  await page
    .getByRole("button", { name: "Load corrected sample", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Replace current work", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Run Northstar sample (synthetic)",
      exact: true,
    }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Start a new drill", exact: true })
    .click();
  await page.getByLabel("Scenario effective time (UTC)").fill("2026-10-28T09:00");
  await page
    .getByRole("button", { name: "Run rehearsal", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Save and follow up", exact: true })
    .click();
  await page
    .getByText("Compare with a previous rehearsal", { exact: true })
    .click();
  await page.getByLabel("Baseline snapshot").selectOption({ index: 1 });
  for (const id of [
    "ingredient-origin",
    "shipment-destination",
    "warehouse-owner",
    "shipment-lot",
  ])
    await expect(page.locator(".comparison-summary")).toContainText(id);
  await exports(page);
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "JSON", exact: true }).click();
  const file = await pending;
  const report = JSON.parse(await readFile((await file.path())!, "utf8"));
  expect(report.comparison.baselineSnapshot.dataset.version).toBe(
    "synthetic-v1",
  );
  expect(report.comparison.result.improved).toHaveLength(4);
  const md = page.waitForEvent("download");
  await page.getByRole("button", { name: "Markdown", exact: true }).click();
  expect(await readFile((await (await md).path())!, "utf8")).toContain(
    "## Before and after",
  );
});
test("follow-up reruns the saved sample on corrected records in one step", async ({
  page,
}) => {
  await sample(page);
  await page
    .getByRole("button", { name: "Save and follow up", exact: true })
    .click();
  await page
    .getByText("Compare with a previous rehearsal", { exact: true })
    .click();
  await page
    .getByRole("button", { name: "Rerun with corrected sample records", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Replace current work", exact: true })
    .click();
  await expect(page.getByText(/Corrected sample records loaded/)).toBeVisible();
  await page
    .getByRole("button", { name: "Save and follow up", exact: true })
    .click();
  await page
    .getByText("Compare with a previous rehearsal", { exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Rerun with corrected sample records", exact: true }),
  ).toHaveCount(0);
  await page.getByLabel("Baseline snapshot").selectOption({ index: 1 });
  await expect(page.locator(".comparison-summary")).toContainText("shipment-destination");
  await home(page);
  await expect(page.getByText("Records loaded:")).toContainText("synthetic-v2");
});
test("corrected rerun keeps the baseline's simulated controls", async ({
  page,
}) => {
  await sample(page);
  await page.getByRole("button", { name: "Rehearse", exact: true }).click();
  await page
    .getByRole("button", { name: "Add simulated intervention", exact: false })
    .click();
  await page
    .getByRole("button", { name: "Save and follow up", exact: true })
    .click();
  await page
    .getByText("Compare with a previous rehearsal", { exact: true })
    .click();
  await page
    .getByRole("button", { name: "Rerun with corrected sample records", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Replace current work", exact: true })
    .click();
  await expect(page.getByText(/with the same simulated controls/)).toBeVisible();
  await page
    .getByRole("button", { name: "Save and follow up", exact: true })
    .click();
  await page
    .getByText("Compare with a previous rehearsal", { exact: true })
    .click();
  await page.getByLabel("Baseline snapshot").selectOption({ index: 1 });
  const summary = page.locator(".comparison-summary");
  await expect(summary).toContainText("shipment-destination");
  await expect(summary).toContainText(/Regressed assertions\s*None/);
});
test("concurrent browser dataset edit rejects stale save and offers no report download", async ({
  page,
}) => {
  await sample(page);
  await page.evaluate(() => {
    const key = "lotzero.local.v1";
    const state = JSON.parse(localStorage.getItem(key)!);
    state.dataset.name = "Concurrent edit";
    localStorage.setItem(key, JSON.stringify(state));
  });
  await page
    .getByRole("button", { name: "Save and follow up", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("dataset changed");
  await expect(
    page.getByRole("heading", { name: "Follow-up", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "JSON", exact: true }),
  ).toHaveCount(0);
});
for (const screen of ["home", "rehearsal", "rehearse", "follow-up", "new-drill"]) test(`screen ${screen} passes axe and narrow viewport checks`, async ({
  page,
}) => {
  test.setTimeout(120000);
  async function check(name: string) {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${name} width ${width}`,
      ).toBe(true);
      await expect
        .poll(() =>
          page.evaluate(
            () =>
              document.getAnimations().filter((a) => a.playState === "running")
                .length,
          ),
        )
        .toBe(0);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(result.violations, `${name} axe ${width}`).toEqual([]);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `${evidence}/${name}-${width}.png` });
    }
  }
  await page.goto("/");
  if (screen !== "home") {
    await page.getByRole("button", {name:"Run Northstar sample (synthetic)",exact:true}).click();
    if (screen === "rehearse") {
      await page.getByRole("button", { name: "Rehearse a hold", exact: true }).click();
      await page.getByRole("button", { name: "Add simulated intervention" }).click();
      await expect(page.getByRole("heading", { name: "1 proposed intervention", exact: true })).toBeVisible();
    }
    if (screen === "follow-up") await page.getByRole("button",{name:"Save and follow up",exact:true}).click();
    if (screen === "new-drill") {
      await home(page);
      await page.getByRole("button",{name:"Start a new drill",exact:true}).click();
    }
  }
  await check(screen);
});
