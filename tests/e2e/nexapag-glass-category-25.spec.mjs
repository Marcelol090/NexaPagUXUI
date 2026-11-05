import { test, expect } from '@playwright/test';

test('V2.5 category expressions transform into stable icons and replay',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:390,height:844});await page.goto('/v2.html');
  await page.locator('#dock button[data-tab="expenses"]').click();
  const morph=page.locator('.category-morph');
  await expect(morph).toHaveCount(4);
  for(const name of ['Alimentação','Compras','Transporte','Casa']){
    await expect(page.getByRole('button',{name:'Reproduzir expressão da categoria '+name})).toHaveCount(1);
  }
  await morph.first().scrollIntoViewIfNeeded();
  await expect.poll(()=>morph.first().evaluate(e=>e.classList.contains('is-playing'))).toBe(true);
  await expect.poll(()=>morph.first().evaluate(e=>e.classList.contains('is-playing')),{timeout:5000}).toBe(false);
  await expect.poll(()=>morph.first().locator('.category-morph-orb').evaluate(e=>getComputedStyle(e).opacity)).toBe('0');
  await morph.first().click();
  await expect(morph.first()).toHaveClass(/is-playing/);
  await expect.poll(()=>morph.first().evaluate(e=>e.classList.contains('is-playing')),{timeout:5000}).toBe(false);
  await page.locator('#dock button[data-tab="cards"]').click();
  await expect(page.locator('.wallet-folder')).toHaveCount(4);
  await page.locator('.wallet-folder--all').click();
  await expect(page.getByRole('dialog',{name:'Minha carteira'})).toBeVisible();
  await page.locator('.wallet-bank-options [data-wallet-pick="1"]').click();
  await expect(page.locator('.wallet-selected-summary')).toContainText('Itaú Personnalité');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
  expect(errors).toEqual([]);
});

test('V2.5 compact reduced-motion glyphs skip sphere animation',async({page})=>{
  await page.setViewportSize({width:320,height:700});
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/v2.html');
  await page.locator('#dock button[data-tab="expenses"]').click();
  await expect(page.locator('.category-morph')).toHaveCount(4);
  await page.locator('.category-morph').first().scrollIntoViewIfNeeded();
  await expect(page.locator('.category-morph.is-playing')).toHaveCount(0);
  await page.locator('.category-morph').first().click();
  await expect(page.locator('.category-morph.is-playing')).toHaveCount(0);
  await expect(page.locator('.category-morph-glyph svg')).toHaveCount(4);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
});