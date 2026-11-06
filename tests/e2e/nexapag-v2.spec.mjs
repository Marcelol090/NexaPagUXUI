import { test, expect } from '@playwright/test';

test('V2 financial experience preserves the reference composition and five tabs', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/v2.html');
  await expect(page).toHaveTitle(/NexaPag V(?:2|3)/);
  await expect(page.locator('#dock button')).toHaveCount(5);
  await expect(page.locator('.compact-hero .jelly')).toHaveCount(3);
  await page.locator('[data-open="1"]').first().click();
  await expect(page.locator('#homePage')).toHaveClass(/hero-expanded/);
  await expect(page.locator('.carousel-slide')).toHaveCount(3);
  await expect(page.locator('.carousel-slide.current')).toHaveCount(1);
  await page.locator('[data-action="next"]').click();
  await expect(page.locator('.carousel-slide.current')).toHaveAttribute('data-slide', '1');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
  for (const tab of ['expenses','ads','cards','review','home']) {
    await page.locator('#dock button[data-tab="' + tab + '"]').click();
    await expect(page.locator('#dock button[data-tab="' + tab + '"]')).toHaveAttribute('aria-current','page');
  }
  expect(errors).toEqual([]);
});

test('V2 320px touch targets, spending period and reviews function', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/v2.html');
  await page.locator('#dock button[data-tab="expenses"]').click();
  await page.locator('[data-period="Mês"]').click();
  await expect(page.locator('.overview')).toContainText('3.468,20');
  await page.locator('#dock button[data-tab="review"]').click();
  await page.locator('[data-review="0"]').click();
  await expect(page.locator('.overview')).toContainText('2');
  const widths = await page.locator('#dock button').evaluateAll(els => els.map(el => el.getBoundingClientRect().width));
  expect(Math.min(...widths)).toBeGreaterThanOrEqual(40);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(2);
});

test('V2.1 carousel follows gestures, supports keyboard and can collapse', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/v2.html');
  await page.locator('[data-open="1"]').first().click();
  await expect(page.locator('#homePage')).toHaveClass(/hero-expanded/);
  await expect(page.locator('.carousel-slide.current')).toHaveAttribute('data-slide', '0');
  const viewport = page.locator('#carouselViewport');
  const rect = await viewport.boundingBox();
  const x = rect.x + rect.width * 0.52;
  const y = rect.y + rect.height * 0.6;
  const from = await page.locator('#carouselTrack').evaluate(el => getComputedStyle(el).transform);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 90, y, { steps: 6 });
  const inMotion = await page.locator('#carouselTrack').evaluate(el => getComputedStyle(el).transform);
  expect(inMotion).not.toBe(from);
  await page.mouse.up();
  await expect(page.locator('.carousel-slide.current')).toHaveAttribute('data-slide', '1');
  await viewport.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.carousel-slide.current')).toHaveAttribute('data-slide', '2');
  await page.getByRole('button', { name: 'Recolher os cartões' }).click();
  await expect(page.locator('#homePage')).not.toHaveClass(/hero-expanded/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(2);
  expect(errors).toEqual([]);
});

test('V2.1 reduced motion keeps the financial view usable without auto-expansion', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/v2.html');
  await page.waitForTimeout(2050);
  await expect(page.locator('#homePage')).not.toHaveClass(/hero-expanded/);
  await page.locator('[data-open="1"]').first().click();
  await expect(page.locator('#homePage')).toHaveClass(/hero-expanded/);
  await page.locator('[data-action="next"]').click();
  await expect(page.locator('.carousel-slide.current')).toHaveAttribute('data-slide', '1');
});

test('V2.2 expressive expenses preserves animated value, warm glow, three moods and 5-tab dock', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/v2.html');
  await page.locator('#dock button[data-tab="expenses"]').click();
  await expect(page.locator('#expenseExpression')).toBeVisible();
  await expect(page.locator('.expression-face .eyes-neutral')).toHaveCount(1);
  await expect(page.locator('.expression-wash')).toHaveCount(1);
  await expect(page.locator('#spendingChart .chart-hit')).toHaveCount(7);
  await expect.poll(async () => page.locator('#expenseExpression').evaluate(el => el.classList.contains('expression-settled'))).toBe(true);
  await expect(page.locator('#expressionInteger')).toHaveText('270');
  const widths = await page.locator('#dock button').evaluateAll(elements => elements.map(el => el.getBoundingClientRect().width));
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1);
  await page.locator('.expression-replay[data-action="expenseReplay"]').click();
  await expect(page.locator('#expenseExpression')).toHaveClass(/expression-counting/);
  await page.locator('[data-period="Mês"]').click();
  await expect.poll(async () => page.locator('#expressionInteger').innerText()).toBe('3.468');
  await page.locator('[data-graph="2"]').click();
  await expect(page.locator('[data-graph="2"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-graph="2"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-graph="3"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-action="graphReplay"]').click();
  await expect(page.locator('#graphPath')).toHaveAttribute('d', /M22/);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
  expect(errors).toEqual([]);
});

