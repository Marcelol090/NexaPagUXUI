import { test, expect } from '@playwright/test';
const tabs=['home','expenses','ads','cards','review'];

test('V3.1 retains the V2.8 structure; background adapts per tab', async ({page}) => {
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:844});await page.goto('/v2.html');
  for(const tab of tabs){
   await page.locator('#dock button[data-tab="'+tab+'"]').click();
   await expect(page.locator('.phone')).toHaveAttribute('data-page-theme',tab);
   await expect(page.locator('.nexa-masthead')).toHaveCount(0);
   await expect(page.locator('#dock button')).toHaveCount(5);
   if(tab==='home'){
    await expect(page.locator('.compact-hero')).toHaveCount(1);
    await expect(page.locator('.week')).toHaveCount(1);
   }else await expect(page.locator('.page-header h1')).toHaveCount(1);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
  }
 }
 expect(errors).toEqual([]);
});

test('V3.1 light/dark is a reversible persisted theme and works in all tabs', async ({page}) => {
 await page.setViewportSize({width:390,height:844});await page.goto('/v2.html');
 await page.locator('#themeToggle').click();
 await expect(page.locator('.phone')).toHaveAttribute('data-ui-theme','dark');
 await expect(page.locator('#themeToggle')).toHaveAttribute('aria-pressed','true');
 for(const tab of tabs){
   await page.locator('#dock button[data-tab="'+tab+'"]').click();
   await expect(page.locator('.phone')).toHaveAttribute('data-ui-theme','dark');
 }
 await page.reload();
 await expect(page.locator('.phone')).toHaveAttribute('data-ui-theme','dark');
 await page.locator('#themeToggle').click();
 await expect(page.locator('.phone')).toHaveAttribute('data-ui-theme','light');
});

test('V3.1 expense action and cards remain functional in dark mode', async ({page})=>{
 await page.setViewportSize({width:320,height:740});await page.goto('/v2.html');
 await page.locator('#dock button[data-tab="expenses"]').click();
 await page.locator('.page-header-action[data-action="category"]').click();
 await expect(page.locator('[data-category-toggle="Alimentação"]')).toHaveAttribute('aria-expanded','true');
 await page.locator('#themeToggle').click();
 await expect(page.locator('.phone')).toHaveAttribute('data-ui-theme','dark');
 await page.locator('#dock button[data-tab="cards"]').click();
 await expect(page.locator('.wallet-folder')).toHaveCount(4);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
});