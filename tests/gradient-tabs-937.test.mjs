import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/gradient-tabs-937.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('9.37 CSS is actually bundled by Vite', () => {
  assert.match(main, /import '\.\/gradient-tabs-937\.css'/);
  assert.match(html, /Visualize 9\.37/);
});

test('bottom navigation remains fixed five-column with all labels', () => {
  assert.match(css, /grid-template-columns:repeat\(5,minmax\(0,1fr\)\)!important/);
  assert.match(css, /\.nav button:not\(\.active\) span:not\(\.icon\)/);
  for (const name of ['Início','Gastos','Anúncios','Cartões','Revisar']) assert.ok(app.includes(name), name);
  assert.match(app, /aria-current/);
});

test('category and quick grids have independent glass/pigment treatment', () => {
  assert.match(css, /\.quick-grid/);
  assert.match(css, /\.category-board-grid/);
  assert.match(css, /rgba\(var\(--tone-rgb\)/);
  assert.match(css, /--live-glass-board/);
  assert.match(app, /data-action="category"/);
});

test('optical controls and reduced motion are not discarded', () => {
  assert.match(css, /--live-glass-blur/);
  assert.match(css, /--live-glass-nav-blur/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /prefers-reduced-transparency:reduce/);
  assert.match(css, /no-optics/);
});
