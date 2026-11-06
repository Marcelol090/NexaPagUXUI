import {test,expect} from '@playwright/test';
test('V3.4 three equal-size financial orbs remain tappable until user acts',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:390,height:844});await page.goto('/v2.html');
 await expect(page.locator('#compactHero .milestone')).toHaveCount(3);
 await page.waitForTimeout(2050);
 await expect(page.locator('#homePage')).not.toHaveClass(/hero-expanded/);
 const sizes=await page.locator('#compactHero .milestone .jelly').evaluateAll(nodes=>nodes.map(x=>x.getBoundingClientRect().width));
 expect(Math.max(...sizes)-Math.min(...sizes)).toBeLessThanOrEqual(1);
 expect(Math.min(...sizes)).toBeGreaterThanOrEqual(60);
 expect(errors).toEqual([]);
});
test('V3.4 Entradas orb morphs into its own accessible receipt story and returns',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:320,height:780});await page.goto('/v2.html');
 await page.locator('[data-orb-story="income"]').click();
 await expect(page.getByRole('dialog',{name:'Dinheiro que entrou.'})).toBeVisible();
 await expect(page.locator('#orbStoryLayer')).toContainText('1.950,00');
 await expect(page.locator('#orbStoryLayer')).toContainText('Não inclui estornos');
 await page.keyboard.press('Escape');
 await expect(page.locator('#orbStoryLayer')).toHaveCount(0);
 await expect(page.locator('#compactHero .milestone')).toHaveCount(3);
 await page.locator('[data-orb-story="income"]').click();
 await page.locator('[data-orb-follow="income"]').click();
 await expect(page.locator('#orbStoryLayer')).toHaveCount(0);
 await expect(page.locator('#transactionsSection')).toHaveCount(1);
});
test('V3.4 Estornos orb opens proper reconciliation, not income summary',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:390,height:844});await page.goto('/v2.html');
 await page.locator('[data-orb-story="refund"]').click();
 await expect(page.getByRole('dialog',{name:'Valor recuperado.'})).toBeVisible();
 await expect(page.locator('#orbStoryLayer')).toContainText('349,90');
 await expect(page.locator('#orbStoryLayer')).toContainText('não é contado novamente como entrada');
 await page.locator('[data-orb-follow="refund"]').click();
 await expect(page.locator('#orbStoryLayer')).toHaveCount(0);
 await expect(page.locator('#moneyInsightLayer')).toHaveCount(1);
});
test('V3.4 Saídas orb morphs to existing three-slide carousel without losing older interactions',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/v2.html');
 await page.locator('[data-open="1"]').first().click();
 await expect(page.locator('#homePage')).toHaveClass(/hero-expanded/);
 await expect(page.locator('.carousel-slide')).toHaveCount(3);
 await expect(page.locator('.carousel-slide.current')).toHaveCount(1);
 await page.locator('[data-action="next"]').click();
 await expect(page.locator('.carousel-slide.current')).toHaveAttribute('data-slide','1');
 await page.getByRole('button',{name:'Recolher os cartões'}).click();
 await expect(page.locator('#homePage')).not.toHaveClass(/hero-expanded/);
});
test('V3.4 modal and orbs retain a readable dark mode and no horizontal overflow',async({page})=>{
 await page.setViewportSize({width:320,height:700});await page.goto('/v2.html');
 await page.locator('#themeToggle').click();
 await expect(page.locator('.phone')).toHaveAttribute('data-ui-theme','dark');
 await page.locator('[data-orb-story="refund"]').click();
 await expect(page.getByRole('dialog')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
 await page.locator('[data-orb-close]').last().click();
 await expect(page.getByRole('dialog')).toHaveCount(0);
});
