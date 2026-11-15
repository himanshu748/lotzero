import {expect,test} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('sample and saved ledger use one case navigation and searchable rehearsals',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Run Northstar sample (synthetic)',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Rehearsal ING-A19'})).toBeVisible();
  await expect(page.getByRole('navigation',{name:'Rehearsal navigation'})).toHaveCount(1);
  await expect(page.locator('.journey-track, .quick-start, .sidebar, .run-summary')).toHaveCount(0);
  await page.getByRole('button',{name:'Save and follow up',exact:true}).click();
  await page.getByRole('button',{name:'LotZero Home',exact:true}).click();
  await page.getByRole('searchbox',{name:'Search saved rehearsals'}).fill('no-such-lot');
  await expect(page.getByText('No rehearsals match “no-such-lot”.')).toBeVisible();await expect(page.getByRole('button',{name:'Open',exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'Clear search',exact:true}).click();await expect(page.getByRole('button',{name:'Open',exact:true})).toHaveCount(1);
  const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(a11y.violations).toEqual([]);
});
test('mobile findings are expandable, keyboard operable and reduced-motion safe',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await page.getByRole('button',{name:'Run Northstar sample (synthetic)',exact:true}).click();await expect(page.locator('.finding-row.selected')).toBeFocused();
  await page.getByRole('button',{name:'Show all 5 findings'}).click();const unknown=page.locator('.finding-row').filter({hasText:'UNKNOWN'}).first();await unknown.focus();await page.keyboard.press('Enter');await expect(unknown).toHaveAttribute('aria-pressed','true');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(a11y.violations).toEqual([]);
});
