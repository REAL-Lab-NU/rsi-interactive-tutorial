'use strict';
// All lesson drawings use the research films' absolute, seekable clock.
// Static geometry is mounted once. Only tracked attributes change on a frame.
class Plate extends Film {
  constructor(phone) {
    super(phone);
    this.w = phone ? 400 : 900;
    this.h = phone ? 430 : 340;
  }
  svg(s) {
    return `<svg class="plate" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}" role="img" aria-label="${esc(l(s.title))}">${this.layers.join('')}</svg>`;
  }
}
const word = (x, y, value, cls = 'diagram-label', anchor = 'start') => txt(x, y, value, cls, anchor);
const box = (x, y, w, h, cls, rx = 6) =>
  `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
const diagramLine = (x1, y1, x2, y2, cls = 'rule') => `<path class="${cls}" d="M${x1} ${y1}L${x2} ${y2}"/>`;
const dot = (x, y, r, cls) => `<circle class="${cls}" cx="${x}" cy="${y}" r="${r}"/>`;
function blip(F, p, amount, tone = 'accent') {
  return F.anim(dot(0, 0, 6, tone), {
    transform: (t) => `translate(${p[0]} ${p[1]}) scale(${fnum(0.82 + amount(t) * 0.65)})`,
    opacity: (t) => fnum(0.45 + 0.55 * amount(t))
  });
}
function signal(F, a, b, start, end, tone = 'accent', bend = 0) {
  const line = curve(a, b, bend);
  const approach = line.at(0.965),
    angle = (Math.atan2(b[1] - approach[1], b[0] - approach[0]) * 180) / Math.PI;
  F.add(`<path class="signal-guide" d="${line.d}"/>`);
  F.add(
    F.anim(`<path class="signal-line ${tone}-stroke" pathLength="1" d="${line.d}"/>`, {
      'stroke-dashoffset': (t) => fnum(1 - rise(t, start, end)),
      opacity: (t) => fnum(rise(t, start, start + 0.08))
    })
  );
  F.add(F.fly(`<circle r="7" class="${tone}"/><circle r="2.2" fill="white"/>`, line, start, end));
  F.add(
    F.fade(
      `<path class="${tone}" transform="translate(${b[0]} ${b[1]}) rotate(${fnum(angle)})" d="m0 0-8-3.6 1.4 3.6L-8 3.6Z"/>`,
      (t) => rise(t, end - 0.21, end)
    )
  );
}
function moduleGlyph(type, x, y, scale = 1) {
  const body = {
    model:
      '<rect x="-12" y="-10" width="24" height="20" rx="4"/><rect x="-5" y="-4" width="10" height="8" rx="2"/><path d="M-7-14v4m7-4v4m7-4v4m-14 20v4m7-4v4m7-4v4"/>',
    context: '<path d="m-14-4 14-7 14 7-14 7zM-13 2 0 9l13-7m-26 6L0 15l13-7"/>',
    tools:
      '<path d="M-13-5h9l4 7h12M-13 8h7l4-7h13"/><circle cx="-13" cy="-5" r="2"/><circle cx="12" cy="2" r="2"/><circle cx="11" cy="-1" r="2"/>',
    control: '<path d="M-11-9h15l7 6v12H-11zM4-9v7h7m-16 4h10m-10 4h8"/>',
    writer: '<path d="m-12 10 3-9L3-11l8 8L-1 9zM1-8l8 8m-18 1 8 8"/>',
    check: '<path d="m-11 0 7 7 14-16"/>',
    trace: '<path d="M-14 9h28m-27-4 7-2 5-10 6 9 8-7"/>'
  }[type];
  return `<g class="module-glyph" transform="translate(${x} ${y}) scale(${scale})">${body}</g>`;
}
function anatomyFilm(F, medical) {
  const p = F.compact,
    x = p ? 75 : 240,
    y = p ? 57 : 45,
    spacing = p ? 84 : 67,
    labelX = p ? 176 : 514;
  const labels = [
    T('模型', 'Model'),
    T('指令与上下文', 'Instructions & context'),
    T('工具接口', 'Tool interface'),
    T('控制与记忆', 'Control & memory')
  ];
  const examples = medical
    ? [
        T('选择病历查询', 'Choose a chart query'),
        T('任务与已有技能', 'Task and stored skills'),
        T('查询观察记录', 'Retrieve observations'),
        T('保存工作流技能', 'Keep a workflow skill')
      ]
    : [
        T('决定先查什么', 'Decide what to inspect'),
        T('活动目标与约束', 'Brief and constraints'),
        T('查场地、排班表', 'Inspect venues and roster'),
        T('检查冲突、记住规则', 'Check clashes, retain rules')
      ];
  const tones = ['accent', 'secondary', 'secondary', 'secondary'];
  const rx = p ? 49 : 95,
    ry = p ? 14 : 26;
  F.add(diagramLine(x, y + 18, x, y + spacing * 3, 'stack-axis'));
  [3, 2, 1, 0].forEach((i) => {
    const py = y + i * spacing,
      tone = tones[i],
      kind = ['model', 'context', 'tools', 'control'][i];
    const face = `<path class="slab-side ${tone}-surface" d="M${-rx} 0 0 ${ry} ${rx} 0v11L0 ${ry + 11} ${-rx} 11Z"/><path class="slab-top ${tone}-surface" d="m${-rx} 0 ${rx}-${ry} ${rx} ${ry}-${rx} ${ry}z"/>${moduleGlyph(kind, 0, -2, p ? 0.7 : 1)}<path class="slab-edge" d="M${-rx * 0.74} ${ry * 0.38 + 5}l${rx * 0.19} ${ry * 0.19}m${rx * 0.1} ${ry * 0.09}l${rx * 0.16} ${ry * 0.16}"/>`;
    F.add(
      F.anim(face, {
        transform: (t) => {
          const focus = between(t, i - 0.15, i + 0.35, i + 0.82, i + 1.2);
          return `translate(${x} ${fnum(py - focus * (p ? 6 : 8))})`;
        }
      })
    );
    F.add(diagramLine(x + rx + 7, py + 5, labelX - 13, py + 5, 'leader'));
    F.add(blip(F, [labelX - 14, py + 5], (t) => between(t, i - 0.2, i + 0.24, i + 0.84, i + 1.12), tone));
    F.add(
      word(labelX, py + 4, labels[i], 'diagram-heading') +
        word(labelX, py + 24, examples[i], 'diagram-detail')
    );
  });
  const bx = p ? 10 : 100,
    top = y + spacing - 16,
    bottom = y + spacing * 3 + 23;
  F.add(`<path class="bracket secondary-stroke" d="M${bx + 8} ${top}h-8v${bottom - top}h8"/>`);
  F.add(
    word(
      p ? 22 : 106,
      p ? 380 : 316,
      T('括号内三层构成这个 Agent 的 harness', 'Three layers inside the bracket form this agent’s harness'),
      'diagram-detail'
    )
  );
}
function roleBox(F, x, y, w, tone, name, sub, kind, active, start = 0, end = 1) {
  const pad = F.compact ? 11 : 14;
  F.add(
    box(x, y, w, 54, 'role-base ' + tone + '-surface', 9) +
      moduleGlyph(kind, x + pad + 9, y + 23, 0.68) +
      word(x + pad + 26, y + 23, name, 'role-title') +
      word(x + pad + 26, y + 42, sub, 'role-sub')
  );
  if (active)
    F.add(
      F.fade(box(x, y, w, 54, 'role-emphasis ' + tone + '-stroke', 9), (t) =>
        between(t, start, start + 0.28, end - 0.2, end + 0.2)
      )
    );
}
function rolePair(F, y, medical = false, training = false) {
  const p = F.compact,
    w = p ? 140 : 196,
    x1 = p ? 24 : 136,
    x2 = F.w - x1 - w;
  roleBox(F, x1, y, w, 'accent', 'Solver', T('执行任务', 'Runs the task'), 'model', true, 0, 1.65);
  roleBox(
    F,
    x2,
    y,
    w,
    'secondary',
    'Improver',
    medical ? T('写技能或工具', 'Writes a skill/tool') : T('提出修改', 'Proposes an edit'),
    'writer',
    true,
    1,
    2.5
  );
  const left = [x1 + w, y + 16],
    right = [x2, y + 16];
  signal(F, left, right, 0.05, 0.92, 'accent', -5);
  signal(
    F,
    [x2, y + 39],
    [x1 + w, y + 39],
    training ? 2.06 : 1.08,
    training ? 2.84 : 1.94,
    'secondary',
    -6
  );
  if (training) {
    const pos = [x2 + w - 18, y + 9];
    F.add(
      F.fade(`<circle cx="${pos[0]}" cy="${pos[1]}" r="6" class="secondary"/>`, (t) => rise(t, 1.32, 1.93))
    );
  }
}
