import {test,expect} from '@playwright/test';
for(const width of [320,390,430]){
 test('V3.34 frame audit disclosure bounds '+width,async({page},info)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:844});await page.goto('/v2.html');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.NexaOrbFlowV35))).toBe(true);
  await page.locator('[data-orb-story="income"]').click();
  const frames=await page.evaluate(()=>new Promise(resolve=>{const samples=[],start=performance.now();function tick(now){const g=document.querySelector('.greeting')?.getBoundingClientRect(),n=document.querySelector('#orbStoryLayer .orb-flow-controls');if(g&&n){const r=n.getBoundingClientRect(),s=getComputedStyle(n);samples.push({visible:s.visibility!=='hidden'&&Number(s.opacity)>.1,bottom:r.bottom,heading:g.top})}if(now-start<850)requestAnimationFrame(tick);else resolve(samples)}requestAnimationFrame(tick)}));
  expect(frames.length).toBeGreaterThan(0);expect(frames.filter(x=>x.visible&&x.bottom>x.heading+1)).toEqual([]);
  await expect(page.locator('.orb-fluid-ghost')).toHaveCount(0,{timeout:3500});
  for(const kind of ['refund','spending']){
   await page.locator('#orbStoryLayer [data-orb-switch="'+kind+'"]').click();
   await expect(page.locator('.orb-fluid-ghost')).toHaveCount(0,{timeout:3500});
   const panel=kind==='spending'?'#expandedHero':'#orbStoryLayer';
   await expect(page.locator(panel)).toBeVisible();
   await expect.poll(()=>page.locator(panel).evaluate(el=>document.querySelector('.greeting').getBoundingClientRect().top-el.getBoundingClientRect().bottom)).toBeGreaterThanOrEqual(0);
   const gap=await page.locator(panel).evaluate(el=>document.querySelector('.greeting').getBoundingClientRect().top-el.getBoundingClientRect().bottom);
   expect(gap).toBeLessThanOrEqual(30);
   await page.locator('.phone').screenshot({path:info.outputPath(kind+'.png'),animations:'disabled'});
  }
  expect(errors).toEqual([]);
 });
}
test('V3.34 theme, anchored atmosphere and review semantics',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/v2.html');
 const phone=page.locator('.phone');
 for(const theme of ['light','dark']){
  if(await phone.getAttribute('data-ui-theme')!==theme)await page.locator('#themeToggle').click();
  const bg=await phone.evaluate(el=>getComputedStyle(el,'::before').backgroundImage);
  await page.locator('#scroller').evaluate(el=>el.scrollTop=400);
  expect(await phone.evaluate(el=>getComputedStyle(el,'::before').backgroundImage)).toBe(bg);
  await page.locator('#dock [data-tab="review"]').click();
  expect(await phone.evaluate(el=>getComputedStyle(el,'::before').backgroundImage)).toBe(bg);
  await expect(page.locator('.review-glyph')).toHaveCount(3);
  expect(await page.locator('.review-glyph use').evaluateAll(els=>els.map(el=>el.getAttribute('href')))).toEqual(['#i-tag','#i-transfer','#i-duplicate']);
  await expect(page.locator('.review-item .orb-cinema')).toHaveCount(0);
  await page.locator('#dock [data-tab="home"]').click();
 }
});
