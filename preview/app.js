'use strict';
/* Falcon Design System brandbook. An app, not a long page: sidebar island, hash routes, pill sub-tabs.
   Reads only dist/ (tokens.flat.json, contrast.json). No colour is written here, hex strings shown on screen come from the tokens. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = { get(k, d) { try { return localStorage.getItem(k) ?? d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- icons (24px, stroke) ---------- */
const I = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 1.5-2.2-.5-1.2.3-2.3 1.6-2.3H17a4 4 0 0 0 4-4c0-5-4-9.5-9-9.5z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7" r="1"/><circle cx="15.5" cy="7.5" r="1"/>',
  type: '<path d="M4 6V4h16v2M12 4v16M9 20h6"/>',
  shapes: '<rect x="3" y="3" width="18" height="18" rx="7"/><rect x="8" y="8" width="8" height="8" rx="3"/>',
  cards: '<rect x="3" y="4" width="18" height="7" rx="2.5"/><rect x="3" y="14" width="8" height="6" rx="2.5"/><rect x="13" y="14" width="8" height="6" rx="2.5"/>',
  toggle: '<rect x="2" y="7" width="20" height="10" rx="5"/><circle cx="16" cy="12" r="2.5"/>',
  zap: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  loader: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>',
  contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  code: '<path d="M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  monitor: '<rect x="3" y="4" width="18" height="12" rx="3"/><path d="M8 20h8M12 16v4"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  chevD: '<path d="M6 9l6 6 6-6"/>', chevL: '<path d="M14 6l-6 6 6 6"/>', chevR: '<path d="M10 6l6 6-6 6"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  truck: '<path d="M2.5 6.5h11v9h-11z"/><path d="M13.5 9.5h4l3.5 3.5v2.5h-7.5"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  file: '<path d="M6.5 3h7.5l4 4v14h-11.5z"/><path d="M14 3v4h4"/><path d="M9.5 12h6M9.5 16h6"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5h4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  play: '<path d="M7 4l13 8-13 8z"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="4"/><circle cx="9" cy="10" r="1.8"/><path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5"/>',
  devices: '<rect x="2.5" y="6" width="14" height="10" rx="2.5"/><rect x="15" y="9" width="6.5" height="11" rx="2"/><path d="M6 19h6"/>',
  download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  refresh: '<path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
};
const svg = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${I[n] || ''}</svg>`;
const ic = (n) => `<span class="pv-ico">${svg(n)}</span>`;

/* ---------- data ---------- */
let flat, ct;
const PAGES = [
  { id: 'overview', t: 'Обзор', i: 'home', g: 'Начало' },
  { id: 'color', t: 'Цвет', i: 'palette', g: 'Основы', sub: [['surfaces', 'Поверхности'], ['text', 'Текст'], ['gold', 'Янтарь'], ['status', 'Статусы'], ['island', 'Острова']] },
  { id: 'type', t: 'Шрифты', i: 'type', sub: [['faces', 'Гарнитуры'], ['scale', 'Шкала'], ['tester', 'Тестер']] },
  { id: 'shape', t: 'Формы', i: 'shapes', sub: [['radii', 'Скругления'], ['nested', 'Вложенность'], ['depth', 'Тени']] },
  { id: 'cards', t: 'Карточки', i: 'cards', g: 'Компоненты', sub: [['all', 'Все'], ['data', 'Данные'], ['action', 'Действия'], ['service', 'Сервис']] },
  { id: 'components', t: 'Элементы', i: 'toggle', sub: [['buttons', 'Кнопки'], ['fields', 'Поля'], ['select', 'Выбор'], ['dropdown', 'Список'], ['sheet', 'Нижний лист'], ['status', 'Статусы'], ['table', 'Таблица'], ['feedback', 'Уведомления'], ['nav', 'Навигация']] },
  { id: 'motion', t: 'Движение', i: 'zap', g: 'Поведение', sub: [['touch', 'Касание'], ['flow', 'Переходы'], ['curves', 'Кривые']] },
  { id: 'loading', t: 'Загрузка', i: 'loader' },
  { id: 'responsive', t: 'Адаптив', i: 'devices', sub: [['screens', 'Экраны'], ['rules', 'Правила'], ['touch', 'Касания']] },
  { id: 'falcon', t: 'Сокол', i: 'falcon', g: 'Бренд', sub: [['logo', 'Логотип'], ['space', 'Размер'], ['everywhere', 'Везде']] },
  { id: 'illustrations', t: 'Иллюстрации', i: 'image', sub: [['catalog', 'Каталог'], ['scenarios', 'Сценарии'], ['palettes', 'Палитры'], ['rules', 'Правила']] },
  { id: 'contrast', t: 'Контраст', i: 'contrast' },
  { id: 'rules', t: 'Правила', i: 'shield' },
  { id: 'install', t: 'Установка', i: 'code', sub: [['html', 'HTML'], ['tailwind', 'Tailwind'], ['flutter', 'Flutter'], ['tokens', 'Токены'], ['open', 'Вопросы']] },
];
const EMBED = new URLSearchParams(location.search).has('embed');
const P = (id) => PAGES.find((x) => x.id === id);
const curTheme = () => document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

/* ---------- contrast math ---------- */
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lum = (h) => rgb(h).reduce((s, c, i) => s + [0.2126, 0.7152, 0.0722][i] * (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4), 0);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

/* ---------- toasts, copy ---------- */
function toast(msg) {
  const box = $('#toasts');
  while (box.children.length >= 3) box.firstElementChild.remove();
  const t = document.createElement('div');
  t.className = 'fa-toast';
  t.innerHTML = `<span class="fa-dot"></span><span>${esc(msg)}</span>`;
  box.append(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.setAttribute('data-in', '')));
  setTimeout(() => { t.setAttribute('data-out', ''); t.removeAttribute('data-in'); setTimeout(() => t.remove(), 200); }, 2400);
}
async function copyText(text, label) {
  try { await navigator.clipboard.writeText(text); } catch (e) {
    const ta = document.createElement('textarea'); ta.value = text; document.body.append(ta); ta.select();
    try { document.execCommand('copy'); } catch (e2) {} ta.remove();
  }
  toast(label || 'Скопировано');
}
const morphBtn = (cls = '') => `<span class="fa-morph ${cls}">${svg('copy')}${svg('check')}</span>`;
function flashMorph(btn) { const m = $('.fa-morph', btn); if (!m) return; m.setAttribute('data-on', ''); setTimeout(() => m.removeAttribute('data-on'), 1400); }

/* ---------- small builders ---------- */
const pills = (items, cur, base) => `<div class="fa-pills" role="tablist">${items.map(([id, l]) =>
  `<a class="fa-pill" role="tab" href="#/${base}/${id}" aria-selected="${id === cur}" tabindex="${id === cur ? 0 : -1}">${l}</a>`).join('')}</div>`;
const seg = (id, items, cur, extra = '') => `<div class="fa-seg" id="${id}" style="--n:${items.length};--i:${Math.max(0, items.findIndex(([v]) => v === cur))}" role="group" ${extra}>${items.map(([v, l]) =>
  `<button data-v="${v}" aria-pressed="${v === cur}">${l}</button>`).join('')}</div>`;
function bindSeg(root, id, cb) {
  const el = $('#' + id, root); if (!el) return;
  const btns = $$('button', el);
  btns.forEach((b, i) => b.addEventListener('click', () => {
    btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    el.style.setProperty('--i', i); cb(b.dataset.v);
  }));
}
const head = (pillsHtml, tools = '') => `<div class="pv-head">${pillsHtml}<div class="pv-tools">${tools}</div></div>`;
const code = (txt) => `<div class="pv-code"><button class="fa-btn fa-btn--cta fa-btn--sm" data-copy-code aria-label="Копировать код">${morphBtn()}<span>Копировать</span></button><pre>${esc(txt)}</pre></div>`;
const skelCard = (o = {}) => `<div class="fa-card fa-skel-stack">${o.avatar ? '<span class="fa-skel fa-skel--avatar"></span>' : ''}<span class="fa-skel fa-skel--title"></span>${o.kpi ? '<span class="fa-skel fa-skel--kpi"></span>' : ''}${o.block ? '<span class="fa-skel fa-skel--block"></span>' : ''}<span class="fa-skel fa-skel--text"></span><span class="fa-skel fa-skel--text" style="width:80%"></span>${o.btn ? '<span class="fa-skel fa-skel--btn"></span>' : ''}</div>`;

/* ---------- page: overview ---------- */
function pOverview() {
  const nTok = Object.keys(flat.color.light).length;
  const cards = [['color', 'Цвет', 'palette', 'Палитра в карточках, клик копирует'], ['cards', 'Карточки', 'cards', '14 видов и скелетоны к ним'], ['components', 'Элементы', 'toggle', 'Кнопки, поля, выбор, таблица'], ['motion', 'Движение', 'zap', 'Касания, переходы, кривые'], ['loading', 'Загрузка', 'loader', 'Skeleton и shimmer'], ['falcon', 'Сокол', 'falcon', 'Знак, портрет, везде']];
  return { html: `<div class="pv-stack pv-enter">
    <section class="fa-island fa-watermark pv-hero" style="--i:0">
      <h2 class="fa-t-display">Один язык для всех продуктов Falcon</h2>
      <p class="fa-t-body-lg">Токены, шрифты, карточки и движение. React, Next, HTML и Flutter.</p>
      <div class="pv-row"><a class="fa-btn fa-btn--default fa-btn--lg" href="#/color">Открыть палитру</a><a class="fa-btn fa-btn--outline fa-btn--lg" href="#/install">Установка</a></div>
    </section>
    <div class="pv-grid pv-grid--six" style="--min:190px;--i:1">
      <div class="fa-card fa-card--stat"><span class="fa-t-caption">Токенов цвета</span><span class="fa-t-kpi">${nTok}</span><span class="fa-badge fa-badge--success">2 темы</span></div>
      <div class="fa-card fa-card--stat"><span class="fa-t-caption">Проверок контраста</span><span class="fa-t-kpi">${ct.checks}</span><span class="fa-badge fa-badge--success">0 ошибок</span></div>
      <div class="fa-card fa-card--stat"><span class="fa-t-caption">Гарнитур</span><span class="fa-t-kpi">3</span><span class="fa-badge">Tektur, Plex</span></div>
      <div class="fa-card fa-card--stat"><span class="fa-t-caption">Скругление карточки</span><span class="fa-t-kpi">${flat.radius.card}px</span><span class="fa-badge">острова ${flat.radius.island}</span></div>
      <div class="fa-card fa-card--stat"><span class="fa-t-caption">Видов карточек</span><span class="fa-t-kpi">12</span><span class="fa-badge">и скелетоны</span></div>
      <div class="fa-card fa-card--stat"><span class="fa-t-caption">Размер кнопки</span><span class="fa-t-kpi">${flat.size.control}px</span><span class="fa-badge">pill</span></div>
    </div>
    <div class="pv-grid pv-grid--six" style="--min:190px;--i:2">${cards.map(([id, t, i, d]) => `<a class="fa-card fa-card--action" href="#/${id}" style="text-decoration:none"><span class="fa-icon-chip">${i === 'falcon' ? '<span class="fa-mark" style="height:18px"></span>' : svg(i)}</span><b class="fa-card__title">${t}</b><span class="fa-card__sub">${d}</span></a>`).join('')}</div>
  </div>`, after() {} };
}

/* ---------- page: color ---------- */
const GROUPS = {
  surfaces: ['canvas', 'card', 'inset', 'line', 'line-strong'],
  text: ['text', 'text-2', 'link', 'focus', 'logo'],
  gold: ['accent', 'accent-hover', 'accent-press', 'on-accent', 'accent-border'],
  status: ['success', 'warning', 'danger', 'info', 'danger-solid', 'on-danger'],
  island: ['island', 'island-raised', 'island-line', 'island-text', 'island-text-2', 'island-accent'],
};
const ROLE = {
  canvas: 'Фон страницы', card: 'Карточки и поля', inset: 'Блоки внутри карточки', line: 'Тонкие разделители', 'line-strong': 'Граница контрола, 3:1',
  text: 'Основной текст', 'text-2': 'Вторичный текст', link: 'Ссылки', focus: 'Кольцо фокуса', logo: 'Логотип на светлом',
  accent: 'Заливка главного действия', 'accent-hover': 'Наведение', 'accent-press': 'Нажатие', 'on-accent': 'Текст на янтаре', 'accent-border': 'Рамка янтарной кнопки и иконка',
  success: 'Точка: готово', warning: 'Точка: внимание', danger: 'Точка: ошибка', info: 'Точка: сведения', 'danger-solid': 'Заливка опасной кнопки', 'on-danger': 'Текст на опасной кнопке',
  island: 'Сайдбар, баннеры', 'island-raised': 'Блоки в острове', 'island-line': 'Разделители в острове', 'island-text': 'Текст в острове', 'island-text-2': 'Вторичный текст в острове', 'island-accent': 'Янтарь на острове',
};
const PAIR = { canvas: 'text', card: 'text', inset: 'text', 'line-strong': 'card', text: 'canvas', 'text-2': 'card', link: 'card', focus: 'card', logo: 'card', accent: 'on-accent', 'accent-hover': 'on-accent', 'accent-press': 'on-accent', 'on-accent': 'accent', 'accent-border': 'card', success: 'card', warning: 'card', danger: 'card', info: 'card', 'danger-solid': 'on-danger', 'on-danger': 'danger-solid', island: 'island-text', 'island-raised': 'island-text', 'island-text': 'island', 'island-text-2': 'island', 'island-accent': 'island' };
function colorCard(k, th, both) {
  const c = flat.color[th], p = PAIR[k], r = p ? ratio(c[k], c[p]) : null;
  const pill = r ? `<span class="fa-badge fa-badge--plain fa-tip fa-tip--end" data-tip="Контраст с ${p}">${r.toFixed(1)}:1</span>` : '';
  const lk = (bg, fg) => `<span class="fa-lockup" role="img" aria-label="Логотип" style="width:78%;height:auto;color:${fg}"></span>`;
  const sw = k === 'logo'
    ? (both
      ? `<span class="pv-pair"><i style="background:${flat.color.light.card};display:flex;align-items:center;justify-content:center">${lk('', flat.color.light.logo)}</i><i style="background:${flat.color.dark.card};display:flex;align-items:center;justify-content:center">${lk('', flat.color.dark.logo)}</i></span>`
      : `<span class="fa-swatch" style="--sw:var(--fa-color-card);display:flex;align-items:center;justify-content:center;position:relative"><span class="fa-lockup" role="img" aria-label="Логотип" style="width:78%;height:auto;color:var(--fa-color-logo)"></span><span style="position:absolute;right:8px;bottom:8px">${pill}</span></span>`)
    : both
    ? `<span class="pv-pair"><i style="background:${flat.color.light[k]}"></i><i style="background:${flat.color.dark[k]}"></i></span>`
    : `<span class="fa-swatch" style="--sw:var(--fa-color-${k})">${pill}</span>`;
  const hex = both ? `${flat.color.light[k]} / ${flat.color.dark[k]}` : c[k];
  return `<button class="fa-card fa-card--color" data-copy="${esc(both ? flat.color.light[k] : c[k])}" data-var="--fa-color-${k}" aria-label="Копировать ${k}">${sw}
    <span class="fa-card__body"><b class="fa-t-label">${k}</b><span class="fa-t-id">${hex}</span><span class="fa-t-caption">${ROLE[k] || ''}</span></span></button>`;
}
let colorBoth = false;
function pColor(sub = 'surfaces') {
  const th = curTheme();
  const prop = (sub === 'surfaces' || sub === 'gold') ? [['canvas', 60, 'Фон'], ['card', 24, 'Карточки'], ['island', 11, 'Острова'], ['accent', 5, 'Янтарь']] : null;
  const note = { surfaces: 'Тёмного синего фона нет: светлая тема бумажная, тёмная почти чёрная.', text: 'Янтарного текста на светлом нет.', gold: 'Янтарь: заливка, рамка, иконка. Текст на нём всегда тёмный.', status: 'Чип: тёмный текст и точка. Цвет не единственный признак.', island: 'Остров тёмный в обеих темах, остальные токены внутри подменяются.' }[sub];
  return { html: `${head(pills(P('color').sub, sub, 'color'), `<span class="pv-label">Темы</span>${seg('both', [['one', 'Текущая'], ['both', 'Обе']], colorBoth ? 'both' : 'one')}`)}
    <div class="pv-stack pv-enter">
      ${prop ? `<div class="fa-card" style="--i:0"><div class="fa-card__head"><b class="fa-card__title">Пропорции экрана</b><span class="fa-t-caption">янтарь до 5%</span></div><div class="pv-prop">${prop.map(([k, w]) => `<i style="width:${w}%;background:var(--fa-color-${k})"></i>`).join('')}</div></div>` : ''}
      ${sub === 'gold' ? `<div class="fa-card pv-stack" style="--i:0"><b class="fa-card__title">В деле</b><div class="pv-row"><button class="fa-btn fa-btn--default">Обычная</button><button class="fa-btn fa-btn--default" data-state="hover">Наведение</button><button class="fa-btn fa-btn--default" data-state="pressed">Нажатие</button><button class="fa-btn fa-btn--default" data-state="loading">Загрузка</button><button class="fa-btn fa-btn--default" disabled>Отключена</button></div></div>` : ''}
      <p class="fa-t-caption" style="margin:0;--i:1">${note} Клик по карточке копирует hex, Shift копирует var().</p>
      <div class="pv-grid" style="--min:190px;--i:2">${GROUPS[sub].map((k) => colorCard(k, th, colorBoth)).join('')}</div>
    </div>`,
  after(root) {
    bindSeg(root, 'both', (v) => { colorBoth = v === 'both'; route(); });
    $$('.fa-card--color', root).forEach((b) => b.addEventListener('click', (e) => { const t = e.shiftKey ? `var(${b.dataset.var})` : b.dataset.copy; copyText(t, `Скопировано: ${t}`); }));
  } };
}

/* ---------- page: type ---------- */
const SAMPLE = { display: 'Freight Network', title: 'Compliance', kpi: '2,684', section: 'Карточка перевозчика', 'body-lg': 'Осталось загрузить один документ', body: 'Страховка истекла 12 дней назад', table: 'Summit Carriers Inc.', label: 'Номер MC', caption: 'Обновлено в 14:32 EDT', id: 'FL-48213 · MC 784321' };
let tester = { font: 'display', size: 40, text: 'Рейс № 204 · O‘zbekiston · G‘ijduvon' };
function pType(sub = 'faces') {
  let body = '';
  if (sub === 'faces') body = `<div class="pv-grid" style="--min:300px">
    ${[['display', 'Tektur', 'Заголовки от 20 px и цифры', 'Freight Network 0123456789', '400 до 900', 'Квадратные формы повторяют прорези логотипа. Не для обычного текста.'],
       ['sans', 'IBM Plex Sans', 'Интерфейс и текст', 'Страховка истекла 12 дней назад', '100 до 700', 'Спокойный гротеск, хорошо держит кириллицу и плотные таблицы.'],
       ['mono', 'IBM Plex Mono', 'ID, номера, суммы', 'FL-48213 · MC 784321 · $12,450.00', '400, 500', 'Идентификаторы читают по буквам: всегда моноширинный.']].map(([f, n, use, s, w, tip]) => `
      <article class="fa-card pv-stack">
        <div class="fa-card__head" style="display:grid;justify-items:start;gap:6px;margin:0"><b class="fa-card__title">${n}</b><span class="fa-badge fa-tip" data-tip="${esc(tip)}">${use}</span></div>
        <div class="pv-stage" style="height:150px;overflow:hidden;font-family:var(--fa-font-${f});font-size:${f === 'display' ? 30 : 20}px;line-height:1.2;text-align:center">${esc(s)}</div>
        <div class="pv-row"><span class="fa-t-caption">Веса: <span class="pv-num">${w}</span></span><span class="fa-badge fa-badge--success">RU, EN, UZ</span></div>
        <div class="fa-block" style="font-family:var(--fa-font-${f})">O‘zbekiston · G‘ijduvon · oʻ gʻ · oʼ gʼ</div>
      </article>`).join('')}
    </div>`;
  if (sub === 'scale') body = `<div class="fa-card" style="padding:var(--fa-space-2) var(--fa-space-5)">${Object.entries(flat.text).map(([k, t]) =>
    `<div class="fa-setting"><div style="min-width:0"><span class="fa-t-${k}" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${SAMPLE[k]}</span></div><span class="fa-badge pv-num fa-tip fa-tip--end" data-tip="Класс fa-t-${k}">${k} · ${t.size}/${t.line} · ${t.weight}</span></div>`).join('')}</div>`;
  if (sub === 'tester') body = `<div class="pv-split"><div class="fa-card pv-stack">
      <div class="fa-field"><label for="tt">Текст</label><input id="tt" class="fa-input" value="${esc(tester.text)}"></div>
      <div class="pv-row"><span class="pv-label">Гарнитура</span>${seg('tf', [['display', 'Tektur'], ['sans', 'Plex Sans'], ['mono', 'Plex Mono']], tester.font)}</div>
      <div class="pv-row"><span class="pv-label">Размер</span>${seg('ts', [['24', '24'], ['40', '40'], ['64', '64']], String(tester.size))}</div>
      <p class="fa-t-caption" style="margin:0">Tektur мельче 20 px не ставим: форма теряется.</p></div>
    <div class="fa-card"><div class="pv-stage" style="min-height:260px;text-align:center;overflow:hidden"><span id="tout" style="font-family:var(--fa-font-${tester.font});font-size:${tester.size}px;line-height:1.15;overflow-wrap:anywhere"></span></div></div></div>`;
  return { html: `${head(pills(P('type').sub, sub, 'type'))}<div class="pv-enter"><div style="--i:0">${body}</div></div>`,
    after(root) {
      if (sub !== 'tester') return;
      const out = $('#tout', root), upd = () => { out.textContent = tester.text; out.style.fontFamily = `var(--fa-font-${tester.font})`; out.style.fontSize = tester.size + 'px'; };
      upd(); $('#tt', root).addEventListener('input', (e) => { tester.text = e.target.value; upd(); });
      bindSeg(root, 'tf', (v) => { tester.font = v; upd(); }); bindSeg(root, 'ts', (v) => { tester.size = +v; upd(); });
    } };
}

/* ---------- page: shape ---------- */
const RAD = [['pill', 'Кнопки, поля, чипы, вкладки', 'pill'], ['md', 'Многострочное поле, блок в карточке', 'md'], ['card', 'Карточки', 'card'], ['island', 'Острова, баннеры, сайдбар', 'island'], ['sm', 'Подсказки, чекбокс', 'sm'], ['xs', 'Минимум для вложенного', 'xs']];
let nested = { outer: 'card', pad: 16, wrong: false };
function pShape(sub = 'radii') {
  let body = '';
  if (sub === 'radii') body = `<div class="pv-grid" style="--min:200px">${RAD.map(([k, use]) => `<article class="fa-card pv-stack" style="padding:var(--fa-space-3)">
    <div class="pv-stage" style="aspect-ratio:1.5;min-height:0;padding:0;background:var(--fa-color-canvas)"><div class="pv-rad" style="width:72%;height:62%;aspect-ratio:auto;box-shadow:0 0 0 1px var(--fa-color-line-strong);border-radius:var(--fa-radius-${k})">${flat.radius[k]}${k === 'pill' ? '' : 'px'}</div></div>
    <div style="padding:0 var(--fa-space-2) var(--fa-space-2)"><b class="fa-t-label">${k}</b><div class="fa-t-caption">${use}</div></div></article>`).join('')}</div>`;
  if (sub === 'nested') body = `<div class="pv-split"><div class="fa-card pv-stack">
      <div class="pv-row"><span class="pv-label">Внешний</span>${seg('no', [['md', 'md 16'], ['card', 'card 24'], ['island', 'island 32']], nested.outer)}</div>
      <div class="fa-field"><label for="np">Отступ <b class="pv-num" id="npv">${nested.pad}</b> px</label><input id="np" class="pv-range" type="range" min="0" max="32" value="${nested.pad}"></div>
      <div class="pv-row"><span class="pv-label">Вариант</span>${seg('nw', [['ok', 'Внешний минус отступ'], ['bad', 'Одинаковый']], nested.wrong ? 'bad' : 'ok')}</div>
      <div class="fa-block" id="nf" style="font-family:var(--fa-font-mono);font-size:13px"></div></div>
    <div class="pv-conc"><div class="pv-conc__outer" id="nout"><div class="pv-conc__inner" id="nin"></div></div></div></div>`;
  if (sub === 'depth') body = `<div class="pv-grid" style="--min:200px">${Object.keys(flat.shadow).filter((k) => !k.startsWith('clay') && k !== 'image').map((k) => `<article class="fa-card pv-stack" style="padding:var(--fa-space-3)"><div class="pv-stage" style="min-height:120px;background:var(--fa-color-canvas)"><div style="width:70%;height:64px;border-radius:var(--fa-radius-card);background:var(--fa-color-card);box-shadow:var(--fa-shadow-${k})"></div></div><div style="padding:0 var(--fa-space-2) var(--fa-space-2)"><b class="fa-t-label">shadow-${k}</b><div class="fa-t-caption">${{ xs: 'Поле, мелкий блок', card: 'Карточка', lift: 'Наведение на карточку', overlay: 'Меню, диалог, тост', island: 'Остров' }[k] || ''}</div></div></article>`).join('')}</div>`;
  return { html: `${head(pills(P('shape').sub, sub, 'shape'))}<div class="pv-enter"><div style="--i:0">${body}</div></div>`,
    after(root) {
      if (sub !== 'nested') return;
      const out = $('#nout', root), inn = $('#nin', root), f = $('#nf', root), upd = () => {
        const o = flat.radius[nested.outer], p = nested.pad, r = nested.wrong ? o : Math.max(o - p, flat.radius.xs);
        out.style.borderRadius = o + 'px'; out.style.padding = p + 'px'; inn.style.borderRadius = r + 'px';
        inn.textContent = `${r}px`; $('#npv', root).textContent = p;
        f.textContent = nested.wrong ? `внутри ${o}px, снаружи ${o}px: углы расходятся` : `${o} - ${p} = ${o - p}${o - p < flat.radius.xs ? `, минимум ${flat.radius.xs}` : ''}`;
      };
      upd(); $('#np', root).addEventListener('input', (e) => { nested.pad = +e.target.value; upd(); });
      bindSeg(root, 'no', (v) => { nested.outer = v; upd(); }); bindSeg(root, 'nw', (v) => { nested.wrong = v === 'bad'; upd(); });
    } };
}

/* ---------- page: cards ---------- */
const CARDS = () => [
  { k: 'stat', c: 'data', n: 'Показатель', h: `<article class="fa-card fa-card--stat"><span class="fa-t-caption">Нужны решения</span><span class="fa-t-kpi">48</span><span class="fa-badge fa-badge--danger">${svg('alert')}+12 за сутки</span></article>`, s: skelCard({ kpi: true }) },
  { k: 'person', c: 'data', n: 'Человек', h: `<article class="fa-card fa-card--person"><span class="fa-avatar"><span class="fa-mark"></span><span class="fa-dot"></span></span><div><b class="fa-t-label">J. Miller</b><div class="fa-t-caption">Диспетчер · онлайн</div></div></article>`, s: `<div class="fa-card fa-card--person"><span class="fa-skel fa-skel--avatar"></span><div class="fa-skel-stack" style="flex:1"><span class="fa-skel fa-skel--text" style="width:50%"></span><span class="fa-skel fa-skel--text" style="width:70%"></span></div></div>` },
  { k: 'file', c: 'data', n: 'Файл', h: `<article class="fa-card fa-card--file"><span class="fa-icon-chip">${svg('file')}</span><div style="flex:1;min-width:0"><div class="fa-t-id">BOL-48213.pdf</div><div class="fa-t-caption">2,4 MB · загружается</div><div class="fa-bar" style="margin-top:8px"><i style="--p:64%"></i></div></div></article>`, s: `<div class="fa-card fa-card--file"><span class="fa-skel fa-skel--avatar"></span><div class="fa-skel-stack" style="flex:1"><span class="fa-skel fa-skel--text" style="width:60%"></span><span class="fa-skel fa-skel--text"></span></div></div>` },
  { k: 'media', c: 'data', n: 'Медиа', h: `<article class="fa-card fa-card--media"><div class="fa-media"><img class="fa-falcon-gray" src="../assets/falcon/falcon-sidebar.webp" alt="Сокол" style="object-fit:contain;padding:12px"></div><div class="fa-card__body"><b class="fa-card__title">Сокол Falcon</b><p class="fa-card__sub">Иллюстрация, рамка 1 px из тени</p></div></article>`, s: `<div class="fa-card fa-card--media"><span class="fa-skel fa-skel--block" style="height:150px;border-radius:0"></span><div class="fa-card__body fa-skel-stack"><span class="fa-skel fa-skel--title"></span><span class="fa-skel fa-skel--text"></span></div></div>` },
  { k: 'action', c: 'action', n: 'Действие', h: `<button class="fa-card fa-card--action"><span class="fa-icon-chip">${svg('file')}</span><b class="fa-card__title">Запросить сертификат</b><span class="fa-card__sub">Страховка Summit Carriers истекла</span></button>`, s: skelCard({ avatar: true }) },
  { k: 'choice', c: 'action', n: 'Выбор', h: `<div class="pv-stack">${[['Диспетчер', 'truck', 'Очередь решений и рейсы', true], ['Водитель', 'user', 'Следующий шаг и документы', false]].map(([n, i, tip, on]) => `<label class="fa-card fa-card--choice"><input type="radio" name="role" ${on ? 'checked' : ''}><span class="fa-icon-chip">${svg(i)}</span><b class="fa-t-label">${n}</b><span class="fa-tip fa-tip--end pv-mini-ic" data-tip="${tip}" style="width:28px;height:28px">${svg('info').replace('<svg', '<svg style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.75"')}</span><span class="fa-tick">${svg('check').replace('<svg', '<svg style="fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round"')}</span></label>`).join('')}</div>`, s: `<div class="pv-stack"><div class="fa-card fa-card--choice"><span class="fa-skel fa-skel--avatar"></span><span class="fa-skel fa-skel--text" style="flex:1"></span></div><div class="fa-card fa-card--choice"><span class="fa-skel fa-skel--avatar"></span><span class="fa-skel fa-skel--text" style="flex:1"></span></div></div>` },
  { k: 'setting', c: 'action', n: 'Настройка', h: `<div class="fa-card fa-card--setting">${[['Push-уведомления', 'Только критичные', true], ['Тёмная тема ночью', 'По системе', true], ['Работа без сети', 'Сохраняется на телефоне', false]].map(([t, d, on]) => `<div class="fa-setting"><div><b class="fa-t-label">${t}</b><div class="fa-t-caption">${d}</div></div><label class="fa-switch"><input type="checkbox" role="switch" ${on ? 'checked' : ''} aria-label="${t}"><span></span></label></div>`).join('')}</div>`, s: `<div class="fa-card fa-card--setting">${[1, 2, 3].map(() => '<div class="fa-setting"><div class="fa-skel-stack" style="flex:1"><span class="fa-skel fa-skel--text" style="width:50%"></span><span class="fa-skel fa-skel--text" style="width:30%"></span></div><span class="fa-skel fa-skel--chip" style="width:52px"></span></div>').join('')}</div>` },
  { k: 'ai', c: 'service', n: 'Предложение AI', h: `<article class="fa-card fa-card--ai"><span class="fa-badge fa-badge--ai">${svg('sparkle')}Предложение AI</span><b class="fa-card__title">Поставить рейсы на паузу</b><p class="fa-card__sub" style="margin:0">Страховка истекла 12 дней назад.</p><span class="fa-source">Источник: FMCSA, 10 окт, 14:32</span><div class="fa-card__foot"><button class="fa-btn fa-btn--default fa-btn--sm">Применить</button><button class="fa-btn fa-btn--ghost fa-btn--sm">Отклонить</button></div></article>`, s: skelCard({ btn: true }) },
  { k: 'trip', c: 'service', n: 'Следующий шаг', h: `<article class="fa-card fa-card--trip"><div class="fa-card__head" style="margin:0"><b class="fa-card__title">Рейс FL-48213</b><span class="fa-badge fa-badge--info">В пути</span></div><div class="fa-trip-route"><div class="fa-trip-stop"><span class="fa-t-label">Dallas, TX</span><span class="fa-t-caption">выехали 06:10</span></div><div class="fa-trip-stop" data-now><span class="fa-t-label">Memphis, TN</span><span class="fa-t-caption">прибытие 14:20</span></div></div><button class="fa-btn fa-btn--default fa-btn--xl">Отметить прибытие</button></article>`, s: skelCard({ block: true, btn: true }) },
  { k: 'notify', c: 'service', n: 'Уведомление', h: `<div class="fa-card fa-card--notify"><span class="fa-icon-chip">${svg('bell')}</span><div><b class="fa-t-label">Документ загружен</b><div class="fa-t-caption">BOL FL-48213 отправлен брокеру</div></div></div>`, s: `<div class="fa-card fa-card--notify"><span class="fa-skel fa-skel--avatar"></span><div class="fa-skel-stack" style="flex:1"><span class="fa-skel fa-skel--text" style="width:60%"></span><span class="fa-skel fa-skel--text"></span></div></div>` },
  { k: 'empty', c: 'service', n: 'Пусто', h: `<article class="fa-card fa-card--empty"><span class="fa-mark"></span><b class="fa-card__title">Очередь пуста</b><span class="fa-card__sub">Нет задач, которые требуют решения</span><button class="fa-btn fa-btn--outline fa-btn--sm">Обновить</button></article>`, s: `<div class="fa-card fa-card--empty"><span class="fa-falcon-loader"><span class="fa-mark" style="height:28px"></span></span><span class="fa-skel fa-skel--text" style="width:50%"></span></div>` },
  { k: 'banner', c: 'service', n: 'Остров-баннер', h: `<div class="fa-island fa-watermark fa-banner"><div><h3>Новый перевозчик</h3><p class="fa-t-caption" style="margin:0">Проверьте документы до 18:00</p></div><button class="fa-btn fa-btn--default">Проверить</button></div>`, s: `<div class="fa-island fa-banner"><div class="fa-skel-stack" style="flex:1;min-width:120px"><span class="fa-skel fa-skel--title"></span><span class="fa-skel fa-skel--text"></span></div><span class="fa-skel fa-skel--btn"></span></div>` },
];
let cardsSkel = false;
/* Bento layouts: every card keeps the size its meaning needs (span of 12 columns), rows share one height. */
const LAYOUT = {
  all: [['stat', 3], ['person', 3], ['file', 3], ['notify', 3], ['action', 4], ['choice', 4], ['setting', 4], ['ai', 4], ['trip', 4], ['media', 4, 2], ['empty', 4], ['banner', 4]],
  data: [['stat', 3], ['person', 3], ['file', 3], ['notify', 3], ['media', 6], ['banner', 6]],
  action: [['action', 4], ['choice', 4], ['setting', 4], ['ai', 6], ['trip', 6]],
  service: [['ai', 4], ['trip', 4], ['empty', 4], ['notify', 6], ['banner', 6]],
};
function pCards(sub = 'all') {
  const all = CARDS(), by = (k) => all.find((x) => x.k === k);
  const list = LAYOUT[sub].map(([k, span, rows]) => ({ ...by(k), span, rows: rows || 1 }));
  return { html: `${head(pills(P('cards').sub, sub, 'cards'), seg('cs', [['c', 'Контент'], ['s', 'Скелетон']], cardsSkel ? 's' : 'c'))}
    <div class="pv-bento pv-enter">${list.map((x, i) => `<figure class="pv-fig" style="--i:${i};--span:${x.span};--rows:${x.rows}"><div class="card-slot" data-k="${x.k}"><div class="cs-layer" ${cardsSkel ? 'inert aria-hidden="true"' : 'data-on'}>${x.h}</div><div class="cs-layer" ${cardsSkel ? 'data-on' : 'inert aria-hidden="true"'}>${x.s}</div></div><figcaption><b class="fa-t-label">${x.n}</b><span class="fa-badge fa-tip fa-tip--end" data-tip="Класс .fa-card--${x.k}">${x.c === 'data' ? 'данные' : x.c === 'action' ? 'действие' : 'сервис'}</span></figcaption></figure>`).join('')}</div>`,
  after(root) { bindSeg(root, 'cs', (v) => { cardsSkel = v === 's'; $$('.card-slot', root).forEach((el) => { const [h, k] = el.children; h.toggleAttribute('data-on', !cardsSkel); k.toggleAttribute('data-on', cardsSkel); [h, k].forEach((l) => { const on = l.hasAttribute('data-on'); l.toggleAttribute('inert', !on); on ? l.removeAttribute('aria-hidden') : l.setAttribute('aria-hidden', 'true'); }); }); }); } };
}

/* ---------- page: components ---------- */
let btnState = '';
function pComponents(sub = 'buttons') {
  let body = '', after = () => {};
  if (sub === 'buttons') {
    const V = [['default', 'Янтарная'], ['cta', 'CTA'], ['secondary', 'Второстепенная'], ['outline', 'Светлая'], ['ghost', 'Текстовая'], ['destructive', 'Опасная']];
    body = `<div class="fa-card pv-stack" style="overflow:auto"><div class="pv-row"><span class="pv-label">Состояние</span><div style="max-width:100%;min-width:0;overflow-x:auto;padding:2px">${seg('bs', [['', 'Обычное'], ['hover', 'Наведение'], ['pressed', 'Нажатие'], ['loading', 'Загрузка'], ['disabled', 'Отключено']], btnState)}</div></div>
      <div id="bm" style="display:grid;gap:var(--fa-space-3)">${V.map(([v, n]) => `<div class="pv-row"><span class="fa-t-label" style="width:112px">${n}</span>
        <button class="fa-btn fa-btn--${v} fa-btn--sm">Кнопка 36</button><button class="fa-btn fa-btn--${v}">Кнопка 44</button><button class="fa-btn fa-btn--${v} fa-btn--lg">Кнопка 48</button>
        <button class="fa-btn fa-btn--${v} fa-btn--icon" aria-label="Добавить">${svg('plus')}</button><button class="fa-btn fa-btn--${v}">${svg('truck')}С иконкой</button></div>`).join('')}</div>
      <div style="max-width:420px"><button class="fa-btn fa-btn--default fa-btn--xl">Отметить прибытие, 56</button></div>
      <p class="fa-t-caption" style="margin:0">Все кнопки pill и без обводок. Нажатие: сжатие до 0,96 и тёмная заливка. Одна янтарная кнопка на экран.</p></div>`;
    after = (root) => { const apply = () => $$('#bm .fa-btn', root).forEach((b) => { b.removeAttribute('data-state'); if (btnState) b.setAttribute('data-state', btnState); }); apply(); bindSeg(root, 'bs', (v) => { btnState = v; apply(); }); };
  }
  if (sub === 'fields') body = `<div class="pv-grid" style="--min:280px"><div class="fa-card pv-stack">
      <div class="fa-field"><label for="a1">Номер MC</label><input id="a1" class="fa-input" value="MC 784321"><span class="fa-field-hint">Поле 44 px, pill</span></div>
      <div class="fa-field"><label for="a2">Страховка до</label><input id="a2" class="fa-input" aria-invalid="true" value="12.10.2026"><span class="fa-field-error">Срок истёк. Загрузите новый сертификат.</span></div>
      <div class="fa-field"><label for="a3">Отключено</label><input id="a3" class="fa-input" disabled value="Недоступно"></div></div>
    <div class="fa-card pv-stack"><div class="fa-field"><label for="a4">Комментарий</label><textarea id="a4" class="fa-textarea" placeholder="Радиус md, 16"></textarea></div>
      <div class="fa-field"><label for="a5">Статус</label><select id="a5" class="fa-select"><option>На проверке</option><option>Проверено</option></select></div></div></div>`;
  if (sub === 'select') body = `<div class="pv-grid" style="--min:280px"><div class="fa-card pv-stack">
      <div class="pv-row"><label class="fa-switch"><input type="checkbox" role="switch" checked aria-label="Переключатель"><span></span></label><span class="fa-t-label">Переключатель</span></div>
      <div class="pv-row"><label class="fa-check"><input type="checkbox" checked aria-label="Флажок">${svg('check').replace('<svg', '<svg')}</label><span class="fa-t-label">Флажок</span></div>
      <div class="pv-row"><label class="fa-radio"><input type="radio" name="r" checked aria-label="Вариант 1"><i></i></label><span class="fa-t-label">Вариант 1</span><label class="fa-radio"><input type="radio" name="r" aria-label="Вариант 2"><i></i></label><span class="fa-t-label">Вариант 2</span></div></div>
    <div class="fa-card pv-stack"><span class="pv-label">Сегментный</span>${seg('sg', [['a', 'День'], ['b', 'Неделя'], ['c', 'Месяц']], 'a')}<span class="pv-label">Фильтры</span><div class="fa-pills" id="flt">${['Все', 'Страховка', 'Полномочия', 'Залог'].map((x, i) => `<button class="fa-pill" aria-pressed="${i === 0}">${x}</button>`).join('')}</div></div></div>`;
  if (sub === 'select') after = (root) => { bindSeg(root, 'sg', () => {}); $$('#flt .fa-pill', root).forEach((b) => b.addEventListener('click', () => $$('#flt .fa-pill', root).forEach((x) => x.setAttribute('aria-pressed', String(x === b))))); };
  if (sub === 'dropdown') {
    const opts = (arr, sel) => arr.map((t) => `<option ${t === sel ? 'selected' : ''}>${t}</option>`).join('');
    const cities = ['Dallas, TX', 'Memphis, TN', 'Atlanta, GA', 'Chicago, IL', 'Denver, CO', 'Houston, TX', 'Phoenix, AZ', 'Seattle, WA', 'Miami, FL', 'Boston, MA', 'Detroit, MI', 'Portland, OR'];
    body = `<div class="pv-grid" style="--min:300px">
      <div class="fa-card pv-stack"><b class="fa-card__title">Обычный</b>
        <div class="fa-field"><label for="d1">Статус</label><select id="d1" class="fa-select">${opts(['На проверке', 'Проверено', 'Отклонено'], 'Проверено')}</select><span class="fa-field-hint">Pill 44 px. Список вырастает из поля.</span></div></div>
      <div class="fa-card pv-stack"><b class="fa-card__title">С группами</b>
        <div class="fa-field"><label for="d2">Документ</label><select id="d2" class="fa-select"><optgroup label="Страховка"><option>Страховка авто</option><option>Страховка груза</option></optgroup><optgroup label="Допуски"><option>Полномочия</option><option disabled>Залог (недоступно)</option></optgroup></select></div></div>
      <div class="fa-card pv-stack"><b class="fa-card__title">С поиском</b>
        <div class="fa-field"><label for="d3">Город</label><select id="d3" class="fa-select">${opts(cities, 'Memphis, TN')}</select><span class="fa-field-hint">Больше 8 пунктов: появляется фильтр.</span></div></div>
      <div class="fa-card pv-stack"><b class="fa-card__title">Состояния</b>
        <div class="fa-field"><label for="d4">С ошибкой</label><select id="d4" class="fa-select" aria-invalid="true">${opts(['Выберите роль', 'Диспетчер', 'Водитель'])}</select><span class="fa-field-error">Роль нужна, чтобы продолжить.</span></div>
        <div class="fa-field"><label for="d5">Отключено</label><select id="d5" class="fa-select" disabled>${opts(['Недоступно'])}</select></div></div>
      <div class="fa-card pv-stack"><b class="fa-card__title">Клавиатура и телефон</b>
        <div class="fa-t-caption">Стрелки, Home, End, Enter, Esc. Набор букв прыгает к пункту. С клавиатуры список появляется без анимации. На телефоне список открывается нижним листом.</div>
        <button class="fa-btn fa-btn--outline fa-btn--sm" id="dsheet">${svg('devices')}Показать как лист</button></div>
    </div>`;
    after = (root) => { $('#dsheet', root).addEventListener('click', () => { const s = $('#d3', root); FaSheet.open({ title: 'Город', body: `<div class="fa-menu__list" role="listbox">${[...s.options].map((o) => `<div class="fa-menu__opt" role="option" tabindex="0" aria-selected="${o.selected}"><span>${o.text}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>`).join('')}</div>` }); }); };
  }
  if (sub === 'sheet') {
    const row = (i, t, d) => `<button class="pv-sheet-row fa-press" data-close>${ic(i)}<span><b class="fa-t-label">${t}</b><br><span class="fa-t-caption">${d}</span></span></button>`;
    const SHEETS = {
      actions: () => FaSheet.open({ title: 'Рейс FL-48213', body: `<div class="pv-stack" style="gap:var(--fa-space-1)">${row('pin', 'Отметить прибытие', 'Memphis, TN')}${row('bell', 'Напомнить позже', 'Через час')}${row('file', 'Открыть документы', 'BOL, POD')}</div>` }),
      form: () => FaSheet.open({ title: 'Новый перевозчик', body: `<div class="pv-stack"><div class="fa-field"><label for="sf1">Название</label><input id="sf1" class="fa-input" placeholder="Summit Carriers Inc."></div><div class="fa-field"><label for="sf2">Статус</label><select id="sf2" class="fa-select"><option>На проверке</option><option>Проверено</option></select></div></div>`, actions: `<button class="fa-btn fa-btn--ghost" data-close>Отмена</button><button class="fa-btn fa-btn--default" data-close>Сохранить</button>` }),
      danger: () => FaSheet.open({ title: 'Удалить рейс?', body: `<p class="fa-t-body" style="margin:0">Рейс FL-48213 исчезнет из списка. Документы останутся в архиве.</p>`, actions: `<button class="fa-btn fa-btn--secondary" data-close data-autofocus>Оставить</button><button class="fa-btn fa-btn--destructive" data-close>Удалить</button>` }),
      tall: () => FaSheet.open({ title: 'История изменений', tall: true, body: `<div class="pv-stack">${Array.from({ length: 14 }, (_, i) => `<div class="fa-card fa-card--notify"><span class="fa-icon-chip">${svg('bell')}</span><div><b class="fa-t-label">Изменение ${i + 1}</b><div class="fa-t-caption">Сегодня, ${9 + (i % 9)}:${i % 2 ? '30' : '00'}</div></div></div>`).join('')}</div>` }),
    };
    body = `<div class="pv-grid" style="--min:280px">${[['actions', 'Список действий', 'Выбор из нескольких действий над одним объектом.'], ['form', 'Форма', 'Короткая форма с двумя кнопками внизу.'], ['danger', 'Подтверждение', 'Опасное действие: безопасная кнопка первая, фокус на ней.'], ['tall', 'Высокий лист', 'Длинное содержимое прокручивается внутри, ручка и заголовок остаются.']].map(([k, t, d]) => `<article class="fa-card pv-stack"><b class="fa-card__title">${t}</b><span class="fa-card__sub">${d}</span><button class="fa-btn fa-btn--outline fa-btn--sm" data-sheet="${k}">${svg('play')}Открыть</button></article>`).join('')}
      <article class="fa-card pv-stack"><b class="fa-card__title">Как устроен</b>
        <div class="fa-t-caption">Появление ${flat.motion.sheet.replace('ms', ' мс')} на ease-drawer, закрытие ${flat.motion['sheet-out'].replace('ms', ' мс')}. Верхний радиус 32 (остров). Закрывают Esc, касание затемнения, кнопка, свайп вниз. Быстрый жест закрывает на любом расстоянии, вверх лист тянется с сопротивлением. Фокус возвращается на кнопку. Без движения: только fade.</div></article>
    </div>`;
    after = (root) => $$('[data-sheet]', root).forEach((b) => b.addEventListener('click', () => SHEETS[b.dataset.sheet]())) ;
  }
  if (sub === 'status') body = `<div class="pv-grid" style="--min:300px"><div class="fa-card pv-stack"><b class="fa-card__title">Чипы</b><div class="pv-row">
      <span class="fa-badge fa-badge--success">Проверено</span><span class="fa-badge fa-badge--warning">Истекает через 3 дня</span><span class="fa-badge fa-badge--danger">${svg('alert')}Страховка истекла</span><span class="fa-badge fa-badge--info">В пути</span><span class="fa-badge fa-badge--brand">Новый</span><span class="fa-badge">Черновик</span><span class="fa-badge fa-badge--ai">${svg('sparkle')}Предложение AI</span></div>
      <p class="fa-t-caption" style="margin:0">Тёмный текст и точка. У критичных ещё и иконка. AI без цвета: подпись и искра.</p></div>
    <div class="fa-card pv-stack"><b class="fa-card__title">Прогресс</b><div class="fa-bar"><i style="--p:30%"></i></div><div class="fa-bar"><i style="--p:64%"></i></div><div class="fa-bar"><i style="--p:92%"></i></div></div></div>`;
  if (sub === 'table') body = `<div class="fa-card"><div class="fa-card__head"><b class="fa-card__title">Перевозчики</b>${seg('dn', [['comfortable', '44'], ['compact', '36']], 'comfortable')}</div>
    <div class="pv-table-wrap"><table class="fa-table" id="dt"><thead><tr><th style="width:44px"></th><th>Перевозчик</th><th>Проверка</th><th>Статус</th></tr></thead><tbody>
    ${[['Summit Carriers Inc.', 'MC 784321', 'Страховка', 'danger', 'Истекла', 1], ['Trans Freight Co.', 'MC 512340', 'Полномочия', 'info', 'На проверке', 0], ['Global Logistics LLC', 'MC 903212', 'Залог', 'warning', 'Через 3 дня', 0], ['Velocity Brokers', 'MC 441120', 'Личность', 'success', 'Проверено', 0]].map(([n, mc, c, t, s, sel]) => `<tr aria-selected="${!!sel}"><td><label class="fa-check"><input type="checkbox" ${sel ? 'checked' : ''} aria-label="Выбрать ${n}">${svg('check')}</label></td><td>${n} <span class="fa-t-id fa-muted">${mc}</span></td><td>${c}</td><td><span class="fa-badge fa-badge--${t}">${t === 'danger' ? svg('alert') : ''}${s}</span></td></tr>`).join('')}</tbody></table></div></div>`;
  if (sub === 'table') after = (root) => { bindSeg(root, 'dn', (v) => { $('#dt', root).dataset.density = v; }); $$('#dt tbody tr', root).forEach((tr) => $('input', tr).addEventListener('change', (e) => tr.setAttribute('aria-selected', String(e.target.checked)))); };
  if (sub === 'feedback') body = `<div class="pv-grid" style="--min:300px"><div class="fa-card pv-stack"><b class="fa-card__title">Тосты</b><div class="pv-row"><button class="fa-btn fa-btn--default" data-toast="Изменения сохранены">Сохранить</button><button class="fa-btn fa-btn--outline" data-toast="Фото сохранено на телефоне">Без сети</button></div><p class="fa-t-caption" style="margin:0">Появление 200 мс, уход быстрее. Без кнопок, не больше трёх.</p></div>
    <div class="fa-island fa-watermark fa-banner"><div><h3>Новый перевозчик</h3><p class="fa-t-caption" style="margin:0">Проверьте документы до 18:00</p></div><button class="fa-btn fa-btn--default">Проверить</button></div>
    <div class="fa-card fa-card--notify"><span class="fa-icon-chip">${svg('alert')}</span><div><b class="fa-t-label">Нет сети</b><div class="fa-t-caption">Сохранено на устройстве. Отправим позже.</div></div></div></div>`;
  if (sub === 'nav') body = `<div class="pv-grid" style="--min:280px"><div class="fa-card pv-stack"><span class="pv-label">Вкладка вырастает из холста</span><div class="pv-mini-side" id="ms" style="margin:0;max-width:240px;--fa-color-canvas:var(--fa-color-card)">${['Обзор', 'Очередь решений', 'Перевозчики', 'Рейсы'].map((t, i) => `<button class="fa-nav-item" ${i === 1 ? 'aria-current="page"' : ''}>${ic(['home', 'bell', 'truck', 'pin'][i])}<span>${t}</span></button>`).join('')}</div></div>
    <div class="fa-card pv-stack"><span class="pv-label">Вкладки-пилюли</span><div class="fa-pills" id="tb">${['Все', 'Проверки', 'Документы'].map((x, i) => `<button class="fa-pill" role="tab" aria-selected="${i === 0}">${x}</button>`).join('')}</div><span class="pv-label">Хлебные крошки</span><div class="pv-row"><span class="fa-pill">Перевозчики</span><span class="fa-t-caption">/</span><span class="fa-pill" aria-selected="true">Summit Carriers</span></div></div></div>`;
  if (sub === 'nav') after = (root) => { const items = $$('#ms .fa-nav-item', root); items.forEach((b) => b.addEventListener('click', () => { items.forEach((x) => x.removeAttribute('aria-current')); b.setAttribute('aria-current', 'page'); })); $$('#tb .fa-pill', root).forEach((b) => b.addEventListener('click', () => $$('#tb .fa-pill', root).forEach((x) => x.setAttribute('aria-selected', String(x === b))))); };
  return { html: `${head(pills(P('components').sub, sub, 'components'))}<div class="pv-enter"><div style="--i:0">${body}</div></div>`,
    after(root) { after(root); $$('[data-toast]', root).forEach((b) => b.addEventListener('click', () => toast(b.dataset.toast))); } };
}

/* ---------- page: motion ---------- */
let speed = 1, reduce = false;
function setSpeed(m) {
  speed = m; const r = document.documentElement;
  ['press', 'fast', 'base', 'slow'].forEach((k) => { const ms = parseFloat(flat.motion[k]); if (m === 1) r.style.removeProperty('--fa-motion-' + k); else r.style.setProperty('--fa-motion-' + k, ms * m + 'ms'); });
}
function bezier(str) { const n = str.match(/[\d.]+/g).map(Number); return n; }
function curveSvg(name, [x1, y1, x2, y2]) {
  const w = 160, h = 120, P = (t) => { const u = 1 - t; return [3 * u * u * t * x1 + 3 * u * t * t * x2 + t ** 3, 3 * u * u * t * y1 + 3 * u * t * t * y2 + t ** 3]; };
  const pts = Array.from({ length: 41 }, (_, i) => P(i / 40)).map(([x, y]) => `${(10 + x * (w - 20)).toFixed(1)},${(h - 10 - y * (h - 20)).toFixed(1)}`);
  return `<div class="pv-curve"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Кривая ${name}"><path class="axis" d="M10 10V${h - 10}H${w - 10}"/><path class="line" d="M${pts.join('L')}"/></svg></div>`;
}
function pMotion(sub = 'touch') {
  const tools = `<span class="pv-label">Скорость</span>${seg('sp', [['1', '1x'], ['4', '4x']], String(speed))}<label class="pv-row pv-label"><span class="fa-switch"><input type="checkbox" role="switch" id="rd" ${reduce ? 'checked' : ''} aria-label="Меньше движения"><span></span></span>Меньше движения</label>`;
  let body = '', after = () => {};
  if (sub === 'touch') body = `<div class="pv-grid" style="--min:280px">
    <article class="fa-card pv-stack"><b class="fa-card__title">Нажатие 0,96</b><div class="pv-stage"><div class="pv-row"><button class="fa-btn fa-btn--default">Янтарная</button><button class="fa-btn fa-btn--cta">CTA</button><button class="fa-btn fa-btn--outline">Светлая</button></div></div><span class="fa-t-caption">120 мс, ease-out. Только сжатие, без блеска.</span></article>
    <article class="fa-card pv-stack"><b class="fa-card__title">Подъём карточки</b><div class="pv-stage"><button class="fa-card fa-card--action fa-lift" style="max-width:220px"><span class="fa-icon-chip">${svg('file')}</span><b class="fa-card__title">Сертификат</b></button></div><span class="fa-t-caption">Только с мышью. Тень входит через opacity.</span></article>
    <article class="fa-card pv-stack"><b class="fa-card__title">Переключатели</b><div class="pv-stage"><div class="pv-row"><label class="fa-switch"><input type="checkbox" role="switch" aria-label="Тумблер"><span></span></label><label class="fa-check"><input type="checkbox" aria-label="Флажок">${svg('check')}</label><label class="fa-radio"><input type="radio" aria-label="Радио"><i></i></label></div></div><span class="fa-t-caption">Тумблер тянется при нажатии, галочка рисуется.</span></article>
    <article class="fa-card pv-stack"><b class="fa-card__title">Копирование</b><div class="pv-stage"><button class="fa-btn fa-btn--outline" id="cp">${morphBtn()}<span>Скопировать токен</span></button></div><span class="fa-t-caption">Иконка: scale 0,25 до 1, blur 4 до 0.</span></article></div>`;
  if (sub === 'touch') after = (root) => { $('#cp', root).addEventListener('click', (e) => { flashMorph(e.currentTarget); copyText('--fa-color-accent', 'Скопировано: --fa-color-accent'); }); };
  if (sub === 'flow') body = `<div class="pv-grid" style="--min:300px">
    <article class="fa-card pv-stack"><div class="fa-card__head"><b class="fa-card__title">Вкладка сайдбара</b><button class="fa-btn fa-btn--outline fa-btn--sm" id="rp1">${svg('refresh')}Повтор</button></div><div class="pv-stage" style="padding:var(--fa-space-3);--fa-stage:var(--fa-color-inset)"><div class="pv-mini-side" id="ms2" style="margin:0;--fa-color-canvas:var(--fa-stage)">${['Обзор', 'Очередь', 'Рейсы'].map((t, i) => `<button class="fa-nav-item" ${i === 1 ? 'aria-current="page"' : ''}>${ic(['home', 'bell', 'pin'][i])}<span>${t}</span></button>`).join('')}</div></div><span class="fa-t-caption">Вырастает справа, 260 мс. Без движения: fade 120 мс.</span></article>
    <article class="fa-card pv-stack"><div class="fa-card__head"><b class="fa-card__title">Каскад списка</b><button class="fa-btn fa-btn--outline fa-btn--sm" id="rp2">${svg('refresh')}Повтор</button></div><div class="pv-stack fa-reveal" id="stg">${[0, 1, 2, 3].map((i) => `<div class="fa-card fa-card--person" style="--i:${i};padding:var(--fa-space-3)"><span class="fa-avatar fa-avatar--sm">${'JSRL'[i]}</span><div><b class="fa-t-label">${['J. Miller', 'S. Patel', 'R. Kim', 'L. Carter'][i]}</b></div></div>`).join('')}</div><span class="fa-t-caption">Шаг 60 мс, подъём 8 px.</span></article>
    <article class="fa-card pv-stack"><div class="fa-card__head"><b class="fa-card__title">Загрузка кнопки</b><button class="fa-btn fa-btn--default fa-btn--sm" id="ld">Сохранить</button></div><span class="fa-t-caption">Кольцо крутится, повторное нажатие заблокировано.</span></article>
    <article class="fa-card pv-stack"><div class="fa-card__head"><b class="fa-card__title">Сокол дышит</b></div><div class="pv-stage"><span class="fa-falcon-loader"><span class="fa-mark" style="height:32px"></span></span></div></article></div>`;
  if (sub === 'flow') after = (root) => {
    const rep = (el, cls) => { el.querySelectorAll(':scope > *').forEach((x) => { x.style.animation = 'none'; void x.offsetWidth; x.style.animation = ''; }); };
    $('#rp1', root).addEventListener('click', () => { const a = $('#ms2 [aria-current]', root); a.removeAttribute('aria-current'); void a.offsetWidth; a.setAttribute('aria-current', 'page'); });
    $$('#ms2 .fa-nav-item', root).forEach((b) => b.addEventListener('click', () => { $$('#ms2 .fa-nav-item', root).forEach((x) => x.removeAttribute('aria-current')); b.setAttribute('aria-current', 'page'); }));
    $('#rp2', root).addEventListener('click', () => rep($('#stg', root)));
    $('#ld', root).addEventListener('click', (e) => { const b = e.currentTarget; b.setAttribute('aria-busy', 'true'); setTimeout(() => { b.removeAttribute('aria-busy'); toast('Сохранено'); }, 1600); });
  };
  if (sub === 'curves') body = `<div class="pv-grid" style="--min:260px">${['ease-out', 'ease-in-out', 'ease-tab'].map((k) => `<article class="fa-card pv-stack"><div class="fa-card__head" style="display:grid;justify-items:start;gap:6px"><b class="fa-card__title">${k}</b><span class="fa-badge pv-num">${flat.motion[k].replace('cubic-bezier', '')}</span></div>${curveSvg(k, bezier(flat.motion[k]))}<div class="pv-track" data-k="${k}" style="--ease:${flat.motion[k]};--dist:calc(100% - 40px)"><i></i></div><button class="fa-btn fa-btn--outline fa-btn--sm" data-play="${k}">${svg('play')}Запустить</button><span class="fa-t-caption">${{ 'ease-out': 'Появление, нажатие, подсказки', 'ease-in-out': 'Движение по экрану, shimmer', 'ease-tab': 'Вкладка сайдбара, сегменты' }[k]}</span></article>`).join('')}</div>`;
  if (sub === 'curves') after = (root) => $$('[data-play]', root).forEach((b) => b.addEventListener('click', () => { const t = $(`.pv-track[data-k="${b.dataset.play}"]`, root); t.toggleAttribute('data-go'); }));
  return { html: `${head(pills(P('motion').sub, sub, 'motion'), tools)}<div class="pv-enter"><div style="--i:0">${body}</div></div>`,
    after(root) {
      bindSeg(root, 'sp', (v) => setSpeed(+v));
      $('#rd', root).addEventListener('change', (e) => { reduce = e.target.checked; document.documentElement.toggleAttribute('data-reduce', reduce); });
      after(root);
    } };
}

