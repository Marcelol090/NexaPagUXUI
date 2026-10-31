import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const script=read('src/control-fidelity-917.js');
const css=read('src/control-fidelity-917.css');
const html=read('index.html');
const entry=read('src/main.js');

function sandboxControls(){
 const variables=new Map();
 const registered=new Map();
 const jobs=[];
 class Range{
  constructor(id,value,min=0,max=100){
   this.id=id;this.type='range';this.value=String(value);
   this.min=String(min);this.max=String(max);this.step='1';
  }
  hasAttribute(){return false}
 }
 const defaults={
  blurRange:23,filmRange:74,rimRange:72,lightRange:78,
  pigmentRange:74,diffuseRange:20,blendRange:44,
  orbRefraction:48,orbSeam:40,orbMotion:68
 };
 const inputs=Object.fromEntries(Object.entries(defaults).map(([k,v])=>[k,new Range(k,v)]));
 const root={style:{setProperty(k,v){variables.set(k,v)}}};
 const document={
  documentElement:root,
  getElementById(id){return inputs[id]||null},
  addEventListener(type,callback){registered.set(type,callback)},
  querySelector(){return null}
 };
 const window={};
 const globals={
  document,window,HTMLInputElement:Range,
  requestAnimationFrame(fn){jobs.push(fn);return jobs.length},
  getComputedStyle(){return{getPropertyValue(key){return variables.get(key)||''}}}
 };
 vm.runInNewContext(script,globals);
 const set=(id,value)=>{
  inputs[id].value=String(value);
  registered.get('input')?.({target:inputs[id]});
  while(jobs.length)jobs.shift()();
 };
 return {variables,inputs,set,window};
}
test('9.17 is the final visual layer and has no obsolete second inspector',()=>{
 assert.ok(html.includes('src/control-fidelity-917.css'));
 assert.ok(entry.includes("import './control-fidelity-917.js';"));
 assert.ok(entry.indexOf("import './control-fidelity-917.js';")>entry.indexOf("import './workspace-913.js';"));
});
test('glass and pigment settings have actual CSS consumers, not decorative sliders',()=>{
 for(const key of ['--ux-ambient-sage','--ux-ambient-sky','--ux-mist-opacity',
  '--ux-ambient-mix','--ux-ambient-secondary','--ux-rim-alpha','--ux-rim-highlight'])
  assert.ok(script.includes(key)&&css.includes(key),key);
 assert.match(css,/\.phone:not\(\.no-shader\) \.ambient::before/);
 assert.match(css,/\.phone:not\(\.no-shader\) \.mist/);
 assert.match(css,/\.phone:not\(\.no-optics\) \.glass-site>/);
 assert.match(css,/\.phone\.no-optics/);
});
test('light behind cards slider changes the actual ambient intensity 0 -> 100',()=>{
 const s=sandboxControls();
 s.set('lightRange',0);
 assert.equal(Number(s.variables.get('--ux-ambient-sage')),0);
 assert.equal(Number(s.variables.get('--ux-ambient-sky')),0);
 s.set('lightRange',100);
 assert.ok(Number(s.variables.get('--ux-ambient-sage'))>.5);
 assert.ok(Number(s.variables.get('--ux-ambient-sky'))>.3);
});
test('pigment and tonal mixing are independent and measurable',()=>{
 const s=sandboxControls();
 s.set('blendRange',0);
 const low=s.variables.get('--ux-ambient-secondary');
 const lowOpacity=Number(s.variables.get('--ux-mist-opacity'));
 s.set('blendRange',100);
 const high=s.variables.get('--ux-ambient-secondary');
 const highOpacity=Number(s.variables.get('--ux-mist-opacity'));
 assert.notEqual(low,high);
 assert.ok(highOpacity>lowOpacity);
 s.set('pigmentRange',0);
 assert.equal(Number(s.variables.get('--ux-mist-opacity')),0);
});
test('pigment 100 to 110 remains responsive at the full original slider range',()=>{
 const s=sandboxControls();
 s.set('pigmentRange',100);
 const before=Number(s.variables.get('--ux-ambient-sage'));
 s.set('pigmentRange',110);
 assert.ok(Number(s.variables.get('--ux-ambient-sage'))>before);
});
test('motion switch turns off the one-shot finance intro',()=>{
 const script=read('src/hero-transition-913.js');
 assert.ok(script.includes("classList.contains('no-motion')"));
});
test('rim reflection controls a real border/shadow response',()=>{
 const s=sandboxControls();
 s.set('rimRange',0);
 const before=Number(s.variables.get('--ux-rim-alpha'));
 s.set('rimRange',100);
 assert.ok(Number(s.variables.get('--ux-rim-alpha'))>before);
 assert.ok(Number(s.variables.get('--ux-rim-highlight'))>.2);
 assert.match(css,/border-color:rgba\(229,245,235,var\(--ux-rim-alpha/);
});
test('physics sliders remain connected to original orb controls through bridge',()=>{
 for(const id of ['orbRefraction','orbSeam','orbMotion']){
  assert.ok(script.includes(id),id);
  assert.ok(html.includes('id="'+id+'"'),id);
 }
 assert.match(script,/NexaPagPreview\?\.setControl\(id,input.value\)/);
 assert.match(script,/id="motionOpenOrb"/);
});
test('all required ranges are discoverable through inspector diagnostic API',()=>{
 const {window}=sandboxControls();
 const all=window.NexaPagControlsQA.check();
 assert.equal(all.length,10);
 assert.equal(all.filter(x=>x.available).length,10);
});
test('source is valid JS/CSS and preserves dark glass and semantic colors',()=>{
 assert.doesNotThrow(()=>new Function(script));
 const clean=css.replace(/\/\*[\s\S]*?\*\//g,'');
 assert.equal((clean.match(/{/g)||[]).length,(clean.match(/}/g)||[]).length);
 assert.ok(!css.includes('.txn-amount{'));
 assert.ok(!css.includes('.quick-icon svg{'));
});
