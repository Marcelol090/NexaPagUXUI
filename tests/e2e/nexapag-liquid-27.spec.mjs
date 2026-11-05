import {test,expect} from '@playwright/test';
test('V2.7 actionable weekly budget and historic refund remain separate flows',async({page})=>{
 for(const width of [320,390]){
  await page.setViewportSize({width,height:844});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/v2.html');
  await expect(page.locator('.money-insight--goal')).toContainText('930,00');
  await expect(page.locator('.money-insight--goal')).toContainText('1.200,00');
  await expect(page.locator('.money-insight--refund')).toContainText('349,90');
  await page.locator('.money-insight--goal').click();
  await expect(page.getByRole('dialog',{name:'Meta semanal'})).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('22,5%');
  await page.locator('[data-insight-go="expenses"]').click();
  await expect(page.locator('#dock button[data-tab="expenses"]')).toHaveAttribute('aria-current','page');
  await expect(page.locator('#chartAmount')).toContainText('30,00');
  await page.locator('#dock button[data-tab="home"]').click();
  await page.locator('.money-insight--refund').click();
  await expect(page.getByRole('dialog',{name:'Estorno confirmado'})).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('3.468,20');
  await expect(page.getByRole('dialog')).toContainText('Não representa uma nova');
  await page.locator('[data-insight-go="transactions"]').click();
  await expect(page.locator('#transactionsSection')).toBeVisible();
  await expect(page.locator('.transactions')).toContainText('Estorno de compra');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);expect(errors).toEqual([]);
 }
});