/* ---------- page: loading ---------- */
let loaded = false, loadTimer;
function loadingBody(isLoaded) {
  const kp = (l, v, t, k) => `<div class="fa-card fa-card--stat" style="--i:${k}"><span class="fa-t-caption">${l}</span><span class="fa-t-kpi">${v}</span><span class="fa-badge fa-badge--${t}">${t === 'danger' ? svg('alert') : ''}${t === 'danger' ? '+12' : t === 'success' ? 'норма' : 'без изменений'}</span></div>`;
  const rows = [['Summit Carriers Inc.', 'Страховка', 'danger', 'Истекла'], ['Trans Freight Co.', 'Полномочия', 'info', 'На проверке'], ['Global Logistics LLC', 'Залог', 'warning', 'Через 3 дня']];
  if (isLoaded) return `<div class="pv-stack fa-reveal">
    <div class="pv-grid" style="--min:170px;--i:0">${kp('Нужны решения', 48, 'danger', 0)}${kp('Просрочено', 216, 'warning', 1)}${kp('Проверено', '2,684', 'success', 2)}</div>
    <div class="fa-card" style="--i:3"><div class="fa-card__head"><b class="fa-card__title">Очередь</b></div><table class="fa-table"><tbody>${rows.map(([n, c, t, s]) => `<tr><td>${n}</td><td>${c}</td><td><span class="fa-badge fa-badge--${t}">${t === 'danger' ? svg('alert') : ''}${s}</span></td></tr>`).join('')}</tbody></table></div></div>`;
  return `<div class="pv-stack"><div class="pv-grid" style="--min:170px">${[0, 1, 2].map(() => skelCard({ kpi: true })).join('')}</div>
    <div class="fa-card"><div class="fa-card__head"><span class="fa-skel fa-skel--title"></span></div><div class="fa-skel-stack" style="gap:var(--fa-space-4)">${rows.map(() => '<div class="pv-row" style="flex-wrap:nowrap"><span class="fa-skel fa-skel--text" style="flex:2"></span><span class="fa-skel fa-skel--text" style="flex:1"></span><span class="fa-skel fa-skel--chip"></span></div>').join('')}</div></div></div>`;
}
function pLoading() {
  return { html: `<div class="pv-head"><div class="pv-tools">${seg('ls', [['l', 'Загрузка'], ['d', 'Готово']], loaded ? 'd' : 'l')}<button class="fa-btn fa-btn--outline fa-btn--sm" id="lp">${svg('play')}Демо</button></div></div>
    <div class="pv-split pv-enter"><div id="lb" style="--i:0">${loadingBody(loaded)}</div>
    <div class="pv-stack" style="--i:1"><article class="fa-card pv-stack"><b class="fa-card__title">Правила</b><div class="pv-stack"><span class="fa-badge fa-badge--success fa-tip fa-tip--end" data-tip="Скелет повторяет раскладку будущего контента">Скелет вместо пустоты</span><span class="fa-badge fa-badge--success fa-tip fa-tip--end" data-tip="Подсветка едет transform, форма задана маской">Shimmer без градиентов в фоне</span><span class="fa-badge fa-badge--success fa-tip fa-tip--end" data-tip="Блоки заменяются по очереди, шаг 60 мс">Постепенная замена</span><span class="fa-badge fa-badge--success fa-tip fa-tip--end" data-tip="Без движения остаётся мягкое мерцание">Без движения: пульс</span></div></article>
    <article class="fa-card pv-stack"><b class="fa-card__title">Индикаторы</b><div class="pv-row"><span class="fa-falcon-loader"><span class="fa-mark" style="height:30px"></span></span><button class="fa-btn fa-btn--default" aria-busy="true">Сохранение</button></div><div class="fa-bar"><i style="--p:45%"></i></div><span class="fa-t-caption">Сокол для страниц, кольцо для кнопок, полоса для измеримого.</span></article></div></div>`,
  after(root) {
    const set = (v) => { loaded = v; $('#lb', root).innerHTML = loadingBody(v); };
    bindSeg(root, 'ls', (v) => { clearTimeout(loadTimer); set(v === 'd'); });
    $('#lp', root).addEventListener('click', () => { const s = $('#ls', root); clearTimeout(loadTimer); set(false); $$('button', s).forEach((b, i) => b.setAttribute('aria-pressed', String(i === 0))); s.style.setProperty('--i', 0);
      loadTimer = setTimeout(() => { set(true); $$('button', s).forEach((b, i) => b.setAttribute('aria-pressed', String(i === 1))); s.style.setProperty('--i', 1); }, 2200); });
  } };
}

