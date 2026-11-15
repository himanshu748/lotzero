import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const evidence = path.resolve("../ui-evidence/trace-2026-11-04");

test("search jumps to a reachable record and a focused path stays anchored while inspecting steps", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Run sample rehearsal", exact: true })
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
    .getByRole("button", { name: "Run sample rehearsal", exact: true })
    .click();
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
  await focusedPath
    .getByRole("button", { name: "Inspect SHIP-002", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    page
      .getByRole("complementary", { name: "Selected record evidence" })
      .getByRole("heading", { name: "SHIP-002", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "View SHIP-002 evidence", exact: true })
    .click();
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
