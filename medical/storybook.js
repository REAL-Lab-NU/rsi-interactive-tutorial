'use strict';
const chapterProps = {
  'base-agent': 'records',
  harness: 'tool',
  si: 'skill',
  training: 'chip',
  'fixed-solver': 'lock',
  unseen: 'book'
};
const roleSpeakers = {
  'base-agent': ['Solver', 'Solver', 'Solver', T('一起看', 'Together')],
  harness: ['Solver', 'Harness', 'Harness', 'Harness'],
  si: ['Improver', 'Improver', 'Solver', T('一起看', 'Together')],
  training: ['Solver', 'Improver', T('评测', 'Grader'), T('共享模型', 'Shared model')],
  'fixed-solver': [
    T('一起看', 'Together'),
    T('一起看', 'Together'),
    T('一起看', 'Together'),
    T('一起看', 'Together')
  ],
  unseen: ['Solver', 'Improver', 'Solver', T('一起看', 'Together')]
};
const partBeats = ['', 'prompt', 'tool', 'memory'];
let turning = null,
  pageNumber = 0,
  changeCleanups = [];

function cancelGlide() {
  cancelAnimationFrame(turning);
  turning = null;
}
function finishStoryMotion() {
  cancelGlide();
  for (const tidy of changeCleanups) tidy();
  changeCleanups = [];
}
function moveToBeat(target) {
  const from = session.t;
  halt();
  session.tour = false;
  if (reduced.matches || Math.abs(target - from) < 0.035) {
    seek(target);
    return;
  }
  let began;
  const travel = Math.min(570, 210 + 105 * Math.abs(target - from));
  function glide(now) {
    if (began === undefined) began = now;
    const frac = Math.min(1, (now - began) / travel);
    session.t = from + (target - from) * smooth(frac);
    paint();
    if (frac < 1) turning = requestAnimationFrame(glide);
    else {
      turning = null;
      updatePlay();
    }
  }
  turning = requestAnimationFrame(glide);
}
function turnStoryPage(previous, stage) {
  const present = stage.firstElementChild,
    duration = 410,
    easing = 'cubic-bezier(.33,0,.19,1)';
  // Keep the outgoing paper in the room for the turn. Rename its paint servers
  // so the page below retains its own pattern definitions.
  const suffix = '-out-' + ++pageNumber;
  previous.querySelectorAll('[id]').forEach((el) => {
    const old = el.id;
    previous
      .querySelectorAll(`[fill="url(#${old})"]`)
      .forEach((n) => n.setAttribute('fill', `url(#${old}${suffix})`));
    el.id += suffix;
  });
  previous.setAttribute('aria-hidden', 'true');
  previous.classList.add('outgoing');
  stage.append(previous);
  const outgoing = previous.animate(
    [
      { opacity: 1, transform: 'translateX(0)' },
      { opacity: 0, transform: 'translateX(-3%) rotate(-.45deg)' }
    ],
    { duration, easing }
  );
  const incoming = present.animate(
    [
      { opacity: 0.45, transform: 'translateX(3%) rotate(.35deg)' },
      { opacity: 1, transform: 'none' }
    ],
    { duration, easing }
  );
  const clear = () => {
    previous.remove();
    outgoing.cancel();
    incoming.cancel();
  };
  changeCleanups.push(clear);
  outgoing.onfinish = () => {
    clear();
    changeCleanups = changeCleanups.filter((f) => f !== clear);
  };
}
function pickStoryOption(key, value, previous) {
  if (key === 'part') {
    moveToBeat(partBeats.indexOf(value) + 0.96);
    return;
  }
  if (dom('drawing').dataset.renderer === 'webgl') {
    if (key === 'solver') moveToBeat(4);
    else {
      activeBeat = -1;
      seek(0.96);
    }
    return;
  }
  if (key === 'window') {
    session.t = reduced.matches ? 0.96 : 0;
    mountDrawing();
    if (!reduced.matches) play();
    return;
  }
  const old = MEDICAL_CONTROLS.find((c) => c.id === previous);
  const newer = MEDICAL_CONTROLS.find((c) => c.id === value);
  const stage = dom('drawing');
  const shown = Array.from(stage.querySelectorAll('.slot-lane')).map((el) => {
    const fill = el.nextElementSibling.querySelector('rect'),
      lane = el.getBoundingClientRect().width;
    return lane ? (100 * fill.getBoundingClientRect().width) / lane : 0;
  });
  session.t = 4;
  mountDrawing();
  if (!reduced.matches && old && newer) {
    const bars = dom('drawing').querySelectorAll('.slot-lane');
    const animations = Array.from(bars, (lane, i) => {
      const start = shown[i] / newer.scores[i],
        bar = lane.nextElementSibling.firstElementChild;
      return bar.animate([{ transform: `scaleX(${start})` }, { transform: 'scaleX(1)' }], {
        duration: 430,
        easing: 'cubic-bezier(.3,0,.15,1)'
      });
    });
    const clear = () => animations.forEach((a) => a.cancel());
    changeCleanups.push(clear);
    animations[0].onfinish = () => {
      clear();
      changeCleanups = changeCleanups.filter((f) => f !== clear);
    };
  }
}
COURSE.story = {
  mount(stage, s, values) {
    return typeof ClinicStudio === 'undefined' ? null : ClinicStudio.mount(stage, s, values);
  },
  beatDuration: 5900,
  mark: `<svg class="brand-mark" viewBox="-35 -18 56 39" aria-hidden="true">${markInfinite()}</svg>`,
  chapterIcon(id) {
    return `<svg class="chapter-icon" viewBox="-30 -32 60 61" aria-hidden="true">${paperProp(chapterProps[id], 0.82)}</svg>`;
  },
  waitForReader(id, values) {
    return id === 'base-agent' && !values.window;
  },
  caption(s, k, values) {
    if (s.id === 'base-agent' && k === 0 && values.window)
      return values.window === 'day'
        ? T(
            '你选的 24 小时符合题意。现在跟着蓝帽子，看论文里的那次查询实际带回了多久的记录。',
            'Your 24-hour window fits the question. Now follow the blue cap and see how far back the lookup in the paper actually went.'
          )
        : T(
            '一年里也有昨天的记录，不过更早的值会一起进来。看蓝帽子接下来有没有把它们筛出去。',
            'A year includes yesterday, and it also brings in older readings. Watch whether the blue cap filters those out.'
          );
    return s.beats[k].text;
  },
  showBeat(s, k) {
    const who = roleSpeakers[s.id][k],
      speaker = Array.isArray(who) ? l(who) : who;
    const subtitle = dom('beatno').parentElement;
    let label = subtitle.querySelector('.speaker');
    if (!label) {
      label = document.createElement('strong');
      label.className = 'speaker';
      subtitle.insertBefore(label, dom('subtitle'));
    }
    label.textContent = speaker;
    label.dataset.voice = who === 'Solver' ? 'solver' : who === 'Improver' ? 'writer' : 'guide';
    if (s.id === 'harness')
      document
        .querySelectorAll('button[data-option="part"]')
        .forEach((b) => b.setAttribute('aria-pressed', String(b.value === partBeats[k])));
  },
  choose: pickStoryOption,
  moveToBeat,
  turnPage: turnStoryPage,
  finishMotion: finishStoryMotion,
  cancelGlide
};
