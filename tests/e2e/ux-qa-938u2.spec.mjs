import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

test('public 9.38u2 Home: one title, clear mock period and no misleading calendar action',async({page})=>{
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await expect(page).toHaveTitle(/9\\.38u2 UX QA/);
 await expect(page.locator('#screenContent .screen-title h2')).toHaveText('Seu dinheiro');
 await expect(page.locator('#screenContent .screen-title .kicker')).toHaveText('Dados demonstrativos');
 await expect(page.locator('#screenContent .screen-title .date-chip')).toHaveCount(1);
 await expect(page.locator('#screenContent button[data-action="calendar"]')).toHaveCount(0);
 await expect(page.locator('#screenContent .overview-lead')).toHaveCount(0);
 await expect(page.locator('#screenContent')).not.toContainText('Segunda-feira · 2 nov');
 await expect(page.locator('#weeklyGoalCard .goal-top strong')).toHaveText('Seu progresso');
 mkdirSync('test-results/screenshots',{recursive:true});
 await page.screenshot({path:'test-results/screenshots/public-home-390-938u2.png',fullPage:true});
 expect(errors).toEqual([]);
});

test('weekly composition uses category model, not fixed demo split',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const goal=page.locator('#weeklyGoalCard');
 await expect(goal.locator('.goal-info')).toContainText('Distribuição mensal');
 await expect(goal.locator('.goal-composition-note')).toContainText('não da semana');
 await expect(goal.locator('.stack-labels span')).toHaveCount(3);
 const result=await goal.locator('.stack-bar').evaluate(el=>({
  aria:el.getAttribute('aria-label'),percentages:[...el.children].map(x=>parseFloat(x.style.width))
 }));
 expect(result.aria).toContain('Marketplace');
 expect(result.aria).not.toContain('Casa 47');
 expect(result.percentages.length).toBe(4);
 expect(result.percentages.reduce((sum,n)=>sum+n,0)).toBeGreaterThan(99.9);
 expect(result.percentages.reduce((sum,n)=>sum+n,0)).toBeLessThan(100.1);
 // Empty data should not show an invented category bar.
 await page.locator('#expensesField').evaluate(el=>{
  el.value='0';
  el.dispatchEvent(new Event('input',{bubbles:true}));
 });
 await expect(page.locator('#weeklyGoalCard .stack-bar')).toHaveCount(0);
 await expect(page.locator('#weeklyGoalCard .goal-composition-note')).toContainText('Não há gastos demonstrativos');
});

test('goal CTA scrolls to actual target, not to the top',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const cta=page.locator('[data-action="meta"]');
 await cta.click();
 await expect.poll(async()=>{
  return await page.evaluate(()=>{
   const target=document.querySelector('#weeklyGoalCard'),screen=document.querySelector('#screen');
   return target.getBoundingClientRect().top-screen.getBoundingClientRect().top;
  });
 },{timeout:4000}).toBeLessThan(180);
 await expect(page.locator('#device .bottom-nav button[data-tab="home"]')).toHaveAttribute('aria-current','page');
});

test('bottom dock retains DOM identity and keyboard focus across tabs',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.evaluate(()=>window.__originalTab=document.querySelector('#navigation button[data-tab="chart"]'));
 const chart=page.locator('#navigation button[data-tab="chart"]');
 await chart.focus();
 await chart.press('Enter');
 await expect(chart).toHaveAttribute('aria-current','page');
 const retained=await page.evaluate(()=>window.__originalTab===document.querySelector('#navigation button[data-tab="chart"]'));
 expect(retained).toBe(true);
 await expect(chart).toBeFocused();
 await expect(page.locator('#screenContent')).toContainText('Gastos e fluxos');
 await page.locator('[data-filter="in"]').click();
 await expect(page.locator('[data-filter="in"]')).toHaveAttribute('aria-pressed','true');
 await page.locator('[data-filter="refunds"]').click();
 await expect(page.locator('[data-filter="refunds"]')).toHaveAttribute('aria-pressed','true');
 await page.locator('#navigation button[data-tab="wallet"]').click();
 await expect(page.locator('.bank-card').first()).toHaveAttribute('aria-pressed','true');
 await page.locator('.bank-card').nth(1).click();
 await expect(page.locator('.bank-card').nth(1)).toHaveAttribute('aria-pressed','true');
});

test('320px, 390px and desktop preserve usable hierarchy and screenshots',async({page})=>{
 mkdirSync('test-results/screenshots',{recursive:true});
 for(const width of [320,390,1366,1920]){
  await page.setViewportSize({width,height:900});
  await page.goto('/');
  const metrics=await page.evaluate(()=>{
   const screen=document.querySelector('#screen'),
         headings=[...document.querySelectorAll('#screenContent h2')];
   return {overflow:document.documentElement.scrollWidth-innerWidth,
    visualHeader:document.querySelector('#device .app-header').getBoundingClientRect().height,
    contentHeight:screen.getBoundingClientRect().height,
    names:headings.map(x=>x.textContent.trim()),
    targetSizes:[...document.querySelectorAll('#device .app-header button')].map(x=>x.getBoundingClientRect().width)};
  });
  expect(metrics.overflow).toBeLessThanOrEqual(2);
  expect(metrics.contentHeight).toBeGreaterThan(400);
  expect(metrics.names).toEqual(['Seu dinheiro']);
  expect(Math.min(...metrics.targetSizes)).toBeGreaterThanOrEqual(43);
  if(width===320 || width===1920){
   await page.screenshot({path:`test-results/screenshots/public-home-${width}-938u2.png`,fullPage:true});
  }
 }
});

test('summary period controls explain their state',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const month=page.locator('#hero [data-period="month"]');
 const week=page.locator('#hero [data-period="week"]');
 await expect(week).toHaveAttribute('aria-pressed','true');
 await month.click();
 await expect(page.locator('#hero [data-period="month"]')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#hero [data-period="week"]')).toHaveAttribute('aria-pressed','false');
 await expect(page.locator('#hero')).toContainText('Resultado do fluxo');
});
