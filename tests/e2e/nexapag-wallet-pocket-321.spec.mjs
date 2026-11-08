import {test,expect} from '@playwright/test';
for(const width of [320,390,430]){
 test('V3.21 wallet cards: exposed tops, actual touch targets and sequential switch at '+width+'px',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:844});await page.goto('/v2.html');
  await page.locator('#dock [data-tab="cards"]').click();
  const scene=page.locator('[data-wallet-live-scene]');
  await expect(scene.locator('[data-wallet-live-card]')).toHaveCount(3);
  await expect(scene).toHaveAttribute('data-opened','false');
  const ribbons=await page.evaluate(()=>{
   const scene=document.querySelector('[data-wallet-live-scene]');
   const seam=scene.querySelector('.wallet-live-pocket-front').getBoundingClientRect().top;
   return [...scene.querySelectorAll('[data-wallet-live-card]')].map(el=>{
    const b=el.getBoundingClientRect();
    const at=document.elementFromPoint(b.x+b.width/2,b.y+12);
    return {bank:el.dataset.walletLiveCard,hit:at?.closest('[data-wallet-live-card]')?.dataset.walletLiveCard,top:b.top,exposed:seam-b.top};
   });
  });
  expect(new Set(ribbons.map(x=>x.hit)).size).toBe(3);
  expect(ribbons.every(x=>x.exposed>35)).toBe(true);
  const first=scene.locator('[data-wallet-live-card="0"]');
  await first.click({position:{x:110,y:12}});
  await expect(scene).toHaveAttribute('data-phase','expanded',{timeout:1700});
  const geo=await page.evaluate(()=>{
   const scene=document.querySelector('[data-wallet-live-scene]');
   return {bottom:scene.querySelector('[data-slot="active"]').getBoundingClientRect().bottom,
           seam:scene.querySelector('.wallet-live-pocket-front').getBoundingClientRect().top};
  });
  expect(geo.bottom).toBeLessThanOrEqual(geo.seam+2);
  await page.locator('[data-wallet-live-dot="1"]').click();
  await expect(scene).toHaveAttribute('data-phase','retracting');
  await expect(scene).toHaveAttribute('data-phase','expanded',{timeout:1800});
  await expect(scene.locator('[data-wallet-live-card="1"]')).toHaveAttribute('data-slot','active');
  await expect(page.locator('.wallet-live-selection')).toContainText('Itaú Personnalité');
  await page.locator('[data-wallet-live-step="1"]').click();
  await expect(scene).toHaveAttribute('data-phase','expanded',{timeout:1800});
  await expect(page.locator('.wallet-live-selection')).toContainText('Inter Black');
  await page.locator('[data-wallet-live-card="2"]').click({position:{x:110,y:12}});
  await expect(scene).toHaveAttribute('data-opened','false',{timeout:1700});
  await expect(page.locator('#dock button')).toHaveCount(5);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
  expect(errors).toEqual([]);
 });
}
test('V3.21 rapid taps, reduced motion and tab navigation do not strand wallet animation',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/v2.html');
 await page.locator('#dock [data-tab="cards"]').click();
 const scene=page.locator('[data-wallet-live-scene]');
 await page.locator('[data-wallet-live-dot="0"]').click();
 await expect(scene).toHaveAttribute('data-phase','expanded');
 await page.locator('[data-wallet-live-step="1"]').click();
 await page.locator('[data-wallet-live-step="1"]').click();
 await expect(scene).toHaveAttribute('data-phase','expanded',{timeout:1800});
 await expect(page.locator('.wallet-live-selection')).toContainText('Inter Black');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('[data-wallet-live-step="1"]').click();
 await expect(page.locator('.wallet-live-selection')).toContainText('Nubank Ultravioleta');
 await expect(scene).toHaveAttribute('data-phase','expanded');
 await page.locator('#dock [data-tab="home"]').click();
 await page.locator('#dock [data-tab="cards"]').click();
 await expect(page.locator('[data-wallet-live-scene]')).toHaveAttribute('data-opened','false');
 await expect(page.locator('.wallet-folder')).toHaveCount(4);
});
