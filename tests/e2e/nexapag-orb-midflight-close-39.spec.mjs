import {test,expect} from '@playwright/test';
test('V3.9 queues close during liquid expansion, all three orb flows',async({page})=>{
 const errs=[];page.on('pageerror',e=>errs.push(e.message));
 await page.setViewportSize({width:390,height:844});await page.goto('/v2.html');
 await expect.poll(()=>page.evaluate(()=>Boolean(window.NexaOrbFlowV35))).toBe(true);
 for(const kind of ['income','refund']){
  await page.locator('[data-orb-story="'+kind+'"]').click();
  await expect(page.locator('.orb-fluid-ghost[data-kind="'+kind+'"]')).toHaveCount(1);
  await page.locator('[data-orb-close]').last().click();
  await expect(page.locator('.orb-fluid-ghost')).toHaveCount(0,{timeout:4500});
  await expect(page.locator('#orbStoryLayer')).toHaveCount(0,{timeout:4500});
  await expect(page.locator('[data-orb-story="'+kind+'"]')).toHaveAttribute('aria-expanded','false');
 }
 await page.locator('[data-open="1"]').click();
 await expect(page.locator('#homePage')).toHaveClass(/hero-expanded/);
 await page.getByRole('button',{name:'Recolher os cartões'}).click();
 await expect(page.locator('#homePage')).not.toHaveClass(/hero-expanded/,{timeout:4500});
 await expect(page.locator('.orb-fluid-ghost')).toHaveCount(0,{timeout:4500});
 await page.locator('[data-orb-story="refund"]').click();
 await expect(page.getByRole('region',{name:'Valor recuperado.'})).toBeVisible();
 expect(errs).toEqual([]);
});
test('V3.9 Escape during opening is not swallowed and reduced motion remains stable',async({page})=>{
 await page.setViewportSize({width:320,height:740});await page.goto('/v2.html');
 await page.locator('[data-open="1"]').click();await page.keyboard.press('Escape');
 await expect(page.locator('#homePage')).not.toHaveClass(/hero-expanded/,{timeout:4500});
 await page.locator('[data-orb-story="income"]').click();await page.keyboard.press('Escape');
 await expect(page.locator('#orbStoryLayer')).toHaveCount(0,{timeout:4500});
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-orb-story="income"]').click();
 await expect(page.getByRole('region',{name:'Dinheiro que entrou.'})).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.locator('#orbStoryLayer')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
});
