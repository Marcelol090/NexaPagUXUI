import {test,expect} from '@playwright/test';
for(const width of [320,390,430]){
 test('V3.11 same-screen liquid disclosure without popup at '+width+'px',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:844});
  await page.goto('/v2.html');
  await expect.poll(()=>page.evaluate(()=>window.NexaOrbFlowV35?.version)).toBe('3.11-inline');
  await expect(page.locator('.greeting')).toBeVisible();
  const before=await page.locator('.greeting').boundingBox();
  for(const [kind,label] of [['income','Dinheiro que entrou.'],['refund','Valor recuperado.']]){
   await page.locator('[data-orb-story="'+kind+'"]').click();
   const section=page.locator('#orbStoryLayer');
   await expect(section).toBeVisible();
   await expect(section).toHaveAttribute('role','region');
   await expect(section).not.toHaveAttribute('aria-modal','true');
   await expect(section.locator('.orb-story-backdrop')).toHaveCount(0);
   await expect(section).toContainText(label);
   expect(await section.evaluate(x=>x.parentElement.id)).toBe('heroRegion');
   expect(await page.evaluate(()=>window.NexaOrbFlowV35.inline)).toBe(true);
   const ghost=page.locator('.orb-fluid-ghost[data-kind="'+kind+'"]');
   await expect(ghost).toHaveCount(1);
   const poses=await ghost.evaluate(el=>el.getAnimations()[0]?.effect?.getKeyframes()||[]);
   expect(poses).toHaveLength(16);
   await expect(ghost).toHaveCount(0,{timeout:3200});
   const during=await page.locator('.greeting').boundingBox();
   expect(during.y).toBeGreaterThan(before.y+55);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
   await page.locator('[data-orb-close]').click();
   await expect(section).toHaveCount(0,{timeout:3200});
   await expect(page.locator('[data-orb-story="'+kind+'"]')).toHaveAttribute('aria-expanded','false');
  }
  await page.locator('[data-open="1"]').click();
  await expect(page.locator('#homePage')).toHaveClass(/hero-expanded/);
  await expect(page.locator('.orb-story-backdrop')).toHaveCount(0);
  await expect(page.locator('.carousel-slide.current')).toBeVisible();
  await page.getByRole('button',{name:'Recolher os cartões'}).click();
  await expect(page.locator('#homePage')).not.toHaveClass(/hero-expanded/,{timeout:3200});
  expect(errors).toEqual([]);
 });
}
test('V3.11 dark/reduced motion preserves inline placement, fixed dock and semantics',async({page})=>{
 await page.setViewportSize({width:320,height:700});
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/v2.html');
 await page.locator('#themeToggle').click();
 await expect(page.locator('.phone')).toHaveAttribute('data-ui-theme','dark');
 await page.locator('[data-orb-story="income"]').click();
 await expect(page.getByRole('region',{name:'Dinheiro que entrou.'})).toBeVisible();
 await expect(page.locator('.orb-fluid-ghost')).toHaveCount(0);
 await expect(page.locator('#orbStoryLayer')).toHaveCount(1);
 await expect(page.locator('.orb-story-backdrop')).toHaveCount(0);
 await page.keyboard.press('Escape');
 await expect(page.locator('#orbStoryLayer')).toHaveCount(0);
 await expect(page.locator('#dock button')).toHaveCount(5);
});
