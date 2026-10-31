import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html');
const css=read('src/geometry-911.css');
const js=read('src/geometry-911.js');
const entry=read('src/main.js');
test('Geometry Lab occupies left rail beside phone, optics remain on right',()=>{
 assert.match(html,/rail left geometry-left/);
 assert.ok(html.indexOf('id="geometryHub"')<html.indexOf('id="phone"'));
 assert.ok(html.indexOf('id="phone"')<html.indexOf('rail right'));
 assert.match(html,/id="geoSample"/);
 assert.match(html,/id="blurRange"/);
});
test('Geometry controls are wired and editable per component, not decorative',()=>{
 for(const scope of ['hero','metric','board','tabs','nav'])
  assert.ok(html.includes('data-geo-scope="'+scope+'"'),scope);
 for(const prop of ['radius','gap','padding','border','height','icon']){
  assert.ok(html.includes('data-geo-prop="'+prop+'"'),prop);
  assert.ok(js.includes("key=input.dataset.geoProp")||js.includes("const key=input.dataset.geoProp"));
 }
 for(const selector of ['.glass-site>.panel.fiduciary-hero','.metric-row', '.quick-grid','.overview-period','.nav{'])
  assert.ok(css.includes(selector),selector);
});
test('Latest cascade, readable defaults, and working JS',()=>{
 assert.ok(html.indexOf('src/geometry-911.css')>html.indexOf('src/sage-material-910.css'));
 assert.ok(entry.includes("import './geometry-911.js';"));
 assert.doesNotThrow(()=>new Function(js));
 assert.ok(js.includes('phone.style.setProperty'));
 assert.ok(js.includes('structuredClone(defaults)'));
 assert.ok(js.includes('localStorage.setItem'));
 assert.ok(js.includes('exportCSS'));
});
test('Mobile access and relevant accessibility labels',()=>{
 assert.match(html,/id="geoMobileToggle"/);
 assert.match(html,/aria-controls="geometryHub"/);
 assert.match(css,/body\.geo-mobile-open \.rail\.left\.geometry-left/);
 assert.match(js,/aria-expanded/);
 assert.match(html,/aria-live="polite"/);
});
test('Glass material and orb physics remain untouched by geometry layer',()=>{
 assert.ok(!css.includes('paintStackedLiquid'));
 assert.ok(!css.includes('.ambient::before'));
 assert.ok(!css.includes('background:linear-gradient(135deg,#D5E6A8'));
 const opened=(css.match(/{/g)||[]).length,closed=(css.match(/}/g)||[]).length;
 assert.equal(opened,closed);
});
