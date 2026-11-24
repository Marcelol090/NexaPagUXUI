import {test,expect} from '@playwright/test';

for(const width of [320,390,430]){
 test('V3.36 preserved context, immediate data and review feedback '+width,async({page},info)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:844});await page.goto('/v2.html');
  const dock=page.locator('#dock');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.NexaMotion336))).toBe(true);
  await dock.locator('[data-tab="expenses"]').click();
  await page.locator('[data-category-toggle="Compras"]').click();
  await expect(page.locator('[data-category-toggle="Compras"]')).toHaveAttribute('aria-expanded','true');
  await page.evaluate(()=>{document.querySelector('.category-stack-list').dataset.identity='retained';document.querySelector('#calendarDetail').dataset.identity='retained'});
  await page.locator('[data-period="Mês"]').click();
  await expect(page.locator('[data-period="Mês"]')).toBeFocused();
  await expect(page.locator('#expressionInteger')).toHaveText('3.468');
  await expect(page.locator('#expressionCents')).toHaveText(',20');
  await expect(page.locator('.category-stack-list')).toHaveAttribute('data-identity','retained');
  await expect(page.locator('#calendarDetail')).toHaveAttribute('data-identity','retained');
  await expect(page.locator('[data-category-toggle="Compras"]')).toHaveAttribute('aria-expanded','true');
  await expect(page.locator('#graphPath')).toHaveCSS('stroke-dashoffset','0px');
  await expect(page.locator('#graphPath')).toBeAttached();
  expect(await page.locator('#spendingChart').evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(2);
  await page.locator('[data-action="graphReplay"]').click();
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('#graphPath')).toHaveCSS('stroke-dashoffset','0px');
  await dock.locator('[data-tab="ads"]').click();
  await page.locator('[data-action="adDemo"]').click();
  await expect(page.locator('#toast')).toContainText('Conectores externos não estão ativos');
  await dock.locator('[data-tab="cards"]').click();
  await expect(page.locator('.wallet-live')).toBeVisible();
  await dock.locator('[data-tab="review"]').click();
  await page.evaluate(()=>document.querySelector('.review-item').dataset.identity='retained');
  await page.locator('[data-review="0"]').click();
  await expect(page.locator('#reviewRemaining')).toHaveText('2');
  await expect(page.locator('.review-item').first()).toHaveAttribute('data-identity','retained');
  await expect(page.locator('[data-review="0"]')).toBeDisabled();
  await page.locator('[data-review="1"]').click();
  await page.locator('[data-review="2"]').click();
  await expect(page.locator('#reviewRemaining')).toHaveText('0');
  await expect(page.locator('.empty-state')).toContainText('Tudo revisado');
  await dock.locator('[data-tab="home"]').click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
  expect(errors).toEqual([]);
  if(width===390)await page.locator('.phone').screenshot({path:info.outputPath('home-final.png'),animations:'disabled'});
 });
}

test('V3.36 morph uses elapsed time and settles on reduced motion',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/v2.html');
 await expect.poll(()=>page.evaluate(()=>Boolean(window.NexaOrbFlowV35))).toBe(true);
 await page.locator('[data-orb-story="income"]').click();
 const ghost=page.locator('.orb-fluid-ghost[data-kind="income"]');
 await expect(ghost).toHaveCount(1);
 const clock=await ghost.evaluate(el=>{const a=el.getAnimations()[0];return {duration:a.effect.getTiming().duration,frames:a.effect.getKeyframes().length}});
 expect(clock.duration).toBe(540);expect(clock.frames).toBe(49);
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(ghost).toHaveCount(0);
 await expect(page.locator('#orbStoryLayer')).toHaveClass(/is-content-ready/);
 await page.keyboard.press('Escape');
 await expect(page.locator('#orbStoryLayer')).toHaveCount(0);
 await expect(page.locator('.greeting')).toBeVisible();
});
