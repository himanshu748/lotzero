import {test, expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';

const evidence=process.env.LOTZERO_EVIDENCE_DIR??'evidence/judged-release-2026-11-15/browser';
mkdirSync(evidence,{recursive:true});

test('guided first run reaches an actual counterexample and preserves repeat sample/save state',async({page})=>{
  await page.goto('/');
  const start=Date.now();
  const tour=page.getByRole('navigation',{name:'Three-step quick start'});
  await tour.getByRole('button',{name:'Load Northstar sample recall (synthetic)',exact:true}).click();
  const summary=page.getByRole('region',{name:'Rehearsal summary'});
  await expect(summary).toContainText('SHIP-002');
  await expect(summary).toContainText('Timing not measured');
  expect(Date.now()-start).toBeLessThan(60000);
  await expect(page.getByRole('navigation',{name:'Rehearsal steps'}).locator('[aria-current="step"]')).toContainText('Trace');
  const firstFinding=summary.locator('.summary-finding');
  const box=await firstFinding.boundingBox();
  expect(box).not.toBeNull();expect(box!.y+box!.height).toBeLessThanOrEqual(1000);
  await page.screenshot({path:`${evidence}/guided-summary-desktop.png`,fullPage:false});
  const typography=await page.locator('.summary-heading h2').evaluate(el=>({family:getComputedStyle(el).fontFamily,size:getComputedStyle(el).fontSize,fontsReady:document.fonts.status}));
  expect(typography.fontsReady).toBe('loaded');
  await summary.getByRole('button',{name:'Save & review report',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Drill report',exact:true})).toBeVisible();
  await expect(page.getByText('Rovo is unavailable in browser rehearsal.',{exact:false})).toBeVisible();
  await page.getByRole('button',{name:'Recall readiness',exact:true}).click();
  await tour.getByRole('button',{name:'Continue current rehearsal',exact:true}).click();
  await expect(page.getByLabel('Current rehearsal scope')).toContainText('Saved rehearsal');
  await summary.getByRole('button',{name:'Save & review report',exact:true}).click();
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('lotzero.local.v1')!));
  expect(state.snapshots).toHaveLength(1);expect(state.audit).toHaveLength(2);
  await test.info().attach('local-first-finding-and-typography',{body:JSON.stringify({elapsedBoundary:'Browser sample interaction only; not installation or native Jira',typography}),contentType:'application/json'});
});

test('corrected or imported records disable sample replacement',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Load synthetic dataset',exact:true}).first().click();
  await page.getByRole('button',{name:'Load corrected fixture',exact:true}).click();
  await expect(page.getByRole('navigation',{name:'Three-step quick start'}).getByRole('button',{name:'Load Northstar sample recall (synthetic)',exact:true})).toBeDisabled();
  expect((await page.evaluate(()=>JSON.parse(localStorage.getItem('lotzero.local.v1')!))).dataset.version).toBe('synthetic-v2');
});

test('storage failure gives a read-only refresh action without resetting data',async({page})=>{
  await page.addInitScript(()=>{
    const original=Storage.prototype.getItem;
    Storage.prototype.getItem=function(key){if(key==='lotzero.local.v1'&&!document.body?.dataset.storageRecovered)throw new Error('Browser storage unavailable');return original.call(this,key);};
  });
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Refresh does not repeat a Jira write');
  await page.evaluate(()=>{document.body.dataset.storageRecovered='true';});
  await page.getByRole('button',{name:'Refresh saved state',exact:true}).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByText('Saved state refreshed.',{exact:false})).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('lotzero.local.v1'))).toBeNull();
});
