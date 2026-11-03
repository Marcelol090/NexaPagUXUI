import { test, expect } from '@playwright/test';

test('public home serves full 9.37 Visualize, not legacy 9.22 lab',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await expect(page).toHaveTitle(/Visualize 9\.37/);
 await expect(page.locator('#device')).toBeVisible();
 await expect(page.locator('#screenContent')).toContainText('Seu dinheiro');
 await expect(page.locator('#device .orb-fluid-canvas')).toHaveCount(1);
 const tabs=page.locator('#device .bottom-nav button');
 await expect(tabs).toHaveCount(5);
 const names=await tabs.evaluateAll(items=>items.map(el=>el.getAttribute('aria-label')));
 expect(names).toEqual(['Início','Gastos','Anúncios','Cartões','Revisar']);
 for(const button of await tabs.all()){
  const state=await button.evaluate(el=>{
   const label=el.querySelector('span');
   return {width:el.getBoundingClientRect().width,visible:label?getComputedStyle(label).display!=='none':false};
  });
  expect(state.width).toBeGreaterThan(35);
  expect(state.visible).toBe(true);
 }
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 expect(overflow).toBeLessThanOrEqual(2);
});

test('public 9.37 category grid, glass and five tabs are interactive',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#device .bottom-nav button[data-tab="chart"]').click();
 await expect(page.locator('#screenContent')).toContainText('Gastos');
 await expect(page.locator('#screenContent .quick-card.dash-card')).toHaveCount(6);
 const category=page.locator('#screenContent .quick-card.dash-card').first();
 await category.click();
 await expect(category).toHaveAttribute('aria-pressed','true');
 await page.locator('#device .bottom-nav button[data-tab="bag"]').click();
 await expect(page.locator('#screenContent')).toContainText('Modo demonstração');
 await page.locator('#device .bottom-nav button[data-tab="home"]').click();
 await expect(page.locator('#screenContent')).toContainText('Meta da semana');
 const blur=await page.locator('#device .ui-card').first().evaluate(el=>getComputedStyle(el).backdropFilter||getComputedStyle(el).webkitBackdropFilter);
 expect(blur).toContain('blur(');
});

test('320px home remains readable and does not overflow',async({page})=>{
 await page.setViewportSize({width:320,height:700});
 await page.goto('/');
 await expect(page.locator('#device')).toBeVisible();
 await expect(page.locator('#device .bottom-nav button')).toHaveCount(5);
 await expect(page.locator('#screenContent')).toContainText('Seu dinheiro');
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 expect(overflow).toBeLessThanOrEqual(2);
});
