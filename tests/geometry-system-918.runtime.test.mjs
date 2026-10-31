import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const js=readFileSync(new URL('../src/geometry-system-918.js',import.meta.url),'utf8');

function fakeWorkbench(){
 const frames=[];
 const memory=new Map();
 class Element{
  constructor(id=''){
   this.id=id;this.attrs=new Map();this.nodes=new Map();this.events=new Map();
   this.dataset={};this.value='';this.style={values:new Map(),
    setProperty:(k,v)=>this.style.values.set(k,v),
    removeProperty:k=>this.style.values.delete(k)};
  }
  setAttribute(k,v){this.attrs.set(k,v)}
  removeAttribute(k){this.attrs.delete(k)}
  addEventListener(k,fn){this.events.set(k,fn)}
  insertBefore(){}
  append(){}
  set innerHTML(html){
   this.html=html;
   if(html.includes('data-ds-prop')){
    for(const id of ['radius','gap','padding','border','icon']){
     const slider=new Element('gg-'+id);slider.dataset.dsProp=id;slider.value='0';
     const number=new Element('gg-number-'+id);number.dataset.dsNum=id;number.value='0';
     this.nodes.set('[data-ds-prop="'+id+'"]',slider);
     this.nodes.set('[data-ds-num="'+id+'"]',number);
    }
    for(const id of ['ggFeedback','ggState','ggReset','ggCopy','ggSave','ggLoad'])
     this.nodes.set('#'+id,new Element(id));
    for(const p of [.1,.25,.5,1]){
     const btn=new Element();btn.dataset.ggStep=String(p);
     this.nodes.set('[data-gg-step="'+p+'"]',btn);
    }
    for(const p of [320,360,390,408]){
     const btn=new Element();btn.dataset.ggDevice=String(p);
     this.nodes.set('[data-gg-device="'+p+'"]',btn);
    }
   }
   if(html.includes('gg-refinements-body'))
    this.nodes.set('.gg-refinements-body',new Element());
  }
  querySelector(selector){
   if(this.id==='phone')return new Element('computed-sample');
   return this.nodes.get(selector)||null;
  }
  querySelectorAll(selector){
   if(this.id==='phone')return [new Element('surface-1'),new Element('surface-2')];
   if(selector==='[data-ds-prop]')return [...this.nodes.entries()].filter(([k])=>k.startsWith('[data-ds-prop="')).map(([,v])=>v);
   if(selector==='[data-ds-num]')return [...this.nodes.entries()].filter(([k])=>k.startsWith('[data-ds-num="')).map(([,v])=>v);
   if(selector==='[data-gg-step]')return [...this.nodes.entries()].filter(([k])=>k.startsWith('[data-gg-step="')).map(([,v])=>v);
   if(selector==='[data-gg-device]')return [...this.nodes.entries()].filter(([k])=>k.startsWith('[data-gg-device="')).map(([,v])=>v);
   return [];
  }
 }
 const phone=new Element('phone');
 const original=new Element('geometryHub');
 const page=new Element('inspector-panel-geometry');
 page.nodes.set('.geo-specimen',new Element('specimen'));
 const content=new Element('content');
 const elements={phone,geometryHub:original,'inspector-panel-geometry':page,content};
 const document={
  getElementById:id=>elements[id]||null,
  createElement:()=>new Element(),
  body:{appendChild(){}}
 };
 const win={};
 const globals={document,window:win,
  getComputedStyle:()=>({borderRadius:'18px',gap:'10px',paddingTop:'14px',borderTopWidth:'1px'}),
  requestAnimationFrame:fn=>{frames.push(fn);return frames.length},
  MutationObserver:class{observe(){}},
  navigator:{},localStorage:{setItem:(k,v)=>memory.set(k,v),getItem:k=>memory.get(k)||null}};
 vm.runInNewContext(js,globals);
 while(frames.length)frames.shift()();
 const flush=()=>{while(frames.length)frames.shift()()};
 return {api:win.NexaPagGlobalGeometry,phone,page,flush};
}
test('single fractional radius token broadcasts to every current and future component',()=>{
 const {api,phone,flush}=fakeWorkbench();
 assert.ok(api);
 assert.equal(phone.attrs.has('data-ds-radius'),false);
 assert.equal(api.apply('radius',12.25),true);
 flush();
 assert.equal(phone.style.values.get('--ds-radius'),'12.25px');
 assert.equal(phone.attrs.has('data-ds-radius'),true);
 assert.ok(api.snapshot().changed.includes('radius'));
 assert.ok(api.countTargets()>0);
});
test('fractional hairline borders and gaps preserve precision',()=>{
 const {api,phone,flush}=fakeWorkbench();
 api.apply('border',.25);api.apply('gap',.1);flush();
 assert.equal(phone.style.values.get('--ds-border'),'0.25px');
 assert.equal(phone.style.values.get('--ds-gap'),'0.1px');
 assert.equal(api.snapshot().changed.length,2);
});
test('mobile viewport previews modify phone CSS width without scaling',()=>{
 const {api,phone,flush}=fakeWorkbench();
 api.changeDevice(320);flush();
 assert.equal(phone.dataset.dsDevice,'320');
 assert.equal(phone.style.values.get('--ds-device-width'),'320px');
 api.changeDevice(408);flush();
 assert.equal(phone.style.values.has('--ds-device-width'),false);
});
test('restoring global geometry removes every injected token',()=>{
 const {api,phone,flush}=fakeWorkbench();
 api.apply('radius',12.1);api.apply('border',.25);api.apply('gap',3.5);
 api.changeDevice(320);flush();api.reset();flush();
 assert.equal(api.snapshot().changed.length,0);
 assert.equal(phone.attrs.has('data-ds-radius'),false);
 assert.equal(phone.attrs.has('data-ds-border'),false);
 assert.equal(phone.style.values.has('--ds-radius'),false);
 assert.equal(phone.style.values.has('--ds-border'),false);
 assert.equal(phone.style.values.has('--ds-device-width'),false);
});
