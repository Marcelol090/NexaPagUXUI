import {test,expect} from '@playwright/test';
test('V2.4 wallet folders fan into interactive card selection', async ({page}) => {
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,390]){
  await page.setViewportSize({width,height:844});
  await page.goto('/v2.html');
  await page.locator('#dock button[data-tab="cards"]').click();
  await expect(page.locator('.wallet-folder')).toHaveCount(4);
  await expect(page.locator('.wallet-folder--all .wallet-preview')).toHaveCount(3);
  await page.locator('[data-wallet-folder="0"]').click();
  await expect(page.getByRole('dialog',{name:'Minha carteira'})).toBeVisible();
  await expect(page.locator('.wallet-bank-options button')).toHaveCount(3);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog',{name:'Minha carteira'})).toHaveCount(0);
  await page.locator('[data-wallet-folder="0"]').click();
  await page.getByRole('button',{name:'Selecionar Itaú Personnalité',exact:true}).click();
  await expect(page.locator('.wallet-selected-summary')).toContainText('Itaú Personnalité');
  await expect(page.locator('.wallet-selected-summary')).toContainText('7310');
  await expect(page.locator('#dock button')).toHaveCount(5);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
 }
 expect(errors).toEqual([]);
});
test('V2.4 single-bank folders and reduced-motion wallet are accessible',async ({page})=>{
 await page.setViewportSize({width:320,height:700});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/v2.html');
 await page.locator('#dock button[data-tab="cards"]').click();
 await page.locator('[data-wallet-folder="3"]').click();
 await expect(page.getByRole('dialog',{name:'Inter'})).toBeVisible();
 await expect(page.locator('.wallet-bank-options button')).toHaveCount(1);
 const button=page.locator('.wallet-bank-options button').first();
 expect(await button.evaluate(el=>el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
 await button.click();
 await expect(page.locator('.wallet-selected-summary')).toContainText('Inter Black');
 await expect(page.getByRole('dialog')).toHaveCount(0);
});
