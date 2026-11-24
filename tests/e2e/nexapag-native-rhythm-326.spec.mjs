import {test,expect} from '@playwright/test';
for(const width of [320,390,430,1440]){
 test('V3.26 native safe rails, compact home and consistent controls '+width,async({page},info)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/v2.html');
  for(const theme of ['light','dark']){
   const phone=page.locator('.phone');
   if(await phone.getAttribute('data-ui-theme')!==theme)await page.locator('#themeToggle').click();
   await page.locator('#dock [data-tab="home"]').click();
   const g=await page.evaluate(()=>{
    const q=s=>document.querySelector(s),r=s=>q(s).getBoundingClientRect();
    const p=r('.phone'),t=r('.topbar'),status=r('.status'),sc=r('.scroller'),w=r('.week'),dock=r('#dock');
    const a=r('#avatar'),theme=r('#themeToggle'),c=r('.week-counter'),svg=r('.week-counter svg');
    const days=[...document.querySelectorAll('.week .day-cell')].map(e=>e.getBoundingClientRect());
    return {statusHeight:status.height,toolbarGap:sc.top-t.bottom,railLeft:w.left-p.left,railRight:p.right-w.right,
     avatarLeft:a.left<theme.left,avatarWidth:a.width,badgeHeight:c.height,badgeIcon:svg.width,
     dockHeight:dock.height,dockLeft:dock.left-p.left,dockRight:p.right-dock.right,
     weekFits:days.every(d=>d.left>=w.left&&d.right<=w.right),overflow:document.documentElement.scrollWidth-innerWidth,
     navMin:Math.min(...[...q('#dock').querySelectorAll('button')].map(b=>b.getBoundingClientRect().height))};
   });
   expect(g.statusHeight).toBe(46);expect(g.toolbarGap).toBe(8);
   expect(Math.abs(g.railLeft-g.railRight)).toBeLessThan(2);expect(g.avatarLeft).toBe(true);
   expect(g.avatarWidth).toBe(44);expect(g.badgeIcon).toBe(12);expect(g.badgeHeight).toBeLessThan(28);
   expect(g.dockHeight).toBe(58);expect(Math.abs(g.dockLeft-g.dockRight)).toBeLessThan(2);
   expect(g.navMin).toBeGreaterThanOrEqual(44);expect(g.weekFits).toBe(true);expect(g.overflow).toBeLessThanOrEqual(2);
   await phone.screenshot({path:info.outputPath(theme+'-home.png'),animations:'disabled'});
   await page.locator('[data-open="1"]').click();await expect(page.locator('#homePage')).toHaveClass(/hero-expanded/);
   await page.getByRole('button',{name:'Recolher os cartões'}).click();await expect(page.locator('#homePage')).not.toHaveClass(/hero-expanded/);
   for(const tab of ['expenses','ads','cards','review']){
    await page.locator('#dock [data-tab="'+tab+'"]').click();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
   }
  }
  expect(errors).toEqual([]);
 });
}
