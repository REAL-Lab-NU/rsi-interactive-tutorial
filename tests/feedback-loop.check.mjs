import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

// Test the same statecharts and teaching data the standalone page actually runs.
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const model = html.match(/<script id="experiment-model">([\s\S]*?)<\/script>/)[1];
const api = vm.runInNewContext(`${model}\n({ tracks, advance, agenda, runSolver, correctCount,
  installedRule, originalImprover, learnFromOutcomes, proposeRule, studyImprovers })`);

function walk(states, start, assertions) {
  const visited = new Set();
  const queue = [{ state: start, events: [] }];
  while (queue.length) {
    const { state, events } = queue.shift();
    assertions(state, events);
    if (visited.has(state)) continue;
    visited.add(state);
    for (const [event, next] of Object.entries(states[state])) {
      // A restart starts a new run with no inherited branch history.
      queue.push({ state: next, events: event === 'restart' ? [] : [...events, event] });
    }
  }
  return visited;
}

const rules = {
  trace(state, events) {
    if (state === 'reply') assert.deepEqual(events, ['plan', 'observe', 'answer']);
  },
  si(state, events) {
    if (['installed', 'inherited'].includes(state)) assert.ok(events.includes('install'), 'Missing install');
    if (['temporary', 'forgotten'].includes(state)) assert.ok(events.includes('once'), 'Missing temporary edit');
    if (state !== 'attempt' && state !== 'feedback') assert.ok(events.includes('inspect'), 'Missing feedback');
    if (['inherited', 'forgotten'].includes(state)) assert.equal(events.at(-1), 'test');
  },
  rsi(state, events) {
    if (['learned', 'suggestions', 'comparison'].includes(state)) assert.ok(events.includes('inspect'), 'Missing outcome');
    if (['suggestions', 'comparison'].includes(state)) assert.ok(events.includes('learn'), 'Missing strategy update');
    if (state === 'comparison') assert.deepEqual(events, ['inspect', 'learn', 'apply', 'evaluate']);
  },
};

for (const [name, { states, start }] of Object.entries(api.tracks)) {
  test(`${name}: all paths respect update order and all states are reachable`, () => {
    assert.equal(walk(states, start, rules[name]).size, Object.keys(states).length);
    for (const [state, enabled] of Object.entries(states)) {
      const events = new Set(Object.values(states).flatMap(next => Object.keys(next)));
      events.add('irrelevant');
      for (const event of events) assert.equal(api.advance(name, state, event), enabled[event] ?? state);
    }
  });
}

test('the checks detect a skipped write and a shortcut around the strategy update', () => {
  const si = structuredClone(api.tracks.si.states);
  si.temporary.test = 'inherited';
  assert.throws(() => walk(si, 'attempt', rules.si), /Missing install/);
  const rsi = structuredClone(api.tracks.rsi.states);
  rsi.failure.apply = 'suggestions';
  assert.throws(() => walk(rsi, 'original', rules.rsi), /Missing strategy update/);
});

test('a saved skill survives into new questions, a one-answer correction expires', () => {
  assert.equal(api.runSolver(api.agenda.intro).room, 'B12');
  assert.equal(api.runSolver(api.agenda.intro, 'latest').room, 'C03');
  assert.equal(api.correctCount(api.agenda.next, api.installedRule('forgotten')), 2);
  assert.equal(api.correctCount(api.agenda.next, api.installedRule('inherited')), 4);
});

test('the Improver update needs a wrong-day outcome and uses traces on its next proposal', () => {
  const study = api.studyImprovers();
  assert.equal(study.outcomes[0].room, 'F21');
  assert.equal(study.outcomes[0].task.expected, 'D10');
  assert.equal(study.revised.checksDay, true);
  assert.equal(api.originalImprover.checksDay, false);
  assert.equal(api.learnFromOutcomes(api.originalImprover, []), api.originalImprover);
  const correct = api.runSolver(api.agenda.intro, 'latest');
  assert.equal(api.learnFromOutcomes(api.originalImprover, [correct]), api.originalImprover);
  assert.equal(api.proposeRule(study.revised, [correct]), 'latest');
  assert.equal(study.oldRule, 'latest');
  assert.equal(study.newRule, 'datedLatest');
});

test('evaluation is held out and includes a distribution on which the two Improvers tie', () => {
  const { oldRule, newRule } = api.studyImprovers();
  const { intro, next, learning, support, heldOut } = api.agenda;
  const ids = [intro, ...next, ...learning, ...support, ...Object.values(heldOut).flat()].map(task => task.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(['first', oldRule, newRule].map(rule => api.correctCount(heldOut.mixed, rule)), [1, 2, 4]);
  assert.deepEqual(['first', oldRule, newRule].map(rule => api.correctCount(heldOut.single, rule)), [2, 4, 4]);
});
