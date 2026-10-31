import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html'),entry=read('src/main.js');
const start=html.indexOf('<style id="nexa-workspace-contract">');
const end=html.indexOf('</style>',start);
const critical=html.slice(start,end);

test('final deployment HTML carries its workspace material and layout CSS directly',()=>{
 assert.ok(start>0&&end>start);
 assert.ok(critical.length>20000);
 assert.ok(critical.includes('.inspector-tabs'));
 assert.ok(critical.includes('.workspace-inspector .inspector-scroll'));
 assert.ok(critical.includes('body>.studio>#workspaceStage'));
 assert.ok(critical.includes('width:840px!important'));
 assert.ok(critical.includes('width:408px!important'));
 assert.ok(critical.includes('width:404px!important'));
});
test('old mobile geometry ribbon is removed but geometry controls survive for the inspector',()=>{
 assert.ok(!html.includes('id="geoMobileToggle"'));
 assert.ok(html.includes('id="geometryRail"'));
 assert.ok(html.includes('id="geometryHub"'));
 assert.ok(html.includes('id="geoReset"'));
 assert.ok(entry.includes("import './geometry-911.js';"));
 assert.ok(entry.includes("import './workspace-913.js';"));
});
test('rigid desktop flex layout and narrow-screen sheet are both inline',()=>{
 for(const term of [
  'display:flex!important;flex-flow:row nowrap!important',
  'height:850px!important;min-height:850px!important;max-height:850px!important',
  'flex:0 0 408px!important','flex:0 0 404px!important',
  '@media(max-width:940px)','body.inspector-open>.studio>#workspaceStage>.rail.right.workspace-inspector'
 ])assert.ok(critical.includes(term),term);
 const open=(critical.match(/{/g)||[]).length, close=(critical.match(/}/g)||[]).length;
 assert.equal(open,close);
});
test('the phone is still directly adjacent to the right rail in HTML',()=>{
 const stage=html.indexOf('id="workspaceStage"'),phone=html.indexOf('id="phone"');
 const inspector=html.indexOf('<aside class="rail right">');
 assert.ok(stage>0&&phone>stage&&inspector>phone);
 assert.ok(html.includes('</aside></div></div><div class="lab-scrim"'));
});
