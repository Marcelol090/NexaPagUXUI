import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('index.html'),css=read('src/geometry-911.css'),js=read('src/geometry-911.js');
test('9.12 geometry is a compact left-rail editor, no leftover editorial copy',()=>{
 assert.ok(html.indexOf('id="geometryHub"')<html.indexOf('id="phone"'));
 assert.ok(html.indexOf('id="phone"')<html.indexOf('rail right'));
 assert.doesNotMatch(html,/class="geo-editorial"/);
 assert.match(html,/id="geoAdvanced"/);
 assert.match(html,/id="geoSample"/);
 assert.match(html,/Visualize 9\.12/);
});
test('9.12 never modifies cards until an explicit user input',()=>{
 assert.doesNotMatch(js,/for\(const group of Object\.keys\(defaults\)\)put/);
 assert.match(js,/input\.addEventListener\('input'/);
 assert.match(js,/phone\.setAttribute\(attr\(group,key\),''\)/);
 assert.match(css,/\.phone\[data-geo-hero-radius\]/);
 assert.match(css,/\.phone\[data-geo-board-gap\]/);
 assert.match(css,/\.phone\[data-geo-nav-height\]/);
});
test('restoring a group removes exact CSS overrides, not guesswork defaults',()=>{
 assert.match(js,/phone\?\.style\.removeProperty\(CSS\(group,key\)\)/);
 assert.match(js,/phone\?\.removeAttribute\(attr\(group,key\)\)/);
 assert.match(js,/restoreGroup\(scope\)/);
 assert.match(js,/nexapag\.geometry\.912/);
});
test('geometry edits never modify optics, pigmented scene or LiquidOrb physics',()=>{
 assert.doesNotMatch(css,/\.ambient(::before|::after)?\s*[{]/);
 assert.doesNotMatch(js,/paintStackedLiquid/);
 assert.match(css,/--geo-board-border/);
 assert.match(css,/--geo-metric-radius/);
 assert.match(html,/id="blurRange"/);
});
test('mobile editor and accessible guide mode remain intact',()=>{
 assert.match(html,/id="geoMobileToggle"/);
 assert.match(js,/aria-expanded/);
 assert.match(js,/Escape/);
 assert.match(html,/aria-live="polite"/);
});
