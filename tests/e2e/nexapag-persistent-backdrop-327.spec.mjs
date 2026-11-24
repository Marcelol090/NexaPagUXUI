import {test,expect} from '@playwright/test';
for(const width of [320,390,430,1440]){
 test('V3.27 green backdrop remains anchored during scroll at '+width,async({page},info)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/v2.html');
  const phone=page.locator('.phone'),scroller=page.locator('#scroller');
  const read=()=>phone.evaluate(el=>{
   const p=getComputedStyle(el,'::before'),b=el.getBoundingClientRect();
   const bar=el.querySelector('.topbar').getBoundingClientRect();
   const sc=el.querySelector('#scroller');
   return {opacity:p.opacity,background:p.backgroundImage,height:p.height,top:p.top,
    barY:bar.top-b.top,scrollTop:sc.scrollTop,scrollMax:sc.scrollHeight-sc.clientHeight};
  });
  for(const theme of ['light','dark']){
   if(await phone.getAttribute('data-ui-theme')!==theme)await page.locator('#themeToggle').click();
   for(const tab of ['home','expenses','ads','cards','review']){
    await page.locator('#dock [data-tab="'+tab+'"]').click();
    await scroller.evaluate(el=>el.scrollTop=0);
    const before=await read();
    expect(before.opacity).toBe('1');
    for(const y of [32,112,220,600]){
     if(before.scrollMax<y)continue;
     await scroller.evaluate((el,pos)=>el.scrollTop=pos,y);
     await expect.poll(async()=>(await read()).scrollTop).toBeGreaterThanOrEqual(y-1);
     const after=await read();
     expect(after.opacity).toBe(before.opacity);
     expect(after.background).toBe(before.background);
     expect(after.height).toBe(before.height);
     expect(after.top).toBe(before.top);
     expect(after.barY).toBeCloseTo(before.barY,0);
     if(y>112)await expect(phone).toHaveClass(/scrolled-deep/);
    }
    if(width===390&&tab==='home'){
     await phone.screenshot({path:info.outputPath(theme+'-scrolled.png'),animations:'disabled'});
     await scroller.evaluate(el=>el.scrollTop=0);
     await phone.screenshot({path:info.outputPath(theme+'-initial.png'),animations:'disabled'});
    }
    await scroller.evaluate(el=>el.scrollTop=0);
    await expect.poll(async()=>(await read()).scrollTop).toBe(0);
    expect((await read()).background).toBe(before.background);
   }
  }
  expect(errors).toEqual([]);
 });
}
