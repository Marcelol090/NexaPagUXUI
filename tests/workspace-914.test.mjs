import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = p => readFileSync(new URL('../'+p, import.meta.url),'utf8');
const html=read('index.html');
const css=read('src/workspace-914.css');
const ui=read('src/workspace-913.js');

test('phone and inspector are siblings in a dedicated stage, not separate implicit grid rows',()=>{
  const open=html.indexOf('<div class="workspace-stage" id="workspaceStage">');
  const phone=html.indexOf('<div class="phone" id="phone">');
  const inspector=html.indexOf('<aside class="rail right">');
  const close=html.indexOf('</aside></div></div><div class="lab-scrim"');
  assert.ok(open>0&&open<phone&&phone<inspector&&inspector<close);
  assert.ok(ui.includes("document.querySelector('.workspace-stage>.rail.right')"));
  assert.ok(html.includes('src/workspace-914.css'));
});
test('100% zoom desktop forces two aligned columns with fixed readable phone and inspector',()=>{
  assert.match(css,/body>\.studio\{/);
  assert.match(css,/display:flex!important;flex-direction:column!important/);
  assert.match(css,/\.workspace-stage\{/);
  assert.match(css,/grid-template-columns:minmax\(0,var\(--nexa-stage-phone\)\) minmax\(0,var\(--nexa-stage-inspector\)\)!important/);
  assert.match(css,/\.workspace-stage>\.phone\{/);
  assert.match(css,/grid-column:1!important;grid-row:1!important/);
  assert.match(css,/\.workspace-stage>\.rail\.right\.workspace-inspector\{/);
  assert.match(css,/grid-column:2!important;grid-row:1!important/);
  assert.match(css,/--nexa-stage-phone:408px/);
  assert.match(css,/--nexa-stage-inspector:404px/);
  assert.match(css,/height:min\(850px,calc\(100dvh - 2 \* var\(--nexa-stage-padding\)\)\)!important/);
});
test('editor remains independently scrollable, responsive and usable with keyboard and on touch',()=>{
  assert.match(css,/\.workspace-stage \.workspace-inspector \.inspector-scroll\{/);
  assert.match(css,/overflow-y:auto!important/);
  assert.match(css,/@media\(max-width:940px\)/);
  assert.match(css,/body\.inspector-open \.workspace-stage>\.rail\.right\.workspace-inspector\{/);
  assert.match(ui,/ArrowRight/);
  assert.match(ui,/Escape/);
});
test('geometry and material remain intact, and selector resolves the new markup',()=>{
  assert.ok(html.includes('id="geometryHub"'));
  assert.ok(html.includes('id="blurRange"'));
  assert.ok(html.includes('id="pigmentRange"'));
  assert.ok(html.includes('id="phone"'));
  assert.doesNotMatch(css,/\.hero-graph-frame/);
  assert.doesNotMatch(css,/\.ambient::before/);
  assert.doesNotMatch(css,/paintStackedLiquid/);
  assert.doesNotThrow(()=>new Function(ui));
  const clean=css.replace(/\/\*[\s\S]*?\*\//g,'');
  assert.equal((clean.match(/{/g)||[]).length,(clean.match(/}/g)||[]).length);
});
