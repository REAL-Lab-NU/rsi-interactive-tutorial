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
  ${script('map-art')}
`, ctx);
const { stories, chapters, controls, film, map } = vm.runInContext(
  '({ stories: STORIES, chapters: CHAPTERS, controls: MEDICAL_CONTROLS, film: makeFilm, map: atlasMap })', ctx
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

test('wide and portrait maps expose one link to each stop in narrative order', () => {
  for (const lang of [0, 1]) {
    ctx.langIndex = lang;
    for (const portrait of [false, true]) {
      const markup = map(portrait, -1);
      const stops = [...markup.matchAll(/<a class="map-stop [^"]*" href="#([^"]+)"/g)].map(m => m[1]);
      assert.deepEqual(stops, Array.from(stories, s => s.id));
      assert.doesNotMatch(markup, /undefined|NaN/);
    }
  }
});

function render(study, choice, portrait, t) {
  const clip = film(study, choice, portrait);
  return clip.svg(study).replace(/data-motion="(\d+)"/g, (_, index) =>
    Object.entries(clip.tracks[Number(index)].attrs).map(([attr, get]) => `${attr}="${get(t)}"`).join(' '));
}

test('each beat contains reversible motion in both languages and both orientations', () => {
  for (const lang of [0, 1]) {
    ctx.langIndex = lang;
    for (const portrait of [false, true]) {
      for (const study of stories) {
        for (let beat = 0; beat < 4; beat++) {
          const before = render(study, undefined, portrait, beat + .10);
          const after = render(study, undefined, portrait, beat + .86);
          assert.ok(before.includes(study.title[lang]));
          assert.doesNotMatch(before + after, /\b(?:undefined|NaN|Infinity)\b/);
          assert.notEqual(before, after, `${study.name}, beat ${beat + 1} must move`);
          assert.equal(render(study, undefined, portrait, beat + .10), before);
        }
      }
    }
  }
});

test('choices change which artifacts appear or reach their destination', () => {
  ctx.langIndex = 1;
  const at = (id, choice, t = 2.98) => render(stories.find(s => s.id === id), choice, false, t);
  assert.ok(at('star', 'miss').includes('Training answer hint'));
  assert.ok(!at('star', 'correct').includes('Training answer hint'));
  assert.ok(at('dgm', 'node6').includes('23.3% · 60 tasks'));
  assert.ok(at('dgm', 'node24').includes('40.5% · 200 tasks'));
  assert.notEqual(at('hyperagents', 'task'), at('hyperagents', 'meta'));
  const versionMarks = choice => at('hyperagents', choice).match(/class="version-mark"/g).length;
  assert.equal(versionMarks('both'), versionMarks('meta') + 1);
  assert.equal(versionMarks('task'), versionMarks('meta'));
  assert.match(at('medicalrsi', undefined, 0), /<g opacity="1"><text[^>]+>2 \/ 11<\/text>/);
  assert.match(at('medicalrsi', undefined, 3), /<g opacity="1"><text[^>]+>11 \/ 11<\/text>/);
});

test('MedicalRSI Figure 5a comparisons preserve fixed solvers and original precision', () => {
  assert.deepEqual(Array.from(controls, c => [c.id, ...c.scores, c.gain]), [
    ['q-base', 37, 61, 66, 4.7], ['q-grpo', 63, 70, 77, 7.0],
    ['g-base', 6, 47, 56, 9.1], ['g-grpo', 52, 50, 61, 10.2]
  ]);
});
