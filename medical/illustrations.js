'use strict';
// The paper, lenses and robot heads are drawn once per shot. The shared film
// clock poses their joints, so a pause or backwards seek also stops the acting.
const ink = {
  line: '#463145',
  paper: '#fffaf0',
  white: '#fffdf7',
  pale: '#f5e4d7',
  blue: '#a7cfdf',
  deepBlue: '#75a8bc',
  lightBlue: '#ddedf0',
  rose: '#edb1c5',
  deepRose: '#c77794',
  lightRose: '#f9e0e6',
  berry: '#922f57',
  mint: '#b2d4be',
  jade: '#34766c',
  yellow: '#f2cd85',
  shadow: '#c8ada7'
};
const shape = (d, fill = 'none', stroke = ink.line, width = 2) =>
  `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const oval = (x, y, rx, ry, color, line = 'none', sw = 2) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${color}" stroke="${line}" stroke-width="${sw}"/>`;
const rr = (x, y, w, h, r, fill, line = ink.line, sw = 2) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${line}" stroke-width="${sw}"/>`;
const pose = (x, y, scale, body, angle = 0) =>
  `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">${body}</g>`;
const scriptText = (x, y, value, cls = 'written', anchor = 'middle') => txt(x, y, value, cls, anchor);
const memo = (x, y, w, h, fill = ink.white) =>
  shape(
    `M${x + 12} ${y + 1} Q${x + w / 2} ${y - 2} ${x + w - 9} ${y} q9 0 10 10 l-1 ${h - 19} q0 9-9 9 Q${x + w / 2} ${y + h + 2} ${x + 10} ${y + h} q-10 0-10-10 l1 ${10 - h + 9} q0-8 11-8z`,
    fill
  );
const tape = (x, y, width, color, tilt = -4) =>
  pose(
    x,
    y,
    1,
    shape(
      `M${-width / 2} -6l${width - 2} 1 3 2 -2 2 2 2 -3 4 ${-width + 3} -1 2 -3 -2 -3z`,
      color,
      '#8b7371',
      0.85
    ) + shape(`M${-width / 2 + 4} -3l${width - 10} 1`, 'none', '#fff7e4', 1),
    tilt
  );
const heart = () => shape('M0 7C-14-1-7-13 0-5C8-13 13-2 0 7z', ink.rose, ink.line, 1.7);
const checkStamp = (x, y, good, size = 1) =>
  pose(
    x,
    y,
    size,
    oval(0, 0, 10.8, 10.1, good ? ink.mint : ink.lightRose) +
      shape(
        good ? 'm-5 0 3.1 3.5 7-7.8' : 'm-3.7-3.7 7.4 7.4m0-7.4-7.4 7.4',
        'none',
        good ? ink.jade : ink.berry,
        2.4
      )
  );

