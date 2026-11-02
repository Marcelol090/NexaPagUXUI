import test from 'node:test';
import assert from 'node:assert/strict';
import {buildImpactGraph} from '../scripts/design-impact-graph.mjs';

test('local impact map includes real entry modules and no broken contracts',()=>{
 const map=buildImpactGraph();
 assert.equal(map.schema,'nexapag-local-impact-v1');
 assert.deepEqual(map.errors,[]);
 assert.ok(map.nodes.includes('src/app.js'));
 assert.ok(map.nodes.includes('src/motion-studio-920.js'));
 assert.ok(map.nodes.includes('src/stacked-liquid.js'));
 assert.ok(map.edges.some(e=>e.from==='src/main.js'&&e.to==='src/motion-studio-920.js'));
 assert.ok(map.edges.some(e=>e.from==='src/main.js'&&e.to==='src/material-engine-919.js'));
 assert.ok(map.contracts.some(c=>c.id==='finance'&&c.dependsOn.includes('src/stacked-liquid.js')));
});
test('graph provenance never pretends Graphify is indexing without workspace authorization',()=>{
 const map=buildImpactGraph();
 assert.equal(map.graphify.indexed,false);
 assert.match(map.graphify.reason,/workspace/i);
 assert.equal(map.source,'GitHub repository files');
});
