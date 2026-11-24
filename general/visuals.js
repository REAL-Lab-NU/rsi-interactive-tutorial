'use strict';
function schedulePlate(F, scene, choices) {
  const recursive = scene === 'rsi',
    si = scene === 'si',
    event = EVENTS[recursive ? 'night' : 'day'],
    p = F.compact;
  const start = recursive
    ? makePlan(event, choices.priority, 'presenter')
    : evaluatePlan(event, event.slots[0]);
  const hallBooked = si && choices.availability === 'closed';
  const openings = hallBooked ? event.slots.filter((slot) => slot.room !== 0) : event.slots;
  const update = makePlan(
    event,
    choices.priority,
    recursive && choices.writer === 'learned' ? 'resource' : 'presenter',
    openings
  );
  const final = si || recursive ? update : start;
  const x = p ? 94 : 145,
    end = F.w - (p ? 28 : 64),
    width = end - x,
    top = p ? 158 : 123,
    row = p ? 48 : 46;
  const domain = recursive ? 210 : 180,
    pos = (minute) => x + (width * minute) / domain;
  if (scene === 'plan') {
    const left = p ? 22 : 70,
      gap = p ? 11 : 18,
      w = (F.w - 2 * left - 2 * gap) / 3;
    [
      [T('场地', 'Rooms'), 'tools'],
      [T('排班', 'Roster'), 'context'],
      [T('排演', 'Rehearsal'), 'check']
    ].forEach(([name, glyph], i) => {
      const px = left + i * (w + gap);
      F.add(
        box(px, 30, w, 50, 'tool-surface', 8) +
          moduleGlyph(glyph, px + 22, 54, 0.72) +
          word(px + 39, 60, name, 'diagram-label')
      );
      F.add(
        F.fade(box(px, 30, w, 50, 'role-emphasis accent-stroke', 8), (t) =>
          between(t, i * 0.82, i * 0.82 + 0.28, i * 0.82 + 1, i * 0.82 + 1.3)
        )
      );
    });
  } else {
    rolePair(F, 25, false, recursive);
    if (recursive && choices.writer === 'learned') {
      const right = p ? 376 : 764,
        outer = p ? 394 : 803;
      const loop = `M${right - 8} 81 C${outer + 3} 89 ${outer + 3} 33 ${right} 36`;
      F.add(`<path class="signal-guide" d="${loop}"/>`);
      F.add(
        F.anim(`<path class="signal-line secondary-stroke" pathLength="1" d="${loop}"/>`, {
          opacity: (t) => fnum(rise(t, 0.86, 1.13)),
          'stroke-dashoffset': (t) => fnum(1 - rise(t, 0.88, 1.92))
        })
      );
      F.add(F.fade(`<path class="secondary" d="M${right} 36l7-4v7z"/>`, (t) => rise(t, 1.68, 1.94)));
    }
  }
  F.add(word(p ? 19 : 48, top - 30, l(event.resource), 'diagram-heading'));
  F.add(
    word(
      end,
      top - 30,
      choices.priority === 'capacity'
        ? T('目标 · 名额', 'Goal · seats')
        : T('目标 · 换场余量', 'Goal · setup time'),
      'diagram-detail',
      'end'
    )
  );
  const axisTop = top + 8,
    rows = [top + 20, top + 20 + row];
  event.rooms.forEach((room, i) => {
    F.add(
      word(p ? 17 : 50, rows[i] + 26, room, 'diagram-label') + box(x, rows[i], width, 35, 'slot-lane', 4)
    );
  });
  for (let m = 0; m <= domain; m += 60) {
    F.add(
      word(pos(m), axisTop, clockAt(event, m), 'time-label', 'middle') +
        diagramLine(pos(m), axisTop + 3, pos(m), rows[1] + 38, 'grid-line')
    );
  }
  if (hallBooked) {
    const occupiedX = pos(75),
      occupiedWidth = pos(135) - occupiedX;
    F.add(
      box(occupiedX, rows[0] + 3, occupiedWidth, 30, 'unavailable-slot', 4) +
        word(occupiedX + occupiedWidth / 2, rows[0] + 23, T('已预订', 'Booked'), 'time-label', 'middle')
    );
  }
  const duration = (width * 60) / domain;
  const block = (name, tone) =>
    box(0, 0, duration, 30, 'booking ' + tone + '-surface', 5) +
    word(duration / 2, 20, name, 'booking-label', 'middle');
  F.add(place([pos(0), rows[0] + 3], block(event.sessions[0], 'accent')));
  const phaseStart = si || recursive ? 1.72 : 1.08;
  F.add(
    F.anim(block(event.sessions[1], 'secondary'), {
      transform: (t) => {
        const u = rise(t, phaseStart, phaseStart + 0.98);
        return `translate(${fnum(pos(start.slot.minute + (final.slot.minute - start.slot.minute) * u))} ${fnum(rows[start.slot.room] + (rows[final.slot.room] - rows[start.slot.room]) * u + 3)})`;
      },
      opacity: (t) => fnum(scene === 'plan' ? 0.32 + 0.68 * rise(t, 1.75, 2.55) : 1)
    })
  );
  const indicator = (t) => (si || recursive ? rise(t, 2.16, 2.74) : rise(t, 2.63, 3.44));
  const details = (out) =>
    `${word(p ? 24 : 52, p ? 345 : 273, T('名额', 'SEATS'), 'metric-label')}${word(p ? 24 : 52, p ? 373 : 300, String(out.seats), 'metric-number')}${word(p ? 135 : 270, p ? 345 : 273, T('换场间隔', 'SETUP GAP'), 'metric-label')}${word(p ? 135 : 270, p ? 373 : 300, out.gap < 0 ? `−${-out.gap} min` : `${out.gap} min`, 'metric-number')}${word(p ? 266 : 549, p ? 345 : 273, T('排演检查', 'REHEARSAL'), 'metric-label')}${word(p ? 266 : 549, p ? 373 : 300, out.feasible ? T('可执行', 'Feasible') : T('冲突', 'Clash'), out.feasible ? 'metric-pass' : 'metric-fail')}`;
  F.add(diagramLine(p ? 20 : 46, p ? 315 : 247, F.w - (p ? 20 : 46), p ? 315 : 247));
  if (scene === 'plan') F.add(F.fade(details(start), indicator));
  else {
    const reveal = recursive ? (t) => rise(t, 1.32, 1.76) : () => 1;
    F.add(F.fade(details(start), (t) => reveal(t) * (1 - indicator(t))));
    F.add(F.fade(details(final), indicator));
  }
  const msg =
    scene === 'plan'
      ? T('运行记录留下了共享领队的冲突', 'The trace records the shared-host conflict')
      : recursive
        ? choices.writer === 'learned'
          ? T('新写作者查询音响清单，写入 45 min', 'The updated writer looks up the PA and writes 45 min')
          : T('原写作者把 15 min 搬到了新任务', 'The original writer carries 15 min to the new task')
        : T('Solver 复用领队换场检查 ≥ 15 min', 'The solver reuses the host check ≥ 15 min');
  F.add(F.fade(word(F.w / 2, p ? 408 : 330, msg, 'diagram-detail', 'middle'), (t) => rise(t, 2.92, 3.78)));
  if (recursive) {
    const marker =
      choices.writer === 'learned'
        ? T('效果反馈 → 按资源写规则', 'Edit feedback → resource-based rule')
        : T('对照 · 沿用固定间隔', 'Control · original fixed-gap rule');
    F.add(F.fade(word(F.w / 2, p ? 108 : 92, marker, 'policy-flag', 'middle'), (t) => rise(t, 0.99, 1.55)));
    const y = p ? 347 : 277,
      practice =
        word(
          p ? 24 : 52,
          y,
          T('练习展台 · 准备需要 40 分钟', 'Practice exhibit · setup takes 40 min'),
          'diagram-heading'
        ) +
        word(p ? 24 : 52, y + 28, T('固定 15 min  ×', 'Fixed 15 min  ×'), 'practice-fail') +
        word(p ? 211 : 421, y + 28, T('按资源 40 min  ✓', 'Look up 40 min  ✓'), 'practice-pass');
    F.add(F.fade(practice, (t) => 1 - rise(t, 0.94, 1.52)));
  }
}
function visualFor(s, values, phone) {
  if (s.paper) {
    const F = new Film(phone);
    paperFilms[s.id](F, values[s.id]);
    return F;
  }
  const F = new Plate(phone);
  if (s.visual === 'anatomy') anatomyFilm(F, false);
  else schedulePlate(F, s.visual, values);
  return F;
}
