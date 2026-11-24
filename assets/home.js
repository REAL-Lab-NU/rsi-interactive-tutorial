'use strict';
function thumbnail(medical) {
  const line = (d, cls) => `<path d="${d}" class="${cls}"/>`;
  const label = (x, y, zh, en, cls) => `<text x="${x}" y="${y}" class="${cls}">${words(zh, en)}</text>`;
  let art = '';
  if (!medical) {
    art =
      label(38, 47, '社区开放日', 'Community open day', 'thumb-head') +
      label(38, 95, '大厅', 'Hall', 'thumb-row') +
      label(38, 140, '工坊', 'Studio', 'thumb-row');
    for (let i = 0; i < 4; i++) art += line(`M${128 + i * 98} 67v88`, 'thumb-grid');
    art +=
      `<rect class="accent-surface" x="128" y="76" width="107" height="29" rx="5"/><rect class="secondary-surface" x="253" y="119" width="107" height="29" rx="5"/>` +
      label(149, 96, '修理课', 'Repair', 'thumb-name') +
      label(276, 139, '版画课', 'Print', 'thumb-name') +
      line('M235 93c38 0-12 40 18 40', 'thumb-thread') +
      label(128, 174, '10:00', '10:00', 'thumb-tick') +
      label(327, 174, '12:00', '12:00', 'thumb-tick');
  } else {
    art =
      label(38, 47, '同一模型，两种角色', 'One model, two roles', 'thumb-head') +
      line('M138 110c0-30 138-30 138 0m0 22c0 29-138 29-138 0', 'thumb-thread');
    art +=
      `<rect class="accent-surface" x="45" y="98" width="118" height="39" rx="8"/><rect class="secondary-surface" x="260" y="98" width="130" height="39" rx="8"/>` +
      label(76, 123, 'Solver', 'Solver', 'thumb-name') +
      label(282, 123, 'Improver', 'Improver', 'thumb-name') +
      label(173, 83, '轨迹', 'Trace', 'thumb-tick') +
      label(175, 165, '技能', 'Skill', 'thumb-tick');
  }
  return `<svg viewBox="0 0 460 193" class="cover-art ${medical ? 'med-art' : 'gen-art'}" aria-hidden="true">${art}</svg>`;
}
function editionCard(type, heading, summary, open) {
  const href = type + '/index.html?lang=' + language;
  return `<a class="edition-card ${type}" href="${href}"><div class="cover">${thumbnail(type === 'medical')}</div><div class="card-body"><h2>${esc(l(heading))}</h2><p>${esc(l(summary))}</p><span class="card-link">${esc(l(open))}${icon('next')}</span></div></a>`;
}
function home() {
  dom('mast').innerHTML = mast();
  document.title = l(T('递归自我改进 · 两种交互导览', 'Recursive Self-Improvement · Interactive Guides'));
  dom('content').innerHTML =
    `<section class="home-heading"><h1>${words('递归自我改进', 'Recursive self-improvement')}</h1><p>${words('Solver 负责做任务，Improver 负责改进它。如果写修改的方法也能从反馈中学习，会发生什么？', 'A solver does the task. An improver edits how it works. What changes when the improver learns from the effects of its own edits?')}</p></section><div class="edition-grid">${editionCard('general', T('通用交互教程', 'General tutorial'), T('给社区开放日排程，再把学到的改法带到音乐夜。用同一套双角色框架读十篇研究。', 'Plan an open day, then transfer the editing strategy to a music night. Follow the same two roles through ten research papers.'), T('开始通用教程', 'Open the tutorial'))}${editionCard('medical', T('MedicalRSI 论文导读', 'MedicalRSI paper walkthrough'), T('从模拟病历查询入门，跟踪一个模型怎样学会写技能，再固定 Solver 检验写作者。', 'Start with a simulated chart query, follow the model as it learns to write skills, and test the writer with a fixed solver.'), T('开始论文导读', 'Open the walkthrough'))}</div>`;
}
function oldBookmark() {
  const id = location.hash.slice(1);
  if (!id || ['content', 'versions-home', 'editions'].includes(id)) return false;
  const u = new URL(id === 'medicalrsi' ? 'medical/index.html' : 'general/index.html', location.href);
  u.search = location.search;
  u.hash = id === 'medicalrsi' ? 'training' : id;
  location.replace(u.href);
  return true;
}
if (!oldBookmark()) home();
window.addEventListener('hashchange', oldBookmark);
document.addEventListener('click', (event) => {
  const b = event.target.closest('button');
  if (!b) return;
  if (b.id === 'theme') toggleTheme();
  if (b.dataset.lang) {
    setLanguage(b.dataset.lang);
    home();
    document.querySelector(`[data-lang="${language}"]`).focus({ preventScroll: true });
  }
});
