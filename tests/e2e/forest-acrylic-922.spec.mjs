import {test,expect} from '@playwright/test';

test('9.22 expression follows monthly loss and weekly budget, including user edits',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const hero=page.locator('#phone .fiduciary-hero');
 const expression=hero.locator('.flow-expression');
 await expect(hero).toHaveAttribute('data-flow-mood','negative');
 await expect(expression).toHaveAttribute('data-tone','negative');
 await expect(expression).toHaveAttribute('aria-label','Saídas superam entradas');
 await expect(hero.locator('.flow-expression-icon')).toHaveCount(1);
 await page.locator('[data-action="period-set"][data-value="week"]').click();
 await expect(hero).toHaveAttribute('data-flow-mood','positive');
 await expect(expression).toHaveAttribute('aria-label','Dentro da meta semanal');
 await expect(hero.locator('.hero-value')).toHaveText('R$ 270,00');
 await page.evaluate(()=>window.NexaPagPreview.setFinance({weeklyBudget:1200,weeklySpend:1400}));
 await expect(hero).toHaveAttribute('data-flow-mood','negative');
 await expect(expression).toHaveAttribute('aria-label','Acima da meta semanal');
 await expect(hero.locator('.hero-value')).toHaveText('R$ 1.400,00');
 await page.evaluate(()=>window.NexaPagPreview.setFinance({weeklyBudget:1200,weeklySpend:1050}));
 await expect(hero).toHaveAttribute('data-flow-mood','warning');
 const overflowing=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 expect(overflowing).toBeLessThanOrEqual(2);
});

test('9.22 matte separates acrylic from active Forest shader and keeps navigation quiet',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const state=await page.evaluate(()=>{
  const phone=document.querySelector('#phone');
  const hero=document.querySelector('#phone .fiduciary-hero');
  const nav=document.querySelector('#phone .nav');
  const active=document.querySelector('#phone .nav button.active');
  const inactive=document.querySelector('#phone .nav button:not(.active)');
  const css=getComputedStyle(hero);
  const face=getComputedStyle(document.querySelector('#phone .flow-expression'));
  const ambient=getComputedStyle(phone.querySelector('.ambient'),'::before');
  return {hasGlass:phone.hasAttribute('data-live-glass'),shader:!phone.classList.contains('no-shader'),
    materialAlpha:css.backgroundColor,blur:css.backdropFilter||css.webkitBackdropFilter,
    navDisplay:getComputedStyle(nav).display,navActiveColor:getComputedStyle(active).backgroundColor,
    inactiveLabel:getComputedStyle(inactive.querySelector('span:not(.icon)')).display,
    faceColor:face.color,ambientDisplay:ambient.display,navCount:nav.children.length};
 });
 expect(state.hasGlass).toBe(true);
 expect(state.shader).toBe(true);
 expect(state.blur).toContain('blur(');
 expect(state.materialAlpha).toMatch(/rgba/);
 expect(state.navDisplay).toBe('flex');
 expect(state.inactiveLabel).toBe('none');
 expect(state.navCount).toBe(5);
 expect(state.faceColor).toBe('rgb(242, 139, 145)');
 expect(state.ambientDisplay).not.toBe('none');
 const alpha=Number(state.materialAlpha.slice(state.materialAlpha.lastIndexOf(',')+1).replace(')','').trim());
 expect(alpha).toBeGreaterThan(.72);
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(page.locator('#phone .flow-expression')).toBeVisible();
});
