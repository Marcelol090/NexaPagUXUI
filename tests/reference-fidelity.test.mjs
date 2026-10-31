import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const workbench=readFileSync(new URL('../src/workbench.js',import.meta.url),'utf8');
test('five functional NexaPag routes stay present',()=>{
 for(const route of ['home','spending','ads','cards','review'])assert.ok(app.includes("'"+route+"'"),route);
});
test('editorial financial hero has semantic period controls',()=>{
 for(const x of ['fiduciary-hero','overview-period','period-set','finance-insight','metric-income','metric-refund'])assert.ok(app.includes(x),x);
});
test('liquid stays financially grounded and interactive',()=>{
 for(const x of ['circularArea(fill)','inverseCircularArea(fullArea*runningTotal/total)','orbSettings.iridescence','Orb'])assert.ok(app.includes(x),x);
 assert.ok(app.includes('orbSettings.seam'));
});
test('heatmap, palette boards and accessibility remain intact',()=>{
 for(const x of ['heat-cell','category-board','aria-pressed','goal-mode','review-view'])assert.ok(app.includes(x),x);
 assert.ok(css.includes('.category-board{'));
});
test('mobile workbench accessible from header without floating nav overlay',()=>{
 assert.ok(app.includes("document.getElementById('wbTrigger').click()"));
 assert.ok(workbench.includes('.wb-trigger{display:none}'));
});
test('visible finance design is an in-browser module',()=>{
 assert.ok(html.includes('src/main.js'));
 assert.ok(html.includes('src/styles.css'));
 assert.ok(html.includes('reference-fidelity.css'));
});