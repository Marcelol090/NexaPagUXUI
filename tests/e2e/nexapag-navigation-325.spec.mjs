import {test,expect} from '@playwright/test';
for(const width of [320,390,430]){
 test('V3.25 centered detail carousel, stable navigation and return '+width,async({page},info)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:844});await page.goto('/v2.html');
  for(const theme of ['light','dark']){
   const phone=page.locator('.phone');
   if(await phone.getAttribute('data-ui-theme')!==theme)await page.locator('#themeToggle').click();
   await page.locator('#dock [data-tab="cards"]').click();
   const dock=await page.locator('#dock').evaluate(el=>{
    const r=el.getBoundingClientRect(),buttons=[...el.querySelectorAll('button')];
    return {widths:buttons.map(b=>b.getBoundingClientRect().width),heights:buttons.map(b=>b.getBoundingClientRect().height),labels:buttons.map(b=>getComputedStyle(b.querySelector('span')).opacity),over:buttons.some(b=>b.getBoundingClientRect().right>r.right+1)};
   });
   expect(Math.max(...dock.widths)-Math.min(...dock.widths)).toBeLessThan(1);
   expect(Math.min(...dock.heights)).toBeGreaterThanOrEqual(44);
   expect(dock.labels.every(x=>x==='1')).toBe(true);expect(dock.over).toBe(false);
   await page.locator('[data-wallet-live-details]').click();
   const layer=page.locator('#walletDetail324');
   await expect(layer).toBeVisible();
   await expect(page.locator('.wd-flight')).toHaveCount(0);
   for(const id of [2,1,0]){
    await page.locator('[data-wd-select="'+id+'"]').click();
    await expect.poll(()=>layer.locator('.wd-carousel').evaluate((track,index)=>{
     const r=track.getBoundingClientRect(),c=track.querySelector('[data-wd-card="'+index+'"]').getBoundingClientRect();
     return Math.abs(r.left+r.width/2-c.left-c.width/2);
    },id),{timeout:4000}).toBeLessThan(3);
    await expect(layer.locator('[data-wd-count]')).toHaveText('0'+(id+1)+' / 03');
   }
   await expect(layer.locator('[data-wd-step="-1"]')).toBeDisabled();
   await phone.screenshot({path:info.outputPath(theme+'-wallet-detail.png')});
   await layer.locator('[data-wd-back]').click();
   await expect(layer).toHaveCount(0);
   await expect(page.locator('.wd-flight')).toHaveCount(0);
   await expect(page.locator('.wallet-live')).toBeVisible();
   await page.locator('#dock [data-tab="expenses"]').click();
   await expect(page.locator('.expense-periods .chip').first()).toBeVisible();
   for(const b of await page.locator('.expense-periods .chip').all())expect(await b.evaluate(el=>el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  }
  expect(errors).toEqual([]);
 });
}
