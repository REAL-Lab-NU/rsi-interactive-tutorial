import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
function script(id) {
  const match = html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`));
  assert.ok(match, `Missing inline script ${id}`);
  return match[1];
}

const ctx = vm.createContext({ langIndex: 0 });
vm.runInContext(`
  const l = pair => pair[langIndex];
  const esc = text => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  ${script('survey-data')}
  ${script('paper-diagrams')}
`, ctx);
const { stories, chapters, controls, draw } = vm.runInContext(
  '({ stories: STORIES, chapters: CHAPTERS, controls: MEDICAL_CONTROLS, draw: scene })', ctx
);

test('one ordered narrative, with bilingual feedback, persistence, updater and evidence for each paper', () => {
  assert.equal(stories[0].id, 'base-agent');
  const studies = stories.slice(1);
  assert.equal(studies.length, 11);
  assert.equal(new Set(studies.map(s => s.arxiv)).size, studies.length);
  const order = Array.from(new Set(stories.map(s => s.chapter)));
  assert.deepEqual(order, Array.from(chapters.slice(0, -1), c => c.id));
  assert.equal(chapters.at(-1).id, 'compare');
  assert.equal(new Set([...stories, ...chapters].map(s => s.id)).size, stories.length + chapters.length);
  for (const study of studies) {
    assert.match(study.arxiv, /^(?:\d{4}\.\d{5}|cs\/\d{7})$/);
    assert.equal(study.fields.length, 4);
    for (const pair of [study.body, study.boundary, study.evidence, study.locator, ...study.fields]) {
      assert.equal(pair.length, 2);
      assert.match(pair[0], /[\u3400-\u9fff]/);
      assert.ok(pair[1].trim());
    }
  }
});

test('every illustrated step renders from the shipped model in both languages', () => {
  for (const lang of [0, 1]) {
    ctx.langIndex = lang;
    for (const s of stories) {
      const frames = new Set();
      for (let i = 0; i < s.steps.length; i++) {
        const frame = draw(s, i, undefined, true, 'test');
        assert.match(frame, /^<svg\b/);
        assert.ok(frame.includes(s.steps[i].title[lang]));
        assert.doesNotMatch(frame, /\bundefined\b|\bNaN\b/);
        frames.add(frame);
      }
      assert.equal(frames.size, s.steps.length);
    }
  }
});

test('experimental controls change the artifact or program shown', () => {
  ctx.langIndex = 1;
  const figure = (id, step, choice) => draw(stories.find(s => s.id === id), step, choice, false, 'test');
  assert.ok(figure('star', 1, 'miss').includes('TRAINING HINT'));
  assert.ok(!figure('star', 1, 'correct').includes('TRAINING HINT'));
  assert.ok(figure('dgm', 2, 'node6').includes('23.3% · 60 tasks'));
  assert.ok(figure('dgm', 2, 'node24').includes('40.5% · 200 tasks'));
  assert.notEqual(figure('hyperagents', 2, 'task'), figure('hyperagents', 2, 'meta'));
  assert.equal(figure('hyperagents', 2, 'both').match(/>Transferred</g).length, 2);
  assert.equal(figure('medicalrsi', 0).match(/class="check-ok"/g).length, 2);
  assert.equal(figure('medicalrsi', 2).match(/class="check-ok"/g).length, 13);
});

test('MedicalRSI Figure 5a comparisons preserve fixed solvers and original precision', () => {
  assert.deepEqual(Array.from(controls, c => [c.id, ...c.scores, c.gain]), [
    ['q-base', 37, 61, 66, 4.7], ['q-grpo', 63, 70, 77, 7.0],
    ['g-base', 6, 47, 56, 9.1], ['g-grpo', 52, 50, 61, 10.2]
  ]);
});
