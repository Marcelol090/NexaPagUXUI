import {test,expect} from '@playwright/test';
const tabs=[['home','Visão geral'],['expenses','Categorias'],['ads','Anúncios'],['cards','Cartões'],['review','Revisar']];
test('V3.0 shared editorial masthead is consistent on all tabs and viewport sizes',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:844});await page.goto('/v2.html');const colors=[];
  for(const [tab,label] of tabs){
   await page.locator('#dock button[data-tab="'+tab+'"]').click();
   const masthead=page.locator('.nexa-masthead');
   await expect(masthead).toHaveCount(1);
   await expect(masthead.locator('h1')).toHaveText(label);
   await expect(page.locator('.phone')).toHaveAttribute('data-page-theme',tab);
   await expect(masthead.locator('.nexa-masthead__contour')).toHaveCount(1);
   colors.push(await masthead.evaluate(el=>getComputedStyle(el).backgroundColor));
   expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
  }
  expect(new Set(colors).size).toBe(5);
 }
 expect(errors).toEqual([]);
});
test('V3.0 title actions and neutral sticky chrome work',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/v2.html');
 await page.locator('#dock button[data-tab="expenses"]').click();
 await page.locator('.nexa-masthead__action[data-action="category"]').click();
 await expect(page.locator('[data-category-toggle="Alimentação"]')).toHaveAttribute('aria-expanded','true');
 await page.locator('#scroller').evaluate(el=>{el.scrollTop=260;el.dispatchEvent(new Event('scroll'))});
 await expect(page.locator('.phone')).toHaveClass(/scrolled-deep/);
 await page.locator('#dock button[data-tab="cards"]').click();
 await expect(page.locator('.phone')).not.toHaveClass(/scrolled-deep/);
 await expect(page.locator('.wallet-folder')).toHaveCount(4);
});