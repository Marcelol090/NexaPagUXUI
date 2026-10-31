import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const source=read('src/motion-studio-920.js');
const css=read('src/motion-studio-920.css');
const entry=read('src/main.js');
const pkg=JSON.parse(read('package.json'));

function mount({reduced=false}={}){
 const variables=new Map(),attributes=new Set(),events=new Map();
 class FakeElement{
  constructor(){this.isConnected=true;this.cancelled=0}
  getClientRects(){return [{}]}
  animate(frames,options){
   this.animation={frames,options,cancel:()=>this.cancelled++};
   return this.animation;
  }
 }
 const sample=new FakeElement();
 const phone={
  style:{setProperty:(key,value)=>variables.set(key,value)},
  dataset:{},classList:{contains:()=>false},
  toggleAttribute(name,on){if(on)attributes.add(name);else attributes.delete(name)}
 };
 const make=()=>({style:{setProperty(){}},textContent:'',addEventListener(type,fn){this.listener=this.listener||{};this.listener[type]=fn},setAttribute(name,value){this[name]=value}});
 const buttons=Object.fromEntries(['nmReplay','nmPause','nmReset','nmTimeEnd','nmCurveName','nmStatus','nmReadback'].map(k=>['#'+k,make()]));
 const controls=[
  ...['duration','stagger','travel','lift','press','shadow','ambient'].map(k=>({
   dataset:{nmKey:k},type:'range',tagName:'INPUT',value:'',addEventListener(type,fn){events.set(k,fn)}
  })),
  {dataset:{nmKey:'ease'},type:'select-one',tagName:'SELECT',value:'',addEventListener(type,fn){events.set('ease',fn)}},
  {dataset:{nmKey:'auto'},type:'checkbox',tagName:'INPUT',checked:true,addEventListener(type,fn){events.set('auto',fn)}}
 ];
 const outputs=controls.filter(x=>x.type==='range').map(x=>({dataset:{nmOutput:x.dataset.nmKey},textContent:''}));
 const presets=['suave','equilibrado','editorial'].map(k=>({
  dataset:{nmPreset:k},textContent:k,addEventListener(type,fn){this.listener=fn},setAttribute(name,value){this[name]=value}
 }));
 const studio={
  style:{setProperty(){}},setAttribute(){},
  querySelector:selector=>buttons[selector]||null,
  querySelectorAll:selector=>selector==='[data-nm-key]'?controls:
    selector==='[data-nm-output]'?outputs:selector==='[data-nm-preset]'?presets:[]
 };
 const panel={querySelector:()=>null,insertBefore(){}};
 const content={querySelector:()=>sample,querySelectorAll:()=>[sample]};
 const document={
  createElement:()=>studio,
  getElementById:id=>id==='phone'?phone:id==='inspector-panel-motion'?panel:id==='content'?content:null,
  addEventListener(){}
 };
 let watcher=null;
 const context={
  document,Element:FakeElement,
  localStorage:{getItem:()=>null,setItem(){}},
  window:{matchMedia:()=>({matches:reduced,addEventListener(){}}),NexaPagPreview:{getState:()=>({tab:'home'})}},
  MutationObserver:class{constructor(fn){watcher=fn}observe(){}},
  requestAnimationFrame:fn=>{fn();return 1},cancelAnimationFrame(){},
  getComputedStyle:()=>({transitionDuration:'0.26s',transitionTimingFunction:'ease-out'})
 };
 vm.runInNewContext(source,context);
 const set=(key,value)=>{
  const input=controls.find(x=>x.dataset.nmKey===key);
  if(input.type==='checkbox')input.checked=value;else input.value=String(value);
  events.get(key)();
 };
 return {api:context.window.NexaPagMotionStudio,variables,attributes,buttons,controls,sample,set,watcher};
}
test('Vite loads motion stylesheet and script AFTER shared Material Engine 9.19',()=>{
 assert.ok(entry.indexOf("import './motion-studio-920.css';")>entry.indexOf("import './material-engine-919.css';"));
 assert.ok(entry.indexOf("import './motion-studio-920.js';")>entry.indexOf("import './material-engine-919.js';"));
 assert.match(pkg.scripts.build,/test:motion/);
 assert.match(pkg.scripts['check:syntax'],/motion-studio-920\.js/);
});
test('exact motion variables update in original phone, without scaling or width changes',()=>{
 const {api,variables}=mount();
 assert.equal(variables.get('--nm-duration'),'260ms');
 assert.equal(api.apply('duration',410),true);
 assert.equal(variables.get('--nm-duration'),'410ms');
 assert.equal(api.apply('lift',3.5),true);
 assert.equal(variables.get('--nm-lift'),'3.5px');
 assert.equal(api.apply('press',3),true);
 assert.equal(variables.get('--nm-press'),'0.97');
 assert.equal(api.apply('notAControl',20),false);
 for(const key of variables.keys())assert.ok(!/width|height|scale|geometry/.test(key),key);
});
test('shadow override only activates on explicit edit, reset returns original look',()=>{
 const {api,attributes,set}=mount();
 assert.equal(attributes.has('data-nm-shadow'),false);
 set('shadow',73);
 assert.equal(attributes.has('data-nm-shadow'),true);
 assert.ok(api.inspect().shadowEdited);
 api.reset();
 assert.equal(attributes.has('data-nm-shadow'),false);
 assert.equal(api.inspect().values.shadow,48);
});
test('finite choreography uses real component, correct easing and timing',()=>{
 const {api,sample}=mount();
 api.apply('duration',340);
 api.apply('stagger',50);
 assert.equal(api.preview(),true);
 assert.equal(sample.animation.options.duration,340);
 assert.equal(sample.animation.options.delay,0);
 assert.equal(sample.animation.options.fill,'none');
 assert.equal(sample.animation.frames[1].opacity,1);
 api.stop();
 assert.equal(sample.cancelled,1);
});
test('system reduced motion bypasses choreography',()=>{
 const {api}=mount({reduced:true});
 assert.equal(api.preview(),false);
 assert.equal(api.inspect().enabled,false);
});
test('no rogue geometry rules, CSS balanced, reduced-motion and no-animation guards',()=>{
 assert.doesNotThrow(()=>new Function(source));
 assert.equal((css.match(/{/g)||[]).length,(css.match(/}/g)||[]).length);
 assert.doesNotMatch(css,/#phone\s*[{][^}]*\b(width|height|scale):/s);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/#phone\.no-motion/);
 assert.match(css,/#phone\[data-nm-shadow\]/);
 assert.match(css,/--nm-ambient-factor/);
 assert.match(source,/MutationObserver/);
 assert.match(source,/getComputedStyle/);
});