function pencil() {
  return (
    shape('M-5 18l2-33 6-1 1 34-4 6z', ink.yellow) +
    shape('m-4 12 8 .5-4 11z', '#f3d1ae', ink.line, 1.4) +
    shape('m-1 20 2-1-1.2 4z', ink.line, ink.line, 1) +
    shape('M-3-14l.2-4q2-3 6-1l.6 4z', ink.rose, ink.line, 1.5) +
    shape('M-.7-11L-.9 9', 'none', '#ae814e', 1.3)
  );
}
const paperDrawings = (() => {
  const card = (col, glyph) =>
    shape('M-21-26q13-2 33-1l9 9-1 37q0 4-5 4l-35-1q-4 0-4-5z', col) +
    shape('m12-27 .5 10 8-1', 'none', ink.line, 1.5) +
    glyph +
    shape('M-13 11q9-1 23 0m-23 5 15 .3', 'none', '#937a82', 1.5);
  const clock =
    oval(0, 0, 16, 16, ink.white, ink.line) +
    shape('M0-11v3m11 8H8M0 11V8m-11-8h3', 'none', ink.deepBlue, 1.4) +
    shape('M0-7v7l5 3', 'none', ink.line, 2.4);
  return {
    clock,
    records: card(ink.lightRose, shape('m-14-4 6 1 4-6 4 12 5-9 6 1', 'none', ink.berry, 2)),
    skill: card(
      ink.lightBlue,
      shape('m-13-6 3 3 5-6m2 4 11 .4m-21 5 4 4 5-6m2 4 9 .2', 'none', ink.jade, 1.8)
    ),
    prompt: card(ink.lightRose, shape('M-13-9h22m-22 5h16m-16 5h20', 'none', ink.berry, 1.8)),
    tool:
      oval(-3, -6, 13, 13, ink.lightBlue, ink.line, 2.4) +
      oval(-3, -6, 8.6, 8.6, ink.white, ink.deepBlue, 1.3) +
      shape('m6 4 13 12-4 4L2 8z', ink.yellow, ink.line, 2) +
      shape('m-8-9 3-3', 'none', ink.white, 2.4),
    memory:
      shape('M-20-11l-1-10 15-1 4 6 21 .3 1 30-41 2z', ink.yellow) +
      shape('m-19-5 9-4 28 1-2 22-38 .9z', ink.paper) +
      shape('M-22 0l10 .3 4-4L22-4l-4 21-40 1z', ink.blue) +
      shape('m-7 6 12 .3', 'none', ink.line, 1.6),
    reward:
      shape('m0-20 7 12 14 3-9 10 1 15L0 13l-13 7 1-14-10-11 15-3z', ink.yellow) +
      shape('m-5 0 3.6 3.5 7.4-8', 'none', ink.line, 2.2),
    chip:
      rr(-16, -15, 32, 30, 8, ink.blue) +
      rr(-9, -8, 18, 16, 3, ink.lightBlue, ink.line, 1.5) +
      shape('M-9-20v5m8-5v5m8-5v5m-16 30v5m8-5v5m8-5v5m-28-21h5m-5 8h5m32-8h5m-5 8h5', 'none', ink.line, 1.8),
    lock:
      shape('M-10-2v-7a10 10 0 0 1 20 0v7', 'none', ink.line, 3) +
      rr(-16, -3, 32, 23, 5, ink.yellow) +
      oval(0, 6, 2.5, 2.7, ink.line) +
      shape('M0 7v5', 'none', ink.line, 2),
    book:
      shape('M-23-17q12-3 23 2 12-5 24-3l-1 31q-11-1-22 4-11-4-24-2z', ink.rose) +
      shape('m-20-14q10-2 20 2 10-4 21-3l-1 25q-10-1-20 3-10-4-20-2z', ink.paper, ink.line, 1.5) +
      shape('M0-11v23m-15-18 9 1m-9 4 9 1m12-7 8-1m-8 6 9-1', 'none', '#907880', 1.3)
  };
})();
function paperProp(type, size = 1) {
  return pose(0, 0, size, paperDrawings[type]);
}
function markInfinite() {
  return (
    shape(
      'M-11 1C-21-11-30-8-29 0c1 10 12 10 22-2C1-12 10-13 14-6c6 10-4 19-12 13L-11-4',
      'none',
      ink.line,
      7
    ) +
    shape('M-15 4c-8 5-13 2-13-4 0-7 7-8 13-1L-3 9', 'none', ink.rose, 4) +
    shape('M-9 0C0-11 9-12 13-6c4 7-1 15-8 13', 'none', ink.blue, 4)
  );
}
function settle(t, start, end) {
  const u = frac(t, start, end);
  // Smootherstep with a small, bounded follow-through at landing.
  const travel = u * u * u * (10 + u * (-15 + 6 * u));
  const recoil = 0.065 * Math.sin(2 * Math.PI * u) * Math.sin(Math.PI * u) ** 2;
  return travel - recoil;
}
function carry(F, drawing, a, b, start, end, { bend = -30, turn = 12, scale = 1 } = {}) {
  const track = curve(a, b, bend);
  return F.anim(drawing, {
    transform(t) {
      const u = rise(t, start, end),
        [x, y] = track.at(u);
      return `translate(${fnum(x)} ${fnum(y)}) rotate(${fnum(turn * Math.sin(Math.PI * u))}) scale(${scale})`;
    },
    opacity: (t) => fnum(rise(t, start - 0.07, start + 0.07) * (1 - rise(t, end - 0.04, end + 0.12)))
  });
}
function drawInk(F, d, color, start, end, width = 2.5) {
  return F.anim(
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1"/>`,
    {
      'stroke-dashoffset': (t) => fnum(1 - rise(t, start, end)),
      opacity: (t) => fnum(rise(t, start, start + 0.07))
    }
  );
}
// A single two-eared robot wears the same heart pin in both roles. Only its cap,
// collar and working hand change. The feet anchor the body while it reaches.
function character(
  F,
  role,
  location,
  { size = 1, facing = 1, reach = () => 0, worry = () => 0, peek = () => 0, phase = 0, tag = '' } = {}
) {
  const writer = role === 'writer',
    cloth = writer ? ink.rose : ink.blue,
    edge = writer ? ink.deepRose : ink.deepBlue;
  const shoe = (x, a) => pose(x, -3, 1, shape('M-9-3q-2-5 2-8l11 1q5 4 6 8 0 4-6 4h-11q-4-1-2-5z', edge), a);
  const coat =
    shape('M-24-45q-8 4-7 17l2 14q8 8 30 7 17 0 27-7l-1-22q-2-10-12-12z', cloth, ink.line, 2.6) +
    shape('m-20-44 7 12 7-8 5 8 12-11', 'none', ink.line, 1.7) +
    shape('m-4-32-.2 19m11-11 12-1-1 7-10 1z', 'none', ink.line, 1.25) +
    pose(14, -25, 0.62, heart()) +
    (writer
      ? shape('m-15-39 4 7-12 8-1-5z', ink.lightRose, ink.line, 1.2)
      : shape('M-22-39q-4 23 5 21 9-1 5-19m-5 19q-1 9 6 12', 'none', ink.line, 1.7) +
        oval(-8, -8, 3.5, 3.5, ink.paper, ink.line, 1.4));
  const ears = shape('M-39-77q-6-1-7 4l-.3 10q1 4 7 3m79-17q6-1 7 4l-.1 8q-1 5-6 4', edge, ink.line, 2.4);
  const helm = shape(
    'M-39-78c0-14 10-23 28-25 20-3 39-1 46 13 6 12 7 31 0 40-6 8-22 10-41 9-24-1-34-6-35-19z',
    cloth,
    ink.line,
    2.9
  );
  const face = shape(
    'M-30-77c2-9 11-12 21-12 12 0 24-2 32 3 6 4 8 17 4 25-3 7-15 10-29 10-16 0-25-3-29-10-2-5-2-12 1-16z',
    ink.paper,
    ink.line,
    2.1
  );
  const eye = (x) => oval(x, 0, 3.9, 5.2, ink.line) + oval(x + 0.9, -1.7, 1.0, 1.15, ink.white);
  const blinkTimes = [0.68, 1.52, 2.74, 3.52];
  const eyes = F.anim(eye(-13) + eye(10), {
    transform(t) {
      const closed = blinkTimes.reduce(
        (a, k) => a + between(t, k + phase, k + phase + 0.019, k + phase + 0.026, k + phase + 0.053),
        0
      );
      return `translate(${fnum(3 * peek(t))} -73) scale(1 ${fnum(1 - 0.89 * Math.min(1, closed))})`;
    }
  });
  const normal = F.fade(shape('M-4-64q4 5 9-.7', 'none', ink.line, 1.9), (t) => 1 - worry(t));
  const uncertain = F.fade(shape('M-4-62q4-5 9-1m-21-17 5-2m15-.8 5 2', 'none', ink.line, 1.8), worry);
  const cap = writer
    ? shape('M-32-95q-5-7 7-12 26-13 47 1 8 4 7 10-8 5-24 4l-30-1z', ink.rose, ink.line, 2.4) +
      shape('M-26-95q21-6 50-1l-1 5q-13-3-46 .5z', ink.deepRose) +
      shape('M-2-110q-2-7 3-8l3 2-1 5z', ink.deepRose, ink.line, 1.6)
    : shape('M-30-94q-3-12 11-18 10-5 29-2 19 2 22 14l-2 8q-29-8-60-2z', ink.lightBlue, ink.line, 2.4) +
      shape('M-31-95q26-8 61 0l4 4q-30-6-65 2z', ink.blue, ink.line, 1.7) +
      shape('m-5-108 5-1 1 4 5-.4.5 4-5 1v4l-5 .3-.4-4-4 .3-.4-4 4-.3z', ink.berry, 'none');
  const head = F.anim(
    ears +
      helm +
      face +
      oval(-22, -66, 5, 2.8, ink.rose) +
      oval(24, -66, 4.2, 2.7, ink.rose) +
      eyes +
      normal +
      uncertain +
      cap +
      shape('m-33-55 3 1m2 1 4 .9', 'none', edge, 1.6),
    {
      transform: (t) =>
        `rotate(${fnum(-1.2 + 4.5 * peek(t) - 3 * worry(t) + 0.8 * Math.sin(6 * t + phase))} 0 -48)`
    }
  );
  const backArm = shape('M-27-36q-6 0-10 11-2 8 3 10 6 2 9-5l6-11z', cloth, ink.line, 2.2);
  const frontArm = F.anim(
    shape('M-4-4q7-3 11 4l7 12q4 7-1 10-4 3-8-1l-11-14q-3-6 2-11z', cloth, ink.line, 2.2) +
      oval(12, 18, 6, 5.5, ink.paper, ink.line, 1.7) +
      (writer ? pose(15, 16, 0.72, pencil(), -24) : shape('m10 17 3 2', 'none', ink.line, 1)),
    {
      transform: (t) => `translate(24 -35) rotate(${fnum(-7 - 51 * reach(t) - 2 * Math.sin(4 * t + phase))})`
    }
  );
  const acting = F.anim(shoe(-13, -4) + shoe(13, 3) + backArm + coat + head + frontArm, {
    transform(t) {
      const r = reach(t),
        breath = Math.sin(t * 4.6 + phase);
      return `translate(${fnum(1.1 * r)} ${fnum(-1.1 * breath)}) rotate(${fnum(1.1 * breath + 2.4 * r)}) scale(${fnum(1 - 0.012 * r)} ${fnum(1 + 0.017 * r)})`;
    }
  });
  return pose(
    location[0],
    location[1],
    size,
    oval(0, 2, 40, 5, '#cab6ad') +
      `<g transform="scale(${facing} 1)">${acting}</g>` +
      (tag ? scriptText(0, 24, tag, 'role-name') : '')
  );
}
function stage(F) {
  const p = F.compact,
    w = F.w,
    h = F.h,
    y = p ? 264 : 245;
  const cloud = shape(
    'M-45 1q-5-10 8-13 3-13 17-9 6-15 20-11 11 2 12 13 13-3 19 7 13-5 18 4 4 8-8 8l-78 1z',
    '#fffaf2',
    '#c7b5b4',
    1.5
  );
  F.add(
    `<defs><pattern id="paper-flecks" width="67" height="53" patternUnits="userSpaceOnUse"><path d="m9 8 1.4-.5m37 30 1 .4m-21-5 .9 .15" stroke="#ac8780" opacity=".32" stroke-width=".9" stroke-linecap="round"/><circle cx="58" cy="9" r=".65" fill="#b78f8c" opacity=".42"/></pattern><pattern id="pencil-hatch" width="7" height="7" patternUnits="userSpaceOnUse"><path d="m-1 7 8-8m-1 9 2-2" fill="none" stroke="#81465b" opacity=".35" stroke-width="1.1"/></pattern></defs>`
  );
  F.add(
    rr(0, 0, w, h, 0, '#fff7ea', 'none') +
      shape(
        `M0 ${y + 7} Q${w * 0.22} ${y - 13} ${w * 0.4} ${y + 1} T${w} ${y - 4} V${h}H0z`,
        '#f4e8d8',
        'none'
      ) +
      shape(`M0 ${y + 7} Q${w * 0.22} ${y - 13} ${w * 0.4} ${y + 1} T${w} ${y - 4}`, 'none', '#cab6ab', 1.3) +
      rr(0, 0, w, h, 0, 'url(#paper-flecks)', 'none')
  );
  // A small window, shelf and plant establish the same room without stealing focus from the task.
  const windowArt =
    rr(-44, -30, 88, 59, 9, '#ead7c8', '#bfa79f', 1.4) +
    rr(-40, -26, 80, 51, 6, '#d8e8e5', '#bfa79f', 1) +
    oval(18, -13, 6, 6, '#f3d4a0') +
    pose(-9, 4, 0.43, cloud) +
    shape('M-1-25v51m-39-11h80m-3 13h-75', 'none', '#b79f99', 1.55);
  const plant =
    shape(
      'M1-7q-1-11-11-19-3-2-5-1-1 10 10 16m6 4q1-13 11-21 4-3 6-2 1 10-12 18m-5 5-1-16',
      'none',
      '#8da18b',
      2
    ) + shape('m-11-7 23 .4-3 12q-8 3-17 0z', '#e5c4b5', '#ac9690', 1.2);
  F.add(
    pose(p ? 40 : 77, p ? 38 : 52, p ? 0.62 : 0.89, windowArt) +
      pose(w - (p ? 21 : 53), p ? 67 : 83, p ? 0.59 : 0.88, plant) +
      shape(`M${w - (p ? 48 : 91)} ${p ? 71 : 91}q22 1 ${p ? 39 : 70} 0`, 'none', '#c3aca2', 1.4)
  );
}
function balloon(F, x, y, w, first, second, side = -1, color = ink.white) {
  const h = second ? 50 : 38,
    tip = side * w * 0.26;
  const body =
    memo(-w / 2, -h / 2, w, h, color) +
    shape(`M${tip - 5} ${h / 2 - 1}l${side * 7} 8 16-8`, color, ink.line, 1.8) +
    shape(`M${tip - 3.5} ${h / 2 - 1}h13`, 'none', color, 2.4) +
    scriptText(0, second ? -3 : 5, first, second ? 'letter-small' : 'written') +
    (second ? scriptText(0, 16, second, 'written') : '');
  return place([x, y], body);
}
function switchLabels(F, x, y, values, cls = 'written', anchor = 'middle') {
  return values
    .map(([a, b, v]) =>
      F.fade(
        scriptText(x, y, v, cls, anchor),
        (t) => (a === 0 ? 1 : rise(t, a, a + 0.18)) * (b === 4 ? 1 : 1 - rise(t, b - 0.18, b))
      )
    )
    .join('');
}