/* ---------- page: falcon ---------- */
let minW = 192, product = '';
function pFalcon(sub = 'logo') {
  let body = '', after = () => {};
  if (sub === 'logo') body = `<div class="pv-grid" style="--min:260px">${[['light', 'На светлом: navy'], ['island', 'На тёмном: белый'], ['gold', 'Янтарь на тёмном'], ['accent', 'Тёмный на янтаре']].map(([k, n]) => `<figure class="pv-fig"><div class="pv-surface pv-surface--${k}"><span class="fa-lockup" role="img" aria-label="Falcon AI"></span></div><figcaption><span class="fa-t-caption">${n}</span></figcaption></figure>`).join('')}
    <figure class="pv-fig"><div class="pv-surface pv-surface--island"><span class="fa-mark" style="height:56px;color:var(--fa-color-island-accent)" role="img" aria-label="Знак"></span></div><figcaption><span class="fa-t-caption">Знак от 48 px</span></figcaption></figure></div>
    <p class="fa-t-caption">Только исходный SVG. Меняется цвет, форма нет. Navy #0E3B5D живёт только в логотипе на светлом.</p>`;
  if (sub === 'space') body = `<div class="pv-split"><div class="fa-card pv-stack"><div class="pv-row"><span class="pv-label">Охранное поле</span>${seg('cl', [['off', 'Скрыть'], ['on', 'Показать']], 'on')}</div>
    <div class="fa-field"><label for="mw">Ширина lockup <b class="pv-num" id="mwv">${minW}</b> px</label><input id="mw" type="range" class="pv-range" min="96" max="360" value="${minW}"></div>
    <div id="mwn"></div><p class="fa-t-caption" style="margin:0">Поле 0,5 высоты знака со всех сторон. Минимум lockup 192 px, ниже только знак.</p></div>
    <div class="fa-card"><div class="pv-stage" style="min-height:240px;overflow:auto"><span class="pv-clear" id="pc" data-on><span class="fa-lockup" id="pl" role="img" aria-label="Falcon AI"></span></span></div></div></div>`;
  if (sub === 'space') after = (root) => { const pl = $('#pl', root), pc = $('#pc', root), n = $('#mwn', root), upd = () => { const h = minW / (1571 / 198); pc.style.fontSize = h + 'px'; $('#mwv', root).textContent = minW; n.innerHTML = minW < 192 ? `<span class="fa-badge fa-badge--warning">${svg('alert')}Ниже 192 px: берите знак</span>` : '<span class="fa-badge fa-badge--success">Размер допустим</span>'; }; upd();
    $('#mw', root).addEventListener('input', (e) => { minW = +e.target.value; upd(); }); bindSeg(root, 'cl', (v) => pc.toggleAttribute('data-on', v === 'on')); };
  if (sub === 'everywhere') body = `<div class="pv-grid" style="--min:250px">
    <figure class="pv-fig"><div class="fa-island pv-portrait"><div class="fa-sidebar__falcon" aria-hidden="true"><img src="../assets/falcon/falcon-sidebar.webp" alt=""></div><span class="fa-lockup" style="height:22px;position:relative;z-index:2"></span></div><figcaption><span class="fa-t-caption">Портрет в сайдбаре</span></figcaption></figure>
    <figure class="pv-fig"><div class="fa-island fa-watermark pv-surface" style="min-height:200px"><b class="fa-t-title">Водяной знак</b></div><figcaption><span class="fa-t-caption">Водяной знак</span></figcaption></figure>
    <figure class="pv-fig"><div class="fa-card fa-card--empty" style="min-height:200px"><span class="fa-mark"></span><b class="fa-card__title">Пусто</b></div><figcaption><span class="fa-t-caption">Пустые состояния</span></figcaption></figure>
    <figure class="pv-fig"><div class="pv-surface fa-card"><span class="fa-falcon-loader"><span class="fa-mark" style="height:34px"></span></span></div><figcaption><span class="fa-t-caption">Загрузчик страницы</span></figcaption></figure>
    <figure class="pv-fig"><div class="pv-surface fa-card"><div class="pv-row"><span class="fa-avatar fa-avatar--lg"><span class="fa-mark" style="height:22px"></span></span><span class="fa-avatar"><span class="fa-mark"></span></span><span class="fa-avatar fa-avatar--sm"><span class="fa-mark" style="height:10px"></span></span></div></div><figcaption><span class="fa-t-caption">Аватар без фото</span></figcaption></figure>
    <figure class="pv-fig"><div class="pv-surface fa-card"><div class="pv-favs">${[64, 32, 16].map((s) => `<span class="pv-fav" style="width:${s}px;height:${s}px"><span class="fa-mark" style="height:${Math.round(s * 0.36)}px"></span></span>`).join('')}</div></div><figcaption><span class="fa-t-caption">Иконка 16-32 px</span></figcaption></figure>
    <figure class="pv-fig"><div class="pv-surface fa-card"><div class="fa-toast" data-in style="position:static"><span class="fa-mark" style="height:14px;color:var(--fa-color-island-accent)"></span><span>Сохранено</span></div></div><figcaption><span class="fa-t-caption">Знак в уведомлениях</span></figcaption></figure>
    <figure class="pv-fig"><div class="pv-surface fa-card"><div class="pv-row"><span class="fa-icon-chip"><span class="fa-mark" style="height:18px"></span></span><b class="fa-t-label">Falcon Driver</b></div></div><figcaption><span class="fa-t-caption">Знак продукта</span></figcaption></figure></div>`;
  return { html: `${head(pills(P('falcon').sub, sub, 'falcon'))}<div class="pv-enter"><div style="--i:0">${body}</div></div>`, after(root) { after(root); } };
}

