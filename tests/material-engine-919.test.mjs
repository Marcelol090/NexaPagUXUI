import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('src/material-engine-919.css');
const js=read('src/material-engine-919.js');
const main=read('src/main.js');
const html=read('index.html');
const names=['filmRange','blurRange','rimRange','lightRange','pigmentRange','diffuseRange','blendRange'];

function fakeMaterial(){
 const frames=[];
 const events={};
 const values={filmRange:74,blurRange:23,rimRange:72,lightRange:78,pigmentRange:74,diffuseRange:20,blendRange:44};
 class Control{constructor(id,val){this.id=id;this.value=String(val)}}
 const inputs=Object.fromEntries(Object.entries(values).map(([id,v])=>[id,new Control(id,v)]));
 const vars=new Map();
 const phone={
  style:{setProperty:(k,v)=>vars.set(k,v)},
  setAttribute(k,v){this[k]=v},
  querySelector:()=>null,
  classList:{contains:()=>false}
 };
 const doc={
  getElementById:id=>id==='phone'?phone:inputs[id]||null,
  addEventListener(type,callback){events[type]=callback}
 };
 const globals={
  document:doc,window:{},HTMLInputElement:Control,Element:class{},
  getComputedStyle:()=>({backgroundColor:'',borderTopColor:'',backdropFilter:''}),
  requestAnimationFrame:fn=>{frames.push(fn);return frames.length}
 };
 vm.runInNewContext(js,globals);
 const flush=()=>{while(frames.length)frames.shift()()};
 const set=(id,value)=>{inputs[id].value=String(value);events.input({target:inputs[id]});flush()};
 flush();
 return {api:globals.window.NexaPagMaterialEngine,vars,set,phone,inputs};
}
test('one authoritative material stylesheet is loaded after earlier rules',()=>{
 assert.ok(html.indexOf('material-engine-919.css')>html.indexOf('workbench-material-918.css'));
 assert.ok(main.indexOf("import './material-engine-919.js';")>main.indexOf("import './workbench-material-918.js';"));
});
test('hero, metrics, boards and navigation consume all actual optical tokens',()=>{
 const required=[
  '#phone[data-live-glass]:not(.no-optics) .glass-site>.panel.fiduciary-hero',
  '#phone[data-live-glass]:not(.no-optics) .glass-site[data-optic="metric"]>.metric',
  '.quick-board','.category-board','.nav',
  'var(--live-glass-hero','var(--live-glass-metric',
  'var(--live-glass-board','var(--live-glass-nav',
  'var(--live-glass-blur','var(--live-glass-rim'
 ];
 for(const part of required)assert.ok(css.includes(part),part);
 assert.ok(css.includes('#phone[data-live-glass].no-optics'));
});
test('changing acrylic film updates every material alpha rather than hardcoded 67% and 71%',()=>{
 const s=fakeMaterial();
 s.set('filmRange',0);
 const low=['--live-glass-panel','--live-glass-hero','--live-glass-metric','--live-glass-board','--live-glass-nav']
  .map(key=>Number(s.vars.get(key)));
 s.set('filmRange',100);
 const high=['--live-glass-panel','--live-glass-hero','--live-glass-metric','--live-glass-board','--live-glass-nav']
  .map(key=>Number(s.vars.get(key)));
 for(let i=0;i<low.length;i++){
  assert.ok(Number.isFinite(low[i])&&high[i]>low[i]+.3,'surface '+i+': '+low[i]+' -> '+high[i]);
 }
 assert.equal(s.phone['data-live-glass'],'');
});
test('blur affects both principal card and boards and nav, with no scaling',()=>{
 const s=fakeMaterial();
 s.set('blurRange',0);
 assert.equal(s.vars.get('--live-glass-blur'),'0px');
 assert.equal(s.vars.get('--live-glass-board-blur'),'0px');
 assert.equal(s.vars.get('--live-glass-nav-blur'),'0px');
 s.set('blurRange',40);
 assert.equal(s.vars.get('--live-glass-blur'),'40px');
 assert.equal(s.vars.get('--live-glass-board-blur'),'17.2px');
 assert.equal(s.vars.get('--live-glass-nav-blur'),'28px');
});
test('rim and underlying illumination have independent, visible parameters',()=>{
 const s=fakeMaterial();
 s.set('rimRange',0);const l=Number(s.vars.get('--live-glass-rim'));
 s.set('rimRange',100);const h=Number(s.vars.get('--live-glass-rim'));
 assert.ok(h>l);
 s.set('lightRange',0);
 assert.equal(Number(s.vars.get('--live-light-sage')),0);
 s.set('lightRange',100);
 assert.ok(Number(s.vars.get('--live-light-sage'))>.4);
});
test('real readback and one-click audit compare rendered styles, restore input',()=>{
 assert.match(js,/getComputedStyle\(el\)/);
 assert.match(js,/verifyOpticalResponse/);
 assert.match(js,/before\[key\]\.background!==after\[key\]\.background/);
 assert.match(js,/finally\s*\{\s*control\.value=initial/);
 assert.match(js,/id="glassLiveAudit"/);
 assert.match(js,/id="glassLiveReset"/);
 assert.match(js,/MutationObserver\(queue\)/);
});
test('engine syntax, CSS balance and independence from financial and LiquidOrb logic',()=>{
 assert.doesNotThrow(()=>new Function(js));
 const source=css.replace(/\/\*[\s\S]*?\*\//g,'');
 assert.equal((source.match(/{/g)||[]).length,(source.match(/}/g)||[]).length);
 assert.doesNotMatch(js,/paintStackedLiquid/);
 assert.doesNotMatch(css,/\.hero-value\s*\{.*color:/s);
});
