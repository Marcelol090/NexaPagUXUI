import {test,expect} from '@playwright/test';
test('V3.7 animates 16 explicit fluid poses for all 3 financial orbs',async({page})=>{
 const errors=[];page.on('pageerror',err=>errors.push(err.message));
 await page.setViewportSize({width:390,height:844});
 await page.goto('/v2.html');
 for(const [kind,selector,dialog] of [
  ['income','[data-orb-story="income"]','Dinheiro que entrou.'],
  ['refund','[data-orb-story="refund"]','Valor recuperado.']]){
  await page.locator(selector).click();
  const ghost=page.locator('.orb-fluid-ghost[data-kind="'+kind+'"]');
  await expect(ghost).toHaveCount(1);
  const keyframes=await ghost.evaluate(el=>el.getAnimations()[0]?.effect?.getKeyframes()||[]);
  expect(keyframes).toHaveLength(16);
  expect(keyframes.every(f=>f.transform?.includes('translate3d')&&f.transform?.includes('scale3d'))).toBe(true);
  expect(keyframes.every(f=>f.clipPath?.startsWith('polygon('))).toBe(true);
  await expect(page.getByRole('dialog',{name:dialog})).toBeVisible();
  await expect(page.locator('.orb-story-layer.is-content-ready')).toHaveCount(1,{timeout:3500});
  await expect(ghost).toHaveCount(0,{timeout:3500});
  await page.keyboard.press('Escape');
  await expect(page.locator('.orb-fluid-ghost[data-kind="'+kind+'"]')).toHaveCount(1);
  await expect(page.getByRole('dialog')).toHaveCount(0,{timeout:3500});
  await expect(page.locator(selector)).toHaveAttribute('aria-expanded','false');
 }
 await page.locator('[data-open="1"]').click();
 const spending=page.locator('.orb-fluid-ghost[data-kind="spending"]');
 await expect(spending).toHaveCount(1);
 const k=await spending.evaluate(el=>el.getAnimations()[0]?.effect?.getKeyframes()||[]);
 expect(k).toHaveLength(16);
 await expect(page.locator('#homePage')).toHaveClass(/hero-expanded/);
 await expect(spending).toHaveCount(0,{timeout:3500});
 await page.getByRole('button',{name:'Recolher os cartões'}).click();
 await expect(page.locator('.orb-fluid-ghost[data-kind="spending"]')).toHaveCount(1);
 await expect(page.locator('#homePage')).not.toHaveClass(/hero-expanded/);
 await expect(page.locator('.orb-fluid-ghost')).toHaveCount(0,{timeout:3500});
 expect(errors).toEqual([]);
});
test('V3.7 reduced motion retains functional cards and preserves the 5-tab shell',async({page})=>{
 await page.setViewportSize({width:320,height:700});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/v2.html');
 await expect(page.locator('#compactHero .milestone')).toHaveCount(3);
 for(const kind of ['income','refund']){
  const orb=page.locator('[data-orb-story="'+kind+'"]');
  await orb.click();
  await expect(page.locator('#orbStoryLayer')).toBeVisible();
  await expect(page.locator('.orb-fluid-ghost')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('#orbStoryLayer')).toHaveCount(0);
 }
 await page.locator('[data-open="1"]').click();
 await expect(page.locator('#homePage')).toHaveClass(/hero-expanded/);
 await page.keyboard.press('Escape');
 await expect(page.locator('#homePage')).not.toHaveClass(/hero-expanded/);
 await expect(page.locator('#dock button')).toHaveCount(5);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
});