/* ---------- page: contrast ---------- */
let cf = { th: 'all', fail: false };
function pContrast() {
  const rows = ct.results.filter((r) => (cf.th === 'all' || r.theme.startsWith(cf.th)) && (!cf.fail || !r.pass));
  const rules = Object.keys(ct.minByRule);
  return { html: `<div class="pv-head">${seg('cth', [['all', 'Все'], ['light', 'Светлая'], ['dark', 'Тёмная']], cf.th)}<div class="pv-tools"><label class="pv-row pv-label"><span class="fa-switch"><input type="checkbox" role="switch" id="cfail" ${cf.fail ? 'checked' : ''} aria-label="Только ошибки"><span></span></label>Только ошибки</label></div></div>
    <div class="pv-enter"><div class="pv-grid" style="--min:150px;--i:0">${rules.map((k) => `<div class="fa-card fa-card--stat" style="padding:var(--fa-space-4)"><span class="fa-t-caption">${k}</span><span class="fa-t-kpi" style="font-size:24px">${ct.minByRule[k]}</span><span class="fa-badge fa-badge--success">минимум</span></div>`).join('')}</div>
    <div class="fa-card" style="margin-top:var(--fa-space-4);--i:1"><div class="fa-card__head"><b class="fa-card__title">${rows.length} из ${ct.checks}</b><span class="fa-badge ${ct.results.every((r) => r.pass) ? 'fa-badge--success' : 'fa-badge--danger'}">${ct.results.every((r) => r.pass) ? 'ошибок нет' : 'есть ошибки'}</span></div>
    <div class="pv-table-wrap"><table class="fa-table" data-density="compact"><thead><tr><th>Тема</th><th>Правило</th><th>Элемент</th><th>Фон</th><th>Контраст</th><th>Нужно</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${r.theme}</td><td>${r.rule}</td><td><span class="pv-chip" style="background:${r.fgHex}"></span>${r.fg}</td><td><span class="pv-chip" style="background:${r.bgHex}"></span>${r.bg}</td><td class="pv-num">${r.ratio.toFixed(2)}</td><td class="pv-num">${r.min}</td></tr>`).join('')}</tbody></table></div></div></div>`,
  after(root) { bindSeg(root, 'cth', (v) => { cf.th = v; route(); }); $('#cfail', root).addEventListener('change', (e) => { cf.fail = e.target.checked; route(); }); } };
}

/* ---------- page: rules ---------- */
function pRules() {
  const ok = [['Янтарь до 5% экрана', 'Главная кнопка, активная вкладка, фокус.'], ['Одна янтарная кнопка на экран', 'Остальное второстепенное.'], ['Текст на янтаре тёмный', 'Белый на янтаре запрещён.'], ['Чип: тёмный текст и точка', 'У критичных ещё иконка.'], ['Кнопки, поля, чипы pill', 'Карточки 24, острова 32.'], ['Вложенный радиус = внешний минус отступ', 'Не меньше 6 px.'], ['Сокол в сайдбаре, пустых и загрузке', 'Знак только исходный SVG.'], ['Skeleton вместо пустоты', 'Shimmer через transform.'], ['Однотипные карточки в ряду одного размера', 'Разные виды: свой размер, ряд одной высоты.']];
  const no = [['Тёмно-синий фон', 'Тёмное это почти чёрный нейтраль.'], ['Градиенты в фонах', 'Маска у shimmer единственное исключение.'], ['Янтарный текст на светлом', 'Янтарь только заливка, рамка, иконка.'], ['Фиолетовый и цвет для AI', 'AI это подпись и искра.'], ['Обводки, блеск и объём на кнопках', 'Только плоская заливка.'], ['Tektur мельче 20 px', 'И для обычного текста.'], ['Растянутый или обведённый логотип', 'Без свечения, 3D-сокол не логотип.'], ['transition: all', 'Только transform и opacity.'], ['Однотипные карточки разного размера в ряду', 'Ни по ширине, ни по высоте.']];
  const cell = ([t, d], cls, icon, i) => `<div class="fa-card pv-rule pv-rule--${cls} fa-lift" style="--i:${i};padding:var(--fa-space-4)"><span class="pv-mini-ic">${svg(icon)}</span><div><b class="fa-t-label">${t}</b><span class="fa-t-caption">${d}</span></div></div>`;
  return { html: `<div class="pv-pairs pv-enter"><b class="fa-t-section pv-pairs__head" style="--i:0">Делаем</b><b class="fa-t-section pv-pairs__head" style="--i:0">Не делаем</b>${ok.map((x, i) => cell(x, 'ok', 'check', i + 1) + cell(no[i], 'no', 'x', i + 1)).join('')}</div>`, after() {} };
}

/* ---------- page: install ---------- */
const SNIP = {
  html: `<link rel="stylesheet" href="dist/css/falcon.css">

