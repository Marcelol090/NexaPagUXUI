import {test,expect} from '@playwright/test';
const tabs=['home','expenses','ads','cards','review'];
for(const width of [320,390,430,1440]){
 test('V3.28 glyph family, scroll anchoring and motion preferences '+width,async({page},info)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/v2.html');
  const phone=page.locator('.phone');
  for(const theme of ['light','dark']){
   if(await phone.getAttribute('data-ui-theme')!==theme)await page.locator('#themeToggle').click();
   for(const tab of tabs){
    const button=page.locator('#dock [data-tab="'+tab+'"]');
    await button.click();await expect(button).toHaveAttribute('aria-current','page');
    await expect(button.locator('use')).toHaveAttribute('href','#nx-nav-'+tab);
    const g=await button.evaluate(el=>{
     const svg=el.querySelector('svg'),symbol=document.querySelector(svg.querySelector('use').getAttribute('href')),r=el.getBoundingClientRect();
     return {width:r.width,height:r.height,glyph:svg.getBoundingClientRect().width,stroke:symbol.getAttribute('stroke-width'),label:el.querySelector('span').textContent,transition:getComputedStyle(svg).transitionDuration};
    });
    expect(g.width).toBeGreaterThanOrEqual(44);expect(g.height).toBeGreaterThanOrEqual(44);expect(g.glyph).toBe(21);expect(g.stroke).toBe('1.85');expect(g.label.length).toBeGreaterThan(1);
    const s=page.locator('#scroller'),before=await phone.evaluate(el=>getComputedStyle(el,'::before').backgroundImage);
    await s.evaluate(el=>el.scrollTop=400);
    await expect.poll(()=>phone.evaluate(el=>getComputedStyle(el,'::before').opacity)).toBe('1');
    expect(await phone.evaluate(el=>getComputedStyle(el,'::before').backgroundImage)).toBe(before);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
    if(width===390){await s.evaluate(el=>el.scrollTop=0);await phone.screenshot({path:info.outputPath(theme+'-'+tab+'.png'),animations:'disabled'});}
   }
  }
  expect(errors).toEqual([]);
 });
}
test('V3.28 changes to reduced-motion do not duplicate canvas elements',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/v2.html');
 await page.emulateMedia({reducedMotion:'reduce'});
 const initial=await page.locator('#screen .liquid-canvas').count();
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(page.locator('#screen .liquid-canvas')).toHaveCount(initial);
 await expect(page.locator('#dock .nx-nav-glyph')).toHaveCount(5);
});
