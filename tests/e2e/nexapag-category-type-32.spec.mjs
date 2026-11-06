import {test,expect} from '@playwright/test';
for(const width of [320,359,390,430,1440]){
 test('V3.2 category typography is responsive at '+width+'px',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:844});await page.goto('/v2.html');
  await page.locator('#dock button[data-tab="expenses"]').click();
  await expect(page.locator('.category-v29')).toHaveCount(4);
  for(const card of await page.locator('.category-v29').all()){
   const d=await card.evaluate(el=>{
    const title=el.querySelector('.copy strong'),sub=el.querySelector('.copy small'),a=el.querySelector('.amount');
    const x=title.getBoundingClientRect(),y=a.getBoundingClientRect(),b=el.querySelector('.category-open').getBoundingClientRect();
    return {title:parseFloat(getComputedStyle(title).fontSize),sub:parseFloat(getComputedStyle(sub).fontSize),
      overlap:!(x.right<=y.left+1||x.bottom<=y.top+1||y.bottom<=x.top+1||y.right<=x.left+1),
      inside:y.left>=b.left-1&&y.right<=b.right+1};
   });
   expect(d.title).toBeGreaterThanOrEqual(13.5);
   expect(d.sub).toBeGreaterThanOrEqual(10.5);
   expect(d.overlap).toBe(false);
   expect(d.inside).toBe(true);
  }
  await page.locator('[data-category-toggle="Compras"]').click();
  await expect(page.locator('#sub-compras .subcategory-entry')).toHaveCount(3);
  await expect(page.locator('#sub-compras .subcategory-heading-summary')).toContainText('965,00');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
  expect(errors).toEqual([]);
 });
}
test('V3.2 type hierarchy is preserved in dark mode',async({page})=>{
 await page.setViewportSize({width:320,height:844});await page.goto('/v2.html');
 await page.locator('#themeToggle').click();await page.locator('#dock button[data-tab="expenses"]').click();
 await expect(page.locator('.phone')).toHaveAttribute('data-ui-theme','dark');
 await page.locator('[data-category-toggle="Alimentação"]').click();
 await expect(page.locator('#sub-alimentacao .subcategory-heading-summary')).toContainText('1.240,00');
 await expect(page.locator('#dock button')).toHaveCount(5);
});
