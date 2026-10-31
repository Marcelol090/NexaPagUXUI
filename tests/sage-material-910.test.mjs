import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
const source = path => readFileSync(new URL('../'+path, import.meta.url), 'utf8');
const html=source('index.html'),css=source('src/sage-material-910.css'),app=source('src/app.js');

test('9.10 runs the approved material last, in the real app rather than a separate Hub',()=>{
 const original=html.indexOf('src/material-continuity.css'),last=html.indexOf('src/sage-material-910.css');
 assert.ok(original>0 && last>original);
 assert.ok(html.includes('Visualize 9.10'));
});
test('the approved sage, leaf, forest, petrol and sky palette grounds the shared scene',()=>{
 for(const hex of ['#D5E6A8','#A8D95E','#6FB81E','#1F8B57','#0D6372','#5FA9D8'])
  assert.ok(css.includes(hex) || app.includes(hex), hex);
 assert.match(css,/\.phone \.ambient/);
 assert.match(css,/\.phone \.glass-site>\.glass-scene\{display:none!important\}/);
});
test('icons are monochrome and chosen by legibility against the color well',()=>{
 assert.ok(app.includes('const inkFor=(hex)=>'));
 assert.ok(app.includes('--glyph-ink:${inkFor(a.tone)}'));
 assert.ok(app.includes('--glyph-ink:${inkFor(c.color)}'));
 assert.match(css,/\.phone \.nav button\.active \.icon svg\{stroke:var\(--nexa-ink\)!important\}/);
 assert.match(css,/stroke:currentColor!important/);
});
test('glass blur is not stacked on nested boards and nav backdrop',()=>{
 assert.match(css,/backdrop-filter:none!important/);
 assert.match(css,/\.phone \.nav-wrap/);
 assert.match(css,/\.phone \.nav\{/);
 assert.match(css,/\.phone:not\(\.no-optics\) \.glass-site>/);
});
test('finance and navigation contracts remain intact',()=>{
 assert.ok(app.includes('weeklyBudget=1200'));
 assert.ok(app.includes('weeklySpend=270'));
 assert.ok(app.includes("const weekCat=[{name:'Mercado',v:98,color:'#D5E6A8'"));
 for(const tab of ["'Início'","'Gastos'","'Anúncios'","'Cartões'","'Revisar'"])
  assert.ok(app.includes(tab));
 assert.ok(app.includes("paintStackedLiquid"));
});
