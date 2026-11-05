import { test, expect } from '@playwright/test';

test('V2 financial experience preserves the reference composition and five tabs', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/v2.html');
  await expect(page).toHaveTitle(/NexaPag V2/);
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
