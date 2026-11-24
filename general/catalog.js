'use strict';
const studyFamilies = [
  [T('修改答案', 'Revision'), ['self-refine']],
  [T('保存记忆', 'Memory'), ['reflexion', 'reasoningbank']],
  [T('更新模型', 'Model updates'), ['star', 'seal']],
  [T('改写运行程序', 'Harness search'), ['meta-harness']],
  [T('继承程序', 'Inheritance'), ['godel-machine', 'dgm']],
  [T('修改改进者', 'Improver edits'), ['stop', 'hyperagents']]
];
const atlasKinds = ['code', 'memory', 'weights', 'tool', 'archive', 'policy'];
function researchAtlas() {
  return `<section class="research" aria-labelledby="page-title"><div class="lesson-head"><div><h1 id="page-title">${words('论文图谱', 'Research atlas')}</h1><p>${words('点开一个方法，沿着 Solver 和 Improver 看它改了什么、留下什么、怎样检验。', 'Open a method to trace the solver, the improver, the edit that survives, and the experiment that tests it.')}</p></div><div class="heading-tools"><button class="utility" data-tour>${icon('play')}${words('连播论文', 'Play the papers')}</button><button class="utility" data-panel="compare">${icon('compare')}${words('对照论文', 'Compare papers')}</button></div></div><div class="paper-grid">${studyFamilies
    .map(
      ([family, ids], i) =>
        `<section class="paper-family"><header><svg aria-hidden="true" viewBox="-40 -36 80 75">${art(atlasKinds[i], i < 3 ? 'teal' : 'rose', 0, 0, 1)}</svg><h2>${esc(l(family))}</h2></header>${ids
          .map((id) => {
            const p = PAPERS.find((s) => s.id === id);
            return `<a class="paper-pin" href="#${id}"><span><strong>${esc(p.name)}</strong><small>${esc(l(paperRoles[id][2]))}</small></span><span class="paper-year">${p.year}</span>${icon('next')}</a>`;
          })
          .join('')}</section>`
    )
    .join('')}</div></section>`;
}
function comparisonContent(pair) {
  const studies = pair.map((id) => PAPERS.find((p) => p.id === id));
  const fields = [
    T('反馈来自哪里', 'Feedback'),
    T('留下了什么', 'What persists'),
    T('谁提出修改', 'Who edits'),
    T('怎样检验', 'Evidence')
  ];
  return `<div class="pair-select">${studies.map((p, i) => `<label>${i === 0 ? words('第一篇论文', 'First paper') : words('第二篇论文', 'Second paper')}<select data-pair="${i}">${PAPERS.map((v) => `<option value="${v.id}" ${v.id === p.id ? 'selected' : ''}>${esc(v.name)}</option>`).join('')}</select></label>`).join('')}</div><div class="pair-table">${fields.map((title, i) => `<section><h3>${esc(l(title))}</h3><div>${studies.map((p) => `<p>${esc(l(p.fields[i]))}</p>`).join('')}</div></section>`).join('')}</div><div class="source-list">${studies.map((p) => sourceLink('https://arxiv.org/abs/' + p.arxiv, T(p.name, p.name))).join('')}</div>`;
}
