import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
const at=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=at('index.html'),app=at('src/app.js'),css=at('src/color-discipline.css'),material=at('materials.html'),js=at('src/materials.js'),vite=at('vite.config.js');
test('9.07u1 imports the chromatic discipline layer after earlier material layers',()=>{
 const a=html.indexOf('src/pigment-fidelity.css'),b=html.indexOf('src/color-discipline.css');
 assert.ok(a>=0&&b>a);
 assert.ok(css.includes('.panel.fiduciary-hero'));
 assert.ok(css.includes('.category-board'));
 assert.ok(css.includes('.quick-board'));
});
test('approved category roles remain distinct and financial values unmodified',()=>{
 for(const c of ['#D5E6A8','#A8D95E','#6FB81E','#1F8B57','#0D6372','#5FA9D8'])assert.ok(app.includes(c),c);
 for(const amount of ['1145.9','874.4','620.3','407.5','340'])assert.ok(app.includes(amount));
 assert.ok(app.includes('weeklyBudget=1200'));
 assert.ok(app.includes('weeklySpend=270'));
});
test('hero chart uses a purposeful tonal series rather than a three-hue rainbow',()=>{
 assert.ok(app.includes('stop-color="#77b6a5"'));
 assert.ok(app.includes('stop-color="#7dbdae"'));
 assert.ok(app.includes('stop-color="#b1dbc7"'));
 assert.ok(!app.includes('stop-color="#e28688"'));
});
test('neutral cards avoid hard chromatic tint while category wells remain colored',()=>{
 assert.ok(css.includes('background:linear-gradient(152deg,rgba(35,50,50,.42)'));
 assert.ok(css.includes('rgba(var(--tone-rgb),.095)'));
 assert.ok(css.includes('.cat-symbol'));
 assert.ok(css.includes('@media (forced-colors:active)'));
});
test('separate interactive material study contains realistic content and preserves liquid renderer',()=>{
 for(const x of ['id="pigment"','id="glass"','id="sphere"','id="boards"','id="stir"','id="boardDetail"'])assert.ok(material.includes(x),x);
 assert.ok(js.includes("import { paintStackedLiquid }"));
 assert.ok(js.includes('paintStackedLiquid({ctx,w,center:c,r,entries'));
 assert.ok(js.includes('aCircle(amount)'));
 assert.ok(vite.includes("materials:resolve(process.cwd(),'materials.html')"));
});
