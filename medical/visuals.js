'use strict';
function windowFilm(F, withSkill) {
  const p = F.compact,
    x = p ? 30 : 84,
    right = F.w - x,
    w = right - x,
    ay = p ? 194 : 158;
  if (withSkill) rolePair(F, 26, true);
  else {
    const cardWidth = p ? 150 : 230;
    roleBox(
      F,
      x,
      26,
      cardWidth,
      'accent',
      'Solver',
      T('读病历任务', 'Reads the task'),
      'model',
      true,
      0,
      1
    );
    roleBox(
      F,
      right - cardWidth,
      26,
      cardWidth,
      'secondary',
      T('病历查询', 'Chart query'),
      T('返回观察记录', 'Returns observations'),
      'tools',
      true,
      1,
      2.5
    );
    signal(F, [x + cardWidth, 49], [right - cardWidth, 49], 0.94, 1.88, 'accent', -9);
  }
  F.add(word(x, ay - 38, T('查询的记录范围', 'Retrieved observations'), 'diagram-heading'));
  F.add(word(right, ay - 38, T('时间范围示意', 'Illustrative timeline'), 'diagram-detail', 'end'));
  const windowX = x + w * 0.74;
  F.add(box(windowX, ay - 13, right - windowX, 32, 'accent-surface window', 5));
  F.add(diagramLine(x, ay + 5, right, ay + 5, 'timeline-rule'));
  const outside = [0.04, 0.12, 0.22, 0.31, 0.38, 0.48, 0.56, 0.63],
    inside = [0.78, 0.86, 0.93, 0.98];
  const positions = [...outside, ...inside];
  positions.forEach((q, i) => {
    const xx = x + q * w,
      older = i < outside.length;
    F.add(
      F.anim(dot(xx, ay + 5, p ? 4 : 5, older ? 'secondary' : 'accent'), {
        opacity: (t) =>
          fnum(
            (0.24 + 0.76 * rise(t, 0.68 + i * 0.048, 1.28 + i * 0.048)) *
              (withSkill && older ? 1 - 0.8 * rise(t, 1.9, 2.72) : 1)
          )
      })
    );
  });
  F.add(
    word(x, ay + 40, T('一年前', 'A year ago'), 'diagram-label') +
      word(right, ay + 40, T('过去 24 小时', 'Last 24 hours'), 'diagram-label', 'end')
  );
  const readoutY = p ? 285 : 234,
    boxW = p ? 338 : 610,
    boxX = (F.w - boxW) / 2;
  F.add(box(boxX, readoutY - 15, boxW, 70, 'output-box', 8));
  F.add(word(boxX + 17, readoutY + 6, T('聚合输入', 'INPUT TO AVERAGE'), 'metric-label'));
  const broad = word(boxX + 17, readoutY + 35, T('全年记录', 'Full year of records'), 'metric-fail'),
    filtered = word(
      boxX + 17,
      readoutY + 35,
      T('窗口内的记录', 'Records inside the window'),
      'metric-pass'
    );
  F.add(F.fade(broad, (t) => (withSkill ? 1 - rise(t, 2.08, 2.61) : 0.28 + 0.72 * rise(t, 1.68, 2.43))));
  if (withSkill) F.add(F.fade(filtered, (t) => rise(t, 2.39, 2.97)));
  const arrow = curve([right - 22, ay + 52], [boxX + boxW - 30, readoutY - 15], -9);
  F.add(F.fly(slip(withSkill ? 'teal' : 'rose', 'note', 0.53), arrow, 2.05, 2.84));
  F.add(
    F.fade(
      word(
        F.w / 2,
        p ? 381 : 319,
        withSkill
          ? T(
              '图 13 · 用技能重新查询后，平均值正确',
              'Figure 13 · the filtered query yields the correct average'
            )
          : T('图 13 · 任务要求筛选 24 小时', 'Figure 13 · the task asks for a 24-hour filter'),
        'diagram-detail',
        'middle'
      ),
      (t) => rise(t, 2.98, 3.72)
    )
  );
}
function trainingFilm(F) {
  const p = F.compact,
    yTop = p ? 38 : 43,
    yBottom = p ? 240 : 190;
  const cw = p ? 146 : 215,
    a = p ? 21 : 111,
    b = F.w - a - cw;
  roleBox(F, a, yTop, cw, 'accent', 'Solver', T('运行 H₀', 'Run H₀'), 'model', true, 0, 1);
  roleBox(
    F,
    b,
    yTop,
    cw,
    'secondary',
    'Improver',
    T('写候选 harness', 'Write candidates'),
    'writer',
    true,
    1,
    2
  );
  roleBox(
    F,
    b,
    yBottom,
    cw,
    'secondary',
    T('配对增益', 'Paired gain'),
    T('候选 vs H₀', 'Candidate vs H₀'),
    'trace',
    true,
    2,
    3
  );
  roleBox(
    F,
    a,
    yBottom,
    cw,
    'accent',
    T('共享模型', 'Shared model'),
    T('两种角色', 'Both roles'),
    'context',
    true,
    3,
    4
  );
  const ya = yTop + 27,
    yb = yBottom + 27;
  signal(F, [a + cw, ya], [b, ya], 0.04, 0.94, 'accent');
  signal(F, [b + cw / 2, yTop + 54], [b + cw / 2, yBottom], 1.06, 1.96, 'secondary');
  signal(F, [b, yb], [a + cw, yb], 2.05, 2.96, 'secondary');
  signal(F, [a + cw / 2, yBottom], [a + cw / 2, yTop + 54], 3.03, 3.9, 'accent');
  const targetX = b + cw,
    targetY = yTop + 39,
    outerX = targetX + (p ? 14 : 30),
    lowerY = yBottom + 78;
  const sharedReturn = `M${a + cw / 2} ${yBottom + 54}v12q0 12 12 12H${outerX - 9}q9 0 9-9V${targetY + 8}q0-8-8-8H${targetX}`;
  F.add(
    F.anim(`<path class="signal-line accent-stroke" pathLength="1" d="${sharedReturn}"/>`, {
      'stroke-dashoffset': (t) => fnum(1 - rise(t, 3.03, 3.9)),
      opacity: (t) => fnum(rise(t, 3.03, 3.24))
    })
  );
  F.add(F.fade(`<path class="accent" d="M${targetX} ${targetY}l7-3.5v7z"/>`, (t) => rise(t, 3.68, 3.91)));
  F.add(
    F.fade(
      word(F.w / 2, lowerY + 17, T('下一轮共用 θ′', 'Both use θ′ next round'), 'time-label', 'middle'),
      (t) => rise(t, 3.45, 3.92)
    )
  );
  const center = p ? 159 : 144;
  F.add(word(F.w / 2, center, T('模型权重', 'Model weights'), 'diagram-label', 'middle'));
  F.add(F.fade(word(F.w / 2, center + 29, 'θ', 'metric-number', 'middle'), (t) => 1 - rise(t, 2.94, 3.62)));
  F.add(F.fade(word(F.w / 2, center + 29, 'θ′', 'metric-pass', 'middle'), (t) => rise(t, 3.2, 3.82)));
  F.add(
    F.fade(
      word(
        F.w / 2,
        p ? 365 : 304,
        T(
          '任务奖励＋写 harness 的增益奖励 → 同一次参数更新',
          'Task reward + harness-gain reward → one shared update'
        ),
        'diagram-detail',
        'middle'
      ),
      (t) => rise(t, 2.98, 3.59)
    )
  );
}
function controlsFilm(F, id) {
  const control = MEDICAL_CONTROLS.find((c) => c.id === id) || MEDICAL_CONTROLS[0],
    p = F.compact;
  const x = p ? 26 : 264,
    w = p ? 302 : 492,
    first = p ? 103 : 84,
    row = p ? 77 : 58;
  F.add(
    word(p ? 26 : 64, 41, control.backbone, 'diagram-heading') +
      word(p ? 26 : 264, p ? 67 : 41, T('任务成功率', 'Task success rate'), 'diagram-label')
  );
  const names = [
    T('基础条件', 'Solver alone'),
    T('GRPO 写的 harness', 'Harness by GRPO'),
    T('MedicalRSI 写的 harness', 'Harness by MedicalRSI')
  ];
  const classes = ['neutral-fill', 'secondary', 'accent'];
  control.scores.forEach((n, i) => {
    const y = first + i * row,
      by = p ? y + 8 : y - 12;
    F.add(word(p ? x : 64, p ? y : y + 5, names[i], 'diagram-label'));
    F.add(box(x, by, w, 18, 'slot-lane', 3));
    F.add(
      place(
        [x, by],
        F.anim(box(0, 0, (w * n) / 100, 18, classes[i], 3), {
          transform: (t) =>
            `scale(${fnum(0.2 + 0.8 * rise(t, i === 0 ? 0.2 : 1.8 + (i - 1) * 0.34, i === 0 ? 1.28 : 2.42 + (i - 1) * 0.34))} 1)`
        })
      )
    );
    F.add(word(x + w + 8, by + 15, n + '%', 'diagram-label'));
  });
  const by = p ? 345 : 278;
  F.add(diagramLine(p ? 24 : 63, by - 17, F.w - (p ? 24 : 63), by - 17));
  F.add(
    word(
      p ? 25 : 64,
      by + 8,
      T('更换写作者的配对差值', 'Paired difference between writers'),
      'diagram-label'
    )
  );
  F.add(
    F.fade(
      word(
        p ? 25 : F.w - 92,
        p ? by + 46 : by + 10,
        '+' + control.gain.toFixed(1) + l(T(' 个百分点', ' pp')),
        'metric-pass',
        p ? 'start' : 'end'
      ),
      (t) => rise(t, 2.65, 3.72)
    )
  );
}
function caseFilm(F) {
  const p = F.compact,
    x = p ? 50 : 150,
    y = p ? 170 : 141,
    gap = p ? 55 : 110;
  rolePair(F, 23, true);
  F.add(
    word(p ? 24 : 64, p ? 116 : 109, T('图 9 · 评测检查项', 'Figure 9 · grader checks'), 'diagram-heading')
  );
  for (let i = 0; i < 11; i++) {
    const px = x + (i % 6) * gap,
      py = y + Math.floor(i / 6) * (p ? 58 : 49),
      s = p ? 1.25 : 1.35;
    F.add(place([px, py], checkIcon(i < 2, s)));
    if (i >= 2)
      F.add(
        F.fade(place([px, py], checkIcon(true, s)), (t) => rise(t, 1.76 + i * 0.064, 2.13 + i * 0.064))
      );
  }
  const by = p ? 311 : 258;
  F.add(F.fade(word(F.w / 2, by, '2 / 11', 'count-number', 'middle'), (t) => 1 - rise(t, 2.22, 2.61)));
  F.add(F.fade(word(F.w / 2, by, '11 / 11', 'count-number', 'middle'), (t) => rise(t, 2.49, 2.93)));
  F.add(
    word(F.w / 2, by + 26, T('本个案通过的检查', 'Checks passed in this case'), 'diagram-label', 'middle')
  );
  F.add(
    F.fade(
      word(
        F.w / 2,
        p ? 388 : 322,
        T('当前条件 · 测试时固定权重', 'Evaluation condition · weights frozen at test time'),
        'diagram-detail',
        'middle'
      ),
      (t) => rise(t, 2.95, 3.74)
    )
  );
}
function visualFor(s, values, phone) {
  const F = new Plate(phone);
  switch (s.visual) {
    case 'window':
    case 'filter':
      windowFilm(F, s.visual === 'filter');
      break;
    case 'anatomy':
      anatomyFilm(F, true);
      break;
    case 'training':
      trainingFilm(F);
      break;
    case 'controls':
      controlsFilm(F, values.solver);
      break;
    case 'checks':
      caseFilm(F);
      break;
  }
  return F;
}
