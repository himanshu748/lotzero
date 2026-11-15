import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdirSync} from 'node:fs';
const evidence=process.env.LOTZERO_EVIDENCE_DIR??'evidence/first-gap-2026-11-15/browser';
mkdirSync(evidence,{recursive:true});
async function sample(page: import('@playwright/test').Page){await page.goto('/');await page.getByRole('button',{name:'Run Northstar sample (synthetic)',exact:true}).click();}
test('one activation opens destination FAIL, SHIP-002 inspector and the supporting path',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page).toHaveTitle(/LotZero/);await expect(page.getByRole('heading',{name:'No saved rehearsals yet'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Run Northstar sample (synthetic)',exact:true})).toHaveCount(1);
  await page.screenshot({path:`${evidence}/home-desktop.png`});
  await page.getByRole('button',{name:'Run Northstar sample (synthetic)',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Rehearsal ING-A19',exact:true})).toBeVisible();
  const selected=page.locator('.finding-row.selected');await expect(selected).toContainText('FAIL');await expect(selected).toContainText('SHIP-002');await expect(selected).toBeFocused();
  const path=page.getByRole('region',{name:'Selected supporting path'});await expect(path.getByRole('heading')).toHaveText('From source to SHIP-002');
  await expect(path.getByRole('button')).toHaveCount(4);
  await expect(page.getByRole('complementary',{name:'Selected record evidence'}).getByRole('heading',{name:'SHIP-002',exact:true})).toBeVisible();
  await expect(page.getByLabel('Rehearsal status')).toContainText('3 lots · 4 shipments · 0 PASS · 3 FAIL · 2 UNKNOWN');
  for(const locator of [selected,path,page.getByRole('complementary',{name:'Selected record evidence'}).getByRole('heading',{name:'SHIP-002',exact:true})]){
    const box=await locator.boundingBox();expect(box!.y+box!.height).toBeLessThan(1000);
  }
  const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(a11y.violations).toEqual([]);
  expect(errors).toEqual([]);await page.screenshot({path:`${evidence}/rehearsal-desktop.png`});
  await path.getByRole('button',{name:'Inspect BATCH-101',exact:true}).click();
  await expect(path.getByRole('heading')).toHaveText('From source to SHIP-002');
  await expect(page.getByRole('complementary',{name:'Selected record evidence'}).getByRole('heading',{name:'BATCH-101',exact:true})).toBeVisible();
  await page.getByRole('navigation',{name:'Rehearsal navigation'}).getByRole('button',{name:'Rehearse',exact:true}).click();
  await page.getByRole('navigation',{name:'Rehearsal navigation'}).getByRole('button',{name:'Trace',exact:true}).click();
  await expect(path.getByRole('heading')).toHaveText('From source to SHIP-002');
});
test('narrow first run exposes the first finding and readable path without hover',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await sample(page);
  const path=page.getByRole('region',{name:'Selected supporting path'});await expect(page.locator('.finding-row.selected')).toBeFocused();
  const ship=path.getByRole('button',{name:'Inspect SHIP-002',exact:true});const box=await ship.boundingBox();expect(box!.y+box!.height).toBeLessThan(844);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`${evidence}/rehearsal-mobile.png`});
  await page.getByRole('button',{name:'Show all 5 findings'}).click();
  await page.locator('.finding-row').filter({hasText:'UNKNOWN'}).first().focus();await page.keyboard.press('Enter');
  await expect(page.locator('.finding-row.selected')).toContainText('UNKNOWN');
  expect(await path.locator('li').first().evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
  const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(a11y.violations).toEqual([]);
});
