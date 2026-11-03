import { test, expect } from '@playwright/test';

test('public home serves complete 9.38 mobile interface, not legacy 9.22 lab',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await expect(page).toHaveTitle(/Visualize 9\.38/);
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
  expect(state.visible).toBe(false);
 }
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 expect(overflow).toBeLessThanOrEqual(2);
});

test('public 9.38 category grid, glass and five tabs are interactive',async({page})=>{
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


test('9.38 icon dock retains accessible names and 5 equal positions',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const nav=page.locator('#device .bottom-nav');
 const buttons=nav.locator('button');
 await expect(buttons).toHaveCount(5);
 const state=await nav.evaluate(el=>{
  const styles=getComputedStyle(el);
  const buttons=[...el.querySelectorAll('button')];
  return {
   display:styles.display,columns:styles.gridTemplateColumns.trim().split(/\s+/),
   labels:buttons.map(b=>({name:b.getAttribute('aria-label'),current:b.getAttribute('aria-current'),visible:getComputedStyle(b.querySelector('span')).display})),
   widths:buttons.map(b=>b.getBoundingClientRect().width),
   activeBackground:getComputedStyle(el.querySelector('button.active')).backgroundImage
  };
 });
 expect(state.display).toBe('grid');
 expect(state.columns).toHaveLength(5);
 expect(state.labels.map(item=>item.name)).toEqual(['Início','Gastos','Anúncios','Cartões','Revisar']);
 expect(state.labels.every(item=>item.visible==='none')).toBe(true);
 expect(Math.max(...state.widths)-Math.min(...state.widths)).toBeLessThanOrEqual(1);
 expect(state.activeBackground).toContain('gradient');
 await buttons.nth(2).click();
 await expect(buttons.nth(2)).toHaveAttribute('aria-current','page');
});

test('Workbench gradient strength changes actual category surface',async({page})=>{
 await page.setViewportSize({width:1440,height:960});
 await page.goto('/');
 const card=page.locator('#screenContent .quick-card.dash-card').first();
 const original=await card.evaluate(el=>getComputedStyle(el).backgroundImage);
 const slider=page.locator('#gradientStrengthRange');
 await slider.evaluate(el=>{
  el.value='44';
  el.dispatchEvent(new Event('input',{bubbles:true}));
 });
 await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--n938-gradient').trim())).toBe('0.44');
 const updated=await card.evaluate(el=>getComputedStyle(el).backgroundImage);
 expect(updated).not.toBe(original);
 await expect(page.locator('#gradientStrengthOutput')).toContainText('44');
});

test('narrow phone 320px shows only icons with 44px targets',async({page})=>{
 await page.setViewportSize({width:320,height:700});
 await page.goto('/');
 const state=await page.locator('#device .bottom-nav').evaluate(el=>({
   targets:[...el.querySelectorAll('button')].map(b=>Math.min(b.getBoundingClientRect().width,b.getBoundingClientRect().height)),
   labels:[...el.querySelectorAll('button span')].map(s=>getComputedStyle(s).display)
 }));
 expect(Math.min(...state.targets)).toBeGreaterThanOrEqual(43);
 expect(state.labels.every(item=>item==='none')).toBe(true);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 expect(overflow).toBeLessThanOrEqual(2);
});


test('9.38u1 compact mobile header removes branding and preserves toolbar actions',async({page})=>{
 const failures=[];
 page.on('pageerror',error=>failures.push(error.message));
 for(const width of [320,390,1920]){
  await page.setViewportSize({width,height:844});
  await page.goto('/');
  const header=page.locator('#device .app-header');
  await expect(header).toHaveClass(/app-header--compact/);
  await expect(header.locator('.brand')).toHaveCount(0);
  await expect(header).not.toContainText('NexaPag');
  await expect(header).not.toContainText('Seu dinheiro, com clareza');
  await expect(page.locator('#screenContent .screen-title h2')).toContainText('Seu dinheiro');
  await expect(header.locator('button')).toHaveCount(2);
  await expect(page.locator('#summaryShortcut')).toHaveCount(0);
  const geometry=await page.evaluate(()=>{
    const bar=document.querySelector('#device .app-header');
    const screen=document.querySelector('#device #screen');
    const buttons=[...bar.querySelectorAll('button')];
    return {height:bar.getBoundingClientRect().height,screenHeight:screen.getBoundingClientRect().height,
      widths:buttons.map(el=>el.getBoundingClientRect().width),
      overflow:document.documentElement.scrollWidth-window.innerWidth};
  });
  expect(geometry.height).toBeLessThanOrEqual(51);
  expect(geometry.screenHeight).toBeGreaterThan(400);
  expect(Math.min(...geometry.widths)).toBeGreaterThanOrEqual(42);
  expect(geometry.overflow).toBeLessThanOrEqual(2);
 }
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.getByRole('button',{name:'Abrir Workbench de design'}).click();
 await expect(page.locator('body')).toHaveClass(/drawer-open/);
 expect(failures).toEqual([]);
});