<body class="fa-app" data-theme="light">
  <button class="fa-btn fa-btn--default">Запросить сертификат</button>
  <span class="fa-badge fa-badge--danger">Истекла</span>
</body>

/* тема: data-theme="light|dark" на любом элементе.
   Без атрибута действует тема системы. */`,
  tailwind: `@import "tailwindcss";
@import "./dist/css/fonts.css";
@import "./dist/css/tokens.css";
@import "./dist/tailwind/theme.css";

/* bg-canvas, bg-card, text-text-2, bg-accent, text-on-accent,
   font-display, rounded-pill, rounded-card, shadow-card */`,
  flutter: `import 'falcon_theme.dart';

MaterialApp(
  theme: falconTheme(Brightness.light),
  darkTheme: falconTheme(Brightness.dark),
  themeMode: ThemeMode.system,
);

// цвета вне Material: Theme.of(context).extension<FalconColors>()!.island
// шрифты: TTF в assets, см. pubspec_fonts.yaml`,
  tokens: `tokens/tokens.json   единственный источник
  primitive   палитра
  semantic    light и dark, имена одинаковы
  product     переопределяется только акцент

node scripts/build.mjs
  dist/css/tokens.css        переменные --fa-*
  dist/tailwind/theme.css    @theme inline
  dist/flutter/falcon_theme.dart
  dist/tokens.flat.json
  dist/contrast.json         сборка падает при ошибке`,
};
function pInstall(sub = 'html') {
  if (sub === 'open') return { after(root) { bindSeg(root, 'prod', (v) => { product = v; document.documentElement.toggleAttribute('data-product', !!v); if (v) document.documentElement.setAttribute('data-product', v); }); }, html: `${head(pills(P('install').sub, sub, 'install'))}<div class="pv-grid pv-enter" style="--min:300px">
    <article class="fa-card pv-stack" style="--i:0"><b class="fa-card__title">Янтарь или золото</b>${(() => { const th = curTheme(), g = flat.color[th], am = flat.products.gold[th]; return `<div class="pv-row"><div class="fa-swatch" style="background:${g.accent};width:130px"><span class="fa-badge fa-badge--plain">янтарь ${g.accent}</span></div><div class="fa-swatch" style="background:${am.accent};width:130px"><span class="fa-badge fa-badge--plain">золото ${am.accent}</span></div></div>`; })()}<div class="pv-row"><span class="pv-label">Весь брендбук</span>${seg('prod', [['', 'Янтарь'], ['gold', 'Золото']], product)}</div><span class="fa-card__sub">Основной акцент янтарь, как в Agents и Vitrino. Золото брендбука осталось как product.gold для сравнения: один блок токенов, контраст проверяется сборкой.</span></article>
    ${[['Знак 16-32 px', 'Нужна упрощённая версия от дизайнера, иконки приложений тоже.'], ['Шрифты для Flutter', 'Нужны TTF: woff2 из fonts/ надо конвертировать.'], ['Что дальше', 'React-обёртки, диалоги, графики, мобильные паттерны.']].map(([t, d], i) => `<article class="fa-card pv-stack" style="--i:${i + 1}"><b class="fa-card__title">${t}</b><span class="fa-card__sub">${d}</span></article>`).join('')}</div>` };
  return { html: `${head(pills(P('install').sub, sub, 'install'))}<div class="pv-enter"><div style="--i:0">${code(SNIP[sub])}</div></div>`,
    after(root) { $('[data-copy-code]', root).addEventListener('click', (e) => { flashMorph(e.currentTarget); copyText(SNIP[sub], 'Код скопирован'); }); } };
}

