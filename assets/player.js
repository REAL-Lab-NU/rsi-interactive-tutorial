'use strict';
const isSurvey = COURSE.kind === 'general';
const lessons = COURSE.lessons;
const read = (id) => lessons.find((s) => s.id === id);
const choices = { ...COURSE.defaults };
const pair = ['meta-harness', 'hyperagents'];
const session = { id: '', t: 0, playing: false, tour: false, modal: null, resume: false };
let frame = 0,
  tickAt = 0,
  activeBeat = -1,
  draw = null,
  opener = null;
const duration = 4600;
function routeId() {
  let id = '';
  try {
    id = decodeURIComponent(location.hash.slice(1));
  } catch {}
  return COURSE.aliases[id] || id || lessons[0].id;
}
function recordRoute(id, replace = false) {
  const u = new URL(location.href);
  u.hash = id;
  if (u.href !== location.href) history[replace ? 'replaceState' : 'pushState'](null, '', u);
}
function railway() {
  const active = read(session.id);
  return `<nav class="rail" aria-label="${words('章节', 'Chapters')}">${COURSE.groups
    .map(
      ([name, ids]) =>
        `<div class="rail-group"><div class="rail-name">${esc(l(name))}</div><div class="rail-path">${ids
          .map((id) => {
            const s = read(id);
            const current = id === session.id || (id === 'atlas' && active?.paper);
            return `<a class="rail-stop" href="#${id}" ${current ? 'aria-current="step"' : ''}><i></i><span>${esc(l(s ? s.tab : T('浏览方法', 'Browse methods')))}</span></a>`;
          })
          .join('')}</div></div>`
    )
    .join('')}</nav>`;
}
function optionsFor(s) {
  if (!s.options?.length) return '';
  const controls = s.options.map(({ key, label, values, kind }) => {
    const heading = esc(l(label));
    if (kind === 'select') {
      const options = values.map(
        ([value, title]) =>
          `<option value="${value}" ${value === choices[key] ? 'selected' : ''}>${esc(l(title))}</option>`
      );
      return `<label class="select-option">${heading}<select data-option="${key}">${options.join('')}</select></label>`;
    }
    const buttons = values.map(
      ([value, title]) =>
        `<button data-option="${key}" value="${value}" aria-pressed="${choices[key] === value}">${esc(l(title))}</button>`
    );
    return `<div class="switch-group"><span class="control-label">${heading}</span>
      <div class="switches" role="group" aria-label="${heading}">${buttons.join('')}</div></div>`;
  });
  return `<div class="options">${controls.join('')}</div>`;
}
function roleKey(s) {
  if (!s.roles) return '';
  const roles = [
    ['Solver', 'accent'],
    ['Improver', 'secondary'],
    [l(T('保留', 'Persists')), 'neutral']
  ];
  return `<div class="role-key">${s.roles.map((v, i) => `<span><i class="${roles[i][1]}"></i><b>${roles[i][0]}</b> ${esc(l(v))}</span>`).join('')}</div>`;
}
function actionFor(s) {
  const idx = lessons.indexOf(s),
    next = lessons[idx + 1];
  if (isSurvey && s.id === 'rsi') return ['atlas', T('进入论文图谱', 'Explore the papers')];
  if (!next)
    return [
      isSurvey ? 'atlas' : lessons[0].id,
      isSurvey ? T('回到论文图谱', 'Back to papers') : T('回到开头', 'Start again')
    ];
  return [next.id, T('下一幕', 'Next scene')];
}
function sourceTag(s) {
  if (s.paper) return sourceLink('https://arxiv.org/abs/' + s.paper.arxiv, s.paper.locator);
  if (s.ref) return sourceLink(s.ref.url, s.ref.label);
  return `<span class="illustrative">${words('教学模拟', 'Teaching simulation')}</span>`;
}
function scenePage(s) {
  const [next, nextLabel] = actionFor(s);
  const back = s.paper
    ? `<a class="utility" href="#atlas">${icon('map')}${words('论文图谱', 'Papers')}</a><button class="utility" data-panel="compare" aria-label="${words('论文对照', 'Compare papers')}">${icon('compare')}</button>`
    : '';
  const steps = s.beats.map(
    (item, i) => `<button data-beat="${i}"><i></i><span>${esc(l(item.label))}</span></button>`
  );
  const notesLabel = s.paper ? words('论文笔记', 'Paper notes') : words('讲解笔记', 'Notes');
  const extraSources = (s.links || []).map((v) => sourceLink(v.url, v.label)).join('');
  return `<div class="lesson-head">
      <div><h1 id="page-title">${esc(l(s.title))}</h1><p>${esc(l(s.deck))}</p></div>
      <div class="heading-tools">${back}<button class="utility" data-panel="notes">${icon('notes')}${notesLabel}</button></div>
    </div>
    <section class="screen" aria-label="${words('可交互动画', 'Interactive animation')}">
      ${roleKey(s)}${optionsFor(s)}
      <div id="drawing" class="drawing${s.paper ? ' paper-film' : ''}"></div>
      <div class="subtitle"><span id="beatno" class="beatno"></span><p id="subtitle"></p></div>
    </section>
    <section class="controls" aria-label="${words('播放控制', 'Playback controls')}">
      <button id="play" class="play"></button>
      <div class="scrub">
        <input id="seek" type="range" min="0" max="4000" step="1" aria-label="${words('动画进度', 'Animation time')}">
        <div class="steps">${steps.join('')}</div>
      </div>
      <a class="continue" href="#${next}">${esc(l(nextLabel))}${icon('next')}</a>
    </section>
    <footer class="scene-foot">${sourceTag(s)}${extraSources}</footer>`;
}
function notesFor(s) {
  let content = '';
  if (s.paper) {
    const p = s.paper;
    content = `<p class="source-author">${esc(p.author)} · ${p.year}</p><h3>${esc(l(p.title))}</h3><p>${esc(l(p.body))}</p><h3>${words('证据与边界', 'Evidence and limits')}</h3><p>${esc(l(p.evidence))}</p><p>${esc(l(p.boundary))}</p>${p.aside ? `<h3>${esc(p.aside.name)}</h3><p>${esc(l(p.aside.text))}</p>${sourceLink('https://arxiv.org/abs/' + p.aside.arxiv, T(p.aside.name, p.aside.name))}` : ''}`;
  } else content = `<h3>${esc(l(s.note[0]))}</h3><p>${esc(l(s.note[1]))}</p>`;
  return (
    content +
    `<ol class="beat-notes">${s.beats.map((b) => `<li><b>${esc(l(b.label))}</b><p>${esc(l(b.text))}</p></li>`).join('')}</ol><div class="source-list">${sourceTag(s)}${s.links ? s.links.map((v) => sourceLink(v.url, v.label)).join('') : ''}</div>`
  );
}
function paintPanel(restore) {
  const compare = session.modal === 'compare';
  dom('panel-title').textContent = compare ? l(T('论文对照', 'Compare papers')) : l(read(session.id).title);
  dom('close-panel').setAttribute('aria-label', l(T('关闭', 'Close')));
  dom('close-panel').innerHTML = icon('close');
  dom('panel-body').innerHTML = compare ? comparisonContent(pair) : notesFor(read(session.id));
  if (restore) dom('panel').querySelector(restore)?.focus({ preventScroll: true });
}
function openPanel(kind, trigger = null) {
  if (session.modal || (kind === 'notes' && !read(session.id)) || (kind === 'compare' && !isSurvey)) return;
  session.modal = kind;
  opener = trigger || document.activeElement;
  session.resume = session.playing;
  halt();
  paintPanel();
  dom('panel').showModal();
  dom('close-panel').focus({ preventScroll: true });
}
function closePanel(resume = true) {
  if (!session.modal) return;
  session.modal = null;
  dom('panel').close();
  if (resume && routeId() === 'compare') recordRoute(session.id, true);
  if (resume && opener?.isConnected) opener.focus({ preventScroll: true });
  if (resume && session.resume && !document.hidden) play();
  session.resume = false;
  opener = null;
}
function render(focus = false, animation = false) {
  const s = read(session.id);
  dom('mast').innerHTML = mast(COURSE.edition);
  dom('rail').innerHTML = railway();
  const rail = dom('rail').querySelector('.rail'),
    current = rail.querySelector('[aria-current="step"]');
  if (current && rail.scrollWidth > rail.clientWidth) {
    const edge = current.getBoundingClientRect().right - rail.getBoundingClientRect().right;
    if (edge > 0) rail.scrollLeft += edge + 10;
  }
  document.title = `${s ? l(s.title) : l(T('论文图谱', 'Research atlas'))} · ${l(COURSE.edition)}`;
  dom('content').innerHTML = s ? scenePage(s) : researchAtlas();
  if (s) mountDrawing();
  else draw = null;
  if (focus) dom('content').focus({ preventScroll: true });
  if (animation && !reduced.matches)
    dom('content').animate(
      [
        { opacity: 0.73, transform: 'translateY(4px)' },
        { opacity: 1, transform: 'none' }
      ],
      { duration: 245, easing: 'cubic-bezier(.2,.6,.2,1)' }
    );
}
function mountDrawing() {
  const s = read(session.id);
  if (!s) return;
  const film = visualFor(s, choices, compact.matches),
    stage = dom('drawing');
  stage.innerHTML = film.svg(s.paper || s);
  draw = bindFilm(stage.firstElementChild, film);
  activeBeat = -1;
  paint();
  updatePlay();
}
function caption(s, k) {
  if (s.id === 'star' && k === 1 && choices.star === 'correct')
    return T(
      '预测正确，原来的理由直接进入训练候选集。',
      'The prediction is correct. Its original rationale enters the training set.'
    );
  return s.beats[k].text;
}
function paint() {
  if (!draw) return;
  const k = Math.max(0, Math.min(3, Math.floor(session.t)));
  draw(reduced.matches ? k + 0.96 : session.t);
  const slider = dom('seek');
  slider.value = String(Math.round(session.t * 1000));
  slider.style.setProperty('--progress', session.t * 25 + '%');
  if (k === activeBeat) return;
  activeBeat = k;
  const s = read(session.id);
  dom('beatno').textContent = k + 1 + ' / 4';
  dom('subtitle').textContent = l(caption(s, k));
  slider.setAttribute('aria-valuetext', k + 1 + ' / 4 · ' + l(s.beats[k].label));
  document.querySelectorAll('[data-beat]').forEach((b, i) => {
    if (k === i) b.setAttribute('aria-current', 'step');
    else b.removeAttribute('aria-current');
  });
}
function updatePlay() {
  const b = dom('play');
  if (!b) return;
  const key = session.playing ? 'pause' : session.t >= 4 ? 'replay' : 'play';
  b.innerHTML = icon(key);
  const label = { pause: T('暂停', 'Pause'), replay: T('重播', 'Replay'), play: T('播放', 'Play') }[key];
  b.title = l(label);
  b.setAttribute('aria-label', l(label));
}
function halt() {
  cancelAnimationFrame(frame);
  frame = 0;
  tickAt = 0;
  session.playing = false;
  updatePlay();
}
function tick(now) {
  if (!session.playing) return;
  if (tickAt) session.t = Math.min(4, session.t + (now - tickAt) / duration);
  tickAt = now;
  paint();
  if (session.t < 4) {
    frame = requestAnimationFrame(tick);
    return;
  }
  const next = lessons[lessons.findIndex((s) => s.id === session.id) + 1];
  if (session.tour && next?.paper) go(next.id, { tour: true, auto: true, focus: false, replace: true });
  else {
    halt();
    session.tour = false;
  }
}
function play() {
  if (!read(session.id) || session.modal || session.playing) return;
  if (session.t >= 4) session.t = 0;
  session.playing = true;
  tickAt = 0;
  updatePlay();
  paint();
  frame = requestAnimationFrame(tick);
}
function seek(t) {
  halt();
  session.tour = false;
  session.t = Math.min(4, Math.max(0, t));
  paint();
  updatePlay();
}
function go(
  id,
  { historyUpdate = true, focus = true, auto = !reduced.matches, tour = false, replace = false } = {}
) {
  id = COURSE.aliases[id] || id;
  const compare = isSurvey && id === 'compare';
  if (compare) id = 'atlas';
  if (!read(id) && !(isSurvey && id === 'atlas')) id = lessons[0].id;
  const changed = session.id !== id;
  closePanel(false);
  halt();
  session.id = id;
  session.tour = tour;
  session.t = reduced.matches ? 0.94 : 0;
  if (historyUpdate) recordRoute(compare ? 'compare' : id, replace);
  render(focus, changed && focus);
  if (compare) openPanel('compare');
  else if (auto) play();
}
function pick(key, value) {
  const s = read(session.id),
    opt = s?.options?.find((o) => o.key === key);
  if (!opt?.values.some(([v]) => v === value)) return;
  halt();
  session.tour = false;
  choices[key] = value;
  document
    .querySelectorAll(`button[data-option="${key}"]`)
    .forEach((b) => b.setAttribute('aria-pressed', String(b.value === value)));
  // Compare outcomes at the point the edit is applied; keep switching reversible.
  const phase = s.paper ? PAPER_OPTIONS[s.id].phase : 2;
  if (key === 'solver') {
    session.t = 4;
  } else {
    session.t = phase + (reduced.matches ? 0.96 : 0);
  }
  mountDrawing();
  if (!reduced.matches && key !== 'solver') play();
}
document.addEventListener('click', (event) => {
  const el = event.target.closest('a,button');
  if (!el) {
    if (event.target === dom('panel')) {
      const r = dom('panel').getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        closePanel();
    }
    return;
  }
  if (el.dataset.lang) {
    const run = session.playing;
    halt();
    setLanguage(el.dataset.lang);
    render();
    if (session.modal) paintPanel('#close-panel');
    else {
      document.querySelector(`[data-lang="${language}"]`).focus({ preventScroll: true });
      if (run) play();
    }
  } else if (el.id === 'theme') toggleTheme();
  else if (el.id === 'play') session.playing ? halt() : play();
  else if (el.id === 'close-panel') closePanel();
  else if (el.dataset.panel) openPanel(el.dataset.panel, el);
  else if (el.matches('[data-tour]')) go(lessons.find((s) => s.paper).id, { tour: true, auto: true });
  else if (el.dataset.beat !== undefined) seek(Number(el.dataset.beat) + 0.96);
  else if (el.dataset.option) pick(el.dataset.option, el.value);
  else if (
    el.matches('a[href^="#"]') &&
    el.getAttribute('href') !== '#content' &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  ) {
    event.preventDefault();
    go(el.getAttribute('href').slice(1));
  }
});
document.addEventListener('input', (event) => {
  if (event.target.id === 'seek') seek(Number(event.target.value) / 1000);
});
document.addEventListener('change', (event) => {
  const el = event.target;
  if (el.matches('select[data-option]')) pick(el.dataset.option, el.value);
  if (el.matches('select[data-pair]')) {
    pair[Number(el.dataset.pair)] = el.value;
    paintPanel(`[data-pair="${el.dataset.pair}"]`);
  }
});
dom('panel').addEventListener('cancel', (event) => {
  event.preventDefault();
  closePanel();
});
document.addEventListener('keydown', (event) => {
  if (
    session.modal ||
    !read(session.id) ||
    event.target.closest('input,select,textarea') ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey
  )
    return;
  if (event.code === 'Space' && !event.target.closest('a,button')) {
    event.preventDefault();
    session.playing ? halt() : play();
  }
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    seek(Math.min(3, Math.max(0, activeBeat + (event.key === 'ArrowRight' ? 1 : -1))) + 0.96);
  }
});
window.addEventListener('hashchange', () => {
  if (location.hash === '#content') {
    recordRoute(session.id, true);
    dom('content').focus({ preventScroll: true });
    return;
  }
  go(routeId(), { historyUpdate: false });
});
compact.addEventListener('change', () => {
  if (read(session.id)) mountDrawing();
});
reduced.addEventListener('change', () => {
  if (reduced.matches) {
    halt();
    session.tour = false;
  }
  paint();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    halt();
    session.resume = false;
  }
});
go(routeId(), { historyUpdate: false, focus: false });
