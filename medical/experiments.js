'use strict';
// Each experiment is driven by the same four-beat clock as its captions and paper notes.
const ClinicExperiments = (() => {
  const {
    G,
    group,
    box,
    ball,
    cylinder,
    disc,
    cord,
    curve,
    label,
    shadow,
    pencil,
    tick,
    plus,
    colors: c
  } = Sculptures;
  const clamp = (n) => Math.min(1, Math.max(0, n));
  function ease(t, a, b) {
    const u = clamp((t - a) / (b - a));
    return u * u * (3 - 2 * u);
  }
  function arc(from, to, p, rise) {
    return from + (to - from) * p + Math.sin(p * Math.PI) * rise;
  }
  function tag(part, id, x, y, z) {
    part.userData.action = id;
    const spot = group(part, x, y, z);
    spot.name = 'anchor:' + id;
    return spot;
  }
  function sheet(parent, w = 0.83, h = 0.72, color = c.sky) {
    const g = group(parent);
    box(g, 0, 0, 0, w, h, 0.105, 0.052, color);
    box(g, 0, -0.014, 0.055, w * 0.85, h * 0.8, 0.042, 0.02, c.cream);
    box(g, -w * 0.19, h * 0.2, 0.087, w * 0.31, 0.073, 0.022, 0.011, color);
    for (let i = 0; i < 3; i++) {
      const length = w * [0.63, 0.51, 0.36][i];
      box(
        g,
        -w * 0.32 + length / 2,
        h * (0.036 - i * 0.14),
        0.087,
        length,
        0.027,
        0.013,
        0.006,
        i === 2 ? c.grey : '#a3abc9'
      );
    }
    return g;
  }
  function folders(parent, w, h, depth, paint) {
    const g = group(parent);
    box(g, 0, 0, 0, w, h, depth, 0.066, paint);
    box(g, -w * 0.21, h * 0.48, 0, w * 0.42, h * 0.22, depth * 0.89, 0.054, paint);
    box(g, 0, -h * 0.06, depth * 0.61, w * 0.91, h * 0.58, depth * 0.5, 0.046, paint);
    box(g, -w * 0.17, h * 0.06, depth * 0.86, w * 0.32, 0.062, 0.016, 0.008, c.cream);
    return g;
  }
  function attach(list, id, node, at, verb, operation) {
    const spot = tag(node, id, ...at);
    list[id] = { node, spot, verb, operation };
  }
  const to = (step) => ({ step });
  const select = (key, value) => ({ key, value });
  const verbs = {
    drawer: T('打开抽屉', 'Open drawer'),
    records: T('检查取回的记录', 'Inspect records'),
    filter: T('选最近 24 小时', 'Select last 24 h'),
    compare: T('对照题目', 'Check the task'),
    prompt: T('读指令', 'Read instructions'),
    tool: T('调用工具', 'Call the tool'),
    memory: T('打开记忆', 'Open memory'),
    trace: T('读失败记录', 'Read the trace'),
    write: T('写技能卡', 'Write the skill'),
    hand: T('把卡交给 Solver', 'Give card to Solver'),
    keep: T('收好技能卡', 'Save the skill'),
    baseline: T('运行 H₀', 'Run H₀'),
    candidates: T('提出候选', 'Propose edits'),
    grade: T('比较同一批题', 'Compare matched tasks'),
    reward: T('送回奖励', 'Send rewards back'),
    lock: T('换一个固定 Solver', 'Change fixed solver'),
    control: T('看基础条件', 'Read baseline'),
    writers: T('比较写作者', 'Compare writers'),
    gain: T('读成功率差值', 'Read the gain'),
    count: T('数通过的检查', 'Count passed checks'),
    fresh: T('写一张新卡', 'Write a new skill'),
    rerun: T('带技能重跑', 'Rerun with skill'),
    frozen: T('检查模型锁', 'Inspect the lock')
  };
  function makeDrawer(root) {
    const g = group(root, 1.0, 0.04, -0.45);
    const w = 1.76,
      h = 1.29,
      d = 1.3;
    box(g, 0, 0.12, 0, w, 0.22, d, 0.095, c.navy);
    box(g, 0, h, 0, w + 0.1, 0.16, d + 0.09, 0.075, c.lightBlue);
    box(g, 0, 0.7, -0.57, w, 1.12, 0.18, 0.082, c.blue);
    for (const s of [-1, 1]) box(g, s * 0.81, 0.73, 0, 0.17, 1.21, d, 0.082, c.blue);
    box(g, 0, 0.36, 0.54, 1.51, 0.36, 0.18, 0.08, c.sky);
    box(g, 0, 0.375, 0.675, 0.44, 0.063, 0.105, 0.03, c.navy);
    const drawer = group(g, 0, 0.8, 0.05);
    box(drawer, 0, -0.24, 0, 1.48, 0.09, 1.1, 0.038, c.navy);
    for (const s of [-1, 1]) box(drawer, s * 0.71, -0.092, 0, 0.075, 0.31, 1.12, 0.035, c.sky);
    const files = [];
    for (let i = 0; i < 5; i++) {
      const f = folders(drawer, 1.26, 0.38, 0.075, [c.honey, c.rose, c.lightBlue, c.mint, c.honey][i]);
      f.position.set(0, -0.05, -0.39 + i * 0.193);
      files.push(f);
    }
    box(drawer, 0, 0, 0.566, 1.55, 0.5, 0.18, 0.083, c.sky);
    box(drawer, 0, 0.042, 0.662, 0.63, 0.19, 0.045, 0.02, c.cream);
    label(drawer, 0, 0.043, 0.688, 0.49, 0.143, 'ARCHIVE', '#465689');
    box(drawer, 0, -0.125, 0.704, 0.42, 0.067, 0.104, 0.032, c.blue);
    shadow(root, 1, 0.042, -0.32, 2.72, 2.17);
    return { g, drawer, files };
  }
  function timeCard(root) {
    const g = group(root, 1.51, 0.53, 1.02);
    g.rotation.x = -0.17;
    g.rotation.y = -0.15;
    box(g, 0, -0.455, -0.02, 1.34, 0.15, 0.56, 0.065, c.lilac);
    box(g, 0, 0, 0, 1.2, 0.85, 0.16, 0.078, c.orange);
    box(g, 0, -0.035, 0.09, 1.09, 0.63, 0.051, 0.022, c.cream);
    for (const x of [-0.37, 0.37])
      cord(
        g,
        [
          [x, 0.29, 0.105],
          [x, 0.415, 0.15],
          [x, 0.465, 0.045],
          [x, 0.402, -0.13]
        ],
        0.04,
        c.navy
      );
    const day = label(g, 0, -0.042, 0.125, 0.83, 0.35, '24 h');
    const year = label(g, 0, -0.042, 0.129, 0.83, 0.35, '1 yr');
    shadow(root, 1.51, 0.046, 1.02, 1.95, 0.93);
    return { g, day, year };
  }
  function base(root) {
    const actions = {},
      cabinet = makeDrawer(root),
      cal = timeCard(root);
    const one = sheet(cabinet.g, 0.8, 0.77, c.honey),
      two = sheet(cabinet.g, 0.67, 0.64, c.rose);
    const range = group(cabinet.g, 0, 0.99, 0.17);
    box(range, 0, 0, 0, 1.35, 0.44, 0.1, 0.05, c.plum);
    label(range, 0, 0, 0.056, 1.16, 0.26, '1 yr');
    attach(actions, 'drawer', cabinet.g, [0.14, 1.64, 0.14], verbs.drawer, to(1));
    attach(actions, 'records', one, [-0.1, 0.46, 0], verbs.records, to(2));
    attach(actions, 'calendar', cal.g, [0.12, 0.57, 0.02], verbs.filter, select('window', 'day'));
    attach(actions, 'range', range, [0, 0.32, 0.04], verbs.compare, to(3));
    return {
      actions,
      roles: [[-1.67, 0.13, 0.18], null],
      focus: ['drawer', 'records', 'range', 'calendar'],
      info(k, v) {
        if (!k)
          return v.window === 'day'
            ? T('你的选择 · 最近 24 小时', 'Your choice · last 24 hours')
            : v.window === 'year'
              ? T('你的选择 · 过去一年', 'Your choice · a full year')
              : T('题目要求 · 最近 24 小时', 'Requested window · last 24 hours');
        if (k === 1) return T('查回的记录 · 过去一年', 'Retrieved window · a full year');
        if (k === 2) return T('实际求平均 · 过去一年', 'Averaged window · a full year');
        return T('题目要求 24 小时，实际取了整年', 'Requested 24 hours · averaged a year');
      },
      pose(t, v) {
        const open = ease(t, 1, 1.56),
          fan = ease(t, 1.19, 1.9),
          result = ease(t, 2.05, 2.65);
        cabinet.drawer.position.z = 0.05 + open * 0.74;
        cabinet.files.forEach((f, i) => {
          f.position.y = -0.05 + open * (0.095 + 0.021 * (4 - i));
          f.rotation.x = -open * 0.19;
        });
        one.visible = two.visible = fan > 0.025;
        one.position.set(-0.21, 0.89 + 1.04 * fan, 0.51 + 0.57 * open);
        two.position.set(0.34, 0.88 + 0.85 * fan, 0.42 + 0.52 * open);
        one.scale.setScalar(0.8 + 0.27 * fan);
        one.rotation.z = 0.12 + 0.08 * fan;
        two.rotation.z = -0.15 - 0.12 * fan;
        range.scale.setScalar(Math.max(0.001, result));
        range.position.set(0, 1.25 + 0.21 * result, 0.83 + open * 0.45);
        cal.year.visible = t < 1 && v.window === 'year';
        cal.day.visible = !cal.year.visible;
        cal.g.rotation.z = 0.028 * Math.sin(ease(t, 3, 3.75) * Math.PI);
      }
    };
  }
  function harness(root) {
    const actions = {},
      tray = group(root, 1.03, 0.055, 0.15);
    box(tray, 0, 0.11, 0, 2.95, 0.22, 1.53, 0.105, c.pine);
    box(tray, 0, 0.22, 0, 2.93, 0.15, 1.51, 0.069, c.mint);
    const lid = group(tray, 0, 0.26, -0.64);
    lid.rotation.x = -0.12;
    box(lid, 0, 0.49, 0.0, 2.8, 0.99, 0.16, 0.077, c.mint);
    box(lid, 0, 0.49, 0.097, 2.52, 0.72, 0.05, 0.024, '#bee0cb');
    cord(
      lid,
      [
        [-0.37, 0.96, 0],
        [-0.34, 1.16, 0],
        [-0.17, 1.23, 0],
        [0.21, 1.23, 0],
        [0.36, 1.15, 0],
        [0.37, 0.96, 0]
      ],
      0.064,
      c.pine
    );
    const parts = [
      sheet(tray, 0.66, 0.85, c.pink),
      group(tray),
      folders(tray, 0.71, 0.64, 0.14, c.honey)
    ];
    const magnifier = parts[1];
    disc(magnifier, 0, 0.15, 0, 0.286, 0.11, c.navy);
    disc(magnifier, 0, 0.15, 0.063, 0.221, 0.072, c.sky);
    cord(
      magnifier,
      [
        [-0.12, 0.19, 0.11],
        [-0.07, 0.266, 0.114],
        [0.03, 0.29, 0.113]
      ],
      0.021,
      c.cream
    );
    const handle = box(magnifier, 0.185, -0.223, 0, 0.135, 0.45, 0.13, 0.06, c.blue);
    handle.rotation.z = 0.54;
    const keys = ['prompt', 'tool', 'memory'];
    parts.forEach((p, i) => {
      p.position.set((i - 1) * 0.89, 0.66, 0.37);
      p.rotation.z = (i - 1) * -0.09;
      box(tray, (i - 1) * 0.89, 0.315, 0.34, 0.75, 0.055, 0.47, 0.025, c.pine);
      attach(actions, keys[i], p, [0, 0.53, 0.03], verbs[keys[i]], select('part', keys[i]));
    });
    shadow(root, 1.03, 0.04, 0.16, 3.88, 2.2);
    return {
      actions,
      roles: [[-1.72, 0.13, 0.19], null],
      focus: ['prompt', 'tool', 'memory', 'prompt'],
      info(k) {
        return [
          T('Agent = 模型 + Harness', 'Agent = model + harness'),
          T('指令进入模型上下文', 'Instructions enter the model context'),
          T('工具把记录返回给模型', 'The tool returns records to the model'),
          T('记忆留给下一次任务', 'Memory persists into the next task')
        ][k];
      },
      pose(t) {
        lid.rotation.x = -0.12 - 0.36 * ease(t, 0, 0.82);
        parts.forEach((p, i) => {
          const a = i + 1,
            rise = ease(t, a, a + 0.46) * (i === 2 ? 1 : 1 - ease(t, a + 1, a + 1.41));
          p.position.y = 0.66 + 0.57 * rise;
          p.position.z = 0.37 + 0.2 * rise;
          p.rotation.z = (i - 1) * -0.09 + 0.11 * Math.sin(rise * Math.PI);
        });
      }
    };
  }
  function deskStand(root, x, z) {
    const g = group(root, x, 0, z);
    g.name = 'card-stand';
    box(g, 0, 0.09, 0, 1.13, 0.17, 0.68, 0.08, c.indigo);
    box(g, 0, 0.18, 0, 1.05, 0.14, 0.61, 0.062, c.lightBlue);
    box(g, 0, 0.24, 0.06, 0.9, 0.075, 0.19, 0.037, c.navy);
    return g;
  }
  function si(root) {
    const actions = {},
      book = group(root, -0.1, 0.32, 1.03);
    book.rotation.x = 0.45;
    box(book, 0, 0, 0, 1.75, 0.15, 0.91, 0.072, c.plum);
    box(book, 0, 0.106, 0, 1.67, 0.088, 0.86, 0.04, c.cream);
    const dots = [],
      spans = [];
    for (let i = 0; i < 7; i++) {
      const dot = group(book, -0.65 + i * 0.213, 0.169, 0.014);
      ball(dot, 0, 0, 0, 0.07, 0.041, 0.076, i < 5 ? c.pink : c.mint);
      dots.push(dot);
    }
    for (const [caption, ink] of [
      ['1 yr', '#8b3e61'],
      ['24 h', '#226962']
    ]) {
      const text = label(book, 0, 0.156, -0.24, 1.01, 0.23, caption, ink);
      text.rotation.x = -Math.PI / 2;
      spans.push(text);
    }
    shadow(root, -0.1, 0.043, 1.03, 2.35, 1.33);
    deskStand(root, -1.28, 0.84);
    const card = sheet(root, 0.94, 0.79, c.blue),
      stamp = group(root, -1.0, 1.2, 0.9);
    box(card, 0, -0.035, 0.1, 0.74, 0.32, 0.022, 0.01, c.cream);
    const rule = label(card, 0, -0.013, 0.114, 0.6, 0.19, '24 h', '#3c598c');
    disc(stamp, 0, 0, 0, 0.155, 0.075, c.pine);
    tick(stamp, 0, 0, 0.049, 0.23, c.cream);
    attach(actions, 'book', book, [0, 0.22, 0], verbs.trace, to(0.0));
    attach(actions, 'writer', group(root, 1.81, 0, -0.12), [0, 2.62, 0], verbs.write, to(1));
    attach(actions, 'card', card, [0, 0.49, 0.01], verbs.hand, to(2));
    attach(actions, 'slot', group(root, -1.28, 0.21, 0.84), [0, 0.29, 0], verbs.keep, to(3));
    return {
      actions,
      roles: [
        [-1.8, -0.07, 0.27],
        [1.81, -0.12, -0.26]
      ],
      focus: ['writer', 'card', 'slot', 'book'],
      handable: true,
      info(k) {
        return [
          T('输入 · 失败轨迹', 'Input · a failed attempt'),
          T('技能 · 先筛时间，再求平均', 'Skill · filter before averaging'),
          T('Solver 带技能重新执行', 'Solver runs again with the skill'),
          T('SI · 改变 Solver 的做法', 'SI · the solver’s method changes')
        ][k];
      },
      pose(t, v, held) {
        const give = held ?? ease(t, 2, 2.79);
        const write = ease(t, 1, 1.68),
          keep = ease(t, 3, 3.75);
        card.position.set(
          arc(0.93, -1.28, give, 0),
          arc(0.64 + 0.42 * write, 0.89, give, 0.67) - 0.21 * keep,
          arc(0.56, 0.86, give, 0.18)
        );
        rule.visible = write > 0.47;
        card.rotation.set(
          -0.19 - 0.04 * give,
          0.16 - 0.39 * give,
          -0.12 + 0.24 * give + 0.18 * Math.sin(give * Math.PI)
        );
        card.scale.setScalar(0.89 + 0.18 * write - 0.1 * keep);
        dots.forEach((dot, i) => {
          dot.scale.setScalar(
            i < 5
              ? 1 - ease(give, 0.22 + i * 0.073, 0.58 + i * 0.073)
              : 1 + 0.16 * Math.sin(give * Math.PI)
          );
          dot.visible = dot.scale.x > 0.02;
        });
        spans[0].visible = give < 0.67;
        spans[1].visible = !spans[0].visible;
        stamp.scale.setScalar(Math.max(0.001, ease(t, 2.74, 2.99)));
        stamp.position.y = 1.22 - 0.2 * keep;
      }
    };
  }
  function train(root) {
    const actions = {},
      chip = group(root, 0, 0.27, 0.7),
      sides = [c.blue, c.pink];
    box(chip, 0, 0, 0, 1.17, 0.26, 0.98, 0.117, c.navy);
    box(chip, 0, 0.18, 0, 0.97, 0.19, 0.81, 0.088, c.lilac);
    box(chip, 0, 0.307, 0, 0.69, 0.125, 0.58, 0.058, c.cream);
    const theta = label(chip, 0, 0.377, 0, 0.45, 0.34, 'θ');
    theta.rotation.x = -Math.PI / 2;
    const feedback = [group(chip, -0.29, 0.08, 0.49), group(chip, 0.29, 0.08, 0.49)];
    feedback.forEach((lamp, i) => {
      ball(lamp, 0, 0, 0, 0.064, 0.056, 0.034, i ? c.rose : c.sky);
    });
    for (const s of [-1, 1])
      for (let i = 0; i < 4; i++)
        box(chip, s * 0.62, -0.015, -0.33 + 0.214 * i, 0.18, 0.06, 0.063, 0.029, c.honey);
    shadow(root, 0, 0.044, 0.68, 2.12, 1.58);
    const paths = [],
      signals = [],
      stacks = [];
    for (const i of [0, 1]) {
      const side = i ? 1 : -1,
        pts = [
          [side * 1.86, 0.48, 0.44],
          [side * 1.66, 0.27, 1.13],
          [side * 1.1, 0.14, 1.32],
          [side * 0.66, 0.2, 0.93],
          [side * 0.45, 0.31, 0.71]
        ];
      cord(root, pts, 0.053, i ? '#ca87aa' : '#86a7de');
      paths.push(curve(pts));
      const orb = group(root);
      ball(orb, 0, 0, 0, 0.105, 0.105, 0.105, i ? c.rose : c.sky);
      signals.push(orb);
      const candidate = sheet(root, 0.63, 0.56, sides[i]);
      candidate.rotation.z = i ? -0.13 : 0.12;
      stacks.push(candidate);
    }
    const dial = group(root, 0.04, 0.74, -0.48);
    box(dial, 0, 0, 0, 1.39, 1.12, 0.24, 0.11, c.pine);
    box(dial, 0, 0.05, 0.14, 1.17, 0.86, 0.075, 0.033, c.cream);
    label(dial, 0, 0.15, 0.184, 0.85, 0.36, 'Δ');
    for (const [idx, paint] of [c.sky, c.honey, c.rose].entries())
      ball(dial, (idx - 1) * 0.2, -0.18, 0.19, 0.052, 0.052, 0.032, paint);
    attach(actions, 'solver', group(root, -1.9, 0, -0.14), [0, 2.55, 0], verbs.baseline, to(0));
    attach(actions, 'writer', group(root, 1.88, 0, -0.18), [0, 2.55, 0], verbs.candidates, to(1));
    attach(actions, 'dial', dial, [0, 0.68, 0.06], verbs.grade, to(2));
    attach(actions, 'chip', chip, [0, 0.49, 0.04], verbs.reward, to(3));
    return {
      actions,
      roles: [
        [-1.9, -0.14, 0.24],
        [1.88, -0.18, -0.23]
      ],
      focus: ['writer', 'dial', 'chip', 'solver'],
      info(k) {
        return [
          T('同一个模型 · 两种角色', 'One model · two roles'),
          T('候选技能交给同一 Solver', 'Same solver tests candidate skills'),
          T('编辑奖励来自匹配任务的评分差', 'Edit reward uses matched-task gains'),
          T('RSI · 两种奖励更新共享权重', 'RSI · both rewards update shared weights')
        ][k];
      },
      pose(t) {
        const propose = ease(t, 1, 1.75),
          test = ease(t, 2, 2.76),
          update = ease(t, 3, 3.83);
        stacks.forEach((p, i) => {
          const q = clamp(test * (1.38 - i * 0.2));
          p.scale.setScalar(Math.max(0.001, propose) * (1 - 0.32 * q));
          p.position.set(
            1.03 - i * 0.3 - (1.25 + i * 0.34) * q,
            1.01 + i * 0.16 + 0.39 * Math.sin(q * Math.PI),
            0.36 + i * 0.11
          );
        });
        signals.forEach((s, i) => {
          const u = ease(t, 3 + i * 0.11, 3.73 + i * 0.1);
          s.position.copy(paths[i].getPoint(u));
          s.visible = t >= 3 && u < 0.985;
          feedback[i].visible = u >= 0.985;
        });
        const pulse = Math.sin(update * Math.PI);
        chip.scale.setScalar(1 + 0.15 * pulse);
        chip.rotation.y = 0.085 * pulse;
        dial.rotation.z = -0.052 * Math.sin(test * Math.PI);
      }
    };
  }
  function lockPiece(parent, x, y, z) {
    const g = group(parent, x, y, z);
    cord(
      g,
      [
        [-0.19, 0.02, 0],
        [-0.19, 0.25, 0],
        [-0.13, 0.39, 0],
        [0.035, 0.42, 0],
        [0.17, 0.33, 0],
        [0.19, 0.13, 0]
      ],
      0.047,
      c.navy
    );
    box(g, 0, -0.08, 0, 0.55, 0.43, 0.16, 0.071, c.honey);
    ball(g, 0, -0.05, 0.089, 0.06, 0.068, 0.025, c.plum);
    box(g, 0, -0.108, 0.089, 0.039, 0.098, 0.024, 0.011, c.plum);
    return g;
  }
  function fixed(root) {
    const actions = {},
      board = group(root, 1.12, 0.075, 0.15),
      bars = [],
      values = [],
      paints = [c.grey, c.blue, c.pink];
    box(board, 0, 0.1, 0, 3.18, 0.19, 1.24, 0.086, c.navy);
    box(board, 0, 0.213, 0, 3.13, 0.12, 1.2, 0.054, c.lightBlue);
    const lock = lockPiece(root, -1.39, 0.81, 0.72);
    attach(actions, 'lock', lock, [0, 0.51, 0.025], verbs.lock, { cycle: true });
    const names = ['H₀', 'GRPO', 'RSI'],
      keys = ['control', 'writers', 'gain'];
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * 0.94,
        p = group(board, x, 0.27, 0);
      box(p, 0, 0.72, 0, 0.65, 1.44, 0.6, 0.103, paints[i]);
      bars.push(p);
      const number = group(board, x, 0.68, 0.16);
      values.push(number);
      for (const model of MEDICAL_CONTROLS) {
        const score = model.scores[i] + '%';
        if (number.children.some((n) => n.name === score)) continue;
        const text = label(number, 0, 0.1, 0, 0.66, 0.255, score);
        text.name = score;
      }
      const name = label(board, x, 0.139, 0.64, 0.68, 0.166, names[i], '#fff9f6');
      name.position.z = 0.631;
      attach(actions, keys[i], p, [0, 1.49, 0], verbs[keys[i]], to([1, 2, 3][i]));
      number.userData.action = keys[i];
    }
    shadow(root, 1.12, 0.042, 0.15, 3.98, 2.04);
    function control(v) {
      return MEDICAL_CONTROLS.find((m) => m.id === v.solver) || MEDICAL_CONTROLS[0];
    }
    return {
      actions,
      roles: [[-1.79, 0.01, 0.16], null],
      focus: ['control', 'writers', 'gain', 'lock'],
      chart: true,
      info(k, v) {
        const m = control(v);
        if (!k) return T('固定 Solver · ' + m.backbone, 'Fixed solver · ' + m.backbone);
        if (k === 1)
          return T('基础条件 H₀ · ' + m.scores[0] + '%', 'Base harness H₀ · ' + m.scores[0] + '%');
        if (k === 2)
          return T(
            '写作者 · GRPO ' + m.scores[1] + '% / MedicalRSI ' + m.scores[2] + '%',
            'Writers · GRPO ' + m.scores[1] + '% / MedicalRSI ' + m.scores[2] + '%'
          );
        return T(
          'MedicalRSI 写作者 +' + m.gain.toFixed(1) + ' 个百分点',
          'MedicalRSI writer +' + m.gain.toFixed(1) + ' pp'
        );
      },
      pose(t, v, held, scoreBlend) {
        const m = control(v);
        bars.forEach((bar, i) => {
          const p = i === 0 ? ease(t, 0.24, 1.52) : ease(t, 1.99 + (i - 1) * 0.14, 2.68 + (i - 1) * 0.1);
          const h = 0.09 + (scoreBlend || m.scores)[i] * 0.023 * p;
          bar.scale.y = h / 1.44;
          values[i].position.y = 0.31 + h;
          values[i].visible = p > 0.77;
          values[i].children.forEach((n) => (n.visible = n.name === m.scores[i] + '%'));
        });
        lock.rotation.z = -0.1 * Math.sin(ease(t, 0.08, 0.73) * Math.PI);
      }
    };
  }
  function unseen(root) {
    const actions = {},
      board = group(root, 0.55, 1.17, 0.47);
    board.rotation.x = -0.1;
    box(board, 0, 0, 0, 2.38, 1.79, 0.22, 0.105, c.pine);
    box(board, 0, -0.024, 0.137, 2.14, 1.54, 0.07, 0.031, c.cream);
    box(board, 0, 0.78, 0.113, 0.66, 0.19, 0.135, 0.064, c.orange);
    shadow(root, 0.55, 0.042, 0.42, 3.04, 1.55);
    box(root, 0.55, 0.16, 0.42, 1.62, 0.29, 0.79, 0.133, c.mint);
    const bulbs = [];
    for (let i = 0; i < 11; i++) {
      const col = i % 4,
        row = Math.floor(i / 4),
        g = group(board, (col - 1.5) * 0.433, 0.39 - row * 0.37, 0.203);
      disc(g, 0, 0, 0, 0.145, 0.065, '#d4d2d6');
      const lit = group(g, 0, 0, 0.026);
      disc(lit, 0, 0, 0, 0.141, 0.075, c.pine);
      tick(lit, 0, 0, 0.052, 0.21, c.cream);
      bulbs.push(lit);
    }
    const tallies = group(board, 0, -0.59, 0.183);
    for (let i = 2; i <= 11; i++) {
      const text = label(tallies, 0, 0, 0, 0.83, 0.17, i + ' / 11', '#287267');
      text.name = String(i);
    }
    const card = sheet(root, 0.74, 0.64, c.pink),
      lock = lockPiece(root, 2.41, 0.67, 0.28);
    attach(actions, 'board', board, [0.48, 0.94, 0.05], verbs.rerun, to(2));
    attach(actions, 'card', card, [0, 0.45, 0.025], verbs.fresh, to(1));
    attach(actions, 'lock', lock, [0, 0.51, 0.03], verbs.frozen, to(3));
    attach(actions, 'solver', group(root, -1.77, 0, -0.05), [0, 2.56, 0], verbs.count, to(0));
    function n(t) {
      return 2 + Math.round(9 * ease(t, 2.03, 2.87));
    }
    return {
      actions,
      roles: [[-1.77, -0.05, 0.23], null],
      focus: ['card', 'board', 'lock', 'solver'],
      info(k, v, t) {
        if (k === 3) return T('测试时固定权重 · 11 / 11', 'Weights frozen at test time · 11 / 11');
        const passed = n(t);
        return T(
          '个案通过的检查 · ' + passed + ' / 11',
          'Checks passed in this case · ' + passed + ' / 11'
        );
      },
      pose(t) {
        const give = ease(t, 1.12, 1.82),
          pass = ease(t, 2, 2.81);
        card.position.set(2.14 - 0.47 * give, 0.99 + 0.45 * give - 0.25 * pass, 0.66 + 0.16 * give);
        card.rotation.z = -0.19 + 0.1 * give;
        const passed = n(t);
        bulbs.forEach((b, i) => {
          b.visible = i < passed;
        });
        tallies.children.forEach((text) => (text.visible = text.name === String(passed)));
        lock.rotation.z = 0.06 * Math.sin(ease(t, 3, 3.7) * Math.PI);
      }
    };
  }
  return { 'base-agent': base, harness, si, training: train, 'fixed-solver': fixed, unseen };
})();
