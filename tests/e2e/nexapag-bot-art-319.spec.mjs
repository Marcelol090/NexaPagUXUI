import {test,expect} from '@playwright/test';

test('V3.19 uses 12-frame artworks and places all financial amounts above their characters',async({page})=>{
 const errors=[];const assets=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',res=>{if(res.url().includes('nexapag-bot-'))assets.push({url:res.url(),status:res.status()})});
 await page.setViewportSize({width:390,height:844});
 await page.goto('/v2.html');
 await expect.poll(()=>page.evaluate(()=>window.NexaOrbFlowV35?.version)).toBe('3.19-animated-art-orbs');
 const data=[['income','1,9 mil','1.950,00'],['spending','3,4 mil','3.468,20'],['refund','349,90','349,90']];
 for(const [kind,compact,full] of data){
  const button=page.locator('#compactHero button[data-bot-kind="'+kind+'"]');
  await expect(button).toHaveAttribute('aria-label',new RegExp(full.replace('.','\\.') ));
  await expect(button.locator('.orb-metric')).toContainText(compact);
  await expect(button.locator('.orb-bot-art')).toHaveCount(1);
  const bg=await button.locator('.orb-bot-art').evaluate(el=>getComputedStyle(el).backgroundImage);
  expect(bg).not.toBe('none');
  const amount=await button.locator('.orb-metric').boundingBox();
  const orb=await button.locator('.jelly').boundingBox();
  const label=await button.locator(':scope > span:last-child').boundingBox();
  expect(amount.y+amount.height).toBeLessThanOrEqual(orb.y+4);
  expect(orb.y+orb.height).toBeLessThanOrEqual(label.y+6);
 }
 expect(assets.filter(x=>x.status===200&&x.url.includes('v319')&&x.url.endsWith('.webp')).length).toBeGreaterThanOrEqual(3);
 await page.locator('[data-orb-story="income"]').click();
 await expect(page.locator('.orb-fluid-ghost .orb-bot-flight-poster')).toHaveCount(1);
 await expect(page.getByRole('region',{name:'Dinheiro que entrou.'})).toBeVisible();
 await page.locator('#orbStoryLayer [data-orb-switch="spending"]').click();
 await expect(page.locator('#homePage')).toHaveClass(/hero-expanded/);
 await expect(page.locator('.orb-fluid-ghost')).toHaveCount(0,{timeout:3500});
 expect(errors).toEqual([]);
});

test('V3.19 reduced motion uses first-frame poster and fits 320px',async({page})=>{
 await page.setViewportSize({width:320,height:740});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/v2.html');
 for(const kind of ['income','spending','refund']){
  const orb=page.locator('#compactHero button[data-bot-kind="'+kind+'"]');
  await expect(orb.locator('.orb-bot-art')).toHaveCount(1);
  const image=await orb.locator('.orb-bot-art').evaluate(el=>getComputedStyle(el).backgroundImage);
  expect(image).not.toBe('none');
  await expect(orb.locator('.orb-metric')).toBeVisible();
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
 await page.locator('[data-orb-story="refund"]').click();
 await expect(page.getByRole('region',{name:'Valor recuperado.'})).toBeVisible();
 await expect(page.locator('.orb-fluid-ghost')).toHaveCount(0);
 await expect(page.locator('#dock button')).toHaveCount(5);
});
