import {expect, test} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('one-click rehearsal uses the engine, step navigation and searchable saved reports', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name: 'Run sample rehearsal', exact: true}).click();
  await expect(page.getByRole('heading', {name: 'Impact explorer', exact: true})).toBeVisible();
  await expect(page.getByLabel('Current rehearsal scope')).toContainText('ING-A19');
  await expect(page.locator('.outcome-bar')).toContainText('4');
  await page.getByRole('navigation', {name: 'Rehearsal steps'}).getByRole('button', {name: '03 Evidence'}).click();
  await expect(page.getByRole('heading', {name: 'Evidence gaps', exact: true})).toBeVisible();
  await expect(page.locator('.badge.fail').first()).toBeVisible();
  await page.getByRole('navigation', {name: 'Rehearsal steps'}).getByRole('button', {name: '05 Report'}).click();
  await page.getByRole('button', {name: 'Save snapshot', exact: true}).click();
  await page.getByRole('button', {name: 'Recall readiness', exact: true}).click();
  await page.getByRole('searchbox', {name: 'Search saved rehearsals'}).fill('no-such-lot');
  await expect(page.getByText('No rehearsals match “no-such-lot”.')).toBeVisible();
  await expect(page.getByRole('button', {name: 'Open', exact: true})).toHaveCount(0);
  await page.getByRole('button', {name: 'Clear search', exact: true}).click();
  await expect(page.getByRole('button', {name: 'Open', exact: true})).toHaveCount(1);
  await page.getByRole('searchbox', {name: 'Search saved rehearsals'}).fill('ing-a19');
  await expect(page.getByRole('button', {name: 'Open', exact: true})).toHaveCount(1);
  const a11y = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(a11y.violations).toEqual([]);
});

test('mobile navigation opens, closes with Escape and retains reduced-motion task flow', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  const menu = page.getByRole('button', {name: 'Open navigation', exact: true});
  await menu.click();
  await expect(page.getByRole('navigation', {name: 'Main navigation'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(page.getByRole('navigation', {name: 'Main navigation'})).toBeHidden();
  await page.getByRole('button', {name: 'Run sample rehearsal', exact: true}).click();
  await expect(page.getByRole('heading', {name: 'Impact explorer', exact: true})).toBeFocused();
  await expect(page.getByLabel('Current rehearsal scope')).toContainText('2026-10-28');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator('.journey-track').evaluate(element => getComputedStyle(element).animationName)).toBe('none');
  const a11y = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(a11y.violations).toEqual([]);
});
