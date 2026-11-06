import {test,expect} from '@playwright/test';
test('V3.5 all three financial orbs morph with one ghost engine and return',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:390,height:844});await page.goto('/v2.html');
 for(const [key,selector,title] of [
  ['income','[data-orb-story="income"]','Dinheiro que entrou.'],
  ['refund','[data-orb-story="refund"]','Valor recuperado.']]){
  await page.locator(selector).click();
  await expect(page.locator('.orb-fluid-ghost[data-kind="'+key+'"]')).toHaveCount(1);
  await expect(page.getByRole('dialog',{name:title})).toBeVisible();
  await expect(page.locator('.orb-fluid-ghost')).toHaveCount(0,{timeout:3200});
  await expect(page.locator('.orb-story-ruler i')).toHaveCount(45);
  await page.keyboard.press('Escape');
  await expect(page.locator('.orb-fluid-ghost[data-kind="'+key+'"]')).toHaveCount(1);
  await expect(page.getByRole('dialog')).toHaveCount(0,{timeout:3200});
  await expect(page.locator('.orb-fluid-ghost')).toHaveCount(0);
 }
 await page.locator('[data-open="1"]').click();
 await expect(page.locator('.orb-fluid-ghost[data-kind="spending"]')).toHaveCount(1);
 await expect(page.locator('#homePage')).toHaveClass(/hero-expanded/);
 await expect(page.locator('.orb-fluid-ghost')).toHaveCount(0,{timeout:3200});
 await page.getByRole('button',{name:'Recolher os cartões'}).click();
 await expect(page.locator('.orb-fluid-ghost[data-kind="spending"]')).toHaveCount(1);
 await expect(page.locator('#homePage')).not.toHaveClass(/hero-expanded/);
 await expect(page.locator('.orb-fluid-ghost')).toHaveCount(0,{timeout:3200});
 await expect(page.locator('#compactHero .milestone')).toHaveCount(3);
 expect(errors).toEqual([]);
});
test('V3.5 preserves functional historical summaries and reduced-motion contrast',async({page})=>{
 await page.setViewportSize({width:320,height:700});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/v2.html');await page.locator('#themeToggle').click();
 for(const [kind,value] of [['income','1.950,00'],['refund','349,90']]){
  await page.locator('[data-orb-story="'+kind+'"]').click();
  await expect(page.locator('.orb-fluid-ghost')).toHaveCount(0);
  await expect(page.locator('#orbStoryLayer')).toContainText(value);
  await expect(page.locator('.orb-story-labels span')).toHaveCount(3);
  await page.keyboard.press('Escape');
  await expect(page.locator('#orbStoryLayer')).toHaveCount(0);
 }
 await page.locator('[data-open="1"]').click();
 await expect(page.locator('#homePage')).toHaveClass(/hero-expanded/);
 await page.locator('[data-action="next"]').click();
 await expect(page.locator('.carousel-slide.current')).toHaveAttribute('data-slide','1');
 await page.getByRole('button',{name:'Recolher os cartões'}).click();
 await expect(page.locator('#homePage')).not.toHaveClass(/hero-expanded/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
});