/* ---------- router ---------- */
const RENDER = { overview: pOverview, color: pColor, type: pType, shape: pShape, cards: pCards, components: pComponents, motion: pMotion, loading: pLoading, falcon: pFalcon, contrast: pContrast, rules: pRules, install: pInstall };
let lastPage = null;
function parse() { const [, id = 'overview', sub] = location.hash.split('/'); const p = PAGES.find((x) => x.id === id) || PAGES[0]; const okSub = sub && (p.sub?.some(([x]) => x === sub) || (p.id === 'illustrations' && /^FAI-\d{3}$/.test(sub)));
  return { p: (EMBED && p.id === 'responsive') ? PAGES[0] : p, sub: okSub ? sub : p.sub?.[0][0] }; }
function route() {
  if (!flat) return;
  const { p, sub } = parse(), root = $('#page'), top = root.scrollTop;
  const r = RENDER[p.id](sub);
  root.innerHTML = r.html; if (window.FaSelect) FaSelect.enhance(root); r.after(root);
  $('#crumb').textContent = p.t;
  if (MORE.includes(p.id) && $('#more') && $('#more').getAttribute('aria-expanded') !== 'true') setMore(true);
  document.title = `${p.t} · Falcon Design System`;
  $$('.fa-nav-item', $('#nav')).forEach((a) => {
    const on = a.dataset.id === p.id;
    if (on && !a.hasAttribute('aria-current')) a.setAttribute('aria-current', 'page');
    if (!on) a.removeAttribute('aria-current');
  });
  if (lastPage === p.id) root.scrollTop = top; else root.scrollTop = 0;
  lastPage = p.id;
  $('#shell').removeAttribute('data-menu');
}

