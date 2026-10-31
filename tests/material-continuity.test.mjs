import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
const src=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=src('src/app.js'),css=src('src/material-continuity.css'),html=src('index.html');
test('cards share app shader, never render their own pigment lights',()=>{
 assert.ok(html.includes('src/material-continuity.css'));
 assert.ok(!app.includes("document.createElement('div');light.className='glass-scene'"));
 assert.ok(css.includes('.phone .ambient::before'));
 assert.ok(css.includes('.glass-site > .glass-scene{display:none!important}'));
});
test('glass controls still affect tint, blur, rim and light',()=>{
 for(const key of ['--glass-film','--glass-blur','--glass-rim-strength','--glass-glow','--pigment-strength','--pigment-diffusion','--pigment-interlock'])assert.ok(css.includes(key),key);
});
test('nested category boards never blur the glass twice',()=>{
 assert.ok(css.includes('.glass-site > .panel :is(.category-board,.finance-insight,.integrations,.callout,.day-detail)'));
 assert.ok(css.includes('backdrop-filter:none!important'));
});
