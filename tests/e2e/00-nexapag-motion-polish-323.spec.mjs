import {test,expect} from '@playwright/test';
for(const width of [320,390,430]){
 test('V3.23 compact controls and financial bots at '+width+'px',async({page},info)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/v2.html');
  for(const theme of ['light','dark']){
   if(await page.locator('.phone').getAttribute('data-ui-theme')!==theme)await page.locator('#themeToggle').click();
   const result=await page.evaluate(()=>{
    const buttons=[...document.querySelectorAll('.topbar .round-action')].map(b=>({w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height,inset:getComputedStyle(b,'::before').top}));
    const items=[...document.querySelectorAll('#compactHero .milestone')].map(b=>({r:b.getBoundingClientRect(),art:b.querySelector('.orb-bot-art').getBoundingClientRect(),value:b.querySelector('.orb-metric').getBoundingClientRect(),label:b.lastElementChild.getBoundingClientRect()}));
    return {buttons,artSizes:items.map(i=>i.art.width),separate:items.every((i,n)=>!n||items[n-1].art.right<=i.art.left+1),vertical:items.every(i=>i.value.bottom<=i.art.top+1&&i.art.bottom<=i.label.top+1),topGap:items[0].value.top-document.querySelector('.topbar').getBoundingClientRect().bottom};
   });
   for(const b of result.buttons){expect(b.w).toBe(44);expect(b.h).toBe(44);expect(b.inset).toBe('5px')}
   expect(result.separate).toBe(true);expect(result.vertical).toBe(true);expect(result.topGap).toBeGreaterThanOrEqual(8);
   expect(Math.max(...result.artSizes)-Math.min(...result.artSizes)).toBeLessThanOrEqual(1);
   await page.locator('.phone').screenshot({path:info.outputPath(theme+'-compact.png'),animations:'disabled'});
  }
  expect(errors).toEqual([]);
 });
}
test('V3.23 rapid wallet switches settle and closing folder does not rebuild the page',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/v2.html');
 await page.locator('#dock [data-tab="cards"]').click();
 const scene=page.locator('[data-wallet-live-scene]');
 await page.locator('[data-wallet-live-dot="0"]').click();
 await expect(scene).toHaveAttribute('data-phase','expanded');
 await page.locator('[data-wallet-live-step="1"]').click();
 await page.locator('[data-wallet-live-step="1"]').click();
 await expect(scene).toHaveAttribute('data-phase','expanded',{timeout:3000});
 await expect(page.locator('.wallet-live-selection')).toContainText('Inter Black');
 await page.locator('[data-wallet-folder="1"]').click();
 await expect(page.locator('#walletLayer')).toBeVisible();
 await page.locator('.wallet-bank-options button').first().click();
 await expect(page.locator('#walletLayer')).toHaveCount(0);
 await expect(page.locator('.wallet-live-selection')).toContainText('Nubank Ultravioleta');
});
test('V3.23 leaving an orb motion never strands the next tab',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/v2.html');
 await page.locator('[data-open="1"]').click();
 await page.locator('#dock [data-tab="ads"]').click();
 await page.locator('#dock [data-tab="home"]').click();
 await expect(page.locator('.orb-fluid-ghost')).toHaveCount(0);
 await expect(page.locator('#homePage')).not.toHaveClass(/hero-expanded/);
 await page.locator('[data-orb-story="income"]').click();
 await expect(page.locator('#orbStoryLayer')).toBeVisible();
 await page.locator('#dock [data-tab="cards"]').click();
 await expect(page.locator('.orb-fluid-ghost')).toHaveCount(0);
 await expect(page.locator('.wallet-live')).toBeVisible();
});