test('V2.2 compact and reduced-motion spending card remains readable', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/v2.html');
  await page.locator('#dock button[data-tab="expenses"]').click();
  await expect(page.locator('#expressionInteger')).toHaveText('270');
  await expect(page.locator('.expression-primary')).toBeVisible();
  await expect(page.locator('.expression-secondary')).toBeVisible();
  const values = await page.locator('#dock button').evaluateAll(elements => elements.map(el => Math.round(el.getBoundingClientRect().height)));
  expect(Math.min(...values)).toBeGreaterThanOrEqual(44);
  await page.locator('[data-graph="0"]').click();
  await expect(page.locator('#chartAmount')).toContainText('126,80');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(2);
});

test('V2.7 weekly liquid orbs are weighted by actual demo category amounts',async({page})=>{
 const errors=[];page.on('pageerror',err=>errors.push(err.message));
 await page.setViewportSize({width:390,height:844});
 // Avoid the autonomous hero expansion racing the ledger interaction test.
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/v2.html');
 await expect(page.locator('.day-cell')).toHaveCount(7);
 await expect(page.locator('.day-cell .week-orb-canvas')).toHaveCount(4);
 await expect(page.locator('.day-cell .jelly.ghost')).toHaveCount(3);
 await expect(page.locator('.day-cell.selected')).toHaveCount(1);
 await page.locator('[data-day="1"]').click();
 await expect(page.locator('#weekDayDetail')).toContainText('74,00');
 await expect(page.locator('#weekDayDetail')).toContainText('Compras');
 await expect(page.locator('#weekDayDetail')).toContainText('Transporte');
 await page.locator('[data-day="5"]').click();
 await expect(page.locator('#weekDayDetail')).toContainText('Dia futuro');
 await expect(page.locator('[data-day="5"]')).toHaveAttribute('aria-pressed','true');
 for(const tab of ['expenses','home']){await page.locator('#dock button[data-tab="'+tab+'"]').click();await expect(page.locator('#dock button[data-tab="'+tab+'"]')).toHaveAttribute('aria-current','page');}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);expect(errors).toEqual([]);
});

test('V2.7 reduced motion shows static category compositions with paused legacy videos',async({page})=>{
 await page.setViewportSize({width:320,height:700});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/v2.html');
 await expect(page.locator('.day-cell .jelly.ghost')).toHaveCount(3);
 await expect(page.locator('.day-cell .week-orb-canvas')).toHaveCount(4);
 await expect(page.locator('.day-cell .orb-media')).toHaveCount(0);
 const isPainted=await page.locator('[data-week-orb="1"]').evaluate(c=>[...c.getContext('2d').getImageData(0,0,c.width,c.height).data].some(x=>x!==0));
 expect(isPainted).toBe(true);
 const pauses=await page.locator('#screen .orb-media').evaluateAll(vs=>vs.map(v=>v.paused));
 expect(pauses.every(Boolean)).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
});

test('V2.3.1 liquid card fits its buttons and reveals in-card rhythm after expression', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for(const width of [320,390]){
    await page.setViewportSize({width,height:844});
    await page.goto('/v2.html');
    await page.locator('#dock button[data-tab="expenses"]').click();
    await expect(page.locator('#expenseExpression')).toBeVisible();
    await expect(page.locator('#expressionRhythm')).toHaveCount(1);
    await expect.poll(async () => page.locator('#expenseExpression').evaluate(el => el.classList.contains('rhythm-visible')), {timeout:6000}).toBe(true);
    const position = await page.locator('#expenseExpression').evaluate(el=>{
      const c=el.getBoundingClientRect(), b=[...el.querySelectorAll('.expression-actions button')].map(x=>x.getBoundingClientRect());
      return {centered:Math.abs(b[0].height-b[1].height)<1,
        equalWidths:Math.abs(b[0].width-b[1].width)<1,
        inside:b.every(x=>x.bottom<=c.bottom-8 && x.left>=c.left && x.right<=c.right),
        minHeight:Math.min(...b.map(x=>x.height))};
    });
    expect(position.centered).toBe(true);
    expect(position.equalWidths).toBe(true);
    expect(position.inside).toBe(true);
    expect(position.minHeight).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
    await page.locator('.expression-replay[data-action="expenseReplay"]').click();
    await expect.poll(async () => page.locator('#expenseExpression').evaluate(el=>el.classList.contains('rhythm-visible')), {timeout:6000}).toBe(true);
  }
  expect(errors).toEqual([]);
});
test('V2.7 6.4-second liquid cycle is identical at both boundaries',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/v2.html');
 const result=await page.evaluate(()=>{
  const api=window.NexaLiquidDebug, canvas=document.querySelector('[data-week-orb="1"]'),items=api.WEEK_LEDGER[1].items;
  api.paintLiquid(canvas,items,0);
  const a=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data.slice();
  api.paintLiquid(canvas,items,api.TWO_PI);
  const b=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
  let diff=0;for(let i=0;i<a.length;i++)diff+=Math.abs(a[i]-b[i]);
  return {diff,spent:api.WEEK_SPENT,remaining:api.WEEK_REMAINING,totals:api.WEEK_LEDGER.map(x=>x.total)};
 });
 expect(result.diff).toBeLessThanOrEqual(60);
 expect(result.spent).toBe(270);expect(result.remaining).toBe(930);
 expect(result.totals).toEqual([126.8,74,39.2,30,0,0,0]);
});

