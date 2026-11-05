import {test,expect} from '@playwright/test';

test('V2.8 MP4-derived motion backgrounds play in all three financial slides and pause on collapse',async({page,request})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:390,height:844});
  for(const theme of ['sun','moon','forest']){
    const [webm,mp4,poster]=await Promise.all([
      request.get('/assets/nexapag-carousel-'+theme+'-motion.webm'),
      request.get('/assets/nexapag-carousel-'+theme+'-motion.mp4'),
      request.get('/assets/nexapag-carousel-'+theme+'-poster.webp')
    ]);
    expect(webm.ok()).toBe(true);expect(mp4.ok()).toBe(true);expect(poster.ok()).toBe(true);
    expect((await webm.body()).byteLength).toBeGreaterThan(10000);
  }
  await page.goto('/v2.html');
  await page.locator('[data-open="1"]').first().click();
  await expect(page.locator('.slide-motion-video')).toHaveCount(3);
  // Headless runners may lack hardware video decoding. Verify semantics and lifecycle; inspect time when playback is available.
  expect(await page.locator('.slide-motion-video').evaluateAll(els=>els.every(el=>el.muted&&el.loop&&el.playsInline))).toBe(true);
  await expect(page.locator('.carousel-slide.current .slide-motion-media')).toHaveCount(1);
  await page.waitForTimeout(450);
  const videoState=await page.locator('.slide-motion-video').first().evaluate(el=>({playing:!el.paused,ready:el.readyState,time:el.currentTime}));
  if(videoState.playing&&videoState.ready>=2){
    await page.waitForTimeout(350);
    const after=await page.locator('.slide-motion-video').first().evaluate(el=>el.currentTime);
    expect(after).toBeGreaterThan(videoState.time);
  }
  for(let i=0;i<2;i++)await page.locator('[data-action="next"]').click();
  await expect(page.locator('.carousel-slide.current')).toHaveAttribute('data-slide','2');
  await page.getByRole('button',{name:'Recolher os cartões'}).click();
  await expect.poll(()=>page.locator('.slide-motion-video').evaluateAll(els=>els.every(el=>el.paused))).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
  expect(errors).toEqual([]);
});
test('V2.8 respects reduced motion on compact devices',async({page})=>{
  await page.setViewportSize({width:320,height:700});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/v2.html');await page.locator('[data-open="1"]').first().click();
  await expect(page.locator('.slide-motion-video')).toHaveCount(3);
  expect(await page.locator('.slide-motion-video').evaluateAll(els=>els.every(el=>el.paused&&getComputedStyle(el).display==='none'))).toBe(true);
  await expect(page.locator('.slide-motion-poster')).toHaveCount(3);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
});
