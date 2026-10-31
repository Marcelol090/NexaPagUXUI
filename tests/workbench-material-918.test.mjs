import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('src/workbench-material-918.css');
const js=read('src/workbench-material-918.js');
const html=read('index.html');
const entry=read('src/main.js');
function mock(){
 const tokens=new Map();const listeners=new Map();
 const controls={
  filmRange:{id:'filmRange',value:'74'},
  rimRange:{id:'rimRange',value:'72'},
  blurRange:{id:'blurRange',value:'23'}
 };
 const root={style:{setProperty:(k,v)=>tokens.set(k,v)}};
 const document={
  documentElement:root,
  getElementById:id=>controls[id]||null,
  addEventListener:(type,fn)=>listeners.set(type,fn)
 };
 const window={NexaPagPreview:null};
 vm.runInNewContext(js,{document,window});
 const set=(id,v)=>{controls[id].value=String(v);listeners.get('input')({target:controls[id]})};
 return {tokens,set};
}
test('material layer is loaded after global geometry without erasing geometry',()=>{
 assert.ok(html.indexOf('workbench-material-918.css')>html.indexOf('geometry-system-918.css'));
 assert.ok(entry.indexOf("import './workbench-material-918.js';")>entry.indexOf("import './geometry-system-918.js';"));
 assert.doesNotThrow(()=>new Function(js));
});
test('acrylic density affects secondary cards and nav, not only hero',()=>{
 const {tokens,set}=mock();
 const initial=Number(tokens.get('--ux-inner-film'));
 set('filmRange',48);
 const low=Number(tokens.get('--ux-inner-film'));
 set('filmRange',86);
 const high=Number(tokens.get('--ux-inner-film'));
 assert.ok(initial>0&&high>initial&&initial>low);
 assert.match(css,/\.quick-board/);
 assert.match(css,/\.category-board/);
 assert.match(css,/\.nav/);
 assert.match(css,/var\(--ux-inner-film/);
});
test('border/reflection and nav blur have real CSS destinations',()=>{
 const {tokens,set}=mock();
 set('rimRange',35);const low=Number(tokens.get('--ux-inner-edge'));
 set('rimRange',100);const high=Number(tokens.get('--ux-inner-edge'));
 assert.ok(high>low);
 set('blurRange',12);assert.equal(tokens.get('--ux-nav-blur'),'7.80px');
 set('blurRange',42);assert.equal(tokens.get('--ux-nav-blur'),'27.30px');
 assert.match(css,/var\(--ux-inner-edge/);
 assert.match(css,/var\(--ux-nav-blur/);
});
test('color editor updates real data-backed category, weekly composition, and card palettes',()=>{
 assert.match(js,/NexaPagPreview\?\.setColor\(group.target,item.name,current\)/);
 for(const group of ['category','weekCat','weekCard'])assert.ok(js.includes(group));
 assert.match(js,/color\.type='color'/);
 assert.match(js,/window\.addEventListener\('nexa:state'/);
 assert.match(css,/\.wb-category-edit input\[type=color\]/);
});
test('no accidental nested glass or overriding color of financial amounts',()=>{
 assert.doesNotMatch(css,/\.txn-amount\s*[{]/);
 assert.doesNotMatch(css,/\.ambient::before/);
 assert.doesNotMatch(css,/filter:blur\(var\(--glass-blur/);
 const clean=css.replace(/\/\*[\s\S]*?\*\//g,'');
 assert.equal((clean.match(/{/g)||[]).length,(clean.match(/}/g)||[]).length);
});
