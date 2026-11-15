import { test, expect } from "@playwright/test";
test("repeat sample/save entry preserves the saved case and loaded records", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "Run Northstar sample (synthetic)",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Save and follow up", exact: true })
    .click();
  await page.getByRole("button", { name: "LotZero Home", exact: true }).click();
  await expect(page.getByText("Records loaded:", { exact: false })).toHaveCount(
    1,
  );
  await expect(
    page.getByRole("button", {
      name: "Run Northstar sample (synthetic)",
      exact: true,
    }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Resume rehearsal", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Save and follow up", exact: true })
    .click();
  const state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("lotzero.local.v1")!),
  );
  expect(state.snapshots).toHaveLength(1);
  expect(state.audit).toHaveLength(2);
});
test("storage failure offers a read refresh that does not reset or repeat writes", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key) {
      if (
        key === "lotzero.local.v1" &&
        !document.body?.dataset.storageRecovered
      )
        throw new Error("Browser storage unavailable");
      return original.call(this, key);
    };
  });
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText(
    "Refresh does not repeat a Jira write",
  );
  await page.evaluate(() => {
    document.body.dataset.storageRecovered = "true";
  });
  await page
    .getByRole("button", { name: "Refresh saved state", exact: true })
    .click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(
    await page.evaluate(() => localStorage.getItem("lotzero.local.v1")),
  ).toBeNull();
});

test('reopened saved rehearsal restores the full prioritised queue without saving again',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Run Northstar sample (synthetic)',exact:true}).click();await page.getByRole('button',{name:'Save and follow up',exact:true}).click();
  await page.reload();await page.getByRole('button',{name:'Open',exact:true}).click();
  await page.getByRole('navigation',{name:'Rehearsal navigation'}).getByRole('button',{name:'Follow-up',exact:true}).click();
  await expect(page.locator('.action-group').first()).toContainText('SHIP-002');
  await expect(page.getByRole('checkbox',{checked:true})).toHaveCount(0);
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('lotzero.local.v1')!));expect(state.snapshots).toHaveLength(1);expect(state.audit).toHaveLength(2);
});
