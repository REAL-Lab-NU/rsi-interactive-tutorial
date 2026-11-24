'use strict';

class StoryFilm extends Film {
  constructor(phone) {
    super(phone);
    this.w = phone ? 400 : 840;
    this.h = phone ? 402 : 357;
    stage(this);
  }
  svg(s) {
    return `<svg class="story-film" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}" role="img" aria-label="${esc(l(s.title))}">${this.layers.join('')}</svg>`;
  }
}
function marginNote(F, text, color = ink.lightBlue) {
  const p = F.compact,
    w = p ? 344 : 484,
    x = (F.w - w) / 2,
    y = F.h - 49;
  return (
    memo(x, y, w, 34, color) +
    tape(x + 12, y + 4, 29, ink.yellow, -20) +
    scriptText(F.w / 2, y + 22, text, 'written')
  );
}
function fileCabinet(F, x, y, size) {
  const drawerTop = shape('M-43-63q-2-5 4-6l65 1 17 8-4 4-78 2z', ink.pale);
  const drawer = (cy, open) => {
    const front =
      shape('M-38-13l67 .5.3 26-66 1z', ink.lightBlue) +
      rr(-12, -5, 15, 5, 2, ink.paper, ink.line, 1.2) +
      shape('m-30 7 8 .2', 'none', ink.deepBlue, 1);
    return place(
      [0, cy],
      open
        ? F.anim(front, {
            transform: (t) =>
              `translate(${fnum(-9 * between(t, 0.8, 1.27, 2.31, 2.83))} ${fnum(3 * between(t, 0.8, 1.27, 2.31, 2.83))})`
          })
        : front
    );
  };
  return pose(
    x,
    y,
    size,
    oval(0, 3, 49, 5, '#d1bbac') +
      shape('m-40-60 70 .5 11-5-1 62-9 4-71-.6z', ink.blue) +
      shape('m29-58 11-7-1 62-10 5z', ink.deepBlue) +
      drawerTop +
      drawer(-45, true) +
      drawer(-17, false) +
      shape('M-34 1v3m58-3v3', 'none', ink.line, 2.6)
  );
}
function recordBoard(F, cx, y, w, h, filter) {
  const a = -w / 2,
    top = -h / 2,
    timeline = top + h * 0.52;
  const paper =
    memo(a + 3, top + 4, w, h, '#e8d1c4') +
    memo(a, top, w, h, ink.white) +
    tape(a + 32, top + 1, 45, ink.yellow, -8) +
    tape(-a - 24, top + 1, 33, ink.lightRose, 10) +
    scriptText(a + 18, top + 32, T('血糖记录', 'Glucose records'), 'board-title', 'start');
  const left = a + 19,
    right = -a - 19,
    split = left + (right - left) * 0.68;
  const broad = shape(
    `M${left - 5} ${timeline - 11}Q${left + 80} ${timeline - 16} ${right + 2} ${timeline - 12}l2 23q-100 4 ${left - right - 6} 0z`,
    ink.lightRose,
    'none'
  );
  const recent = rr(split, timeline - 13, right - split + 9, 26, 9, ink.mint, ink.jade, 1.3);
  let inside =
    paper +
    F.fade(broad, (t) => 0.32 + 0.68 * rise(t, filter ? 0 : 0.9, filter ? 0.62 : 1.5)) +
    F.fade(recent, (t) => (filter ? 0.35 + 0.65 * rise(t, 1.65, 2.35) : 0.33)) +
    shape(`M${left} ${timeline}l${(right - left) * 0.56} -.6m13 .5H${right}`, 'none', '#a99790', 1.25) +
    shape(`M${left + (right - left) * 0.58} ${timeline + 5}l5-10m1 10 5-10`, 'none', '#998383', 1.2);
  const offsets = [0.04, 0.17, 0.29, 0.42, 0.51, 0.73, 0.84, 0.96];
  offsets.forEach((v, i) => {
    const recentPoint = i >= 5,
      tone = recentPoint ? ink.jade : ink.berry,
      xx = left + (right - left) * v;
    const mark = oval(0, 0, 4.2, 4.6, recentPoint ? ink.mint : ink.rose, tone, 1.55);
    inside += F.anim(mark, {
      transform: (t) => {
        const drop = settle(t, 0.78 + i * 0.034, 1.22 + i * 0.034);
        return `translate(${fnum(xx)} ${fnum(timeline - (filter ? 0 : (1 - drop) * 8))})`;
      },
      opacity: (t) =>
        fnum(
          (filter ? 0.95 : 0.25 + 0.75 * rise(t, 0.69 + i * 0.035, 1.22 + i * 0.035)) *
            (filter && !recentPoint ? 1 - 0.8 * rise(t, 1.72, 2.48) : 1)
        )
    });
  });
  inside +=
    scriptText(left, timeline + 32, T('一年前', 'A year ago'), 'letter-small', 'start') +
    scriptText(right, timeline + 32, T('过去 24 小时', 'Last 24 h'), 'letter-small', 'end');
  const bracketStart = filter ? split : left,
    by = top + h - 34;
  inside += drawInk(
    F,
    `M${bracketStart} ${by - 6}q0 7 5 7h${right - bracketStart - 10}q5 0 5-7`,
    filter ? ink.jade : ink.berry,
    1.9,
    2.55
  );
  inside += F.fade(
    scriptText(
      0,
      top + h - 9,
      filter ? T('只算窗口内', 'Average within the window') : T('算了全年', 'Averaged the whole year'),
      filter ? 'good-writing' : 'bad-writing'
    ),
    (t) => rise(t, 2.16, 2.68)
  );
  return place([cx, y], inside);
}
function windowFilm(F, withSkill, guess) {
  const p = F.compact,
    robotX = p ? 79 : 142,
    right = p ? 323 : 721;
  const feet = p ? 177 : 236,
    boardX = p ? 199 : 432,
    boardY = p ? 269 : 155;
  const boardW = p ? 328 : 349,
    boardH = p ? 143 : 188;
  if (p)
    F.add(
      balloon(
        F,
        202,
        35,
        175,
        withSkill ? T('试试这张技能卡', 'Try the skill card') : T('过去 24 小时', 'The last 24 hours')
      )
    );
  else
    F.add(
      balloon(
        F,
        213,
        48,
        207,
        withSkill
          ? T('给下次查询的技能', 'A skill for next time')
          : T('题目问哪一天？', 'Which records count?'),
        null,
        -1
      )
    );
  if (!withSkill)
    F.add(
      fileCabinet(F, right, p ? 158 : 221, p ? 1.03 : 1.33) +
        scriptText(right, p ? 181 : 252, T('病历档案', 'Chart archive'), 'role-name')
    );
  else {
    F.add(
      character(F, 'writer', [right, feet], {
        size: p ? 0.84 : 1.22,
        facing: -1,
        reach: (t) => between(t, 0.65, 1.36, 1.68, 2.14),
        peek: (t) => between(t, 0.2, 0.62, 2.2, 2.74),
        phase: 0.17
      })
    );
    F.add(scriptText(right, p ? 192 : 266, 'Improver', 'role-name'));
  }
  F.add(
    character(F, 'solver', [robotX, feet], {
      size: p ? 0.84 : 1.27,
      reach: (t) => between(t, 0.72, 1.28, 1.74, 2.18) + between(t, 2.43, 2.85, 3.35, 3.78),
      worry: (t) => (withSkill ? 1 - rise(t, 1.67, 2.33) : rise(t, 2.23, 2.8)),
      peek: (t) => between(t, 0.04, 0.52, 3.34, 3.82)
    })
  );
  F.add(scriptText(robotX, p ? 192 : 266, 'Solver', 'role-name'));
  F.add(recordBoard(F, boardX, boardY, boardW, boardH, withSkill));
  if (withSkill) {
    const cardX = right - (p ? 36 : 56),
      cardY = feet - (p ? 37 : 53);
    const writing = pose(
      cardX,
      cardY,
      p ? 0.64 : 0.79,
      shape('M-31-23q20-2 49 0l9 8-1 37-56 .6z', ink.lightBlue) +
        shape('m18-23 .5 9 8 .3', 'none', ink.line, 1.4) +
        drawInk(F, 'M-21-9l3 3 6-6m3 4q10-1 20 0m-32 9 3 3 6-6m3 3h18', ink.jade, 0.41, 1.13, 2.1)
    );
    F.add(F.fade(writing, (t) => between(t, 0.23, 0.46, 1.17, 1.35)));
    F.add(
      carry(F, paperProp('skill'), [cardX, cardY], [robotX + (p ? 28 : 48), feet - 42], 1.17, 1.89, {
        bend: p ? 45 : 121,
        turn: -17,
        scale: p ? 0.61 : 0.8
      })
    );
    F.add(
      carry(
        F,
        paperProp('clock'),
        [robotX + 32, feet - 38],
        [boardX + boardW * 0.3, boardY + 7],
        1.88,
        2.54,
        { bend: p ? 14 : -17, scale: 0.68 }
      )
    );
    F.add(marginNote(F, T('SI · 给 Solver 留一条技能', 'SI · A skill the solver can reuse'), ink.lightBlue));
  } else {
    F.add(
      carry(
        F,
        paperProp('records'),
        [right - 31, p ? 111 : 170],
        [p ? 260 : 560, p ? 220 : 117],
        1.04,
        1.86,
        { bend: p ? 8 : 20, turn: -16, scale: 0.72 }
      )
    );
    const mismatch = balloon(
      F,
      p ? 199 : 732,
      p ? 134 : 78,
      p ? 110 : 147,
      T('全年？', 'A full year?'),
      null,
      -1,
      ink.lightRose
    );
    F.add(F.fade(mismatch, (t) => rise(t, 2.28, 2.82)));
    let text = T('要算哪段时间？', 'Which time window belongs in the average?');
    if (guess === 'day') text = T('你的选择符合题意 · 24 小时', 'Your window fits the question · 24 hours');
    if (guess === 'year') text = T('选一年会混入更早的记录', 'A full year includes older records');
    F.add(
      F.fade(
        marginNote(F, text, guess === 'year' ? ink.lightRose : ink.lightBlue),
        (t) => 1 - rise(t, 2.87, 3.17)
      )
    );
    F.add(
      F.fade(
        marginNote(F, T('找到遗漏的一步 · 先筛时间', 'Missing step · filter by time first'), ink.lightRose),
        (t) => rise(t, 3.08, 3.46)
      )
    );
  }
}
function toolkitFilm(F) {
  const p = F.compact,
    cx = p ? 257 : 536,
    y = p ? 240 : 186,
    w = p ? 240 : 392,
    h = p ? 144 : 137;
  const solverX = p ? 70 : 160,
    feet = p ? 207 : 232;
  F.add(balloon(F, p ? 184 : 220, p ? 41 : 44, p ? 184 : 211, T('我要查病历。', 'Let’s look it up.')));
  F.add(
    character(F, 'solver', [solverX, feet], {
      size: p ? 0.91 : 1.34,
      peek: (t) => rise(t, 0.1, 0.64),
      reach: (t) => between(t, 0.1, 0.42, 0.65, 0.93) + between(t, 1.65, 2.17, 2.72, 3.12)
    })
  );
  F.add(scriptText(solverX, feet + 25, T('模型', 'Model'), 'role-name'));
  const a = -w / 2,
    top = -h / 2;
  const lid =
    shape(`M${a + 4} 0q-3-23 13-41 8-10 24-11l${w - 82} -2q21 1 30 19l9 34z`, ink.blue) +
    shape(`M${a + 15} -2q4-30 23-36l${w - 82} -1q17 1 25 28`, 'none', ink.deepBlue, 1.8) +
    shape('M-28-49v-9q0-7 8-7l37-.5q9 .5 10 7v9', 'none', ink.line, 4);
  F.add(
    place(
      [cx, y + top + 29],
      F.anim(lid, {
        transform: (t) =>
          `translate(0 ${fnum(12 - 19 * settle(t, 0.42, 1.08))}) scale(1 ${fnum(0.72 + 0.28 * rise(t, 0.42, 1.07))})`
      })
    )
  );
  F.add(
    place(
      [cx, y],
      shape(`M${a + 3} ${top + 36}l13-14 ${w - 35} -2 16 15-7 11H${a + 4}z`, '#85a6b1') +
        shape(
          `M${a + 3} ${top + 37}q${w / 2} 3 ${w - 4} 0l-4 70q0 10-12 11l${21 - w} 1q-8-2-9-10z`,
          ink.lightBlue
        ) +
        shape(`M${a + 9} ${top + 47}h${w - 17}`, 'none', ink.deepBlue, 1.5) +
        scriptText(0, top + 86, 'Harness', 'board-title') +
        shape(`M${a + 14} ${top + 55}v14m${w - 35}-15v15`, 'none', '#88a5b0', 1.6)
    )
  );
  const parts = [
    ['prompt', T('指令', 'Instructions'), 0.55, 1.16],
    ['tool', T('工具', 'Tools'), 1.54, 2.22],
    ['memory', T('记忆', 'Memory'), 2.5, 3.25]
  ];
  parts.forEach(([type, label, start, end], i) => {
    const xx = cx + (i - 1) * (p ? 72 : 106),
      destY = p ? 132 : 97;
    const body = paperProp(type, p ? 0.84 : 1.02) + scriptText(0, p ? 34 : 36, label, 'letter-small');
    F.add(
      F.anim(body, {
        transform(t) {
          const u = settle(t, start, end);
          return `translate(${xx} ${fnum(y - 20 + (destY - y + 20) * u)}) rotate(${fnum((1 - u) * (i - 1) * 10)}) scale(${fnum(0.53 + 0.47 * u)})`;
        },
        opacity: (t) => fnum(0.75 + 0.25 * rise(t, start, start + 0.26))
      })
    );
  });
  F.add(
    carry(F, paperProp('records'), [cx, p ? 135 : 94], [solverX + 26, feet - 42], 2.21, 2.88, {
      bend: p ? 13 : 39,
      scale: 0.56
    })
  );
  F.add(marginNote(F, T('Agent = 模型 + Harness', 'Agent = model + harness')));
}
function trainingStory(F) {
  const p = F.compact,
    lx = p ? 74 : 143,
    rx = p ? 326 : 697,
    feet = p ? 202 : 222;
  const mid = F.w / 2,
    cy = p ? 260 : 151,
    w = p ? 308 : 330,
    h = p ? 88 : 123;
  F.add(balloon(F, mid, p ? 42 : 45, p ? 194 : 220, T('同一个模型', 'One shared model'), null, 1, ink.white));
  F.add(
    character(F, 'solver', [lx, feet], {
      size: p ? 0.92 : 1.23,
      peek: (t) => 0.63 + rise(t, 2.5, 3.17) * 0.34,
      reach: (t) => between(t, 0.18, 0.68, 1.06, 1.45) + between(t, 2.38, 2.88, 3.1, 3.55)
    })
  );
  F.add(
    character(F, 'writer', [rx, feet], {
      size: p ? 0.92 : 1.23,
      facing: -1,
      phase: 0.2,
      peek: (t) => 0.84,
      reach: (t) => between(t, 0.89, 1.27, 1.95, 2.35) + between(t, 3.25, 3.6, 3.76, 3.99)
    })
  );
  F.add(
    scriptText(lx, feet + (p ? 12 : 27), 'Solver', 'role-name') +
      scriptText(rx, feet + (p ? 12 : 27), 'Improver', 'role-name')
  );
  F.add(
    memo(mid - w / 2, cy - h / 2, w, h, ink.white) +
      tape(mid - w / 2 + 26, cy - h / 2 + 2, 38, ink.lightRose, -8)
  );
  F.add(
    switchLabels(
      F,
      mid,
      cy - h / 2 + 25,
      [
        [0, 1, T('基础条件 H₀', 'Baseline H₀')],
        [1, 2, T('写出不同候选', 'Propose candidates')],
        [2, 3, T('同题重跑', 'Rerun matched tasks')],
        [3, 4, T('更新共享模型', 'Update the shared model')]
      ],
      'written'
    )
  );
  const actions = [
    [
      0,
      1,
      paperProp('records', 0.72) +
        pose(p ? 65 : 73, 0, 0.83, checkStamp(0, 0, true)) +
        pose(p ? -65 : -73, 0, 0.83, checkStamp(0, 0, false))
    ],
    [1, 2, pose(-36, 0, 0.72, paperProp('skill'), -8) + pose(36, 0, 0.79, paperProp('tool'), 8)],
    [
      2,
      3,
      scriptText(-51, 5, 'H₀', 'board-title') +
        scriptText(0, 3, T('对照', 'vs.'), 'letter-small') +
        pose(53, -1, 0.7, paperProp('skill'))
    ],
    [
      3,
      4,
      pose(-54, 0, 0.74, paperProp('reward')) +
        scriptText(-22, 5, '+', 'written') +
        pose(4, 0, 0.74, paperProp('reward')) +
        scriptText(36, 5, '→', 'written') +
        pose(69, 0, 0.78, paperProp('chip'))
    ]
  ];
  for (const [a, b, pic] of actions)
    F.add(
      F.fade(
        place([mid, cy + (p ? 12 : 14)], pic),
        (t) => (a === 0 ? 1 : rise(t, a, a + 0.25)) * (b === 4 ? 1 : 1 - rise(t, b - 0.23, b))
      )
    );
  const handL = [lx + (p ? 26 : 47), feet - (p ? 63 : 78)],
    handR = [rx - (p ? 26 : 47), feet - (p ? 63 : 78)];
  F.add(carry(F, paperProp('records'), handL, handR, 0.15, 0.92, { bend: p ? -94 : -174, scale: 0.62 }));
  F.add(
    carry(F, paperProp('skill'), handR, handL, 1.12, 1.93, { bend: p ? 75 : 155, scale: 0.62, turn: -13 })
  );
  // Both roles receive the same updated weights. Two curved strokes branch
  // out from the very same chip after the gains have arrived.
  const coreY = p ? 95 : 270,
    start = [mid, coreY];
  F.add(carry(F, paperProp('reward'), [mid - 53, cy + 15], start, 2.58, 3.16, { bend: -37, scale: 0.69 }));
  F.add(F.fade(pose(mid, coreY, 0.93, paperProp('chip')), (t) => rise(t, 2.93, 3.32)));
  for (const [dest, side] of [
    [[lx + (p ? 16 : 24), feet - (p ? 110 : 4)], -1],
    [[rx - (p ? 16 : 24), feet - (p ? 110 : 4)], 1]
  ]) {
    const from = [start[0] + side * 24, start[1]],
      line = curve(from, dest, p ? side * -17 : side * -19),
      near = line.at(0.95);
    const angle = (Math.atan2(dest[1] - near[1], dest[0] - near[0]) * 180) / Math.PI;
    F.add(drawInk(F, line.d, ink.berry, 3.23, 3.83, 2.1));
    F.add(
      F.fade(pose(dest[0], dest[1], 1, shape('m-7-3 7 3-7 3', 'none', ink.berry, 2.0), angle), (t) =>
        rise(t, 3.72, 3.87)
      )
    );
  }
  F.add(
    marginNote(
      F,
      p
        ? T('RSI · 修改的效果训练写作者', 'RSI · Edits teach the writer')
        : T('RSI · 用技能的效果训练写技能的模型', 'RSI · Train the writer on what its edits achieve'),
      ink.lightRose
    )
  );
}
function comparisonFilm(F, id) {
  const c = MEDICAL_CONTROLS.find((item) => item.id === id) || MEDICAL_CONTROLS[0],
    p = F.compact;
  const lx = p ? 69 : 125,
    feet = p ? 167 : 220;
  F.add(
    character(F, 'solver', [lx, feet], {
      size: p ? 0.79 : 1.29,
      reach: (t) => between(t, 0.28, 0.7, 1.33, 1.75) + between(t, 2.13, 2.55, 3.26, 3.66),
      peek: (t) => 0.68
    })
  );
  F.add(pose(lx + (p ? 34 : 59), feet - 8, 0.64, paperProp('lock')));
  const lineX = p ? 247 : 565,
    lineY = p ? 72 : 42;
  F.add(
    balloon(
      F,
      p ? 223 : 153,
      p ? 94 : 39,
      p ? 185 : 174,
      T('固定同一个 Solver', 'Keep the solver fixed'),
      null,
      -1
    )
  );
  const x = p ? 30 : 484,
    w = p ? 290 : 232,
    bw = p ? 350 : 534,
    bx = p ? 24 : 269,
    by = p ? 174 : 49,
    bh = p ? 150 : 189;
  F.add(memo(bx, by, bw, bh, ink.white) + tape(bx + bw - 20, by, 38, ink.yellow, 14));
  F.add(
    scriptText(p ? 37 : 287, by + (p ? 20 : 27), T('任务成功率', 'Task success rate'), 'written', 'start')
  );
  if (!p) F.add(scriptText(lineX + 148, lineY + 33, c.backbone, 'letter-small', 'end'));
  const names = [
    T('基础条件', 'Solver alone'),
    T('GRPO 写的 harness', 'GRPO harness'),
    T('MedicalRSI 写的 harness', 'MedicalRSI harness')
  ];
  const barClass = ['neutral-fill', 'secondary', 'accent'];
  c.scores.forEach((n, i) => {
    const yy = by + (p ? 43 : 53) + i * (p ? 38 : 44),
      yBar = p ? yy + 3 : yy - 9;
    const start = i === 0 ? 0.48 : 1.47 + (i - 1) * 0.42,
      end = i === 0 ? 1.35 : 2.31 + (i - 1) * 0.42;
    F.add(
      scriptText(p ? x + 7 : 288, p ? yy - 1 : yy + 4, names[i], p ? 'letter-small' : 'written', 'start')
    );
    F.add(box(x, yBar, w, p ? 9 : 13, 'slot-lane', 4));
    const fill = box(0, 0, (n * w) / 100, p ? 9 : 13, barClass[i], 4);
    const hatch = i === 2 ? rr(0, 0, (n * w) / 100, p ? 9 : 13, 4, 'url(#pencil-hatch)', 'none') : '';
    F.add(
      place([x, yBar], F.anim(fill + hatch, { transform: (t) => `scale(${fnum(rise(t, start, end))} 1)` }))
    );
    F.add(
      F.fade(scriptText(x + w + 7, p ? yBar + 8 : yBar + 12, n + '%', 'chart-value', 'start'), (t) =>
        rise(t, end - 0.32, end)
      )
    );
  });
  const yy = p ? 362 : 301,
    label = p
      ? T('两位写作者相差', 'Writer difference')
      : T('给同一 Solver 换写作者，相差', 'Same solver, different writer');
  F.add(
    memo(p ? 24 : 268, yy - 25, p ? 351 : 535, 44, ink.lightRose) +
      scriptText(p ? 34 : 286, yy + 3, label, 'letter-small', 'start')
  );
  F.add(
    F.fade(
      scriptText(
        p ? 363 : 783,
        yy + 7,
        '+' + c.gain.toFixed(1) + l(T(' 个百分点', ' pp')),
        'metric-pass',
        'end'
      ),
      (t) => rise(t, 2.93, 3.58)
    )
  );
}
function checkFilm(F) {
  const p = F.compact,
    lx = p ? 69 : 127,
    rx = p ? 329 : 705,
    feet = p ? 189 : 235,
    mid = F.w / 2;
  F.add(balloon(F, mid, p ? 43 : 45, p ? 179 : 202, T('新工作流', 'A new workflow'), null, 1));
  F.add(
    character(F, 'solver', [lx, feet], {
      size: p ? 0.83 : 1.18,
      tag: 'Solver',
      worry: (t) => 1 - rise(t, 1.86, 2.55),
      reach: (t) => between(t, 1.64, 2.17, 2.81, 3.27),
      peek: (t) => 0.8
    })
  );
  F.add(
    character(F, 'writer', [rx, feet], {
      size: p ? 0.83 : 1.18,
      facing: -1,
      phase: 0.18,
      tag: 'Improver',
      reach: (t) => between(t, 0.68, 1.14, 1.62, 2.07),
      peek: (t) => 0.8
    })
  );
  const x = p ? 27 : 247,
    y = p ? 223 : 92,
    w = p ? 346 : 345,
    h = p ? 107 : 131;
  F.add(memo(x, y, w, h, ink.white) + tape(x + 25, y + 1, 34, ink.yellow, -11));
  F.add(scriptText(x + 17, y + 24, T('通过的检查', 'Checks passed'), 'written', 'start'));
  const countY = y + (p ? 28 : 33),
    countX = x + w - 18;
  F.add(F.fade(scriptText(countX, countY, '2 / 11', 'check-count', 'end'), (t) => 1 - rise(t, 2.3, 2.6)));
  F.add(F.fade(scriptText(countX, countY, '11 / 11', 'check-count', 'end'), (t) => rise(t, 2.57, 2.91)));
  for (let i = 0; i < 11; i++) {
    const xx = x + 36 + (i % 6) * 51,
      yy = y + (p ? 51 : 61) + Math.floor(i / 6) * (p ? 32 : 37),
      size = p ? 0.98 : 1.08;
    F.add(checkStamp(xx, yy, i < 2, size));
    if (i >= 2) {
      const start = 1.74 + 0.078 * i;
      F.add(
        F.anim(checkStamp(0, 0, true, size), {
          transform: (t) =>
            `translate(${xx} ${yy}) scale(${fnum(0.65 + 0.35 * settle(t, start, start + 0.38))})`,
          opacity: (t) => fnum(rise(t, start, start + 0.22))
        })
      );
    }
  }
  F.add(
    carry(F, paperProp('skill'), [rx - 38, feet - 43], [lx + 36, feet - 43], 1.09, 1.94, {
      bend: p ? 72 : 155,
      scale: 0.71
    })
  );
  F.add(
    marginNote(
      F,
      T('测试时 · 固定模型，现场写新技能', 'At test time · frozen model, fresh skill'),
      ink.lightBlue
    )
  );
}
function visualFor(s, values, phone) {
  const F = new StoryFilm(phone);
  switch (s.visual) {
    case 'window':
      windowFilm(F, false, values.window);
      break;
    case 'filter':
      windowFilm(F, true);
      break;
    case 'anatomy':
      toolkitFilm(F);
      break;
    case 'training':
      trainingStory(F);
      break;
    case 'controls':
      comparisonFilm(F, values.solver);
      break;
    case 'checks':
      checkFilm(F);
      break;
  }
  return F;
}
