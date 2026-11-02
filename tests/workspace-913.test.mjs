import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const get=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=get('index.html'),main=get('src/main.js'),css=get('src/workspace-913.css');
const ui=get('src/workspace-913.js'),motion=get('src/hero-transition-913.js');
const original=get('src/app.js');
const geometry=get('src/geometry-911.js');

test('9.13 mounts the workspace after the approved Sage Material and Geometry layers',()=>{
 assert.ok(html.indexOf('workspace-913.css')>html.indexOf('geometry-911.css'));
 assert.ok(main.includes("import './hero-transition-913.js';"));
 assert.ok(main.includes("import './workspace-913.js';"));
 assert.ok(html.includes("Visualize 9."));
 assert.ok(html.includes('nexa-workspace-contract'));
});
test('at 100% zoom, full-size phone and the editor share the desktop viewport',()=>{
 assert.match(css,/grid-template-columns:minmax\(420px,1fr\) minmax\(340px,var\(--inspector-width\)\)/);
 assert.match(css,/\.studio>\.rail\.left\.geometry-left\{display:none!important\}/);
 assert.match(css,/\.studio>\.phone\{/);
 assert.match(css,/\.studio>\.rail\.right\.workspace-inspector\{/);
 assert.match(css,/\.workspace-inspector \.inspector-scroll/);
 assert.match(css,/@media\(max-width:820px\)/);
});
test('four inspector tabs preserve original connected DOM controls and real geometry',()=>{
 for(const tab of ['material','pigment','geometry','motion'])
  assert.ok(ui.includes("['"+tab+"'")||ui.includes("'"+tab+"','"),tab);
 assert.match(ui,/right\.replaceChildren\(main,tabs,scroll\)/);
 for(const id of ['#shaderSwitch','#opticsSwitch','#blurRange','#filmRange','#rimRange','#lightRange','#pigmentRange','#diffuseRange','#blendRange','#motionSwitch'])
  assert.ok(ui.includes(id),id);
 assert.match(ui,/pages\.geometry\.appendChild\(geometry\)/);
 assert.match(ui,/pages\.geometry\.appendChild\(geometrySample\)/);
 assert.match(geometry,/querySelectorAll\('input\[data-geo-prop\]'\)/);
 assert.ok(geometry.includes("phone.setAttribute(attr(group,key)"));
});
test('new inspector replaces duplicate workbench instead of nesting a second modal',()=>{
 assert.match(css,/#nexa-live-lab \.wb-trigger\{display:none!important\}/);
 assert.match(ui,/stopImmediatePropagation\(\)/);
 assert.match(ui,/aria-controls/);
 assert.match(ui,/ArrowRight/);
 assert.match(ui,/Escape/);
});
test('liquid-hero intro is finite, respects reduced motion and restores analytics',()=>{
 assert.match(motion,/prefers-reduced-motion: reduce/);
 assert.match(motion,/if\(!homeVisited && !reduced.matches\)/);
 assert.match(motion,/setTimeout\(\(\)=>\{/);
 assert.match(motion,/1120/);
 assert.match(motion,/1480/);
 assert.match(motion,/hero\.classList\.add\('intro-return'\)/);
 assert.match(motion,/function settle\(hero\)/);
 assert.match(motion,/MutationObserver\(refresh\)/);
 assert.match(css,/@keyframes nexa-intro-film/);
 assert.match(css,/\.intro-return \.hero-graph-frame/);
 assert.doesNotMatch(motion,/setInterval/);
});
test('finance data, charts and nav remain in the existing application',()=>{
 for(const label of ['Saídas líquidas','R$ 3.818,10','R$ 349,90','R$ 270,00'])
  assert.ok(original.includes(label),label);
 assert.match(original,/money\(3818\.1-349\.9\)/);
 assert.ok(original.includes("function graph("));
 assert.ok(original.includes("function nav()"));
 for(const tab of ["'Início'","'Gastos'","'Anúncios'","'Cartões'","'Revisar'"])
  assert.ok(original.includes(tab));
});
test('javascript syntax and CSS braces remain well-formed',()=>{
 assert.doesNotThrow(()=>new Function(ui));
 assert.doesNotThrow(()=>new Function(motion));
 const clean=css.replace(/\/\*[\s\S]*?\*\//g,'');
 assert.equal((clean.match(/{/g)||[]).length,(clean.match(/}/g)||[]).length);
});
