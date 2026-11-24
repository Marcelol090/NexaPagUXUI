import {test,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';
const tabs=['home','expenses','ads','cards','review'];
const selectors={home:'.week',expenses:'.category-v29',ads:'.offer-card',cards:'.wallet-intro',review:'.review-item'};
for(const width of [320,390,1440]){
 for(const theme of ['light','dark']){
  test('V3.22 spacing audit '+width+' '+theme,async({page},info)=>{
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.setViewportSize({width,height:844});await page.emulateMedia({reducedMotion:'reduce'});
   await page.goto('/v2.html');
   const phone=page.locator('.phone');
   await expect(phone).toHaveAttribute('data-spacing-system','v322');
   if(await phone.getAttribute('data-ui-theme')!==theme)await page.locator('#themeToggle').click();
   await expect(phone).toHaveAttribute('data-ui-theme',theme);
   const audit=[];
   for(const tab of tabs){
    await page.locator('#dock button[data-tab="'+tab+'"]').click();
    const panel=page.locator(selectors[tab]).first();await expect(panel).toBeVisible();
    if(width===390){
     await phone.evaluate(el=>el.removeAttribute('data-spacing-system'));
     await phone.screenshot({path:info.outputPath(tab+'-before.png'),animations:'disabled'});
     await phone.evaluate(el=>el.setAttribute('data-spacing-system','v322'));
    }
    await phone.screenshot({path:info.outputPath(tab+'-after.png'),animations:'disabled'});
    const result=await page.evaluate(sel=>{
     const q=s=>document.querySelector(s);
     const item=q(sel),p=q('.phone'),b=item.getBoundingClientRect(),outer=p.getBoundingClientRect();
     const style=getComputedStyle(item),dock=[...document.querySelectorAll('#dock button')].map(x=>x.getBoundingClientRect().height);
     return {cardWidth:b.width,cardLeft:b.left-outer.left,cardRight:outer.right-b.right,padding:style.padding,
      horizontalOverflow:document.documentElement.scrollWidth-innerWidth,dockMinHeight:Math.min(...dock),
      sectionButtons:[...document.querySelectorAll('.section-title button')].map(x=>({height:x.getBoundingClientRect().height,font:getComputedStyle(x).fontSize})),
      spacing:getComputedStyle(p).getPropertyValue('--nx-space-4').trim()};
    },selectors[tab]);
    expect(result.horizontalOverflow).toBeLessThanOrEqual(2);
    expect(result.cardLeft).toBeGreaterThanOrEqual(-1);
    expect(result.cardRight).toBeGreaterThanOrEqual(-1);
    expect(result.dockMinHeight).toBeGreaterThanOrEqual(44);
    expect(result.spacing).toBe('16px');
    for(const b of result.sectionButtons)expect(b.height).toBeGreaterThanOrEqual(44);
    audit.push({tab,...result});
   }
   await page.locator('#dock button[data-tab="expenses"]').click();
   await page.locator('[data-category-toggle="Compras"]').click();
   await expect(page.locator('#sub-compras')).toBeVisible();
   for(const card of await page.locator('.category-v29').all()){
    const fits=await card.evaluate(el=>{
     const a=el.querySelector('.copy strong').getBoundingClientRect(),b=el.querySelector('.amount').getBoundingClientRect();
     const outer=el.getBoundingClientRect();
     return b.left>=outer.left-1&&b.right<=outer.right+1&&(a.right<=b.left+1||a.bottom<=b.top+1||b.bottom<=a.top+1);
    });
    expect(fits).toBe(true);
   }
   await phone.screenshot({path:info.outputPath('expenses-expanded.png'),animations:'disabled'});
   writeFileSync(info.outputPath('spacing-audit.json'),JSON.stringify({width,theme,audit,errors},null,2));
   console.log('SPACING_AUDIT',JSON.stringify({width,theme,audit,errors}));
   expect(errors).toEqual([]);
  });
 }
}
