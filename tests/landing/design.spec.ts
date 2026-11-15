import {expect, test} from '@playwright/test';

test('guided sample reveals uncertainty and only hypothetical prevention', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name: 'Next: inspect the gap'}).click();
  await expect(page.locator('#mode-detail')).toContainText('FAIL / Recorded destination');
  await page.getByRole('button', {name: 'Next: rehearse a hold'}).click();
  await page.getByRole('button', {name: 'Apply the hypothetical hold'}).click();
  await expect(page.getByLabel('Simulate quarantine', {exact: true})).toBeChecked();
  await expect(page.locator('#sample-outcome')).toContainText('SHIP-001 remains in historical impact');
  await expect(page.locator('#record-status')).toHaveText('Missing destination');
  await page.getByRole('button', {name: 'Replay trace'}).click();
  await expect(page.locator('#trace-canvas')).toHaveClass(/tracing/);
  await expect(page.locator('#trace-canvas')).not.toHaveClass(/tracing/);
});

test('video dialog is keyboard-accessible and clears media on close', async ({page}) => {
  // Test the local dialog independently of the third-party player's availability.
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({contentType: 'text/html', body: '<p>Player boundary test</p>'}));
  await page.goto('/');
  const trigger = page.getByRole('link', {name: 'Watch the demo', exact: true});
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#video-frame iframe')).toHaveAttribute('src', /KNKdnH8N6kw/);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('#video-frame iframe')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('landing opens the built real browser workspace and persists a rehearsal', async ({page}) => {
  await page.goto('/');
  await page.getByRole('link', {name: 'Open interactive workspace', exact: true}).first().click();
  await expect(page).toHaveURL(/\/app\/$/);
  await expect(page.getByRole('heading', {name: 'Recall readiness', exact: true})).toBeVisible();
  await page.getByRole('button', {name: 'Run sample rehearsal', exact: true}).click();
  await expect(page.locator('.outcome-bar')).toContainText('9');
  await page.getByRole('navigation', {name: 'Rehearsal steps'}).getByRole('button', {name: '05 Report'}).click();
  await page.getByRole('button', {name: 'Save snapshot', exact: true}).click();
  await page.reload();
  await expect(page.getByRole('button', {name: 'Open', exact: true})).toHaveCount(1);
  await expect(page.getByRole('link', {name: 'Product website', exact: true})).toHaveAttribute('href', '../');
});
