function refineFilm(F) {
  const { a, b, c, compact } = F;
  const p1 = curve(shift(a, 45, -3), shift(b, -49, -10), -38),
    p2 = curve(shift(b, 28, -27), shift(c, -29, -28), compact ? -45 : -63),
    p3 = curve(shift(c, -22, 18), shift(b, 31, 17), compact ? 38 : -38);
  F.add(F.draw(p1, 'teal', 0, 0.77) + F.draw(p2, 'rose', 0.95, 1.75) + F.draw(p3, 'rose', 1.95, 2.75));
  F.add(place(a, bench('teal', 'chip', T('同一个模型', 'One model'), 1.85)));
  F.add(place(b, sheet(compact ? 146 : 178, 115, 'gold', T('当前解', 'CURRENT SOLUTION'), '')));
  const raw =
    F.fade(txt(0, -5, 'for i in 1 … n', 'code-type'), (t) => rise(t, 0.08, 0.43)) +
    F.fade(txt(0, 17, 'sum += i', 'code-type'), (t) => rise(t, 0.38, 0.82)) +
    paperLines(-53, 38, [69]);
  const clean =
    txt(0, 7, 'n(n + 1) / 2', 'equation') + txt(0, 33, T('闭式求和', 'Closed-form sum'), 'micro');
  F.add(
    place(
      b,
      F.fade(raw, (t) => between(t, 0.08, 0.7, 2.08, 2.65)) + F.fade(clean, (t) => rise(t, 2.37, 2.95))
    )
  );
  F.add(
    F.appear(
      c,
      sheet(
        142,
        86,
        'rose',
        T('模型的批注', 'MODEL CRITIQUE'),
        txt(0, 8, T('消掉这层循环', 'Remove the loop'), 'body-type') + paperLines(-40, 25, [67])
      ),
      1.13,
      1.85
    )
  );
  F.add(
    F.fly(slip('gold', 'code'), p1, 0.04, 0.91) +
      F.fly(slip('rose', 'lines'), p2, 1.01, 1.87) +
      F.fly(slip('rose', 'delta'), p3, 2.01, 2.88)
  );
  // Trace both snippets on the same illustrative input; the revision keeps the answer.
  const sample = compact ? [94, 184] : [421, 249];
  const sums = [0, 1, 3, 6, 10, 15];
  const cells = Array.from({ length: 5 }, (_, i) => {
    const x = -53 + i * 19,
      hit = 0.1 + i * 0.14;
    return (
      `<rect class="count-cell" x="${x}" y="-4" width="16" height="16" rx="3"/>` +
      F.fade(`<rect class="count-cell filled" x="${x}" y="-4" width="16" height="16" rx="3"/>`, (t) =>
        rise(t, hit, hit + 0.12)
      ) +
      txt(x + 8, 8, String(i + 1), 'count-type')
    );
  }).join('');
  const running = sums
    .map((sum, i) =>
      F.fade(txt(49, 8, String(sum), 'counter'), (t) => {
        const interval = Math.min(5, Math.max(0, Math.floor((t - 0.05) / 0.14)));
        return interval === i ? 1 : 0;
      })
    )
    .join('');
  const experiment = sheet(
    143,
    59,
    'teal',
    'n = 5',
    F.fade(cells + running, (t) => 1 - rise(t, 2.32, 2.62)) +
      F.fade(txt(0, 11, '5 × 6 / 2 = 15', 'code-type'), (t) => rise(t, 2.36, 2.76))
  );
  F.add(place(sample, experiment));
  F.add(F.appear(shift(b, 56, 46), checkIcon(true, 1.35), 3.06, 3.66));
  const delivered = curve(shift(b, -47, 38), shift(a, 21, 26), compact ? 14 : -45);
  F.add(
    F.draw(delivered, 'teal', 3.08, 3.76, false) + F.fly(slip('teal', 'code', 0.86), delivered, 3.11, 3.94)
  );
}
function reflexionFilm(F) {
  const { compact } = F;
  const room = compact ? [146, 119] : [258, 146],
    memory = compact ? [284, 250] : [643, 144];
  const x = compact ? 98 : 164;
  F.add(
    place(
      room,
      `<g class="room"><path class="room-wall" d="M${-x} 32v-77l${x} -28 ${x} 28v78l-${x} 32Z"/><path class="room-floor" d="m${-x} 32 ${x} -25 ${x} 26-${x} 32z"/><path class="wall-hatch" d="M0-73V7m${-x + 8} 29L7 62m${-x + 27} -35 96 27m3-23 38 9"/>${place([x * 0.51, -11], `<g class="shelf"><path d="m-18 7 36-9 7 3-35 10zM-16 9v13m38-19v13"/></g>`)}${txt(0, 92, T('同一个 ALFWorld 任务', 'Same ALFWorld task'), 'prop-label')}</g>`
    )
  );
  const start = shift(room, -x * 0.53, 7),
    shelf = shift(room, x * 0.45, 3),
    item = shift(room, -x * 0.14, 6);
  const walk = curve(start, shelf, -9),
    pickup = curve(start, item, -4),
    carry = curve(item, shelf, -8);
  F.add(
    F.anim(robot('teal'), {
      transform: (t) => {
        let p =
          t < 1.5
            ? walk.at(rise(t, 0.06, 0.93))
            : t < 2.9
              ? walk.at(1 - rise(t, 2.63, 2.9))
              : t < 3.37
                ? pickup.at(rise(t, 2.94, 3.35))
                : carry.at(rise(t, 3.36, 3.95));
        return `translate(${fnum(p[0])} ${fnum(p[1] - 2 * Math.abs(Math.sin(t * 15)))})`;
      }
    })
  );
  const block = slip('gold', 'lines', 0.62);
  F.add(
    F.anim(block, {
      transform: (t) => {
        const p = carry.at(rise(t, 3.36, 3.92));
        return `translate(${fnum(p[0] + 15)} ${fnum(p[1] + 12 - 14 * rise(t, 3.2, 3.44))})`;
      }
    })
  );
  F.add(
    F.fade(place(shift(shelf, 4, -37), checkIcon(false, 1.1)), (t) => between(t, 0.96, 1.35, 2.4, 2.75))
  );
  F.add(place(memory, bench('rose', 'memory', T('反思记忆', 'Episodic memory'), 1.78)));
  const write = curve(shelf, shift(memory, -27, -12), compact ? 38 : -60),
    retry = curve(shift(memory, -19, 7), start, compact ? -55 : 65);
  F.add(
    F.draw(write, 'rose', 1.15, 2.33) +
      F.fly(slip('rose', 'lines'), write, 1.75, 2.58) +
      F.draw(retry, 'teal', 2.65, 3.35, false) +
      F.fly(slip('rose', 'lines', 0.86), retry, 2.68, 3.35)
  );
  F.add(F.appear(shift(shelf, 4, -37), checkIcon(true, 1.15), 3.76, 3.98));
}
function reasoningFilm(F) {
  const { a, b, c } = F;
  const shelfBody = [-17, 5, 27]
    .map(
      (y, i) =>
        `<rect class="drawer-slot" x="-57" y="${y}" width="114" height="16" rx="3"/>` +
        book(['gold', 'teal', 'rose'][i], -50, y + 1, [60, 45, 68][i])
    )
    .join('');
  F.add(place(a, bay(140, 119, 'teal', T('策略库', 'STRATEGY BANK'), shelfBody)));
  F.add(place(b, bench('gold', 'chip', T('当前任务', 'Current task'), 1.5)));
  F.add(
    place(
      c,
      sheet(
        148,
        106,
        'rose',
        T('两种轨迹', 'TWO TRACES'),
        place([-47, -3], checkIcon(true, 0.7)) +
          paperLines(-30, -5, [75]) +
          place([-47, 24], checkIcon(false, 0.7)) +
          paperLines(-30, 22, [58])
      )
    )
  );
  const retrieve = curve(shift(a, 35, -4), shift(b, -39, -5), -40),
    run = curve(shift(b, 34, 7), shift(c, -44, -3), -38),
    success = curve(shift(c, -30, -9), shift(a, 17, -6), -57),
    fail = curve(shift(c, -25, 22), shift(a, 17, 14), 51);
  F.add(
    F.draw(retrieve, 'teal', 0.04, 0.8) +
      F.fly(slip('teal', 'lines'), retrieve, 0.06, 0.93) +
      F.draw(run, 'gold', 1.02, 1.8) +
      F.fly(slip('gold', 'lines'), run, 1.04, 1.92)
  );
  F.add(
    F.draw(success, 'teal', 1.97, 2.73, false) +
      F.draw(fail, 'rose', 2.08, 2.8, false) +
      F.fly(slip('teal', 'lines', 0.83), success, 2.0, 2.83) +
      F.fly(slip('rose', 'lines', 0.83), fail, 2.11, 2.91)
  );
  F.add(F.appear(shift(a, -16, 28), book('teal', -23, -3, 67), 2.64, 3.0));
  F.add(
    F.fade(
      place(
        shift(b, 0, 67),
        `<rect class="label-mask" x="-69" y="-17" width="138" height="24"/>${txt(0, 1, T('新任务', 'New task'), 'prop-label')}`
      ),
      (t) => rise(t, 2.98, 3.35)
    )
  );
  F.add(F.fly(slip('teal', 'lines', 1.13), retrieve, 3.06, 3.93));
}
function starFilm(F, choice) {
  const { a, b, c } = F,
    miss = choice !== 'correct';
  const reason = sheet(
    139,
    101,
    'gold',
    T('模型预测', 'PREDICTION'),
    txt(0, 4, T('理由 → 答案', 'Reason → answer'), 'body-type') + paperLines(-43, 22, [76, 55])
  );
  const row = curve(shift(a, 39, -7), shift(b, -37, -8), -29),
    update = curve(shift(b, 36, 4), shift(c, -39, -7), -38),
    back = curve(shift(c, -7, 21), shift(a, -15, 22), -87);
  F.add(
    F.draw(row, 'gold', 0.02, 0.8) +
      F.draw(update, 'teal', 1.99, 2.83) +
      F.draw(back, 'teal', 3.03, 3.92, false)
  );
  F.add(
    place(a, reason) +
      place(b, bench('gold', 'grade', T('答案检查', 'Answer check'), 1.56)) +
      place(c, bench('teal', 'weights', T('模型权重', 'Model weights'), 1.66))
  );
  F.add(F.fly(slip('gold', 'lines'), row, 0.02, 0.9));
  F.add(
    F.fade(place(shift(b, 36, -40), checkIcon(!miss, 1.15)), (t) =>
      miss ? between(t, 0.8, 1.12, 1.63, 1.96) : rise(t, 0.8, 1.12)
    )
  );
  if (miss) {
    const hint = shift(a, 0, 69),
      h = curve(hint, shift(b, -10, -5), -17);
    F.add(
      F.fade(place(hint, txt(0, 15, T('训练时给答案提示', 'Training answer hint'), 'micro')), (t) =>
        between(t, 0.96, 1.24, 1.9, 2.12)
      )
    );
    F.add(F.fly(token(l(T('提示', 'Hint')), 'rose'), h, 1.05, 1.83));
    F.add(F.appear(shift(b, 36, -40), checkIcon(true, 1.15), 1.71, 2.02));
  }
  const pair = slip('gold', 'lines', 0.86) + place([5, 7], slip('teal', 'lines', 0.82));
  F.add(F.fly(pair, update, 2.02, 2.95));
  if (miss) {
    const discard = curve(shift(b, -12, 1), F.compact ? [300, 184] : [433, 246], 22);
    F.add(F.fly(token(l(T('提示', 'Hint')), 'rose'), discard, 2.02, 2.68));
    F.add(
      F.fade(place(discard.at(1), txt(0, 13, T('训练时移除', 'Removed for training'), 'micro')), (t) =>
        between(t, 2.34, 2.62, 2.83, 3.03)
      )
    );
  }
  F.add(F.appear(shift(c, 33, 15), token('θ′', 'rose'), 2.55, 3.02));
  F.add(
    F.fly(token('θ′', 'teal'), back, 3.12, 3.9) +
      F.fade(place(shift(a, 0, 38), txt(0, 3, T('下一批题', 'Next batch'), 'sheet-foot')), (t) =>
        rise(t, 3.44, 3.96)
      )
  );
}
function sealFilm(F) {
  const { a, b, c } = F;
  const pass = curve(shift(a, 49, 1), shift(b, -36, -4), -41),
    train = curve(shift(b, 32, 6), shift(c, -43, -7), -40),
    reward = curve(shift(c, -18, 30), shift(b, 3, 18), -73);
  F.add(
    F.draw(pass, 'gold', 0.03, 0.87) +
      F.draw(train, 'teal', 1.11, 2.32) +
      F.draw(reward, 'rose', 2.96, 3.83)
  );
  F.add(
    place(a, sheet(132, 114, 'gold', T('新段落', 'NEW PASSAGE'), paperLines(-45, -8, [82, 75, 85, 63, 45])))
  );
  F.add(place(b, bench('rose', 'policy', T('自编辑策略', 'Self-edit policy'), 1.62)));
  const grid = [];
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 6; col++) {
      const x = -44 + col * 15,
        y = -12 + row * 11;
      grid.push(`<rect class="matrix-cell" x="${x}" y="${y}" width="11" height="8" rx="1"/>`);
      if ((col + row * 2) % 3 !== 1)
        grid.push(
          F.fade(`<rect class="matrix-learned" x="${x}" y="${y}" width="11" height="8" rx="1"/>`, (t) =>
            rise(t, 2.05 + (row + col) * 0.06, 2.42 + (row + col) * 0.06)
          )
        );
    }
  F.add(place(c, bay(139, 112, 'teal', T('适配权重', 'ADAPTED WEIGHTS'), grid.join(''))));
  F.add(F.fly(slip('gold', 'lines'), pass, 0.06, 0.94));
  for (let i = 0; i < 3; i++) {
    const r = curve(shift(b, 15 + i * 6, 0), shift(c, -14 + i * 9, -6), -38 + i * 17);
    F.add(F.fly(slip(i === 2 ? 'rose' : 'gold', 'lines', 0.79), r, 1.04 + i * 0.21, 2.12 + i * 0.17));
  }
  F.add(F.appear(shift(c, 42, 39), checkIcon(true, 1.0), 2.64, 2.96));
  F.add(
    F.fly(slip('rose', 'delta', 1.05), reward, 3.05, 3.86) +
      F.appear(shift(b, 37, -32), token('π′', 'rose'), 3.58, 3.98)
  );
}
function harnessFilm(F) {
  const { a, b, c } = F;
  const files =
    place([-17, -16], slip('teal', 'code', 1.03)) +
    place([6, -11], slip('rose', 'lines', 1.04)) +
    place([21, 0], slip('gold', 'lines', 1.06));
  F.add(
    place(
      a,
      bay(
        141,
        115,
        'gold',
        T('候选档案', 'CANDIDATE FILES'),
        files + txt(0, 40, T('代码 · 轨迹 · 分数', 'Code · trace · score'), 'sheet-foot')
      )
    )
  );
  F.add(place(b, bench('rose', 'searcher', T('外部提案者', 'External proposer'), 1.67)));
  F.add(
    place(
      c,
      sheet(
        145,
        105,
        'teal',
        T('检索 Harness', 'RETRIEVAL HARNESS'),
        txt(-50, -2, 'context = …', 'code-type', 'start') + paperLines(-50, 18, [74, 62])
      )
    )
  );
  const read = curve(shift(a, 38, -7), shift(b, -38, -7), -37),
    edit = curve(shift(b, 38, 0), shift(c, -40, -14), -37),
    file = curve(shift(c, -13, 24), shift(a, -19, 25), -89);
  F.add(
    F.draw(read, 'gold', 0.08, 0.86) +
      F.fly(slip('teal', 'code'), read, 0.12, 0.96) +
      F.fly(slip('rose', 'lines', 1.17), read, 1.04, 1.92)
  );
  F.add(F.fade(place(shift(b, 30, -35), checkIcon(false, 1.0)), (t) => between(t, 1.16, 1.51, 2.02, 2.56)));
  F.add(F.draw(edit, 'rose', 2.01, 2.81) + F.fly(slip('rose', 'code', 1.12), edit, 2.06, 2.94));
  F.add(
    F.fade(
      place(
        shift(c, 0, 18),
        `<rect class="edit-strip" x="-58" y="-11" width="116" height="21" rx="3"/>${txt(0, 3, '+ select(trace)', 'code-small')}`
      ),
      (t) => rise(t, 2.54, 2.93)
    )
  );
  F.add(
    F.draw(file, 'teal', 3.02, 3.83, false) +
      F.fly(slip('teal', 'code', 1.05), file, 3.05, 3.94) +
      F.appear(shift(a, 31, 14), slip('teal', 'code', 0.72), 3.66, 3.98)
  );
}
function godelFilm(F) {
  const { a, b, c, compact } = F;
  const input = curve(shift(a, 38, -3), shift(b, -41, -13), -36),
    patch = curve(shift(b, 43, 1), shift(c, -41, -8), -40);
  const old = bay(
    143,
    118,
    'gold',
    T('程序 v', 'PROGRAM v'),
    art('searcher', 'gold', -18, 5, 0.76) +
      txt(18, 11, T('搜索器', 'Searcher'), 'micro', 'start') +
      txt(0, 45, T('公理 + 效用', 'Axioms + utility'), 'sheet-foot')
  );
  F.add(place(a, old));
  F.add(
    place(
      b,
      sheet(
        151,
        99,
        'rose',
        T('切换证明', 'SWITCH PROOF'),
        txt(0, 0, 'U(switch)', 'code-type') + txt(0, 24, '> U(search)', 'code-type')
      )
    )
  );
  F.add(
    F.draw(input, 'rose', 0.13, 1.57) +
      F.fly(slip('gold', 'code'), input, 0.17, 0.95) +
      F.fly(slip('rose', 'lines', 1.08), input, 1.06, 1.9)
  );
  const hinge = compact ? [254, 176] : [555, 136];
  F.add(place(hinge, '<circle class="hinge-base" r="11"/>'));
  F.add(
    F.pivot(
      `<path class="switch-arm" d="M0 0l1-30"/><circle class="switch-knob" cx="1" cy="-30" r="5"/>`,
      hinge,
      (t) => -29 + 94 * rise(t, 2.18, 2.8)
    )
  );
  F.add(F.appear(shift(b, 54, 39), checkIcon(true, 1.14), 2.31, 2.88));
  F.add(F.draw(patch, 'teal', 2.67, 3.61) + F.fly(slip('teal', 'code'), patch, 2.85, 3.78));
  const next = bay(
    145,
    118,
    'teal',
    T('程序 v′', 'PROGRAM v′'),
    art('searcher', 'rose', -21, 4, 0.78) +
      txt(13, 10, T('新搜索器', 'Searcher′'), 'micro', 'start') +
      txt(0, 45, T('继承改写', 'Rewrite applied'), 'sheet-foot')
  );
  F.add(F.fade(place(c, next), (t) => 0.2 + 0.8 * rise(t, 2.78, 3.77)));
  F.add(F.appear(shift(c, 46, 43), checkIcon(true, 0.96), 3.5, 3.95));
}
function dgmFilm(F, choice) {
  const { compact } = F;
  const nodes = compact
    ? {
        0: [43, 62],
        4: [130, 65],
        6: [257, 42],
        20: [213, 126],
        24: [204, 208],
        38: [72, 282],
        47: [201, 296],
        61: [335, 273]
      }
    : {
        0: [84, 146],
        4: [220, 146],
        6: [356, 64],
        20: [357, 201],
        24: [491, 201],
        38: [649, 92],
        47: [663, 197],
        61: [741, 249]
      };
  const sample = choice === 'node6' ? 6 : 24;
  const arcs = [
    [0, 4, 0.03, 0.79],
    [4, 6, 1.0, 1.66],
    [4, 20, 1.23, 1.95],
    [20, 24, 2.0, 2.77],
    [24, 38, 3.02, 3.6],
    [24, 47, 3.16, 3.77],
    [24, 61, 3.31, 3.95]
  ];
  for (const [a, b, t, e] of arcs) {
    const line = curve(nodes[a], nodes[b], b === 6 || b === 38 ? -20 : b === 61 ? 22 : 8);
    F.add(F.draw(line, b === sample ? 'rose' : a === 24 ? 'teal' : 'gold', t, e));
    F.add(F.fly(slip(a === 24 ? 'teal' : 'gold', 'code', 0.65), line, t + 0.045, e + 0.07));
  }
  for (const [id, p] of Object.entries(nodes)) {
    const n = +id,
      src = arcs.find((a) => a[1] === n);
    const tone = n === sample ? 'rose' : n < 5 ? 'gold' : 'teal';
    const candidate = `<g class="specimen tone-${tone}"><ellipse class="ground" cx="2" cy="6" rx="23" ry="21"/><circle class="specimen-shell" r="22"/><circle class="specimen-core" r="16"/>${txt(0, 5, id, 'node-number')}</g>`;
    F.add(src ? F.appear(p, candidate, src[3] - 0.25, src[3] + 0.05) : place(p, candidate));
  }
  const plate = compact ? [86, 177] : [558, 44],
    label =
      sample === 6
        ? T('节点 6 · 扩展 edit', 'Node 6 · extend edit')
        : T('节点 24 · str_replace', 'Node 24 · str_replace');
  F.add(
    F.appear(
      plate,
      sheet(
        compact ? 146 : 173,
        57,
        'rose',
        label,
        txt(
          0,
          16,
          sample === 6
            ? l(T('23.3% · 60 题', '23.3% · 60 tasks'))
            : l(T('40.5% · 200 题', '40.5% · 200 tasks')),
          'body-type'
        )
      ),
      2.36,
      2.88
    )
  );
}
function stopFilm(F) {
  const { compact } = F;
  const seed = compact ? [71, 83] : [118, 144],
    pool = compact
      ? [
          [154, 43],
          [188, 103],
          [221, 160]
        ]
      : [
          [343, 65],
          [342, 143],
          [344, 220]
        ],
    products = compact
      ? [
          [252, 43],
          [282, 103],
          [312, 160]
        ]
      : [
          [535, 65],
          [535, 143],
          [535, 220]
        ],
    winner = compact ? [225, 256] : [715, 145];
  F.add(place(seed, bench('rose', 'searcher', T('当前 Improver', 'Current improver'), 1.23)));
  const own = curve(shift(seed, -30, -16), shift(seed, 22, -20), -66);
  F.add(F.draw(own, 'rose', 0.05, 0.81) + F.fly(slip('rose', 'code', 0.76), own, 0.05, 0.92));
  for (let i = 0; i < 3; i++) {
    const line = curve(shift(seed, 19, -4), pool[i], i === 0 ? -18 : 12),
      out = curve(shift(pool[i], 16, 0), products[i], -9);
    F.add(
      F.draw(line, 'rose', 1 + i * 0.16, 1.58 + i * 0.17) +
        F.fly(slip('rose', 'code', 0.65), line, 1.03 + i * 0.16, 1.63 + i * 0.17)
    );
    F.add(
      F.appear(
        pool[i],
        art('policy', 'rose', 0, -2, 0.76) + txt(0, 28, 'I′' + ['₁', '₂', '₃'][i], 'micro'),
        1.38 + i * 0.16,
        1.68 + i * 0.16
      )
    );
    F.add(
      F.draw(out, 'teal', 2 + i * 0.15, 2.52 + i * 0.15) +
        F.fly(slip('teal', 'code', 0.65), out, 2.02 + i * 0.15, 2.6 + i * 0.15) +
        F.appear(products[i], art('code', 'teal', 0, -1, 0.74), 2.34 + i * 0.15, 2.68 + i * 0.15)
    );
  }
  const selected = curve(products[1], winner, compact ? 31 : -20);
  F.add(F.draw(selected, 'gold', 2.78, 3.47) + F.fly(slip('gold', 'delta', 0.85), selected, 2.82, 3.46));
  F.add(F.appear(winner, bench('rose', 'policy', T('下一轮 Improver', 'Next improver'), 1.3), 3.12, 3.7));
  const again = curve(shift(winner, -24, 28), shift(seed, -20, 19), compact ? -49 : -127);
  F.add(F.draw(again, 'rose', 3.46, 3.92, false) + F.fly(slip('rose', 'code', 0.79), again, 3.49, 3.98));
}
function hyperFilm(F, choice) {
  const { compact } = F;
  const from = compact ? [95, 128] : [217, 149],
    to = compact ? [304, 128] : [624, 149];
  const w = compact ? 150 : 204,
    h = 149;
  choice = choice || 'meta';
  const bays = (title, tone) =>
    bay(
      w,
      h,
      tone,
      title,
      [-17, 36]
        .map(
          (y, i) =>
            `<rect class="module-slot" x="${-w / 2 + 9}" y="${y - 16}" width="${w - 18}" height="39" rx="5"/>${txt(8, y + 7, i ? 'Meta' : 'Task', 'body-type', 'start')}`
        )
        .join('')
    );
  F.add(
    place(from, bays(T('源领域', 'SOURCE DOMAIN'), 'gold')) +
      place(to, bays(T('目标领域', 'TARGET DOMAIN'), 'teal'))
  );
  const roles = [
    ['chip', 'teal', 'task'],
    ['policy', 'rose', 'meta']
  ];
  for (let i = 0; i < 2; i++) {
    const [kind, tone, role] = roles[i],
      offset = compact ? -34 : -40,
      y = i ? 37 : -16,
      a = shift(from, offset, y),
      b = shift(to, offset, y);
    const carried = choice === 'both' || choice === role,
      unfold = curve(shift(from, offset - 10, 8), a, i ? 13 : -15);
    const module = art(kind, tone, 0, 0, 0.72);
    F.add(
      F.anim(module, {
        transform: (t) => {
          const p = unfold.at(rise(t, 0.04 + i * 0.15, 0.77 + i * 0.14));
          return `translate(${fnum(p[0])} ${fnum(p[1])})`;
        }
      })
    );
    F.add(
      place(
        b,
        F.fade(art(kind, 'neutral', 0, 0, 0.71), (t) => (carried ? 1 - rise(t, 2.61 + i * 0.09, 2.91) : 1))
      )
    );
    const edit = curve(shift(from, -29, 36), a, i ? 38 : -51);
    F.add(F.fly(slip('rose', 'code', 0.66), edit, 1.02 + i * 0.22, 1.71 + i * 0.2));
    const notch = `<g class="edition tone-${tone}"><path class="slip-face" d="M-10-7h20v14h-20z"/>${txt(0, 3, 'v′', 'version-mark')}</g>`;
    F.add(F.appear(shift(a, -22, -10), notch, 1.45 + i * 0.18, 1.87 + i * 0.09));
    if (carried) {
      const travel = curve(a, b, i === 0 ? -72 : 74);
      F.add(
        F.draw(travel, tone, 2.0 + i * 0.11, 2.78 + i * 0.08, false) +
          F.fly(art(kind, tone, 0, 0, 0.96), travel, 2.03 + i * 0.13, 2.81 + i * 0.08)
      );
      F.add(F.fade(place(b, module + place([-22, -10], notch)), (t) => rise(t, 2.67 + i * 0.08, 2.98)));
    }
  }
  const grade = compact ? [218, 266] : [505, 261];
  const test = curve(shift(to, 3, 65), shift(grade, 22, 0), compact ? 24 : -22);
  F.add(F.draw(test, 'gold', 3.03, 3.77) + F.fly(slip('gold', 'code', 0.82), test, 3.04, 3.84));
  F.add(
    F.appear(
      grade,
      sheet(
        154,
        60,
        'gold',
        T('目标任务', 'TARGET TASK'),
        txt(0, 17, T('奥数解答评分', 'Grade math solutions'), 'body-type')
      ),
      3.26,
      3.85
    )
  );
}
const paperFilms = {
  'self-refine': refineFilm,
  reflexion: reflexionFilm,
  reasoningbank: reasoningFilm,
  star: starFilm,
  seal: sealFilm,
  'meta-harness': harnessFilm,
  'godel-machine': godelFilm,
  dgm: dgmFilm,
  stop: stopFilm,
  hyperagents: hyperFilm
};
