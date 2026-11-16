import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { syntheticDataset } from "../../fixtures/synthetic/dataset";

const evidence = path.resolve(process.env.LOTZERO_EVIDENCE_DIR ?? "evidence/first-gap-2026-11-15/browser");

test("search jumps to a reachable record and a focused path stays anchored while inspecting steps", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Run Northstar sample (synthetic)", exact: true })
    .click();
  const search = page.getByRole("searchbox", {
    name: "Find a reachable record",
  });
  await search.fill("ship-002");
  await expect(
    page.getByRole("button", { name: "Go to SHIP-002", exact: true }),
  ).toBeVisible();
  await search.press("Enter");
  await expect(search).toBeFocused();
  const inspector = page.getByRole("complementary", {
    name: "Selected record evidence",
  });
  await expect(
    inspector.getByRole("heading", { name: "SHIP-002", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Selected path", exact: true })
    .click();
  const focusedPath = page.getByRole("region", {
    name: "Selected supporting path",
  });
  await expect(focusedPath.getByRole("heading")).toHaveText(
    "From source to SHIP-002",
  );
  await expect(focusedPath.getByRole("button")).toHaveCount(4);
  await expect(
    focusedPath.getByRole("button", { name: "Inspect SHIP-002", exact: true }),
  ).toHaveAccessibleDescription("Scheduled · destination missing Association: confirmed");
  await focusedPath
    .getByRole("button", { name: "Inspect BATCH-101", exact: true })
    .click();
  await expect(
    inspector.getByRole("heading", { name: "BATCH-101", exact: true }),
  ).toBeVisible();
  await expect(focusedPath.getByRole("heading")).toHaveText(
    "From source to SHIP-002",
  );
  await expect(focusedPath.getByRole("button")).toHaveCount(4);
  // ING-C01 exists in the fixture but is outside this source's downstream trace.
  await search.fill("ING-C01");
  await expect(
    page.getByText("No reachable records match “ING-C01”."),
  ).toBeVisible();
  await search.press("Escape");
  await expect(search).toHaveValue("");
  await expect(
    inspector.getByRole("heading", { name: "BATCH-101", exact: true }),
  ).toBeVisible();
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await mkdir(evidence, { recursive: true });
  await page.screenshot({
    path: path.join(evidence, "selected-path-desktop.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Flow map", exact: true }).click();
  await expect(
    page
      .getByRole("region", { name: "Interactive material-flow graph" })
      .getByRole("button"),
  ).toHaveCount(15);
});

test("fit map responds to viewport changes and mobile path inspection respects reduced motion", async ({
  page,
}) => {
  const appErrors: string[] = [];
  page.on("pageerror", (error) => appErrors.push(error.message));
  await page.goto("/");
  await page
    .getByRole("button", { name: "Run Northstar sample (synthetic)", exact: true })
    .click();
  await page.getByRole("button", { name: "Flow map", exact: true }).click();
  await page.getByRole("button", { name: "Fit map", exact: true }).click();
  const fits = () =>
    page.locator(".graph-scroll").evaluate((el) => {
      const canvas = el.querySelector(".scaled-map")!;
      return canvas.getBoundingClientRect().width <= el.clientWidth + 1;
    });
  await expect.poll(fits).toBe(true);
  await page.getByRole("button", { name: "Actual size", exact: true }).click();
  await expect(page.getByLabel("Current map scale")).toHaveText("100%");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Fit map", exact: true }).click();
  await expect.poll(fits).toBe(true);
  const search = page.getByRole("searchbox", {
    name: "Find a reachable record",
  });
  await search.fill("SHIP-002");
  await search.press("Enter");
  await page
    .getByRole("button", { name: "Selected path", exact: true })
    .click();
  const focusedPath = page.getByRole("region", {
    name: "Selected supporting path",
  });
  const evidenceJump = page.getByRole("button", {
    name: "View SHIP-002 evidence", exact: true,
  });
  await page.keyboard.press("Tab");
  await expect(evidenceJump).toBeFocused();
  // The shortcut and all four path steps remain in the mobile keyboard order.
  for (let step = 0; step < 4; step++) await page.keyboard.press("Tab");
  await expect(
    focusedPath.getByRole("button", { name: "Inspect SHIP-002", exact: true }),
  ).toBeFocused();
  await expect(
    focusedPath.getByRole("button", { name: "Inspect SHIP-002", exact: true }),
  ).toHaveAccessibleDescription("Scheduled · destination missing Association: confirmed");
  await page.keyboard.press("Enter");
  await expect(
    page
      .getByRole("complementary", { name: "Selected record evidence" })
      .getByRole("heading", { name: "SHIP-002", exact: true }),
  ).toBeVisible();
  for (let step = 0; step < 4; step++) await page.keyboard.press("Shift+Tab");
  await expect(evidenceJump).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page
      .getByRole("complementary", { name: "Selected record evidence" })
      .getByRole("heading", { name: "SHIP-002", exact: true }),
  ).toBeFocused();
  expect(
    await focusedPath
      .locator("li")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  expect(appErrors).toEqual([]);
  await mkdir(evidence, { recursive: true });
  await page.screenshot({
    path: path.join(evidence, "selected-path-mobile.png"),
    fullPage: true,
  });
});

test("the map excludes rejected links, deduplicates accepted links and highlights only the selected relationship IDs", async ({ page }) => {
  const dataset = structuredClone(syntheticDataset);
  const dispatch = dataset.edges.find((edge) => edge.id === "DISPATCH-002")!;
  dataset.edges.push(
    { ...dispatch },
    { ...dispatch, id: "Z-PARALLEL-DISPATCH", certainty: "potential" },
    { ...dispatch, id: "INVALID-WAREHOUSE-SHIPMENT", from: "WH-NORTH" },
    { ...dispatch, id: "CONFLICTING-DISPATCH" },
    { ...dispatch, id: "CONFLICTING-DISPATCH", to: "SHIP-001" },
  );
  await page.goto("/");
  await page.getByLabel("Import traceability dataset").setInputFiles({
    name: "graph-boundaries.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(dataset)),
  });
  await page.getByRole("button", { name: "Start a new drill", exact: true }).click();
  await page.getByLabel("Scenario effective time (UTC)").fill("2026-10-28T09:00");
  await page.getByRole("button", { name: "Run rehearsal", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Inspect SHIP-002", exact: true }),
  ).toHaveAccessibleDescription("Scheduled · destination missing Association: unknown");
  await page.getByRole("button", { name: "Flow map", exact: true }).click();
  const graph = page.getByRole("region", { name: "Interactive material-flow graph" });
  await expect(graph.locator('[data-edge-id="INVALID-WAREHOUSE-SHIPMENT"]')).toHaveCount(0);
  await expect(graph.locator('[data-edge-id="CONFLICTING-DISPATCH"]')).toHaveCount(0);
  await expect(graph.locator('[data-edge-id="DISPATCH-002"]')).toHaveCount(1);
  await expect(graph.locator('[data-edge-id="Z-PARALLEL-DISPATCH"]')).toHaveCount(1);
  await expect(graph.locator('[data-edge-id="Z-PARALLEL-DISPATCH"]')).toHaveAttribute("stroke-width", "1.5");
  expect(await graph.locator('[data-edge-id][stroke-width="3"]').evaluateAll(
    (edges) => edges.map((edge) => edge.getAttribute("data-edge-id")).sort(),
  )).toEqual(["DISPATCH-002", "MAKE-101", "USE-A19-101"]);
});

test("a finding with no affected records keeps origins disabled until a real record is selected", async ({ page }) => {
  const appErrors: string[] = [];
  page.on("pageerror", (error) => appErrors.push(error.message));
  await page.goto("/");
  await page.getByLabel("Import traceability dataset").setInputFiles({
    name: "northstar.json", mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(syntheticDataset)),
  });
  await page.getByRole("button", { name: "Start a new drill", exact: true }).click();
  await page.getByLabel("Scenario effective time (UTC)").fill("2026-10-28T09:00");
  await page.getByLabel("Initiating lot").selectOption("ING-F01");
  for (const checkbox of await page.getByRole("checkbox").all()) await checkbox.uncheck();
  await page.getByRole("checkbox", { name: "Every affected shipment has a recorded destination", exact: true }).check();
  await page.getByRole("button", { name: "Run rehearsal", exact: true }).click();
  await expect(page.locator(".finding-row.selected")).toContainText("UNKNOWN");
  await expect(page.getByRole("heading", { name: "No supporting path selected", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Selected path", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Flow map", exact: true }).click();
  const trace = page.getByRole("combobox", { name: "Trace", exact: true });
  await expect(trace.getByRole("option", { name: "Origins of selected record" })).toHaveJSProperty("disabled", true);
  await trace.press("End");
  await trace.press("Enter");
  await expect(trace).toHaveValue("forward");
  const graph = page.getByRole("region", { name: "Interactive material-flow graph" });
  await expect(graph.getByRole("button")).toHaveCount(1);
  await graph.getByRole("button", { name: /ING-F01/ }).click();
  await expect(trace.getByRole("option", { name: "Origins of selected record" })).toHaveJSProperty("disabled", false);
  await trace.selectOption("backward");
  await expect(graph.getByRole("button")).toHaveCount(2);
  await expect(graph.getByRole("button", { name: /SUP-02/ })).toBeVisible();
  expect(appErrors).toEqual([]);
});

test("selected path buttons expose potential association certainty to assistive technology", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Run Northstar sample (synthetic)", exact: true }).click();
  const search = page.getByRole("searchbox", { name: "Find a reachable record" });
  await search.fill("SHIP-004");
  await search.press("Enter");
  await expect(
    page.getByRole("button", { name: "Inspect SHIP-004", exact: true }),
  ).toHaveAccessibleDescription("Scheduled · ambiguous cracker lot Association: potential");
});
