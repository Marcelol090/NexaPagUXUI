import {test,expect} from '@playwright/test';
for(const width of [320,390,430]){
 test('V3.24 stack moves as one group, selected card enters detail at '+width,async({page},info)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:844});await page.goto('/v2.html');
  await page.locator('#dock [data-tab="cards"]').click();
  const scene=page.locator('[data-wallet-live-scene]');
  const tops=()=>scene.locator('[data-wallet-live-card]').evaluateAll(els=>els.map(e=>e.getBoundingClientRect().top));
  await scene.locator('[data-wallet-stack-toggle]').scrollIntoViewIfNeeded();
  const before=await tops();
  const pocket=await scene.locator('.wallet-live-pocket-front').evaluate(el=>el.getBoundingClientRect().top-el.closest('[data-wallet-live-scene]').getBoundingClientRect().top);
  await scene.locator('[data-wallet-stack-toggle]').click();
  await expect(scene).toHaveAttribute('data-opened','true');
  await expect.poll(async()=>{const a=await tops();return a.every((v,i)=>v<before[i]-8)}).toBe(true);
  const after=await scene.locator('.wallet-live-pocket-front').evaluate(el=>el.getBoundingClientRect().top-el.closest('[data-wallet-live-scene]').getBoundingClientRect().top);
  expect(Math.abs(pocket-after)).toBeLessThan(2);
  await page.locator('.phone').screenshot({path:info.outputPath('stack.png')});
  await scene.locator('[data-wallet-live-card="1"]').click({position:{x:80,y:12}});
  await expect(page.locator('#walletDetail324')).toBeVisible();
  await expect(page.locator('[data-wd-name]')).toHaveText('Itaú Personnalité');
  await expect(page.locator('.wd-flight')).toHaveCount(0);
  await expect(page.locator('[data-wd-ending]')).toContainText('7310');
  await page.locator('[data-wd-step="1"]').click();
  await expect(page.locator('[data-wd-name]')).toHaveText('Inter Black');
  await expect(page.locator('.wd-empty')).toContainText('Sem histórico individual');
  await page.locator('.phone').screenshot({path:info.outputPath('detail.png')});
  await page.locator('[data-wd-back]').click();
  await expect(page.locator('#walletDetail324')).toHaveCount(0);
  await expect(scene).toBeVisible();
  await expect(page.locator('.wallet-live-selection')).toContainText('Inter Black');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
  expect(errors).toEqual([]);
 });
}
test('V3.24 reduced motion and dark mode preserve wallet navigation',async({page})=>{
 await page.setViewportSize({width:320,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/v2.html');
 await page.locator('#themeToggle').click();await page.locator('#dock [data-tab="cards"]').click();
 await page.locator('[data-wallet-live-card="0"]').click({position:{x:70,y:12}});
 await expect(page.locator('[data-wd-name]')).toContainText('Nubank');
 await expect(page.locator('.wd-flight')).toHaveCount(0);
 await page.locator('[data-wd-select="2"]').click();await expect(page.locator('[data-wd-name]')).toHaveText('Inter Black');
 await page.keyboard.press('Escape');await expect(page.locator('#walletDetail324')).toHaveCount(0);
 await page.locator('#dock [data-tab="home"]').click();await expect(page.locator('#homePage')).toBeVisible();
});

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
