import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SCREENSHOTS = 'test-results/screenshots';

async function appReady(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#phone')).toBeVisible();
  await expect(page.locator('.workspace-inspector')).toHaveCount(1);
  await page.waitForFunction(() =>
    !!window.NexaPagMaterialEngine &&
    !!window.NexaPagGlobalGeometry &&
    !!window.NexaPagInspector,
  );
}

async function capture(page, filename) {
  mkdirSync(SCREENSHOTS, { recursive: true });
  await page.screenshot({
    path: join(SCREENSHOTS, filename),
    fullPage: true,
    animations: 'disabled',
  });
}

for (const size of [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
]) {
  test(`Workbench at ${size.width}x${size.height} stays beside an undistorted phone`, async ({ page }) => {
    await page.setViewportSize(size);
    await appReady(page);
    const phone = await page.locator('#phone').boundingBox();
    const inspector = await page.locator('.workspace-inspector').boundingBox();
    expect(phone).toBeTruthy();
    expect(inspector).toBeTruthy();
    expect(phone.width).toBeGreaterThanOrEqual(405);
    expect(phone.width).toBeLessThanOrEqual(411);
    expect(inspector.width).toBeGreaterThanOrEqual(390);
    expect(inspector.width).toBeLessThanOrEqual(415);
    expect(phone.height).toBeGreaterThanOrEqual(840);
    expect(phone.height).toBeLessThanOrEqual(860);
    expect(inspector.x).toBeGreaterThanOrEqual(phone.x + phone.width + 10);
    expect(Math.abs(inspector.y - phone.y)).toBeLessThanOrEqual(12);
    await capture(page, `workspace-${size.width}.png`);
  });
}

test('Glass density affects the actual hero, metric and board, not just a slider label', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await appReady(page);
  await expect(page.locator('#phone[data-live-glass]')).toHaveCount(1);

  const measure = () => page.evaluate(() => {
    const map = {
      hero: '.fiduciary-hero',
      metric: '.glass-site[data-optic="metric"] > .metric',
      board: '.quick-board',
    };
    return Object.fromEntries(Object.entries(map).map(([name, selector]) => {
      const el = document.querySelector('#phone ' + selector);
      const style = el ? getComputedStyle(el) : null;
      return [name, style ? {
        background: style.backgroundColor,
        blur: style.backdropFilter || style.webkitBackdropFilter,
        border: style.borderColor,
      } : null];
    }));
  });

  async function change(id, value) {
    await page.locator('#' + id).evaluate((input, next) => {
      input.value = String(next);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
    await page.waitForTimeout(60);
  }

  await change('filmRange', 12);
  const low = await measure();
  await change('filmRange', 92);
  const high = await measure();
  console.log('GLASS DIAGNOSTIC', JSON.stringify(await page.evaluate(() => {
    const el=document.querySelector('#phone .fiduciary-hero'),phone=document.querySelector('#phone');
    const style=el?getComputedStyle(el):null;
    return {hasGlass:phone.hasAttribute('data-live-glass'),token:phone.style.getPropertyValue('--live-glass-hero'),
      image:style?.backgroundImage,color:style?.backgroundColor,selectorMatch:el?.matches('#phone[data-live-glass]:not(.no-optics) .glass-site>.panel.fiduciary-hero'),
      styles:[...document.querySelectorAll('link[rel="stylesheet"]')].map(x=>({href:x.getAttribute('href'),loaded:!!x.sheet})),
      sheets:[...document.styleSheets].map(x=>x.href||'inline'),
      matchedRules:[...document.styleSheets].flatMap(sheet=>{
        try{return [...sheet.cssRules].filter(r=>r.selectorText&&r.selectorText.includes('data-live-glass')&&r.selectorText.includes('panel')).slice(0,8).map(r=>({selector:r.selectorText,background:r.style?.background,valid:r.style?.getPropertyPriority('background')}));}
        catch{return [];}
      })
    };
  })));

  for (const name of ['hero', 'metric', 'board']) {
    expect(low[name], `${name} absent from screen`).not.toBeNull();
    expect(high[name].background, `${name} did not react to glass opacity`)
      .not.toEqual(low[name].background);
  }

  await change('blurRange', 4);
  const blurLow = await measure();
  await change('blurRange', 35);
  const blurHigh = await measure();
  expect(blurLow.hero.blur).not.toEqual(blurHigh.hero.blur);
  await capture(page, 'material-responsive.png');
});

test('One geometry token changes multiple actual card types with fractional pixels', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await appReady(page);
  const proof = await page.evaluate(() => {
    const geometry = window.NexaPagGlobalGeometry;
    const applied = geometry.apply('radius', 12.25);
    const card = document.querySelector('#phone .quick-board');
    const nav = document.querySelector('#phone .nav');
    const result = {
      applied,
      quickBoard: card ? getComputedStyle(card).borderRadius : null,
      nav: nav ? getComputedStyle(nav).borderRadius : null,
      token: document.querySelector('#phone').style.getPropertyValue('--ds-radius').trim(),
    };
    geometry.reset();
    return result;
  });
  console.log('GEOMETRY DIAGNOSTIC', JSON.stringify({
    proof,
    extra:await page.evaluate(()=>{
      const p=document.querySelector('#phone'),card=p?.querySelector('.quick-board');
      return {
       attr:p?.hasAttribute('data-ds-radius'),selector:card?.matches('#phone[data-ds-radius] .quick-board'),
       rules:[...document.styleSheets].flatMap(sheet=>{try{return [...sheet.cssRules].filter(r=>r.selectorText?.includes('data-ds-radius')).slice(0,5).map(r=>({selector:r.selectorText,radius:r.style?.borderRadius}));}catch{return [];}})
      };
    })
  }));
  expect(proof.applied).toBe(true);
  expect(proof.token).toBe('12.25px');
  expect(proof.quickBoard).toBe('12.25px');
  expect(proof.nav).toBe('12.25px');
});

for (const width of [390, 320]) {
  test(`Mobile ${width}px: no forced wide desktop inspector or horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await appReady(page);
    const phone = await page.locator('#phone').boundingBox();
    expect(phone).toBeTruthy();
    expect(phone.width).toBeLessThanOrEqual(width + 1);
    const info = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(info.scrollWidth).toBeLessThanOrEqual(info.viewport + 2);
    const open = page.locator('.inspector-open-button');
    await expect(open).toBeVisible();
    await open.click();
    await expect(page.locator('.workspace-inspector')).toBeVisible();
    await expect(page.locator('#inspector-tab-geometry')).toBeVisible();
    await capture(page, `mobile-${width}.png`);
  });
}

test('Five functional tabs and reduced-motion mode remain supported', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await appReady(page);
  await expect(page.locator('#phone .nav button')).toHaveCount(5);
  await expect(page.locator('#phone .fiduciary-hero')).toBeVisible();
  const result = await page.evaluate(() => window.NexaPagLiquidIntro?.replay());
  expect(result).toBe(false);
});
