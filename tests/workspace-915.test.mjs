import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const get=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=get('index.html'),css=get('src/workspace-915.css'),js=get('src/workspace-915.js'),main=get('src/main.js');
const ui=get('src/workspace-913.js');

test('Visualize 9.15 loads only final desktop geometry layer, no obsolete 9.14 cascade',()=>{
 assert.ok(html.includes('src/workspace-915.css'));
 assert.ok(!html.includes('src/workspace-914.css'));
 assert.ok(main.includes("import './workspace-915.js';"));
 assert.ok(main.indexOf("import './workspace-915.js';")>main.indexOf("import './workspace-913.js';"));
});
test('phone and workbench remain siblings inside a single dedicated workspace',()=>{
 const a=html.indexOf('<div class="workspace-stage" id="workspaceStage">');
 const b=html.indexOf('<div class="phone" id="phone">');
 const c=html.indexOf('<aside class="rail right">');
 assert.ok(a>0&&a<b&&b<c);
 assert.ok(html.includes('</aside></div></div><div class="lab-scrim"'));
 assert.ok(ui.includes("document.querySelector('.workspace-stage>.rail.right')"));
});
test('desktop stage never wraps, shrinks or scales the phone',()=>{
 for(const snippet of [
  '--stage-phone-w:408px','--stage-phone-h:850px','--stage-inspector-w:404px',
  '--stage-space:28px','display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important',
  'flex:0 0 var(--stage-phone-w)!important','aspect-ratio:408/850!important',
  'transform:none!important;scale:1!important;zoom:1!important',
  'flex:0 0 var(--stage-inspector-w)!important'
 ]) assert.ok(css.includes(snippet),snippet);
 assert.ok(!css.includes('transform:scale(.25)'));
});
test('inspector stays beside phone and scrolls internally at native browser zoom',()=>{
 assert.ok(css.includes('body>.studio>.workspace-stage>.rail.right.workspace-inspector'));
 assert.ok(css.includes('.inspector-scroll'));
 assert.ok(css.includes('overflow-y:auto!important;overflow-x:hidden!important'));
 assert.ok(js.includes("getBoundingClientRect()"));
 assert.ok(js.includes("inspector.getBoundingClientRect()"));
 assert.ok(js.includes("window.NexaPagWorkspaceQA="));
 assert.ok(js.includes("sideBySide"));
});
test('narrow screens use a drawer, do not accidentally stack inspector under the phone',()=>{
 assert.ok(css.includes('@media(max-width:940px)'));
 assert.ok(css.includes('display:none!important'));
 assert.ok(css.includes('body.inspector-open>.studio>.workspace-stage>.rail.right.workspace-inspector'));
 assert.ok(css.includes('position:fixed!important;z-index:94!important'));
 assert.ok(css.includes('@media(max-width:450px)'));
});
test('geometry patch does not touch financial shaders or stacked-liquid solver',()=>{
 assert.ok(!css.includes('paintStackedLiquid'));
 assert.ok(!js.includes('paintStackedLiquid'));
 assert.ok(!css.includes('.ambient:before'));
 assert.doesNotThrow(()=>new Function(js));
 const clean=css.replace(/\/\*[\s\S]*?\*\//g,'');
 assert.equal((clean.match(/{/g)||[]).length,(clean.match(/}/g)||[]).length);
});
