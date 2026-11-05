import { test, expect } from '@playwright/test';
for(const width of [320,390]){
 test('V2.9 category drill-down + 30-day calendar at '+width+'px',async ({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:844});await page.goto('/v2.html');
  await page.locator('#dock button[data-tab="expenses"]').click();
  await expect(page.locator('.phone.expenses-theme')).toHaveCount(1);
  await expect(page.locator('.category-v29')).toHaveCount(4);
  await expect(page.locator('.expense-category-note')).toContainText('3.468,20');
  await expect(page.locator('.calendar-heatmap > *')).toHaveCount(42);
  await expect(page.locator('.calendar-heatmap .heat-day')).toHaveCount(30);
  await expect(page.locator('.heat-day.has-expenses')).toHaveCount(4);
  await page.locator('[data-category-toggle="Alimentação"]').click();
  await expect(page.locator('[data-category-toggle="Alimentação"]')).toHaveAttribute('aria-expanded','true');
  await expect(page.locator('#sub-alimentacao')).toContainText('710,00');
  await expect(page.locator('#sub-alimentacao .subcategory-entry')).toHaveCount(3);
  await page.locator('[data-category-toggle="Compras"]').click();
  await expect(page.locator('[data-category-toggle="Alimentação"]')).toHaveAttribute('aria-expanded','false');
  await expect(page.locator('#sub-compras')).toContainText('Marketplace');
  await page.locator('[data-heat="2"]').click();
  await expect(page.locator('#calendarDetail')).toContainText('126,80');
  await page.locator('[data-heat="5"]').click();
  await expect(page.locator('#calendarDetail')).toContainText('30,00');
  await expect(page.locator('#calendarDetail')).toContainText('Combustível');
  await page.locator('[data-heat="30"]').click();
  await expect(page.locator('#calendarDetail')).toContainText('Dia posterior à data de referência.');
  await expect(page.locator('[data-heat="30"]')).toHaveAttribute('aria-pressed','true');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
  expect(errors).toEqual([]);
 });
}
test('V2.9 reduced motion shows data without animated liquid',async({page})=>{
 await page.setViewportSize({width:320,height:700});
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/v2.html');
 await page.locator('#dock button[data-tab="expenses"]').click();
 expect(await page.locator('.heat-day.has-expenses').first().evaluate(x=>getComputedStyle(x,'::before').animationName)).toBe('none');
 await page.locator('[data-heat="3"]').click();
 await expect(page.locator('#calendarDetail')).toContainText('74,00');
 await page.locator('[data-category-toggle="Casa"]').click();
 await expect(page.locator('#sub-casa')).toContainText('264,20');
});
test('V2.9 financial tabs remain intact',async({page})=>{
 await page.goto('/v2.html');await page.locator('#dock button[data-tab="expenses"]').click();
 await page.locator('#dock button[data-tab="home"]').click();
 await expect(page.locator('#weekSection')).toBeVisible();
 await page.locator('#dock button[data-tab="cards"]').click();
 await expect(page.locator('.wallet-folder')).toHaveCount(4);
});
