import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const load = (file) => readFileSync(new URL(file, root), 'utf8');
function course(edition) {
  const ctx = vm.createContext({
    URL,
    location: { href: `https://example.org/${edition}/` },
    matchMedia: () => ({ matches: false })
  });
  const html = load(edition + '/index.html');
  for (const [, file] of html.matchAll(/<script src="([^"]+)"><\/script>/g)) {
    if (!file.endsWith('/player.js')) vm.runInContext(load(edition + '/' + file), ctx, { filename: file });
  }
  return { ctx, run: (source) => vm.runInContext(source, ctx) };
}
const general = course('general'),
  medical = course('medical');
const array = (value) => JSON.parse(JSON.stringify(value));
test('two independent bilingual editions lead to their distinct subjects', () => {
  const g = general.run('COURSE'),
    m = medical.run('COURSE');
  assert.deepEqual(
    Array.from(g.lessons.slice(0, 4), (s) => s.id),
    ['base-agent', 'harness', 'si', 'rsi']
  );
  assert.deepEqual(
    Array.from(m.lessons, (s) => s.id),
    ['base-agent', 'harness', 'si', 'training', 'fixed-solver', 'unseen']
  );
  assert.doesNotMatch(JSON.stringify(g), /MedicalRSI|2611\.26806|临床|病例/i);
  assert.ok(!load('general/index.html').includes('medical/'));
  for (const edition of [g, m]) {
    assert.equal(new Set(edition.lessons.map((s) => s.id)).size, edition.lessons.length);
    for (const s of edition.lessons) {
      assert.equal(s.beats.length, 4);
      for (const pair of [s.title, s.deck, ...s.beats.flatMap((b) => [b.label, b.text])]) {
        assert.equal(pair.length, 2);
        assert.ok(pair.every((x) => x.trim()));
      }
    }
  }
  for (const s of m.lessons) assert.match(s.ref.url, /2611\.26806v1#(?:S\d|A\d)/);
});
test('the same tools and solver admit different feasible open-day plans for different goals', () => {
  const scores = general.run(
    `['capacity','buffer'].map(p=>{const plan=makePlan(EVENTS.day,p,'presenter');return [plan.seats,plan.gap,plan.feasible]})`
  );
  assert.deepEqual(array(scores), [
    [96, 15, true],
    [72, 60, true]
  ]);
  const changed = general.run(
    `makePlan(EVENTS.day, 'capacity', 'presenter', EVENTS.day.slots.filter(s=>s.room===1))`
  );
  assert.deepEqual(array([changed.seats, changed.gap, changed.slot.room, changed.feasible]), [
    72,
    30,
    1,
    true
  ]);
  assert.equal(general.run('evaluatePlan(EVENTS.day, EVENTS.day.slots[0]).feasible'), false);
});
test('same new task, solver, evaluator and preference isolate the proposed constraint', () => {
  const controls = general.run(
    `['capacity','buffer'].map(p=>['presenter','resource'].map(r=>{const plan=makePlan(EVENTS.night,p,r);return [plan.seats,plan.gap,plan.feasible]}))`
  );
  assert.deepEqual(array(controls), [
    [
      [96, 15, false],
      [96, 45, true]
    ],
    [
      [72, 75, true],
      [72, 75, true]
    ]
  ]);
});
test('the research map and comparison cover ten primary papers with both roles and distinct evidence', () => {
  const studies = general.run('PAPERS');
  assert.equal(studies.length, 10);
  assert.equal(new Set(studies.map((p) => p.arxiv)).size, 10);
  for (const s of studies) {
    assert.match(s.arxiv, /^(?:\d{4}\.\d{5}|cs\/\d{7})$/);
    assert.equal(s.fields.length, 4);
    for (const p of [s.evidence, s.boundary, s.locator, ...s.fields]) {
      assert.match(p[0], /[\u3400-\u9fff]/);
      assert.ok(p[1].trim());
    }
  }
  const map = general.run('researchAtlas()');
  const ids = [...map.matchAll(/class="paper-pin" href="#([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(
    ids,
    Array.from(studies, (s) => s.id)
  );
  for (const s of general.run('paperLessons')) assert.equal(s.roles.length, 3);
});
function snapshot(film, entity, t) {
  return film.svg(entity).replace(/data-motion="(\d+)"/g, (_, idx) =>
    Object.entries(film.tracks[idx].attrs)
      .map(([key, f]) => `${key}="${f(t)}"`)
      .join(' ')
  );
}
test('the reader’s prediction leaves the reported glucose query and its correction intact', () => {
  medical.run("language='en'");
  const opening = medical.run('COURSE.lessons[0]'),
    correction = medical.run('COURSE.lessons[2]'),
    story = medical.run('COURSE.story');
  assert.equal(story.waitForReader(opening.id, { window: '' }), true);
  for (const [choice, feedback] of [['day', /fits the question/], ['year', /older readings/]]) {
    assert.match(story.caption(opening, 0, { window: choice })[1], feedback);
    assert.equal(story.waitForReader(opening.id, { window: choice }), false);
    const base = medical.run(`visualFor(COURSE.lessons[0], {window:'${choice}'}, true)`);
    assert.match(snapshot(base, opening, 3.9), /<g opacity="1"><text[^>]+>Averaged the whole year</);
  }
  const improved = medical.run('visualFor(COURSE.lessons[2], COURSE.defaults, true)');
  assert.match(snapshot(improved, correction, 3.9), /<g opacity="1"><text[^>]+>Average within the window</);
});
test('every scene has seekable motion in both languages and orientations', () => {
  for (const edition of [general, medical])
    for (const lang of ['zh', 'en'])
      for (const phone of [true, false]) {
        edition.run(`language='${lang}'`);
        for (const s of edition.run('COURSE.lessons')) {
          const film = edition.run(
              `visualFor(COURSE.lessons.find(s=>s.id==='${s.id}'),COURSE.defaults,${phone})`
            ),
            entity = s.paper || s;
          for (let k = 0; k < 4; k++) {
            const a = snapshot(film, entity, k + 0.12),
              b = snapshot(film, entity, k + 0.86);
            assert.notEqual(a, b, `${edition.run('COURSE.kind')} / ${s.id}, beat ${k + 1} has no motion`);
            assert.doesNotMatch(a + b, /\b(?:undefined|NaN|Infinity)\b/);
            assert.equal(
              snapshot(film, entity, k + 0.12),
              a,
              'Seeking backwards restores the same drawing'
            );
          }
        }
      }
});
test('paper controls and matched medical figures preserve source results', () => {
  general.run("language='en'");
  const at = (id, choice) => {
    const s = general.run(`COURSE.lessons.find(s=>s.id==='${id}')`),
      film = general.run(
        `visualFor(COURSE.lessons.find(s=>s.id==='${id}'),{...COURSE.defaults,'${id}':'${choice}'},false)`
      );
    return snapshot(film, s.paper, 2.98);
  };
  assert.match(at('star', 'miss'), /Training answer hint/);
  assert.doesNotMatch(at('star', 'correct'), /Training answer hint/);
  assert.match(at('dgm', 'node6'), /23.3% · 60 tasks/);
  assert.match(at('dgm', 'node24'), /40.5% · 200 tasks/);
  assert.notEqual(at('hyperagents', 'task'), at('hyperagents', 'meta'));
  assert.deepEqual(array(medical.run('MEDICAL_CONTROLS.map(c=>[c.id,...c.scores,c.gain])')), [
    ['q-base', 37, 61, 66, 4.7],
    ['q-grpo', 63, 70, 77, 7],
    ['g-base', 6, 47, 56, 9.1],
    ['g-grpo', 52, 50, 61, 10.2]
  ]);
  const s = medical.run('COURSE.lessons.at(-1)'),
    f = medical.run('visualFor(COURSE.lessons.at(-1),COURSE.defaults,false)');
  assert.match(snapshot(f, s, 0), /<g opacity="1"><text[^>]+>2 \/ 11<\/text>/);
  assert.match(snapshot(f, s, 4), /<g opacity="1"><text[^>]+>11 \/ 11<\/text>/);
});
