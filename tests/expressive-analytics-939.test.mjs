import test from 'node:test';
import assert from 'node:assert/strict';

// The production HTML loads this classic script before its inline UI logic.
globalThis.window={};
await import('../public/expressive-analytics-939.js');
const {graph,categoryRanking,morphSignal}=globalThis.window.Nexa939;
delete globalThis.window;

test('monthly overview charts real comparison totals, not a fabricated trend',()=>{
  const markup=graph({period:'month',income:1950,expenses:3818.10,refunds:349.90},'negative');
  assert.match(markup,/Recebimentos/);
  assert.match(markup,/Saídas líquidas/);
  assert.match(markup,/1\.950,00/);
  assert.match(markup,/3\.468,20/);
  assert.match(markup,/dados? são demonstrativos|valores são demonstrativos/i);
  assert.doesNotMatch(markup,/M0 62C22 59/);
  const bars=[...markup.matchAll(/class="chart-fill"[^>]*width="([0-9.]+)"/g)].map(x=>Number(x[1]));
  assert.equal(bars.length,2);
  assert.ok(bars[0]<bars[1]);
  assert.ok(bars.every(x=>x>=0&&x<=330));
  assert.match(markup,/tabindex="0"/);
});

test('weekly chart uses spent and budget on a common scale, even after overspend',()=>{
  const within=graph({period:'week',weekly:270,budget:1200},'positive');
  assert.match(within,/270,00/);
  assert.match(within,/1\.200,00/);
  assert.match(within,/n939-green/);
  const overspent=graph({period:'week',weekly:1400,budget:1200},'negative');
  assert.match(overspent,/1\.400,00/);
  assert.match(overspent,/n939-red/);
  assert.doesNotMatch(overspent,/NaN|Infinity/);
  assert.doesNotMatch(graph({period:'week',weekly:0,budget:0},'neutral'),/NaN|Infinity/);
});

test('category ranking reflects model amounts, sorting and selected control state',()=>{
  const list=[{name:'Casa',color:'10,35,50',value:200},{name:'Moda',color:'50,40,20',value:100}];
  const html=categoryRanking(list,x=>x.value,'Casa',x=>'R$ '+x.toFixed(2));
  assert.ok(html.indexOf('Casa')<html.indexOf('Moda'));
  assert.match(html,/--ranking-share:66\.6667%/);
  assert.match(html,/--ranking-share:33\.3333%/);
  assert.match(html,/aria-pressed="true"/);
  assert.match(html,/data-category="Moda"/);
  assert.doesNotMatch(categoryRanking(list,()=>0,null,String),/NaN|Infinity/);
});

test('facial rig gives distinct emotional mouth and brows without emoji',()=>{
  const names=['[data-eye="left"]','[data-eye="right"]','[data-mouth]','[data-brow="left"]','[data-brow="right"]'];
  function sample(tone){
    const elements=new Map(names.map(name=>[name,{attrs:{},style:{},setAttribute(k,v){this.attrs[k]=v}}]));
    const hero={dataset:{mood:tone},querySelector:n=>elements.get(n)};
    morphSignal(hero,.68);
    return {mouth:elements.get('[data-mouth]').attrs.d,brow:elements.get('[data-brow="left"]').attrs.d,eye:elements.get('[data-eye="left"]').attrs.d,opacity:elements.get('[data-mouth]').style.opacity};
  }
  const sad=sample('negative'),happy=sample('positive'),cautious=sample('warning');
  assert.notEqual(sad.mouth,happy.mouth);
  assert.notEqual(sad.eye,happy.eye);
  assert.notEqual(sad.brow,cautious.brow);
  assert.ok(Number(happy.opacity)>0.5);
  assert.ok(Number(sad.opacity)>0.5);
  assert.doesNotMatch(sad.mouth+happy.mouth,/🫤/);
});
