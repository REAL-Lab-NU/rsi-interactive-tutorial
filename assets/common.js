'use strict';
const T = (zh, en) => [zh, en];
function preference(key, value) {
  try {
    if (value !== undefined) localStorage.setItem('rsi-atlas-' + key, value);
    return localStorage.getItem('rsi-atlas-' + key);
  } catch {
    return null;
  }
}
const urlLang = new URL(location.href).searchParams.get('lang');
let language = ['en', 'zh'].includes(urlLang) ? urlLang : preference('lang') === 'en' ? 'en' : 'zh';
const l = (pair) => pair[language === 'en' ? 1 : 0];
const esc = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );
const words = (zh, en) => esc(l(T(zh, en)));
const dom = (id) => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const compact = matchMedia('(max-width: 650px)');
const icons = {
  play: '<path d="m8 5 11 7-11 7Z" fill="currentColor" stroke="none"/>',
  pause: '<path d="M8 5v14m8-14v14" stroke-width="3.5"/>',
  replay: '<path d="M4 10a8 8 0 1 1 1 8m-1-14v6h6"/>',
  next: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H5m6 6-6-6 6-6"/>',
  out: '<path d="M6 18 18 6M8 6h10v10"/>',
  notes: '<path d="M5 3h11l3 3v15H5zM8 9h8m-8 4h8m-8 4h5"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  compare: '<path d="M3 5h7v14H3zM14 5h7v14h-7z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
  moon: '<path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10Z"/>',
  map: '<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3zm6-3v15m6-12v15"/>',
  levels: '<path d="m2 9 10-6 10 6-10 6zM2 14l10 6 10-6"/>'
};
function icon(name) {
  return `<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`;
}
const mark =
  '<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><path d="M6 18v-6a5 5 0 0 1 5-5h13m-3-4 4 4-4 4M26 14v6a5 5 0 0 1-5 5H8m3 4-4-4 4-4" fill="none" stroke="currentColor" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="16" r="3" fill="currentColor"/></svg>';
function syncLocale() {
  document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
  dom('skip').textContent = l(T('跳到内容', 'Skip to content'));
}
function themeButton() {
  const dark = document.documentElement.dataset.theme === 'dark';
  return `<button class="icon-btn" id="theme" aria-label="${dark ? words('切换浅色', 'Light theme') : words('切换深色', 'Dark theme')}">${icon(dark ? 'sun' : 'moon')}</button>`;
}
function mast(edition, brandMark = mark) {
  syncLocale();
  const prefix = edition ? '../' : './';
  const homeURL = prefix + (location.protocol === 'file:' ? 'index.html' : '') + '?lang=' + language;
  return `<header class="mast"><a class="brand" href="${homeURL}">${brandMark}RSI Atlas</a>${edition ? `<span class="mast-edition">${esc(l(edition))}</span>` : ''}<div class="mast-tools">${edition ? `<a class="editions-link" href="${homeURL}">${icon('levels')}<span>${words('选择版本', 'Editions')}</span></a>` : ''}<div class="languages" aria-label="${words('语言', 'Language')}">${[
    ['zh', '中文'],
    ['en', 'EN']
  ]
    .map(
      ([key, label]) =>
        `<button lang="${key}" data-lang="${key}" aria-pressed="${language === key}">${label}</button>`
    )
    .join('')}</div>${themeButton()}</div></header>`;
}
function setLanguage(next) {
  language = next;
  preference('lang', next);
  const url = new URL(location.href);
  url.searchParams.set('lang', next);
  history.replaceState(null, '', url);
}
function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  preference('theme', next);
  const button = dom('theme');
  button.outerHTML = themeButton();
  dom('theme').focus({ preventScroll: true });
}
const beat = (zh, en, zhText, enText) => ({ label: T(zh, en), text: T(zhText, enText) });
const lesson = (id, tab, title, deck, beats, options = {}) => ({ id, tab, title, deck, beats, ...options });
function sourceLink(url, label) {
  return `<a class="source" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(l(label))}${icon('out')}</a>`;
}
