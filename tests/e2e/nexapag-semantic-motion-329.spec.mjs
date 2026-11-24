import {test,expect} from '@playwright/test';
for(const width of [320,390,430,1440]){
 test('V3.29 semantic navigation and anchored atmosphere '+width,async({page},info)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:844});await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/v2.html');
  const phone=page.locator('.phone'),scroll=page.locator('#scroller'),dock=page.locator('#dock');
  const backdrop=()=>phone.evaluate(el=>{const p=getComputedStyle(el,'::before');return [p.backgroundImage,p.height,p.top,p.opacity]});
  for(const theme of ['light','dark']){
   if(await phone.getAttribute('data-ui-theme')!==theme)await page.locator('#themeToggle').click();
   for(const tab of ['home','expenses','ads','cards','review']){
    const btn=dock.locator('[data-tab="'+tab+'"]');await btn.click();
    await expect(btn).toHaveAttribute('aria-current','page');
    await expect(dock.locator('[aria-current="page"]')).toHaveCount(1);
    for(const b of await dock.locator('button').all()){
     const g=await b.evaluate(el=>{const r=el.getBoundingClientRect(),s=el.querySelector('svg'),t=el.querySelector('span');return {w:r.width,h:r.height,svg:s.getBoundingClientRect().width,label:getComputedStyle(t).opacity,box:s.querySelector('use').getBBox().width}});
     expect(g.w).toBeGreaterThanOrEqual(48);expect(g.h).toBeGreaterThanOrEqual(48);
     expect(g.svg).toBeCloseTo(21,0);expect(g.label).toBe('1');expect(g.box).toBeGreaterThan(0);
    }
    const initial=await backdrop();expect(initial[3]).toBe('1');
    const max=await scroll.evaluate(el=>el.scrollHeight-el.clientHeight);
    for(const y of [24,120,220]){
     if(max<y)continue;
     await scroll.evaluate((el,y)=>el.scrollTop=y,y);
     await expect.poll(()=>phone.evaluate(el=>Number(el.style.getPropertyValue('--nx-scroll-edge')))).toBeCloseTo(Math.min(1,y/48),1);
     expect(await backdrop()).toEqual(initial);
    }
    await scroll.evaluate(el=>el.scrollTop=0);
    await expect.poll(()=>phone.evaluate(el=>Number(el.style.getPropertyValue('--nx-scroll-edge')))).toBe(0);
    expect(await backdrop()).toEqual(initial);
    if(width===390)await phone.screenshot({path:info.outputPath(theme+'-'+tab+'.png'),animations:'disabled'});
   }
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await dock.locator('[data-tab="home"]').click();
  expect(await page.locator('#homePage').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
  expect(errors).toEqual([]);
 });
}
test('V3.29 financial glyphs distinguish receipt, transfer and refund',async({page})=>{
 await page.goto('/v2.html');
 const tx=page.locator('.transactions .transaction');
 await expect(tx.nth(0).locator('use')).toHaveAttribute('href','#i-receipt');
 await expect(tx.nth(1).locator('use')).toHaveAttribute('href','#i-transfer');
 await expect(tx.nth(2).locator('use')).toHaveAttribute('href','#i-refund');
 await expect(tx.nth(2).locator('.transaction-amount')).toHaveClass(/refund/);
 await expect(page.locator('.money-insight--goal use').first()).toHaveAttribute('href','#i-target');
});

test('V3.29 exact financial value during replay and neutral expression',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/v2.html');
 await page.locator('#dock [data-tab="expenses"]').click();
 const card=page.locator('#expenseExpression'),integer=page.locator('#expressionInteger'),cents=page.locator('#expressionCents');
 await page.locator('.expense-periods button').filter({hasText:'Mês'}).click();
 await expect(integer).toHaveText('3.468');await expect(cents).toHaveText(',20');
 await card.locator('[data-action="expenseReplay"]').click();
 for(const ms of [0,90,180,240]){
  if(ms)await page.waitForTimeout(ms);
  await expect(integer).toHaveText('3.468');await expect(cents).toHaveText(',20');
 }
 await expect(card).toHaveClass(/expression-settled/);
 await expect.poll(()=>card.locator('.eyes-joy').evaluate(el=>getComputedStyle(el).opacity)).toBe('0');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('.expense-periods button').filter({hasText:'Semana'}).click();
 await expect(integer).toHaveText('270');await expect(cents).toHaveText(',00');
 await expect(card).toHaveClass(/expression-settled/);
});
test('V3.29 reading films separate card from field in both themes',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/v2.html');
 const phone=page.locator('.phone');
 for(const theme of ['light','dark']){
  if(await phone.getAttribute('data-ui-theme')!==theme)await page.locator('#themeToggle').click();
  const background=theme==='dark'?'rgb(27, 43, 33)':'rgb(248, 250, 246)';
  for(const selector of ['.week','.transactions','.daily-note']){
   await expect.poll(()=>page.locator(selector).evaluate(el=>getComputedStyle(el).backgroundColor)).toBe(background);
  }
  await expect.poll(()=>page.locator('.transactions .transaction').first().evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
 }
});
