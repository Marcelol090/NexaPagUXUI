import { test, expect } from '@playwright/test';
const microbots=['alimentacao','compras','transporte','casa'];

test('V2.6 generates distinct shape morphs with real WebP and static icons',async({page,request})=>{
  for(const slug of microbots){
    const [morph,final]=await Promise.all([request.get('/assets/microbot-'+slug+'.webp'),request.get('/assets/microbot-'+slug+'-last.png')]);
    expect(morph.ok()).toBe(true);expect(final.ok()).toBe(true);
    expect((await morph.body()).length).toBeGreaterThan(20000);
    expect(morph.headers()['content-type']).toContain('image/webp');
  }
  await page.setViewportSize({width:390,height:844});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/v2.html');
  await expect.poll(()=>page.evaluate(()=>typeof window.NexaPagMicrobots)).toBe('object');
  await page.locator('#dock button[data-tab="expenses"]').click();
  const bots=page.locator('.category-morph');
  await expect(bots).toHaveCount(4);
  expect(await bots.evaluateAll(els=>els.map(e=>e.dataset.shape))).toEqual(['droplet','rectangle','triangle','pentagon']);
  await expect(page.locator('.category-morph-film')).toHaveCount(4);
  await expect(page.locator('.category-morph-final')).toHaveCount(4);
  await bots.first().scrollIntoViewIfNeeded();
  await expect.poll(()=>bots.first().getAttribute('data-motion-state'),{timeout:3500}).toBe('playing');
  await expect.poll(()=>bots.first().getAttribute('data-motion-state'),{timeout:5000}).toBe('complete');
  expect(await bots.first().locator('.category-morph-final').evaluate(e=>e.naturalWidth)).toBe(144);
  await bots.first().click();
  await expect.poll(()=>bots.first().getAttribute('data-motion-state')).toBe('playing');
  await expect.poll(()=>bots.first().getAttribute('data-motion-state'),{timeout:5000}).toBe('complete');
  const size=await bots.first().evaluate(e=>[e.getBoundingClientRect().width,e.getBoundingClientRect().height]);
  expect(size).toEqual([44,44]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
  expect(errors).toEqual([]);
});

test('V2.6 reduced motion displays a static finished icon immediately',async({page})=>{
  await page.setViewportSize({width:320,height:700});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/v2.html');
  await expect.poll(()=>page.evaluate(()=>typeof window.NexaPagMicrobots)).toBe('object');
  await page.locator('#dock button[data-tab="expenses"]').click();
  const first=page.locator('.category-morph').first();
  await first.scrollIntoViewIfNeeded();
  await first.click();
  await expect(first).not.toHaveClass(/is-playing/);
  expect(await first.locator('.category-morph-final').evaluate(e=>getComputedStyle(e).opacity)).toBe('1');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
});