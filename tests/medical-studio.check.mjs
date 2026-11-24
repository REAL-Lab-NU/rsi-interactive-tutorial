import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

// Use the site's actual scene graph without a GPU. A blank texture stands in for
// the painted lettering so the test can inspect the geometry and seek the clock.
const drawingContext = {
  fillText() {},
  fillRect() {},
  createRadialGradient: () => ({ addColorStop() {} })
};
const context = vm.createContext({
  T: (zh, en) => [zh, en],
  document: { createElement: () => ({ getContext: () => drawingContext }) }
});
const run = (code) => vm.runInContext(code, context);
for (const src of ['vendor/three-r187.min.js', 'results.js', 'sculptures.js', 'experiments.js']) {
  const url = new URL('../medical/' + src, import.meta.url);
  vm.runInContext(readFileSync(url, 'utf8'), context, { filename: src });
}
function build(id) {
  return run(`ClinicExperiments['${id}'](new ClinicThree.Group())`);
}
test('each marked 3D prop belongs to the experiment and acts on a valid step or control', () => {
  for (const id of run('Object.keys(ClinicExperiments)')) {
    const scene = build(id);
    for (const key of scene.focus) {
      const { node, spot, operation, verb } = scene.actions[key];
      assert.equal(spot.parent, node);
      assert.equal(node.userData.action, key);
      assert.ok(verb.every((label) => label.length > 0));
      assert.ok(
        [0, 1, 2, 3].includes(operation.step) ||
          ['window', 'part'].includes(operation.key) ||
          operation.cycle
      );
    }
  }
});
test('handing over the skill or scrubbing the same transfer selects the same records', () => {
  const scene = build('si');
  const observations = scene.actions.book.node.children.filter((c) => c.isGroup && c.children[0]?.isMesh);
  assert.equal(observations.length, 7);
  const visible = () => observations.filter((dot) => dot.visible).length;
  scene.pose(1.96, {});
  assert.equal(visible(), 7);
  const start = scene.actions.card.node.position.x;
  scene.pose(1.96, {}, 1);
  assert.equal(visible(), 2);
  const atSolver = scene.actions.card.node.position.x;
  assert.ok(atSolver < start);
  scene.pose(2.96, {});
  assert.equal(scene.actions.card.node.position.x, atSolver);
  assert.equal(visible(), 2);
  scene.pose(0, {});
  assert.equal(visible(), 7);
});
test('seeking preserves both incoming training rewards and the held-out case counts', () => {
  const training = build('training');
  const signals = training.actions.chip.node.children.filter((c) => c.isGroup && c.children[0]?.isMesh);
  assert.equal(signals.length, 2);
  for (const [t, expected] of [
    [2.96, 0],
    [3.96, 2],
    [0, 0]
  ]) {
    training.pose(t, {});
    assert.equal(signals.filter((s) => s.visible).length, expected);
  }
  const checks = build('unseen');
  for (const [t, expected] of [
    [0, '2 / 11'],
    [2.96, '11 / 11'],
    [0.96, '2 / 11']
  ]) {
    checks.pose(t, {});
    assert.ok(checks.info(Math.floor(t), {}, t)[1].includes(expected));
  }
});
