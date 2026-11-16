import { test, expect } from "@playwright/test";
import { syntheticDataset } from "../../fixtures/synthetic/dataset";
for (const viewport of [
  { width: 1440, height: 1000, duration: "0.15s" },
  { width: 390, height: 844, duration: "0.12s" },
])
  test(`evidence feedback settles and preserves keyboard focus at ${viewport.width}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page
      .getByRole("button", {
        name: "Run Northstar sample (synthetic)",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Record table", exact: true })
      .click();
    const record = page
      .locator("table")
      .getByRole("button", { name: "SHIP-002", exact: true });
    await record.focus();
    await page.keyboard.press("Enter");
    await expect(record).toBeFocused();
    await expect(record).toHaveAttribute("aria-pressed", "true");
    await expect(record).toHaveAttribute("aria-controls", "record-evidence");
    await expect(record).toHaveCSS("outline-style", "solid");
    const inspector = page.getByRole("complementary", {
      name: "Selected record evidence",
    });
    await expect(inspector.getByRole("status")).toHaveText(
      "Showing evidence for SHIP-002.",
    );
    await expect(inspector.locator(".inspector-heading")).toHaveCSS(
      "animation-duration",
      viewport.duration,
    );
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.getAnimations().filter((a) => a.playState === "running")
              .length,
        ),
      )
      .toBe(0);
    await page.keyboard.press("Enter");
    expect(
      await inspector
        .locator(".inspector-heading")
        .evaluate((el) =>
          el.getAnimations().every((a) => a.playState === "finished"),
        ),
    ).toBe(true);
    await expect(record).toBeFocused();
  });
test("reduced-motion import has explicit pending and completion, then keyboard evidence", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => {
    const read = File.prototype.text;
    File.prototype.text = function () {
      return new Promise<string>((resolve, reject) =>
        window.addEventListener(
          "release-file",
          () => read.call(this).then(resolve, reject),
          { once: true },
        ),
      );
    };
  });
  await page
    .getByLabel("Import traceability dataset")
    .setInputFiles({
      name: "synthetic.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(syntheticDataset)),
    });
  await expect(page.getByRole("status")).toHaveText("Validating records");
  await expect(page.getByRole("status")).toHaveAttribute("aria-atomic", "true");
  await expect(
    page.getByRole("button", {
      name: "Run Northstar sample (synthetic)",
      exact: true,
    }),
  ).toBeDisabled();
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await page.evaluate(() => window.dispatchEvent(new Event("release-file")));
  await expect(page.getByRole("status")).toContainText("Records imported.");
  await page
    .getByRole("button", { name: "Start a new drill", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "New drill", exact: true }),
  ).toBeFocused();
  await page.getByLabel("Scenario effective time (UTC)").fill("2026-10-28T09:00");
  await page
    .getByRole("button", { name: "Run rehearsal", exact: true })
    .click();
  await page.getByRole("button", { name: "Record table", exact: true }).click();
  const record = page
    .locator("table")
    .getByRole("button", { name: "SHIP-002", exact: true });
  await record.focus();
  await page.keyboard.press("Enter");
  await expect(record).toBeFocused();
  await expect(page.locator(".inspector-heading")).toHaveCSS(
    "animation-name",
    "none",
  );
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});
