'use strict';
function thumbnail(medical) {
  if (medical)
    return '<img class="cover-art" src="medical/workbench.webp" alt="" width="920" height="386">';
  const line = (d, cls) => `<path d="${d}" class="${cls}"/>`;
  const label = (x, y, zh, en, cls) => `<text x="${x}" y="${y}" class="${cls}">${words(zh, en)}</text>`;
  let art =
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

  return `<svg viewBox="0 0 460 193" class="cover-art gen-art" aria-hidden="true">${art}</svg>`;
}
function editionCard(type, heading, summary, open) {
  const href = type + '/index.html?lang=' + language;
  return `<a class="edition-card ${type}" href="${href}"><div class="cover">${thumbnail(type === 'medical')}</div><div class="card-body"><h2>${esc(l(heading))}</h2><p>${esc(l(summary))}</p><span class="card-link">${esc(l(open))}${icon('next')}</span></div></a>`;
}
function home() {
  dom('mast').innerHTML = mast();
  document.title = l(T('递归自我改进 · 两种交互导览', 'Recursive Self-Improvement · Interactive Guides'));
  dom('content').innerHTML =
    `<section class="home-heading"><h1>${words('递归自我改进', 'Recursive self-improvement')}</h1><p>${words('Solver 负责做任务，Improver 负责改进它。如果写修改的方法也能从反馈中学习，会发生什么？', 'A solver does the task. An improver edits how it works. What changes when the improver learns from the effects of its own edits?')}</p></section><div class="edition-grid">${editionCard('general', T('通用交互教程', 'General tutorial'), T('给社区开放日排程，再把学到的改法带到音乐夜。用同一套双角色框架读十篇研究。', 'Plan an open day, then transfer the editing strategy to a music night. Follow the same two roles through ten research papers.'), T('开始通用教程', 'Open the tutorial'))}${editionCard('medical', T('MedicalRSI 论文导读', 'MedicalRSI paper walkthrough'), T('在三维工作台上打开病历，把技能卡交给 Solver，再看技能的效果如何训练 Improver。', 'Open the chart in the 3D workbench, hand a skill to the solver, and follow the reward back to the improver.'), T('开始论文导读', 'Open the walkthrough'))}</div>`;
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
