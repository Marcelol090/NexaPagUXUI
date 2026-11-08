import {test,expect} from '@playwright/test';
test('V3.18 three distinct Bot-inspired shapes with value and continuous reaction',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/v2.html');
 await expect.poll(()=>page.evaluate(()=>window.NexaOrbFlowV35?.version)).toBe('3.19-animated-art-orbs');
 const types=await page.locator('#compactHero .milestone').evaluateAll(buttons=>
  buttons.map(button=>({
   kind:button.dataset.botKind,
   shape:button.querySelector('.jelly')?.style.clipPath,
   amount:button.querySelector('.orb-bot-amount')?.textContent,
   eyes:button.querySelectorAll('.orb-bot-eye').length,
   idle:button.querySelector('.orb-bot-art')?1:0
  })));
 expect(types).toHaveLength(3);
 expect(types.map(x=>x.kind)).toEqual(['income','spending','refund']);
 expect(types.map(x=>x.amount)).toEqual(['1,9k','3,4k','350']);
 expect(types.every(x=>x.eyes===2&&x.idle===1&&x.shape.startsWith('polygon('))).toBe(true);
 expect(new Set(types.map(x=>x.shape)).size).toBe(3);
 await page.locator('[data-orb-story="income"]').click();
 const flight=page.locator('.orb-fluid-ghost[data-kind="income"]');
 await expect(flight).toHaveCount(1);
 await expect(flight.locator('.orb-bot-flight-identity')).toHaveCount(1);
 const first=await flight.evaluate(el=>el.getAnimations()[0].effect.getKeyframes()[0].clipPath);
 expect(first).toBe(types[0].shape);
 await expect(flight).toHaveCount(0,{timeout:3500});
 await page.locator('#orbStoryLayer [data-orb-switch="spending"]').click();
 await expect(page.locator('#homePage')).toHaveClass(/hero-expanded/,{timeout:3500});
 await expect(page.locator('.orb-fluid-ghost')).toHaveCount(0,{timeout:3500});
 await page.getByRole('button',{name:'Recolher os cartões'}).click();
 await expect(page.locator('#homePage')).not.toHaveClass(/hero-expanded/,{timeout:3500});
});
test('V3.18 reduced motion keeps shape, value and 5-tab navigation',async({page})=>{
 await page.setViewportSize({width:320,height:740});
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/v2.html');
 await expect(page.locator('#compactHero .jelly.bot-orb')).toHaveCount(3);
 const orbs=await page.locator('#compactHero .jelly.bot-orb').evaluateAll(nodes=>
   nodes.map(node=>({clip:node.style.clipPath,animations:node.getAnimations().filter(a=>a.id.startsWith('nexapag-bot-idle-')).length})));
 expect(new Set(orbs.map(x=>x.clip)).size).toBe(3);
 expect(orbs.every(x=>x.animations===0)).toBe(true);
 await page.locator('[data-orb-story="refund"]').click();
 await expect(page.getByRole('region',{name:'Valor recuperado.'})).toBeVisible();
 await expect(page.locator('.orb-fluid-ghost')).toHaveCount(0);
 await expect(page.locator('#dock button')).toHaveCount(5);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await expect(page.locator('#compactHero .orb-bot-identity')).toHaveCount(3);
 await expect.poll(()=>page.locator('#compactHero .jelly.bot-orb').evaluateAll(nodes=>
  nodes.every(node=>Boolean(node.querySelector('.orb-bot-art'))))).toBe(true);
});
test('V3.18 reinitializes character shape after switching tabs',async({page})=>{
 await page.goto('/v2.html');
 await page.locator('#dock [data-tab="expenses"]').click();
 await page.locator('#dock [data-tab="home"]').click();
 await expect(page.locator('#compactHero .bot-orb')).toHaveCount(3);
 await expect(page.locator('#compactHero .orb-bot-identity')).toHaveCount(3);
});
