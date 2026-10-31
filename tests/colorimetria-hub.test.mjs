import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const hub = read('public/colorimetria.html');
const app = read('index.html');
const study = read('materials.html');

test('colorimetria hub is self-contained and linked from all design workspaces', () => {
  assert.match(hub, /<style>/);
  assert.match(hub, /<script>/);
  assert.match(hub, /Hub de colorimetria/);
  assert.match(app, /href="\.\/colorimetria\.html"/);
  assert.match(study, /href="\.\/colorimetria\.html"/);
});
test('every material scope and comparison control stays accessible', () => {
  for (const role of ['card', 'board', 'button', 'nav'])
    assert.ok(hub.includes('data-scope="' + role + '"'), role);
  for (const id of ['baselineSpecimen', 'currentSpecimen', 'tokenList', 'cssOut', 'compareGrid'])
    assert.ok(hub.includes('id="' + id + '"'), id);
  for (const prop of ['blur','film','pigment','spread','border-alpha','highlight','shadow','saturation','brightness','border-width','radius','gap'])
    assert.ok(hub.includes('data-prop="' + prop + '"'), prop);
});
test('zero blur remains zero when switching from card to board scope', () => {
  assert.match(hub, /Number\.isFinite\(parsed\)/);
  assert.ok(!hub.includes('parseFloat(getVar(cssVar(state.scope,prop)))||input.value'));
});
