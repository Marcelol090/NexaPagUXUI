import {test,expect} from '@playwright/test';
for(const width of [320,390,430,1440]){
 test('V3.33 integrated Quiet Precision lineage '+width,async({page},info)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/v2.html');
  await expect(page).toHaveTitle(/V3\.33/);
  const phone=page.locator('.phone'),dock=page.locator('#dock');
  for(const theme of ['light','dark']){
   if(await phone.getAttribute('data-ui-theme')!==theme)await page.locator('#themeToggle').click();
   const color=theme==='dark'?'rgb(27, 43, 33)':'rgb(248, 250, 246)';
   for(const tab of ['home','expenses','ads','cards','review']){
    await dock.locator('[data-tab="'+tab+'"]').click();
    await expect(dock.locator('[aria-current="page"]')).toHaveCount(1);
    expect(await phone.evaluate(el=>getComputedStyle(el,'::before').height)).toBe('278px');
    const field=await phone.evaluate(el=>getComputedStyle(el,'::before').backgroundImage);
    await page.locator('#scroller').evaluate(el=>el.scrollTop=400);
    expect(await phone.evaluate(el=>getComputedStyle(el,'::before').backgroundImage)).toBe(field);
    const geometry=await dock.evaluate(el=>({dock:el.getBoundingClientRect().height,glyph:el.querySelector('button svg').getBoundingClientRect().width,targets:[...el.querySelectorAll('button')].map(b=>b.getBoundingClientRect().height)}));
    expect(geometry.dock).toBe(58);expect(geometry.glyph).toBeCloseTo(21,0);expect(Math.min(...geometry.targets)).toBeGreaterThanOrEqual(48);
    const surface=tab==='home'?'.week':tab==='expenses'?'.spending-chart':tab==='ads'?'.offer-card':tab==='review'?'.review-item':null;
    if(surface)await expect.poll(()=>page.locator(surface).first().evaluate(el=>getComputedStyle(el).backgroundColor)).toBe(color);
    if(width===390)await phone.screenshot({path:info.outputPath(theme+'-'+tab+'.png'),animations:'disabled'});
    await page.locator('#scroller').evaluate(el=>el.scrollTop=0);
   }
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
  expect(errors).toEqual([]);
 });
}
test('V3.31 nominal liquid layers encode circular area and motion stops offscreen',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/v2.html');
 const parts=await page.evaluate(()=>[.01,.1,.25,.5,.75,.9,.99].map(q=>{
  const y=window.NexaLiquidDebug.liquidBoundary(q),r=(y-40)/36.2;
  return {q,y,area:(Math.acos(r)-r*Math.sqrt(1-r*r))/Math.PI};
 }));
 for(const p of parts)expect(p.area).toBeCloseTo(p.q,5);
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect.poll(()=>page.evaluate(()=>window.NexaLiquidDebug.activity().scheduled)).toBe(false);
 await page.locator('#dock [data-tab="expenses"]').click();
 expect(await page.evaluate(()=>window.NexaLiquidDebug.activity().scheduled)).toBe(false);
});
test('V3.32 missing days, honest graph baseline and keyboard selection',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/v2.html');
 await page.locator('#dock [data-tab="expenses"]').click();
 await expect(page.locator('.chart-hit[data-missing="true"]')).toHaveCount(3);
 await page.locator('[data-graph="4"]').click();
 await expect(page.locator('#chartAmount')).toHaveText('—');
 await expect(page.locator('#chartPlot')).toHaveAttribute('data-missing','true');
 await expect(page.locator('#graphMarker')).toHaveCSS('visibility','hidden');
 await page.locator('[data-graph="0"]').click();
 await expect(page.locator('#chartAmount')).toContainText('126,80');
 await expect(page.locator('#chartPlot')).toHaveAttribute('data-missing','false');
 await page.locator('[data-period="Mês"]').focus();await page.keyboard.press('Enter');
 await expect(page.locator('[data-period="Mês"]')).toBeFocused();
 await expect(page.locator('.chart-hit[data-missing="true"]')).toHaveCount(0);
 await expect(page.locator('.heat-day[data-recorded="true"]')).toHaveCount(4);
});
