import {test,expect} from '@playwright/test';

test('Motion Studio controls the real cards and respects rigid desktop geometry',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/');
 await expect(page.locator('#nexaMotionStudio')).toHaveCount(1);
 const before=await page.locator('#phone').boundingBox();
 await page.locator('#inspector-tab-motion').click();
 await expect(page.locator('#nexaMotionStudio')).toBeVisible();
 await page.locator('[data-nm-key="duration"]').evaluate(input=>{
  input.value='430';input.dispatchEvent(new Event('input',{bubbles:true}));
 });
 await expect(page.locator('[data-nm-output="duration"]')).toHaveText('430 ms');
 expect(await page.locator('#phone').evaluate(el=>el.style.getPropertyValue('--nm-duration'))).toBe('430ms');
 await page.locator('[data-nm-key="shadow"]').evaluate(input=>{
  input.value='75';input.dispatchEvent(new Event('input',{bubbles:true}));
 });
 await expect(page.locator('#phone')).toHaveAttribute('data-nm-shadow','');
 await page.locator('#nmReplay').click();
 await expect(page.locator('#nmStatus')).toContainText('componentes');
 const after=await page.locator('#phone').boundingBox();
 expect(Math.abs(before.width-after.width)).toBeLessThan(1);
 expect(Math.abs(before.height-after.height)).toBeLessThan(1);
 await page.locator('#nmReset').click();
 await expect(page.locator('#phone')).not.toHaveAttribute('data-nm-shadow');
 await expect(page.locator('[data-nm-output="duration"]')).toHaveText('260 ms');
});

test('320px device retains accessible Motion Workbench controls',async({page})=>{
 await page.setViewportSize({width:320,height:700});
 await page.goto('/');
 const open=page.locator('.inspector-open-button');
 await expect(open).toBeVisible();
 await open.click();
 await page.locator('#inspector-tab-motion').click();
 await expect(page.locator('#nexaMotionStudio')).toBeVisible();
 await expect(page.locator('#nmReplay')).toBeVisible();
 await page.locator('[data-nm-preset="suave"]').click();
 await expect(page.locator('[data-nm-output="duration"]')).toHaveText('210 ms');
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 expect(overflow).toBeLessThanOrEqual(1);
});

test('prefers-reduced-motion blocks playback but keeps the design adjustable',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');
 await page.locator('#inspector-tab-motion').click();
 await page.locator('#nmReplay').click();
 await expect(page.locator('#nmStatus')).toContainText('reduzido');
 expect(await page.evaluate(()=>window.NexaPagMotionStudio.inspect().enabled)).toBe(false);
 await page.locator('[data-nm-preset="editorial"]').click();
 await expect(page.locator('[data-nm-output="duration"]')).toHaveText('380 ms');
});