/* ---------- shell wiring ---------- */
const MORE = ['contrast', 'rules', 'install'];
function navItem(p) {
  return `<a class="fa-nav-item" data-id="${p.id}" href="#/${p.id}">${p.i === 'falcon' ? '<span class="fa-mark" style="height:18px;width:43px;margin-left:-6px"></span>' : ic(p.i)}<span>${p.t}</span></a>`;
}
function buildNav() {
  let g = '', html = '';
  for (const p of PAGES.filter((x) => !MORE.includes(x.id))) {
    if (p.g && p.g !== g) { g = p.g; html += `<div class="fa-nav-label">${p.g}</div>`; }
    html += navItem(p);
  }
  const open = store.get('fa-more', '0') === '1';
  html += `<button class="fa-nav-more" id="more" aria-expanded="${open}" aria-controls="more-body"><span>Дополнительно</span>${svg('chevD')}</button>
    <div class="fa-nav-more__body" id="more-body" ${open ? 'data-open' : ''}><div>${PAGES.filter((x) => MORE.includes(x.id)).map(navItem).join('')}</div></div>`;
  $('#nav').innerHTML = html;
  $('#more').addEventListener('click', () => setMore($('#more').getAttribute('aria-expanded') !== 'true'));
  navBar();
}
function setMore(v) {
  $('#more').setAttribute('aria-expanded', String(v));
  $('#more-body').toggleAttribute('data-open', v);
  store.set('fa-more', v ? '1' : '0');
}
function setCollapsed(v) {
  const sh = $('#shell'); sh.toggleAttribute('data-collapsed', v);
  const b = $('#collapse'); b.innerHTML = ic(v ? 'chevR' : 'chevL'); b.setAttribute('aria-expanded', String(!v));
  b.dataset.tip = v ? 'Развернуть панель' : 'Свернуть панель'; b.setAttribute('aria-label', b.dataset.tip);
  $$('#nav .fa-nav-item').forEach((a) => { a.removeAttribute('title'); if (v) { a.dataset.tip = a.textContent.trim(); a.dataset.tipSide = 'right'; } else { delete a.dataset.tip; delete a.dataset.tipSide; } });
  store.set('fa-collapsed', v ? '1' : '0');
}
function setTheme(m) {
  const r = document.documentElement; if (m === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', m);
  const el = $('#theme'); $$('button', el).forEach((b, i) => { const on = b.dataset.themeSet === m; b.setAttribute('aria-pressed', String(on)); if (on) el.style.setProperty('--i', i); });
  store.set('fa-theme', m); if (flat) route();
}
function palette() {
  const dlg = $('#palette'), q = $('#palette-q'), list = $('#palette-list'); let sel = 0, items = [];
  const all = PAGES.flatMap((p) => [[`#/${p.id}`, p.t, p.g || ''], ...(p.sub || []).map(([s, l]) => [`#/${p.id}/${s}`, `${p.t} · ${l}`, ''])]).concat(FaIllu.data ? FaIllu.data.items.map((i) => [`#/illustrations/${i.id}`, `${i.id} ${i.title}`, 'иллюстрация']) : []);
  const draw = () => { const t = q.value.trim().toLowerCase(); items = all.filter((x) => x[1].toLowerCase().includes(t)).slice(0, 12); sel = Math.min(sel, Math.max(0, items.length - 1));
    list.innerHTML = items.map((x, i) => `<button class="pv-palette__item" role="option" aria-selected="${i === sel}" data-h="${x[0]}">${esc(x[1])}<small>${x[2]}</small></button>`).join('') || '<div class="fa-t-caption" style="padding:var(--fa-space-3)">Ничего не найдено</div>'; };
  const go = (h) => { dlg.close(); location.hash = h; };
  const open = () => { q.value = ''; sel = 0; draw(); dlg.showModal(); q.focus(); };
  $('#open-palette').addEventListener('click', open);
  addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dlg.open ? dlg.close() : open(); } });
  q.addEventListener('input', () => { sel = 0; draw(); });
  q.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, items.length - 1); draw(); e.preventDefault(); } if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); draw(); e.preventDefault(); } if (e.key === 'Enter' && items[sel]) go(items[sel][0]); });
  list.addEventListener('click', (e) => { const b = e.target.closest('[data-h]'); if (b) go(b.dataset.h); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
}
function keyNav() {
  addEventListener('keydown', (e) => {
    const t = e.target;
    if (t.closest?.('[role="tablist"]') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      const tabs = $$('[role="tab"]', t.closest('[role="tablist"]')), i = tabs.indexOf(t); if (i < 0) return;
      const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); if (n.href) location.hash = n.getAttribute('href'); else n.click(); e.preventDefault();
    }
    if (t.closest?.('#nav') && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      const it = $$('.fa-nav-item', $('#nav')), i = it.indexOf(t); if (i < 0) return;
      it[(i + (e.key === 'ArrowDown' ? 1 : it.length - 1)) % it.length].focus(); e.preventDefault();
    }
  });
}

