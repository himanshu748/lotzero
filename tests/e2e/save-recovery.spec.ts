import {expect, test} from '@playwright/test';

test('a lost save response retries the same rehearsal without another saved report', async ({page}) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    let interrupted = false;
    Storage.prototype.setItem = function(key, value) {
      original.call(this, key, value);
      if (!interrupted && key === 'lotzero.local.v1' && JSON.parse(value).snapshots.length === 1) {
        interrupted = true;
        throw new Error('Simulated save response lost after persistence');
      }
    };
  });
  await page.goto('/');
  await page.getByRole('button', {name: 'Run Northstar sample (synthetic)', exact: true}).click();
  await page.getByRole('button', {name: 'Save and follow up', exact: true}).click();
  await expect(page.getByRole('alert')).toContainText('Simulated save response lost');
  const persistedId = await page.evaluate(() => JSON.parse(localStorage.getItem('lotzero.local.v1')!).snapshots[0].id as string);
  await page.getByRole('button', {name: 'Save and follow up', exact: true}).click();
  await expect(page.getByRole('heading', {name: 'Follow-up', exact: true})).toBeVisible();
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('lotzero.local.v1')!));
  expect(state.snapshots.map((snapshot: {id: string}) => snapshot.id)).toEqual([persistedId]);
  expect(state.audit.filter((event: {event: string}) => event.event.startsWith('Saved drill'))).toHaveLength(1);
});
