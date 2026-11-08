import {test,expect} from '@playwright/test';
test('V3.20 wallet cards lift from a sleeve, switch in place and show grounded bank information',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,390,430]){
  await page.setViewportSize({width,height:844});await page.goto('/v2.html');
  await page.locator('#dock [data-tab="cards"]').click();
  const scene=page.locator('[data-wallet-live-scene]');
  await expect(scene).toHaveCount(1);
  await expect(scene).toHaveAttribute('data-opened','false');
  await expect(scene.locator('[data-wallet-live-card]')).toHaveCount(3);
  await expect(page.locator('.wallet-live-selection')).toContainText('Nubank Ultravioleta');
  expect(await scene.locator('[data-wallet-live-card="0"]').getAttribute('data-slot')).toBe('active');
  await page.locator('[data-wallet-live-dot="1"]').click();
  await expect(scene).toHaveAttribute('data-opened','true');
  await expect(scene.locator('[data-wallet-live-card="1"]')).toHaveAttribute('data-slot','active');
  await expect(page.locator('.wallet-live-selection')).toContainText('Itaú Personnalité');
  await expect(page.locator('.wallet-selected-summary')).toContainText('7310');
  await page.locator('[data-wallet-live-step="1"]').click();
  await expect(page.locator('.wallet-live-selection')).toContainText('Inter Black');
  await expect(page.locator('.wallet-selected-summary')).toContainText('2044');
  await scene.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.wallet-live-selection')).toContainText('Nubank Ultravioleta');
  await page.keyboard.press('End');
  await expect(page.locator('.wallet-live-selection')).toContainText('Inter Black');
  await page.locator('[data-wallet-live-details]').click();
  await expect(page.locator('.wallet-selected-summary')).toContainText('Inter Black');
  await expect(page.locator('#dock button')).toHaveCount(5);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
 }
 expect(errors).toEqual([]);
});
test('V3.20 wallet pocket supports touch drag and reduced motion without losing the original folders',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/v2.html');
 await page.locator('#dock [data-tab="cards"]').click();
 const scene=page.locator('[data-wallet-live-scene]');const r=await scene.boundingBox();
 await page.mouse.move(r.x+r.width*.75,r.y+65);await page.mouse.down();
 await page.mouse.move(r.x+r.width*.18,r.y+65,{steps:9});await page.mouse.up();
 await expect(page.locator('.wallet-live-selection')).toContainText('Itaú Personnalité');
 await expect(scene).toHaveAttribute('data-opened','true');
 await expect(page.locator('.wallet-folder')).toHaveCount(4);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('[data-wallet-live-dot="0"]').click();
 await expect(page.locator('.wallet-selected-summary')).toContainText('Nubank Ultravioleta');
 await page.locator('[data-wallet-folder="0"]').click();
 await expect(page.getByRole('dialog',{name:'Minha carteira'})).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog',{name:'Minha carteira'})).toHaveCount(0);
});
