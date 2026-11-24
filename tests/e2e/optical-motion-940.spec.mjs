import { test, expect } from '@playwright/test';
const tabs=['home','chart','bag','wallet','review'];
for(const width of [320,390,430,1440]){
 test('9.40 root: anchored lightfield and precise glyphs '+width,async({page},info)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:844});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/');
  await expect(page).toHaveTitle(/Visualize 9\.40/);
  const screen=page.locator('#screen'),device=page.locator('#device'),nav=page.locator('#navigation');
  const field=()=>device.evaluate(el=>{
    const bg=el.querySelector('.atmosphere'),r=bg.getBoundingClientRect(),s=getComputedStyle(bg),d=el.getBoundingClientRect();
    return {x:r.x-d.x,y:r.y-d.y,w:r.width,h:r.height,bg:s.backgroundImage,opacity:s.opacity,transform:s.transform};
  });
  for(const tab of tabs){
   const button=nav.locator('[data-tab="'+tab+'"]');await button.click();
   await expect(button).toHaveAttribute('aria-current','page');
   await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
   await expect(button.locator('use')).toHaveAttribute('href','#i-nav-'+tab);
   const sizes=await nav.locator('button').evaluateAll(items=>items.map(b=>{
     const r=b.getBoundingClientRect(),g=b.querySelector('svg'),s=getComputedStyle(g),bbox=g.querySelector('use').getBBox();
     return {w:r.width,h:r.height,glyph:parseFloat(s.width),label:getComputedStyle(b.querySelector('span')).display,valid:bbox.width>0&&bbox.height>0&&bbox.x>=0&&bbox.y>=0&&bbox.x+bbox.width<=24&&bbox.y+bbox.height<=24};
   }));
   for(const s of sizes){expect(s.w).toBeGreaterThanOrEqual(47);expect(s.h).toBeGreaterThanOrEqual(47);expect(s.glyph).toBe(23);expect(s.label).toBe('none');expect(s.valid).toBe(true)}
   await screen.evaluate(el=>el.scrollTop=0);
   await expect.poll(()=>device.evaluate(el=>Number(el.style.getPropertyValue('--nx940-edge')))).toBe(0);
   const before=await field(),max=await screen.evaluate(el=>el.scrollHeight-el.clientHeight);
   for(const y of [24,48,160,420]){
    if(max<y)continue;
    await screen.evaluate((el,y)=>el.scrollTop=y,y);
    await expect.poll(()=>device.evaluate(el=>Number(el.style.getPropertyValue('--nx940-edge')))).toBeCloseTo(Math.min(1,y/48),2);
    expect(await field()).toEqual(before);
   }
   if(width===390)await device.screenshot({path:info.outputPath(tab+'-scrolled.png'),animations:'disabled'});
   await screen.evaluate(el=>el.scrollTop=0);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
  expect(errors).toEqual([]);
 });
}
test('9.40 workbench keeps four lightfields, gradient and no-motion control',async({page})=>{
 await page.setViewportSize({width:1440,height:960});await page.goto('/');
 const device=page.locator('#device');
 for(const theme of ['verdi','forest','emerald','lumen']){
  await page.locator('[data-green-bg="'+theme+'"]').click();
  await expect(device).toHaveAttribute('data-bg-theme',theme);
  const atmo=device.locator('.atmosphere');
  const before=await atmo.evaluate(el=>getComputedStyle(el).backgroundImage);
  await page.locator('#screen').evaluate(el=>el.scrollTop=200);
  expect(await atmo.evaluate(el=>getComputedStyle(el).backgroundImage)).toBe(before);
 }
 const motion=page.locator('[data-toggle="motion"]');
 await motion.click();await expect(device).toHaveClass(/no-motion/);
 await page.locator('#navigation [data-tab="chart"]').click();
 expect(await page.locator('#navigation .active svg').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
 await page.emulateMedia({reducedMotion:'reduce'});
 await motion.click();await page.locator('#navigation [data-tab="home"]').click();
 expect(await page.locator('#screenContent h2').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
});
test('9.40 transaction filters are semantic and refund is not income',async({page})=>{
 await page.goto('/');await page.locator('#navigation [data-tab="chart"]').click();
 await page.locator('[data-filter="in"]').click();
 await expect(page.locator('.transaction')).toHaveCount(1);
 await expect(page.locator('.transaction')).toHaveAttribute('data-kind','income');
 await expect(page.locator('.transaction use')).toHaveAttribute('href','#i-transfer');
 await page.locator('[data-filter="refunds"]').click();
 await expect(page.locator('.transaction')).toHaveCount(1);
 await expect(page.locator('.transaction')).toHaveAttribute('data-kind','refund');
 await expect(page.locator('.transaction .tx-value')).toHaveClass(/amber/);
 await expect(page.locator('.transaction use')).toHaveAttribute('href','#i-refund');
 await expect(page.locator('#screenContent')).toContainText('não a composição do total');
});
test('9.40 only true tab changes animate heading, local filters do not',async({page})=>{
 await page.goto('/');await page.locator('#navigation [data-tab="chart"]').click();
 await expect(page.locator('#screenContent')).toHaveAttribute('data-nx940-transition','tab');
 await page.locator('[data-filter="in"]').click();
 await expect(page.locator('#screenContent')).toHaveAttribute('data-nx940-transition','local');
 await page.locator('#navigation [data-tab="home"]').click();
 await page.locator('[data-period="week"]').click();
 await expect(page.locator('#screenContent')).toHaveAttribute('data-nx940-transition','period');
});
