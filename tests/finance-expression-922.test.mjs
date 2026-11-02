import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {financialMood,financialFace} from '../src/finance-expression-922.js';

test('monthly expression follows net financial flow in cents',()=>{
 const negative=financialMood({period:'month',income:1950,expenses:3818.10,refunds:349.90});
 assert.equal(negative.tone,'negative');
 assert.equal(negative.difference,-151820);
 assert.match(negative.label,/Saídas/);
 const positive=financialMood({period:'month',income:4000,expenses:2000,refunds:500});
 assert.equal(positive.tone,'positive');
 assert.equal(positive.difference,250000);
 assert.equal(financialMood({period:'month',income:100,expenses:150,refunds:50}).tone,'neutral');
});
test('weekly expression reacts to spending thresholds, not cosmetic settings',()=>{
 assert.equal(financialMood({period:'week',spent:270,budget:1200}).tone,'positive');
 assert.equal(financialMood({period:'week',spent:1000,budget:1200}).tone,'warning');
 assert.equal(financialMood({period:'week',spent:1200,budget:1200}).tone,'warning');
 assert.equal(financialMood({period:'week',spent:1200.01,budget:1200}).tone,'negative');
 assert.equal(financialMood({period:'week',spent:12,budget:0}).tone,'neutral');
});
test('bespoke SVG expression has consistent semantic shape and accessible label',()=>{
 const sad=financialFace(financialMood({period:'month',income:100,expenses:200,refunds:0}));
 const happy=financialFace(financialMood({period:'week',spent:100,budget:1000}));
 assert.match(sad,/data-tone="negative"/);
 assert.match(sad,/role="img"/);
 assert.match(sad,/aria-label="Saídas superam entradas"/);
 assert.match(sad,/M12 26 Q20 18 28 26/);
 assert.match(happy,/M12 23 Q20 31 28 23/);
 assert.doesNotMatch(sad,/😀|😢|😂|<img /);
});
test('production mounts one optical surface, retained animated Forest and five tabs',()=>{
 const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
 const css=readFileSync(new URL('../src/art-direction-922.css',import.meta.url),'utf8');
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 const intro=readFileSync(new URL('../src/hero-transition-913.js',import.meta.url),'utf8');
 assert.ok(main.indexOf('art-direction-922.css')>main.indexOf('material-engine-919.css'));
 assert.match(app,/financialMood\(currentMonth/);
 assert.match(app,/data-flow-mood/);
 assert.match(css,/--live-glass-board/);
 assert.match(css,/\.nav button\.active/);
 assert.match(css,/\.flow-expression-icon/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(intro,/hero\.dataset\.flowMood/);
 assert.match(app,/\['home','Início'\]/);
 assert.match(app,/heat\(\)/);
});
