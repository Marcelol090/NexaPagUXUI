import {test,expect} from '@playwright/test';
const rgb=raw=>raw.slice(raw.indexOf('(')+1,raw.indexOf(')')).split(',').slice(0,3).map(v=>Number(v.trim()));
const luminance=c=>c.map(v=>{v=v/255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const hex=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));
test('V3.3 pastel MP4 slides keep dark readable ink inside dark shell',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:390,height:844});
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/v2.html');
 await page.locator('#themeToggle').click();await page.locator('[data-open="1"]').first().click();
 await expect(page.locator('.phone')).toHaveAttribute('data-ui-theme','dark');
 await expect(page.locator('.carousel-slide')).toHaveCount(3);
 for(const [kind,bg] of [['sun','#f6ab88'],['moon','#e2daf4'],['forest','#d6e5c9']]){
  const card=page.locator('.carousel-slide.'+kind);
  for(const selector of ['.slide-timer','.slide-text h3','.slide-text p','.slide-chip']){
   const raw=await card.locator(selector).first().evaluate(el=>getComputedStyle(el).color);
   expect(ratio(rgb(raw),hex(bg)),kind+' '+selector).toBeGreaterThanOrEqual(4.5);
  }
 }
 await page.locator('#themeToggle').click();
 await expect(page.locator('.phone')).toHaveAttribute('data-ui-theme','light');
 expect(errors).toEqual([]);
});
for(const width of [320,390,1440]){
 test('V3.3 dark metadata legible in five tabs at '+width+'px',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:844});await page.goto('/v2.html');
  await page.locator('#themeToggle').click();
  for(const [tab,selector,bg] of [
   ['home','.greeting p','#15231b'],['home','.week-title em','#203629'],
   ['ads','.offer-card p','#1d2b22'],['review','.review-item p','#1d2b22']]){
   await page.locator('#dock button[data-tab="'+tab+'"]').click();
   const raw=await page.locator(selector).first().evaluate(el=>getComputedStyle(el).color);
   expect(ratio(rgb(raw),hex(bg)),tab+' '+selector).toBeGreaterThanOrEqual(4.5);
  }
  await page.locator('#dock button[data-tab="cards"]').click();
  await expect(page.locator('.wallet-folder')).toHaveCount(4);
  await page.locator('#dock button[data-tab="expenses"]').click();
  await expect(page.locator('.category-v29')).toHaveCount(4);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
  expect(errors).toEqual([]);
 });
}