async function init() {
  $$('[data-icon]').forEach((el) => { el.innerHTML = svg(el.dataset.icon); });
  $('#menu').innerHTML = ic('menu');
  buildNav();
  setCollapsed(store.get('fa-collapsed', '0') === '1');
  $('#collapse').addEventListener('click', () => setCollapsed(!$('#shell').hasAttribute('data-collapsed')));
  $('#menu').addEventListener('click', () => $('#shell').toggleAttribute('data-menu'));
  $$('#theme button').forEach((b) => b.addEventListener('click', () => setTheme(b.dataset.themeSet)));
  setTheme(store.get('fa-theme', 'auto'));
  const ZOOM = { 0.8: 0.9, 1: 1, 1.45: 1.3 };
  const setScale = (v) => { $('#page').style.setProperty('--pv-scale', v); $('#page').style.setProperty('--pv-zoom', ZOOM[v] ?? 1); const b = $$('#size button'); b.forEach((x, i) => { const on = x.dataset.scale === String(v); x.setAttribute('aria-pressed', String(on)); if (on) $('#size').style.setProperty('--i', i); }); store.set('fa-scale', String(v)); };
  $$('#size button').forEach((b) => b.addEventListener('click', () => setScale(b.dataset.scale)));
  setScale(store.get('fa-scale', '1'));
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (!document.documentElement.dataset.theme) route(); });
  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-copy-code]'); if (c) return;
    if (e.target.closest('#sidebar') === null && !e.target.closest('#menu') && $('#shell').hasAttribute('data-menu')) $('#shell').removeAttribute('data-menu');
  });
  [flat, ct] = await Promise.all(['../dist/tokens.flat.json', '../dist/contrast.json'].map((u) => fetch(u).then((r) => r.json())));
  await FaIllu.load();
  if (EMBED) document.documentElement.setAttribute('data-embed', '');
  palette(); keyNav();
  addEventListener('hashchange', route);
  route();
}
init();

/* The nav scrolls vertically. A scrollbar would eat the width that lets the active tab reach the island edge,
   so the position is drawn by a thin overlay thumb that does not take layout space. */
function navBar() {
  const nav = $('#nav'); let bar = $('#navbar');
  if (!bar) { bar = document.createElement('i'); bar.id = 'navbar'; bar.className = 'fa-navbar'; nav.parentNode.appendChild(bar); }
  let t;
  const upd = (flash) => {
    const over = nav.scrollHeight - nav.clientHeight > 1;
    bar.hidden = !over; if (!over) return;
    const r = nav.clientHeight / nav.scrollHeight;
    bar.style.height = Math.max(24, nav.clientHeight * r) + 'px';
    bar.style.transform = `translateY(${nav.offsetTop + (nav.scrollTop / nav.scrollHeight) * nav.clientHeight}px)`;
    if (flash) { bar.dataset.on = ''; clearTimeout(t); t = setTimeout(() => delete bar.dataset.on, 900); }
  };
  nav.addEventListener('scroll', () => upd(true), { passive: true });
  new ResizeObserver(() => upd(false)).observe(nav);
  upd(false);
}
