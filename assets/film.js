'use strict';
// All coordinates, outlines and animation paths are drawn for this survey.
// A node carries an artifact or role. A wire carries that artifact to a destination.
const SHAPES = {
  paper: `<path class="shadow" d="m-32 14 46 14 27-13-44-13z"/><path class="side" d="m-30-13 43 9 18-9v31l-18 10-43-11z"/><path class="face" d="m-31-16 43 10v30l-43-10z"/><path class="top" d="m-31-16 15-8 44 10-16 8z"/><g class="etched"><path d="m-24-8 21 5m-21 3 30 7m-30 0 26 6m-26 1 16 4"/></g>`,
  code: `<path class="shadow" d="m-35 18 44 13 29-12-42-12z"/><path class="side" d="m-31-18 48 10 11-5v35l-11 5-48-12z"/><path class="top" d="m-31-18 11-6 48 11-11 5z"/><path class="face" d="m-31-18 48 10v35l-48-12z"/><path class="etched" d="m-31-9 48 11m-38-6-5 3 5 5m17-4 5 5-5 3m-6-10-4 11"/><circle class="inkfill" cx="-24" cy="-12" r="1.2"/><circle class="inkfill" cx="-19" cy="-11" r="1.2"/>`,
  chip: `<path class="shadow" d="m-39 15 45 16 38-17-47-14z"/><path class="side" d="m-30-2 29 12 33-14v16L0 27l-30-13z"/><path class="top" d="m-30-2 31-15 31 13-33 14z"/><path class="face" d="m-18-2 19-9 18 8-19 9z"/><g class="etched"><path d="m-9-6 20 9m-12-12 19 9m-34 1 18 8m-9-13 17-8m-9 12 17-8m-9 12 17-8"/><path d="m-26 8-8 4m16-1-8 4m16-1-8 4m18-1-8 4m18-3 8 3m1-8 8 3m1-7 8 3"/></g>`,
  weights: `<path class="shadow" d="m-36 18 41 12 34-14-39-12z"/><path class="side" d="m-30-9 32 12 30-13v29L3 31l-33-12z"/><path class="face" d="m-30-9 33 12v28l-33-12z"/><path class="top" d="m-30-9 30-14 33 13L3 3z"/><g class="etched"><path d="m-21-13 33 12m-23-17 34 13m-43 0 29-14m-19 18 30-14m-43 14 32 12 30-13m-62 8 32 12 30-13"/></g>`,
  tool: `<path class="shadow" d="m-38 16 47 12 26-14-44-12z"/><path class="side" d="m-32-4 45 10 16-8v20l-16 8-45-11z"/><path class="top" d="m-32-4 16-10 46 11-17 9z"/><path class="face" d="m-32-4 45 10v20l-45-11z"/><path class="etched" d="m-23 3 12 3m-12 2 7 2m12-9 5-3 6 2 5-3 6 1-6 6-6-1-4 4-6-2z"/><circle class="inkfill" cx="6" cy="14" r="2"/>`,
  memory: `<path class="shadow" d="m-37 17 45 12 29-14-43-12z"/><path class="side" d="m-28-16 39 9 20-10v35L10 28l-38-10z"/><path class="top" d="m-28-16 21-10 38 9-20 10z"/><path class="face" d="m-28-16 39 9v35l-39-10z"/><g class="etched"><path d="m-27-5 37 9m-37 2 37 9m-25-25 11 3m-11 8 11 3m-11 8 11 3"/></g>`,
  trace: `<path class="shadow" d="m-36 16 45 15 27-13-45-14z"/><g class="paper-stack"><path class="side" d="m-32 11 20-11 46 11-21 12z"/><path class="face" d="m-32 5 20-11L34 5 13 17z"/><path class="top" d="m-32-3 20-11 46 11-21 12z"/><path class="etched" d="m-19-1 6-3 6 4 5-4 5 6 10-4 9 3"/></g>`,
  grade: `<path class="shadow" d="m-34 17 40 11 25-12-41-11z"/><path class="side" d="m-22-20 35 8 9-5v38l-9 5-35-9z"/><path class="face" d="m-22-20 35 8v38l-35-9z"/><path class="top" d="m-22-20 10-5 34 8-9 5z"/><g class="etched"><path d="m-16-8 3 4 6-6m3 5 10 2m-22 5 3 4 6-6m3 5 10 2m-22 5 3 4 6-6m3 5 10 2"/></g>`,
  note: `<path class="shadow" d="m-35 17 43 12 22-13-42-10z"/><path class="side" d="m-27-15 36 8 17-7v32l-17 9-36-9z"/><path class="top" d="m-27-15 16-9 37 10-17 7z"/><path class="face" d="m-27-15 36 8v34l-12-10-24-6z"/><path class="etched" d="m-20-6 23 5m-23 2 18 5m-18 2 11 3"/>`,
  archive: `<path class="shadow" d="m-36 18 42 13 35-16-41-11z"/><path class="side" d="m-33-4 42 11 27-13v27L8 34l-41-12z"/><path class="top" d="m-33-4 28-14L36-6 9 7z"/><path class="face" d="m-25-5 23-11 27 7L3 1z"/><path class="paperleaf" d="m-20-6 20-10v-12l-20 10zM-8-3l20-10v-17l-20 10zM4 0l20-10v-14L4-14z"/><path class="etched" d="m-21 10 15 4v5l-15-4z"/>`,
  searcher: `<path class="shadow" d="m-37 15 44 15 28-15-43-12z"/><path class="side" d="m-30-3 42 10 17-8v21l-17 9-42-12z"/><path class="top" d="m-30-3 18-10 41 12-17 8z"/><path class="face" d="m-30-3 42 10v21l-42-12z"/><path class="etched" d="m-21 7 13 3m-13 3 8 2"/><circle class="top" cx="1" cy="-12" r="11"/><circle class="face" cx="1" cy="-12" r="6.5"/><path class="outline" d="m10-5 9 8"/>`,
  policy: `<path class="shadow" d="m-36 18 42 12 30-13-38-13z"/><path class="side" d="m-32 0 38 10 24-14v21L6 30l-38-11z"/><path class="face" d="m-32 0 38 10v20l-38-11z"/><path class="top" d="m-32 0 24-14 38 10L6 10z"/><path class="etched" d="m-22 0 16-8m-8 11 16-9m-7 12 17-9"/><circle class="face" cx="-13" cy="-4" r="3"/><circle class="face" cx="-5" cy="-2" r="3"/><circle class="face" cx="10" cy="1" r="3"/>`,
  proof: `<path class="shadow" d="m-34 16 44 14 24-13-43-12z"/><path class="side" d="m-28-18 39 10 13-7v33l-13 8-39-11z"/><path class="face" d="m-28-18 39 10v34l-39-11z"/><path class="top" d="m-28-18 13-8 39 11-13 7z"/><path class="etched" d="m-21-10 21 5m-21 1 14 4m-14 3 16 4"/><path class="stamp" d="m-5 10 5 6 12-12"/>`
};
function art(kind, tone, x, y, scale = 1) {
  return `<g class="art tone-${tone}" transform="translate(${x} ${y}) scale(${scale})">${SHAPES[kind]}</g>`;
}

