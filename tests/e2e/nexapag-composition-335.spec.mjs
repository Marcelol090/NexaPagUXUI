import {test,expect} from '@playwright/test';
for(const width of [320,390,430,1440]){
 test('V3.35 composition rails, keylines and optical centers '+width,async({page},info)=>{
  await page.setViewportSize({width,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/v2.html');
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const phone=page.locator('.phone');
  for(const theme of ['light','dark']){
   if(await phone.getAttribute('data-ui-theme')!==theme)await page.locator('#themeToggle').click();
   for(const [tab,selectors] of [
    ['home',['.week','.daily-note','.transactions']],['expenses',['.category-v29','.calendar-surface','.expense-expression','.spending-chart']],
    ['ads',['.overview','.offer-card']],['cards',['.wallet-live','.wallet-selected-summary']],['review',['.overview','.review-item']]]){
    await page.locator('#dock [data-tab="'+tab+'"]').click();
    const audit=await page.evaluate(selectors=>{
     const sc=document.querySelector('#scroller'),r=sc.getBoundingClientRect(),s=getComputedStyle(sc);
     const left=r.left+parseFloat(s.paddingLeft),right=r.right-parseFloat(s.paddingRight);
     return selectors.flatMap(sel=>Array.from(document.querySelectorAll(sel)).map(el=>{
      const b=el.getBoundingClientRect(),st=getComputedStyle(el);
      return {sel,dl:Math.abs(b.left-left),dr:Math.abs(b.right-right),radius:st.borderTopLeftRadius,border:st.borderTopWidth,overflow:el.scrollWidth-el.clientWidth};
     }));
    },selectors);
    expect(audit.length).toBeGreaterThanOrEqual(selectors.length);
    for(const item of audit){expect(item.dl,item.sel+' left').toBeLessThanOrEqual(2);expect(item.dr,item.sel+' right').toBeLessThanOrEqual(2);expect(item.radius,item.sel).toBe('22px');expect(item.border,item.sel).toBe('1px');expect(item.overflow,item.sel).toBeLessThanOrEqual(2)}
    if(tab==='home'){
     const g=await page.locator('.money-insights').evaluate(el=>{
      const rect=s=>[...el.querySelectorAll(s)].map(e=>e.getBoundingClientRect());
      const cards=rect('.money-insight'),values=rect('.insight-amount');
      return {height:Math.abs(cards[0].height-cards[1].height),valueY:Math.abs(values[0].top-values[1].top)};
     });
     expect(g.height).toBeLessThanOrEqual(1);expect(g.valueY).toBeLessThanOrEqual(1);
    }
    if(tab==='review'){
     const centers=await page.locator('.review-glyph').evaluateAll(els=>els.map(el=>{const b=el.getBoundingClientRect(),g=el.querySelector('svg').getBoundingClientRect();return [Math.abs((b.left+b.width/2)-(g.left+g.width/2)),Math.abs((b.top+b.height/2)-(g.top+g.height/2))]}));
     for(const c of centers)expect(Math.max(...c)).toBeLessThanOrEqual(1);
    }
    if(width===390)await phone.screenshot({path:info.outputPath(theme+'-'+tab+'.png'),animations:'disabled'});
   }
  }
  expect(errors).toEqual([]);
 });
}
