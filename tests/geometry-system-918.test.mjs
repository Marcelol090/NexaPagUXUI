import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('src/geometry-system-918.css');
const js=read('src/geometry-system-918.js');
const html=read('index.html');
const main=read('src/main.js');

test('9.18 is loaded after existing Workbench and Sage optical calibration',()=>{
 assert.ok(html.indexOf('geometry-system-918.css')>html.indexOf('control-fidelity-917.css'));
 assert.ok(main.indexOf("import './geometry-system-918.js';")>main.indexOf("import './workspace-913.js';"));
 assert.ok(html.includes('id="geometryHub"'));
});
test('one token reaches real surfaces, interactive controls and card descendants across tabs',()=>{
 const scope={
  radius:['.glass-site>.panel','.quick-board','.category-board','.shop','.nav','.bankcard','.nav button','.segmented button'],
  gap:['.metric-row','.quick-grid','.category-board-grid','.review-actions','.nav','.overview-period'],
  padding:['.glass-site>.panel','.quick-board','.category-board','.shop','.nav button'],
  border:['.glass-site>.panel','.quick-board','.category-board','.nav button','.quick-icon'],
  icon:['.quick-icon','.small-icon','.cat-symbol','.txn-icon']
 };
 for(const [name,selectors] of Object.entries(scope)){
  assert.ok(css.includes('#phone[data-ds-'+name+']'),name);
  assert.ok(css.includes('var(--ds-'+name+')'),name);
  for(const selector of selectors)assert.ok(css.includes(selector),name+':'+selector);
 }
});
test('fractional pixel precision and smaller viewport presets are wired, not labels',()=>{
 for(const step of ['0.1','0.25','0.5','1'])
  assert.ok(js.includes(step),step);
 for(const width of [320,360,390,408])assert.ok(js.includes(String(width)),width);
 assert.ok(js.includes("field.step=String(precision)"));
 assert.ok(js.includes("phone.style.setProperty('--ds-'+key"));
 assert.ok(css.includes('var(--ds-device-width)'));
 assert.ok(css.includes('body>.studio>#workspaceStage>#phone[data-ds-device]'));
 assert.ok(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'));
});
test('no overrides are activated on load and every edited property can be reset',()=>{
 assert.ok(!js.includes("phone.setAttribute('data-ds-radius','');\nphone.setAttribute('data-ds-gap','')"));
 assert.match(js,/const changed=new Set\(\)/);
 assert.match(js,/phone\.setAttribute\('data-ds-'\+key,''\)/);
 assert.match(js,/phone\.removeAttribute\('data-ds-'\+key\)/);
 assert.match(js,/phone\.style\.removeProperty\('--ds-'\+key\)/);
 assert.match(js,/phone\.removeAttribute\('data-ds-device'\)/);
});
test('real computed readbacks and replay on rerender support every screen',()=>{
 assert.match(js,/getComputedStyle\(el\)\[p\.css\]/);
 assert.match(js,/MutationObserver\(queueReport\)/);
 assert.match(js,/watcher\.observe\(content,\{childList:true,subtree:false\}\)/);
 assert.match(js,/window\.NexaPagGlobalGeometry=Object\.freeze/);
 assert.match(js,/reportFrame=requestAnimationFrame\(report\)/);
});
test('advanced local refinements remain available without overriding global scope by default',()=>{
 assert.match(js,/gg-refinements/);
 assert.match(js,/details\.querySelector\('\.gg-refinements-body'\)\.append\(original\)/);
 assert.match(js,/details\.querySelector\('\.gg-refinements-body'\)\.append\(specimen\)/);
 assert.ok(html.includes('id="geoReset"'));
 assert.ok(html.includes('step="0.25"'));
});
test('javascript and CSS parse, no modifications to financial or LiquidOrb solver',()=>{
 assert.doesNotThrow(()=>new Function(js));
 const clean=css.replace(/\/\*[\s\S]*?\*\//g,'');
 assert.equal((clean.match(/{/g)||[]).length,(clean.match(/}/g)||[]).length);
 assert.doesNotMatch(css,/\.ambient::before/);
 assert.doesNotMatch(js,/paintStackedLiquid/);
 assert.doesNotMatch(js,/weeklySpend\s*=/);
});
