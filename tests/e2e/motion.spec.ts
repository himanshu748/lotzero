import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { syntheticDataset } from "../../fixtures/synthetic/dataset";

const evidence = process.env.LOTZERO_EVIDENCE_DIR ?? "../ui-evidence";

async function seed(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Load synthetic dataset", exact: true })
    .last()
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Synthetic records loaded",
  );
}

async function expectSettled(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .filter((animation) => animation.playState === "running").length,
      ),
    )
    .toBe(0);
}

for (const viewport of [
  { name: "desktop", width: 1440, height: 1000, duration: "0.18s" },
  { name: "mobile", width: 390, height: 844, duration: "0.144s" },
]) {
  test(`${viewport.name} motion is brief, single-run and preserves keyboard selection`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await seed(page);
    await page
      .getByRole("button", { name: "New drill", exact: true })
      .last()
      .click();
    await expect(page.locator("h1")).toBeFocused();
    await expect(page.locator(".screen-title")).toHaveCSS(
      "animation-duration",
      viewport.duration,
    );
    await expect(page.locator(".screen-title")).toHaveCSS(
      "animation-iteration-count",
      "1",
    );
    await page.getByRole("button", { name: "Run recall rehearsal" }).click();
    await expect(page.locator("h1")).toBeFocused();
    await page.getByRole("button", { name: "Record table" }).click();
    const record = page.locator("table").getByRole("button", {
      name: "SHIP-002",
      exact: true,
    });
    await record.focus();
    await page.keyboard.press("Enter");
    await expect(record).toBeFocused();
    await expect(record).toHaveAttribute("aria-pressed", "true");
    await expect(record).toHaveAttribute("aria-controls", "record-evidence");
    await expect(record).toHaveCSS("outline-style", "solid");
    const inspector = page.getByRole("complementary", {
      name: "Selected record evidence",
    });
    await expect(
      inspector.getByRole("heading", { name: "SHIP-002" }),
    ).toBeVisible();
    await expect(inspector.getByRole("status")).toHaveText(
      "Showing evidence for SHIP-002.",
    );
    await expect(inspector.locator(".inspector-heading")).toHaveCSS(
      "animation-duration",
      viewport.duration,
    );
    await expectSettled(page);
    // Same record selection does not remount or replay the evidence cue.
    await page.keyboard.press("Enter");
    expect(
      await inspector
        .locator(".inspector-heading")
        .evaluate((element) =>
          element
            .getAnimations()
            .every((animation) => animation.playState === "finished"),
        ),
    ).toBe(true);
    await expect(record).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    await mkdir(evidence, { recursive: true });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `${evidence}/motion-evidence-${viewport.name}.png`,
      fullPage: true,
    });
  });
}

test("reduced motion is instant while pending and completion remain explicit", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seed(page);
  // Hold real browser file reading so the pending state is observable; resume
  // the original File.text implementation to exercise validation and persistence.
  await page.evaluate(() => {
    const readText = File.prototype.text;
    File.prototype.text = function () {
      return new Promise<string>((resolve, reject) => {
        window.addEventListener(
          "lotzero-release-file",
          () => readText.call(this).then(resolve, reject),
          { once: true },
        );
      });
    };
  });
  await page.getByLabel("Import traceability dataset").setInputFiles({
    name: "synthetic.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(syntheticDataset)),
  });
  const status = page.getByRole("status");
  await expect(status).toContainText("Validating records…");
  await expect(status).toContainText("In progress");
  await expect(status).toHaveAttribute("aria-live", "polite");
  await expect(status).toHaveAttribute("aria-atomic", "true");
  await expect(
    page.getByRole("button", { name: "New drill", exact: true }).last(),
  ).toBeDisabled();
  await expect(page.locator(".operation-pending")).toHaveCSS(
    "animation-name",
    "none",
  );
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await mkdir(evidence, { recursive: true });
  await status.scrollIntoViewIfNeeded();
  await expect(status).toBeInViewport();
  await page.screenshot({
    path: `${evidence}/motion-pending-reduced-mobile.png`,
  });
  await page.evaluate(() =>
    window.dispatchEvent(new Event("lotzero-release-file")),
  );
  await expect(status).toContainText("imported. Run a new drill");
  await expect(page.locator(".operation-pending")).toHaveCount(0);
  await page
    .getByRole("button", { name: "New drill", exact: true })
    .last()
    .click();
  await expect(page.locator("h1")).toBeFocused();
  await page.getByRole("button", { name: "Run recall rehearsal" }).click();
  await page.getByRole("button", { name: "Record table" }).click();
  const record = page
    .locator("table")
    .getByRole("button", { name: "SHIP-002", exact: true });
  await record.focus();
  await page.keyboard.press("Enter");
  await expect(record).toBeFocused();
  for (const target of [
    ".screen-title",
    ".inspector-heading",
    ".notice.success",
  ]) {
    await expect(page.locator(target)).toHaveCSS("animation-name", "none");
    await expect(page.locator(target)).toHaveCSS("transform", "none");
  }
  await expect(record).toHaveCSS("transition-duration", "0s");
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});