// All the research films use the same four-beat clock. The drawing is sampled at
// an absolute time, so dragging backwards restores the objects as well as the ink.
const clamp01 = (n) => Math.max(0, Math.min(1, n));
const frac = (t, a, b) => clamp01((t - a) / (b - a));
const smooth = (x) => x * x * (3 - 2 * x);
const rise = (t, a, b) => smooth(frac(t, a, b));
const between = (t, a, b, c, d) => rise(t, a, b) * (1 - rise(t, c, d));
const fnum = (n) => Number(n.toFixed(3));
const txt = (x, y, v, cls = 'glyph-text', anchor = 'middle') =>
  `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${esc(Array.isArray(v) ? l(v) : v)}</text>`;
const place = (p, body) => `<g transform="translate(${p[0]} ${p[1]})">${body}</g>`;
const path = (d, cls) => `<path d="${d}" class="${cls}"/>`;
const shift = (p, x, y) => [p[0] + x, p[1] + y];
function curve(a, b, bend = 0) {
  const dx = b[0] - a[0],
    dy = b[1] - a[1],
    len = Math.max(1, Math.hypot(dx, dy));
  const ctrl = [(a[0] + b[0]) / 2 - (dy / len) * bend, (a[1] + b[1]) / 2 + (dx / len) * bend];
  return {
    d: `M${a.join(' ')}Q${ctrl.join(' ')} ${b.join(' ')}`,
    at(u) {
      const q = 1 - u;
      return [
        q * q * a[0] + 2 * q * u * ctrl[0] + u * u * b[0],
        q * q * a[1] + 2 * q * u * ctrl[1] + u * u * b[1]
      ];
    }
  };
}
function checkIcon(pass = true, size = 1) {
  return `<g transform="scale(${size})" class="mark ${pass ? 'yes' : 'no'}"><circle r="11"/>${path(pass ? 'm-5 0 3.2 4 7.1-8.4' : 'm-3.7-3.7 7.4 7.4m0-7.4-7.4 7.4', 'mark-stroke')}</g>`;
}
function slip(tone, kind, scale = 1) {
  const lines =
    kind === 'code'
      ? 'm-12-2-5 4 5 4m15-8 5 4-5 4m-5-10-5 13'
      : kind === 'delta'
        ? 'm-13 5 8-10 8 10zm21-5h6'
        : 'm-15-2h25m-25 5H7m-22 5H1';
  return `<g class="slip tone-${tone}" transform="scale(${scale})"><path class="slip-shadow" d="m-22-11 42 2 4 26-44-2z"/><path class="slip-face" d="m-23-14 38 1 7 6 1 20-45-2z"/><path class="slip-fold" d="m15-13 .1 7 7 .3"/><path class="slip-ink" d="${lines}"/></g>`;
}
function token(v, tone = 'gold') {
  return `<g class="token tone-${tone}"><rect x="-18" y="-12" width="36" height="24" rx="7"/>${txt(0, 5, v, 'token-type')}</g>`;
}
function bench(tone, kind, label, scale = 1.5) {
  return `<g class="instrument tone-${tone}"><ellipse class="ground" cy="29" rx="58" ry="13"/><path class="plinth-side" d="m-58 13 46-18 70 15v12L13 41-58 25Z"/><path class="plinth-top" d="m-58 13 46-18 70 15-45 20z"/>${art(kind, tone, 0, -12, scale)}${txt(0, 68, label, 'prop-label')}</g>`;
}
function sheet(w, h, tone, header, inside) {
  const x = -w / 2,
    y = -h / 2;
  return `<g class="sheet tone-${tone}"><rect class="sheet-shadow" x="${x + 2.8}" y="${y + 4}" width="${w}" height="${h}" rx="6"/><rect class="sheet-face" x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/><path class="sheet-rule" d="M${x} ${y + 24}h${w}"/><circle class="rivet" cx="${x + 11}" cy="${y + 12}" r="2.7"/>${txt(x + 20, y + 16, header, 'sheet-header', 'start')}${inside}</g>`;
}
function paperLines(x, y, lens, tone = '') {
  return lens.map((v, i) => `<path class="paper-line ${tone}" d="M${x} ${y + i * 9}h${v}"/>`).join('');
}
function bay(w, h, tone, label, inside) {
  return `<g class="cabinet tone-${tone}"><path class="cabinet-leg" d="M${-w / 2 + 12} ${h / 2 - 1}v7h13v-7m${w - 51} 0v7h13v-7"/><rect class="cabinet-face" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="11"/><path class="cabinet-rim" d="M${-w / 2 + 8} ${-h / 2 + 26}h${w - 16}"/>${txt(0, -h / 2 + 18, label, 'sheet-header')}${inside}</g>`;
}
function robot(tone) {
  return `<g class="robot tone-${tone}"><ellipse class="ground" cy="31" rx="26" ry="6"/><path class="robot-wire" d="M0-22v-11m-15 33-9 10m39-9 9 7m-33 12-4 9m20-9 4 9"/><circle class="lamp" cy="-33" r="3"/><rect class="shell" x="-15" y="-5" width="30" height="27" rx="7"/><rect class="shell" x="-21" y="-24" width="42" height="24" rx="8"/><rect class="visor" x="-14" y="-18" width="28" height="12" rx="4"/><path class="robot-eyes" d="M-8-12h3m10 0h3"/><circle class="lamp" cy="8" r="3"/></g>`;
}
function book(tone, x, y, width = 39) {
  return `<g class="library-book tone-${tone}" transform="translate(${x} ${y})"><path class="slip-face" d="m0 0 ${width} 0 5 5v7H0z"/><path class="slip-ink" d="M5 4h${width - 9}"/></g>`;
}
function originTag(x, y, value, tone = 'teal') {
  return place(
    [x, y],
    `<g class="tiny-tag tone-${tone}"><circle class="rivet" cx="0" cy="-4" r="3"/>${txt(8, 0, value, 'micro', 'start')}</g>`
  );
}
class Film {
  constructor(compact) {
    this.compact = compact;
    this.w = compact ? 400 : 840;
    this.h = compact ? 350 : 314;
    this.a = compact ? [100, 86] : [148, 141];
    this.b = compact ? [300, 86] : [420, 141];
    this.c = compact ? [201, 245] : [693, 141];
    this.layers = [];
    this.tracks = [];
  }
  add(markup) {
    this.layers.push(markup);
  }
  anim(markup, attrs) {
    const index = this.tracks.length;
    this.tracks.push({ attrs });
    return `<g data-motion="${index}">${markup}</g>`;
  }
  fade(markup, amount) {
    return this.anim(markup, { opacity: (t) => fnum(amount(t)) });
  }
  appear(p, markup, a, b) {
    return this.anim(markup, {
      opacity: (t) => fnum(rise(t, a, b)),
      transform: (t) => {
        const u = rise(t, a, b);
        return `translate(${p[0]} ${fnum(p[1] + (1 - u) * 12)}) scale(${fnum(0.82 + u * 0.18)})`;
      }
    });
  }
  draw(line, tone, a, b, keep = true) {
    return (
      `<path class="rail-guide" d="${line.d}"/>` +
      this.anim(`<path class="ink-line ${tone}" pathLength="1" d="${line.d}"/>`, {
        'stroke-dashoffset': (t) => fnum(1 - rise(t, a, b)),
        opacity: (t) => fnum(keep ? rise(t, a, a + 0.08) : between(t, a, a + 0.08, b, b + 0.2))
      })
    );
  }
  fly(body, line, a, b, keep = false) {
    return this.anim(body, {
      transform: (t) => {
        const u = rise(t, a, b),
          p = line.at(u);
        return `translate(${fnum(p[0])} ${fnum(p[1])})`;
      },
      opacity: (t) => fnum(keep ? rise(t, a, a + 0.1) : between(t, a, a + 0.1, b - 0.12, b + 0.08))
    });
  }
  pivot(body, at, fn) {
    return this.anim(body, { transform: (t) => `translate(${at[0]} ${at[1]}) rotate(${fnum(fn(t))})` });
  }
  svg(s) {
    return `<svg class="film" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}" role="img" aria-label="${esc(s.name + ' · ' + l(s.title))}">${this.layers.join('')}</svg>`;
  }
}
function bindFilm(svg, film) {
  const tracks = Array.from(svg.querySelectorAll('[data-motion]'), (el) => ({
    el,
    values: film.tracks[Number(el.dataset.motion)].attrs,
    prev: {}
  }));
  return (t) => {
    for (const track of tracks) {
      for (const [attr, fn] of Object.entries(track.values)) {
        const v = String(fn(t));
        if (track.prev[attr] !== v) {
          track.el.setAttribute(attr, v);
          track.prev[attr] = v;
        }
      }
    }
  };
}
