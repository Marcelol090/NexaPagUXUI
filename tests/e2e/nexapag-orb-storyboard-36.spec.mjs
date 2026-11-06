import {test,expect} from '@playwright/test';
test('V3.6 matches twelve-frame story: equal responsive orbs with reversible GPU morphs',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:390,height:844});
 await page.goto('/v2.html');
 await expect(page.locator('#compactHero .milestone')).toHaveCount(3);
 const sizes=await page.locator('#compactHero .jelly').evaluateAll(list=>list.map(el=>Math.round(el.getBoundingClientRect().width)));
 expect(Math.max(...sizes)-Math.min(...sizes)).toBeLessThanOrEqual(1);
 expect(sizes[0]).toBeGreaterThanOrEqual(76);
 for(const [kind,button,title] of [
   ['income','[data-orb-story="income"]','Dinheiro que entrou.'],
   ['refund','[data-orb-story="refund"]','Valor recuperado.']
 ]){
  await page.locator(button).click();
  const ghost=page.locator('.orb-fluid-ghost[data-kind="'+kind+'"]');
  await expect(ghost).toHaveCount(1);
  const frames=await ghost.evaluate(el=>el.getAnimations()[0]?.effect?.getKeyframes()||[]);
  expect(frames.length).toBeGreaterThanOrEqual(8);
  expect(frames.every(frame=>frame.transform?.includes('translate3d')&&frame.transform?.includes('scale3d'))).toBe(true);
  expect(frames.every(frame=>!('width' in frame)&&!('height' in frame)&&!('top' in frame)&&!('left' in frame))).toBe(true);
  await expect(page.getByRole('region',{name:title})).toBeVisible();
  await expect(ghost).toHaveCount(0,{timeout:3600});
  await page.keyboard.press('Escape');
  await expect(page.locator('.orb-fluid-ghost[data-kind="'+kind+'"]')).toHaveCount(1);
  await expect(page.locator('#orbStoryLayer')).toHaveCount(0,{timeout:3600});
  await expect(page.locator(button)).toHaveAttribute('aria-expanded','false');
 }
 await page.locator('[data-open="1"]').click();
 const spending=page.locator('.orb-fluid-ghost[data-kind="spending"]');
 await expect(spending).toHaveCount(1);
 await expect(page.locator('#homePage')).toHaveClass(/hero-expanded/);
 await expect(spending).toHaveCount(0,{timeout:3600});
 await expect(page.locator('.carousel-slide')).toHaveCount(3);
 await page.getByRole('button',{name:'Recolher os cartões'}).click();
 await expect(page.locator('.orb-fluid-ghost[data-kind="spending"]')).toHaveCount(1);
 await expect(page.locator('#homePage')).not.toHaveClass(/hero-expanded/);
 await expect(page.locator('.orb-fluid-ghost')).toHaveCount(0,{timeout:3600});
 await expect(page.locator('[data-open="1"]')).toHaveAttribute('aria-expanded','false');
 // Keyboard closing must use the same reverse morph; no instant CSS collapse.
 await page.locator('[data-open="1"]').click();
 await expect(page.locator('.orb-fluid-ghost[data-kind="spending"]')).toHaveCount(0,{timeout:3600});
 await page.locator('#carouselViewport').focus();
 await page.keyboard.press('Escape');
 await expect(page.locator('.orb-fluid-ghost[data-kind="spending"]')).toHaveCount(1);
 await expect(page.locator('.orb-fluid-ghost')).toHaveCount(0,{timeout:3600});
 await expect(page.locator('#homePage')).not.toHaveClass(/hero-expanded/);
 expect(errors).toEqual([]);
});
test('V3.6 reduced-motion keeps all three cards functional, without ghost',async({page})=>{
 await page.setViewportSize({width:320,height:700});
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/v2.html');
 for(const [kind,value] of [['income','1.950,00'],['refund','349,90']]){
  await page.locator('[data-orb-story="'+kind+'"]').click();
  await expect(page.locator('.orb-fluid-ghost')).toHaveCount(0);
  await expect(page.locator('#orbStoryLayer')).toContainText(value);
  await page.keyboard.press('Escape');
  await expect(page.locator('#orbStoryLayer')).toHaveCount(0);
 }
 await page.locator('[data-open="1"]').click();
 await expect(page.locator('#homePage')).toHaveClass(/hero-expanded/);
 await expect(page.locator('.orb-fluid-ghost')).toHaveCount(0);
 await page.getByRole('button',{name:'Recolher os cartões'}).click();
 await expect(page.locator('#homePage')).not.toHaveClass(/hero-expanded/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
});
