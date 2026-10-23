'use strict';
/* Illustrations and Responsive pages. Loaded after app.js and uses its helpers. */
const IL = { sec: 'all', q: '', ctx: null, pal: 'auto', sample: 'FAI-089' };
const STATE_NAME = { empty: 'пусто', problem: 'проблема', success: 'успех', waiting: 'ожидание', neutral: 'сведения' };
const ilFiltered = () => FaIllu.data.items.filter((i) => (IL.sec === 'all' || String(i.section) === String(IL.sec)) && (!IL.q || `${i.id} ${i.title} ${i.scenario}`.toLowerCase().includes(IL.q.toLowerCase())));
const ilBar = () => `<div class="pv-tools" style="flex:1">
  <select class="fa-select" id="il-sec" aria-label="Раздел каталога" style="width:auto;min-width:240px;max-width:100%"><option value="all">Все разделы (${FaIllu.data.count})</option>${FaIllu.data.sections.map((s) => `<option value="${s.n}" ${String(IL.sec) === String(s.n) ? 'selected' : ''}>${s.n}. ${esc(s.title)}</option>`).join('')}</select>
  <input class="fa-input" id="il-q" placeholder="Поиск: 404, архив, лупа" aria-label="Поиск по каталогу" value="${esc(IL.q)}" style="width:220px">
  <span class="fa-badge" id="il-n"></span></div>`;
const illuCard = (i) => `<a class="fa-card fa-card--action pv-illu" href="#/illustrations/${i.id}" style="text-decoration:none;padding:var(--fa-space-3)"><div class="fa-slot fa-slot--square">${FaIllu.art(i.id)}</div><div class="pv-illu__meta"><span class="fa-t-id fa-muted">${i.id}</span><b class="fa-t-label pv-clamp">${esc(i.title)}</b></div></a>`;
const ctxBadges = (i) => FaIllu.contexts(i).map((c) => `<span class="fa-badge">${FaIllu.CONTEXT_NAMES[c]}</span>`).join(' ');

function bindIlBar(root, redraw) {
  const upd = () => { const n = ilFiltered().length; $('#il-n', root).textContent = `${n} из ${FaIllu.data.count}`; redraw(); };
  $('#il-sec', root).addEventListener('change', (e) => { IL.sec = e.target.value; upd(); });
  $('#il-q', root).addEventListener('input', (e) => { IL.q = e.target.value; upd(); });
  upd();
}

/* ---------- devices: real iframes, so media queries behave as on the device ---------- */
const DEV = [['phone', 390, 800, 'Телефон 390'], ['tablet', 820, 800, 'Планшет 820'], ['desktop', 1280, 760, 'Ноутбук 1280']];
let devRO = null;
function devFrames(srcFor, devs = DEV) {
  return `<div class="pv-devs">${devs.map(([k, w, h, n]) => `<figure class="pv-dev" data-w="${w}" data-h="${h}"><div class="pv-dev__screen"><iframe title="${n}" loading="lazy" scrolling="no" tabindex="-1" src="${srcFor(k)}" style="width:${w}px;height:${h}px"></iframe></div><figcaption class="fa-t-caption">${n}</figcaption></figure>`).join('')}</div>`;
}
function fitDevs(root) {
  const box = $('.pv-devs', root); if (!box) return;
  const figs = $$('.pv-dev', box), gap = 16, sumW = figs.reduce((a, f) => a + +f.dataset.w, 0);
  const avail = box.clientWidth - gap * (figs.length - 1);
  // hysteresis: a page scrollbar that appears after stacking must not flip the layout back and forth
  const was = !box.classList.contains('pv-devs--stack');
  const together = figs.length === 1 || avail / sumW >= (was ? 0.27 : 0.33);
  box.classList.toggle('pv-devs--stack', !together);
  figs.forEach((f) => {
    const w = +f.dataset.w, h = +f.dataset.h;
    const s = together ? Math.min(figs.length === 1 ? 1 : 0.7, avail / sumW) : Math.min(1, box.clientWidth / w);
    const sc = $('.pv-dev__screen', f); sc.style.width = Math.round(w * s) + 'px'; sc.style.height = Math.round(h * s) + 'px';
    $('iframe', f).style.transform = `scale(${s})`;
  });
  box.setAttribute('data-fit', '');
}
function watchDevs(root) {
  if (devRO) devRO.disconnect();
  const box = $('.pv-devs', root); if (!box) return;
  let lastW = -1;
  // refit only when the width really changed: a height-only change must not feed back into the scale
  devRO = new ResizeObserver(() => { const w = box.clientWidth; if (Math.abs(w - lastW) > 1) { lastW = w; fitDevs(root); } });
  devRO.observe(box); lastW = box.clientWidth; fitDevs(root);
}
const themeQ = () => (document.documentElement.dataset.theme ? `&theme=${document.documentElement.dataset.theme}` : '');
const prodQ = () => (document.documentElement.dataset.product ? `&product=${document.documentElement.dataset.product}` : '');

/* ---------- illustrations ---------- */
function pIllustrations(sub = 'catalog') {
  if (/^FAI-\d{3}$/.test(sub)) return illuDetail(sub);
  const tabs = head(pills(P('illustrations').sub, sub, 'illustrations'), sub === 'catalog' || sub === 'scenarios' ? ilBar() : '');
  if (sub === 'catalog') return { html: `${tabs}<div class="pv-grid pv-grid--illu" id="il-grid" style="--min:170px"></div>`, after(root) { bindIlBar(root, () => { $('#il-grid', root).innerHTML = ilFiltered().map(illuCard).join('') || '<p class="fa-muted">Ничего не найдено</p>'; }); } };
  if (sub === 'scenarios') return { html: `${tabs}<div class="fa-card" style="padding:0;overflow:hidden"><div class="pv-table-wrap" style="max-height:calc(100vh - 230px)"><table class="fa-table pv-scen" data-density="compact"><thead><tr><th>ID</th><th>Иллюстрация</th><th>Продукт</th><th>Где показывать</th><th>Сюжет и место применения (текст каталога)</th><th>Ограничения</th></tr></thead><tbody id="il-rows"></tbody></table></div></div>`,
    after(root) { bindIlBar(root, () => { $('#il-rows', root).innerHTML = ilFiltered().map((i) => `<tr><td><a class="fa-link fa-t-id" href="#/illustrations/${i.id}">${i.id}</a></td><td><b class="fa-t-label">${esc(i.title)}</b></td><td>${esc(i.product)}</td><td class="pv-wrapcell">${ctxBadges(i)}</td><td class="pv-wrapcell">${esc(i.scenario)}</td><td class="pv-wrapcell">${i.limits.map(esc).join('; ') || '<span class="fa-muted">общие правила</span>'}</td></tr>`).join(''); }); } };
  if (sub === 'palettes') {
    const cells = [['Светлая', 'data-theme="light"', 'fa-slot--wide'], ['Тёмная', 'data-theme="dark"', 'fa-slot--wide'], ['Остров', 'data-theme="light"', 'fa-slot--wide fa-island'], ['Золото брендбука, светлая', 'data-theme="light" data-product="gold"', 'fa-slot--wide'], ['Золото брендбука, тёмная', 'data-theme="dark" data-product="gold"', 'fa-slot--wide'], ['Карточка на холсте', 'data-theme="light"', 'fa-slot--wide pv-onCard']];
    return { html: `${tabs}<div class="pv-head" style="margin-top:calc(var(--fa-space-2) * -1)"><div class="pv-tools"><span class="pv-label">Пример</span><select class="fa-select" id="pal-s" aria-label="Пример" style="width:auto;min-width:260px">${FaIllu.data.items.map((i) => `<option value="${i.id}" ${i.id === IL.sample ? 'selected' : ''}>${i.id} ${esc(i.title)}</option>`).join('')}</select></div></div>
      <div class="pv-grid" id="pal-grid" style="--min:300px">${cells.map(([n, attr, cls], k) => `<article class="fa-card pv-stack" ${attr} style="background:var(--fa-color-canvas)"><div class="fa-slot ${cls}" data-k="${k}" style="${cls.includes('onCard') ? 'background:var(--fa-color-card)' : ''}"></div><b class="fa-t-label">${n}</b></article>`).join('')}</div>
      <p class="fa-t-caption" style="margin:var(--fa-space-4) 0 0">Цвета берутся из токенов через --illustration-*: контур это text, заливка смесь text и card, светлые детали inset, акцент accent, поверхности card, кожа illu-skin. Нужна другая палитра, меняется только слот product.</p>`,
      after(root) { const draw = () => { $$('.fa-slot[data-k]', root).forEach((el) => { el.innerHTML = FaIllu.art(IL.sample); }); }; draw(); $('#pal-s', root).addEventListener('change', (e) => { IL.sample = e.target.value; draw(); }); } };
  }
  const R = [
    ['Hero отдельно', 'FAI-001...008 крупные композиции для лендингов. Их не уменьшают в карточки и пустые состояния, для компактных мест есть свои позиции.'],
    ['Плейсхолдеры отдельно', 'FAI-025...040 рассчитаны на карточки и медиаконтейнеры. Один SVG вписывается в квадрат, горизонталь и вертикаль, это не три рисунка.'],
    ['Загрузка это skeleton', 'Рисунок никогда не изображает «идёт загрузка». Для ожидания есть skeleton, shimmer и прогресс.'],
    ['Текст снаружи', 'Коды ошибок, заголовки, кнопки, суммы и даты пишет интерфейс. В рисунке текста нет.'],
    ['Доступность', 'Рядом с текстом обёртка получает aria-hidden="true". Если рисунок сам несёт смысл, role="img" и aria-label.'],
    ['Палитра из токенов', 'Inline SVG красится переменными --illustration-*. Обычный img их не наследует, для него готовы варианты assets/illustrations/light и dark.'],
    ['Правдивость состояния', 'Успех показывают только после фактического успеха. Ошибка, отсутствие и ожидание это разные рисунки.'],
    ['Не путать пары', FaIllu.data.items[16] ? '017 и 092, 101 и 103, 005 и 081, 012 и 068, 044 и 111, 035 и 036, 039 и 059.' : ''],
    ['Статус набора', 'Все 128 иллюстраций утверждены владельцем.'],
  ];
  return { html: `${tabs}<div class="pv-grid" style="--min:290px">${R.map(([t, d]) => `<article class="fa-card pv-stack"><b class="fa-card__title">${t}</b><span class="fa-card__sub">${d}</span></article>`).join('')}</div>
    <div class="pv-grid" style="--min:420px;margin-top:var(--fa-space-4)"><div>${code(`<span class="fa-illu" aria-hidden="true">\n  <!-- содержимое assets/illustrations/svg/FAI-041.svg -->\n</span>`)}</div><div>${code(`<img src="assets/illustrations/dark/FAI-041.svg" alt="" width="240" height="240">\n\n# обновить набор из каталога\nnode scripts/sync-illustrations.mjs`)}</div></div>`, after(root) { $$('[data-copy-code]', root).forEach((b) => b.addEventListener('click', () => { flashMorph(b); copyText($('pre', b.parentElement).textContent, 'Код скопирован'); })); } };
}

let ilPalDetail = 'auto';
function illuDetail(id) {
  const it = FaIllu.byId[id];
  if (!it) return { html: '<p>Иллюстрация не найдена</p>', after() {} };
  const items = FaIllu.data.items, k = items.findIndex((x) => x.id === id), prev = items[k - 1], next = items[k + 1];
  const ctxs = FaIllu.contexts(it); const ctx = ctxs.includes(IL.ctx) ? IL.ctx : ctxs[0]; IL.ctx = ctx;
  const sec = FaIllu.data.sections.find((s) => s.n === it.section);
  const stageAttr = ilPalDetail === 'island' ? '' : ilPalDetail === 'auto' ? '' : `data-theme="${ilPalDetail}"`;
  const stageCls = ilPalDetail === 'island' ? 'fa-island' : '';
  const info = `<div class="pv-stack">
    <div class="pv-row"><span class="fa-badge">${esc(it.product)}</span><span class="fa-badge">${STATE_NAME[it.state]}</span></div>
    <div><b class="fa-t-label">Сюжет и место применения</b><p class="fa-t-body" style="margin:var(--fa-space-1) 0 0">${esc(it.scenario)}</p></div>
    <div><b class="fa-t-label">Раздел каталога</b><p class="fa-t-caption" style="margin:2px 0 0">${sec ? sec.n + '. ' + esc(sec.title) : ''}</p></div>
    <div><b class="fa-t-label">Ограничения</b>${it.limits.length ? `<ul class="pv-list">${it.limits.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : '<p class="fa-t-caption" style="margin:2px 0 0">Особых нет, действуют общие правила набора.</p>'}</div>
    ${it.related ? `<div><b class="fa-t-label">Не путать с</b><ul class="pv-list">${it.related.map((r) => `<li><a class="fa-link" href="#/illustrations/${r.id}">${r.id} ${esc(FaIllu.byId[r.id].title)}</a> <span class="fa-t-caption">${esc(r.why)}</span></li>`).join('')}</ul></div>` : ''}
    <div><b class="fa-t-label">Доступность</b><p class="fa-t-caption" style="margin:2px 0 0">Рядом с текстом: aria-hidden="true". Если рисунок один несёт смысл: role="img" и aria-label="${esc(it.title)}".</p></div>
    <div class="pv-row"><a class="fa-btn fa-btn--secondary fa-btn--sm" href="../assets/illustrations/${it.svg}" download>${svg('download')}SVG</a><a class="fa-btn fa-btn--secondary fa-btn--sm" href="../assets/illustrations/light/${it.id}.svg" download>${svg('download')}Светлая</a><a class="fa-btn fa-btn--secondary fa-btn--sm" href="../assets/illustrations/dark/${it.id}.svg" download>${svg('download')}Тёмная</a></div></div>`;
  return { html: `<div class="pv-head"><div class="pv-row"><a class="fa-btn fa-btn--secondary fa-btn--sm" href="#/illustrations/catalog">${svg('chevL')}Каталог</a><span class="fa-t-id">${it.id}</span><b class="fa-t-section">${esc(it.title)}</b></div>
      <div class="pv-row">${prev ? `<a class="fa-btn fa-btn--outline fa-btn--icon fa-btn--sm fa-tip fa-tip--below" data-tip="${prev.id}" aria-label="Предыдущая" href="#/illustrations/${prev.id}">${svg('chevL')}</a>` : ''}${next ? `<a class="fa-btn fa-btn--outline fa-btn--icon fa-btn--sm fa-tip fa-tip--below" data-tip="${next.id}" aria-label="Следующая" href="#/illustrations/${next.id}">${svg('chevR')}</a>` : ''}</div></div>
    <div class="pv-split pv-enter">
      <article class="fa-card pv-stack" style="--i:0"><div class="pv-row"><span class="pv-label">Подложка</span>${seg('il-pal', [['auto', 'Текущая'], ['light', 'Светлая'], ['dark', 'Тёмная'], ['island', 'Остров']], ilPalDetail)}</div>
        <div class="fa-slot fa-slot--square ${stageCls}" ${stageAttr} style="max-width:520px;margin-inline:auto;${ilPalDetail === 'island' ? 'background:var(--fa-color-island)' : 'background:var(--fa-color-card);box-shadow:var(--fa-shadow-image)'};border-radius:var(--fa-radius-card)">${FaIllu.art(id, '', it.title)}</div></article>
      <article class="fa-card" style="--i:1">${info}</article>
    </div>
    <section style="margin-top:var(--fa-space-5)"><div class="pv-head"><b class="fa-t-section">Сценарии использования</b><div class="fa-pills" id="il-ctx" role="tablist">${ctxs.map((c) => `<button class="fa-pill" role="tab" data-c="${c}" aria-selected="${c === ctx}">${FaIllu.CONTEXT_NAMES[c]}</button>`).join('')}</div></div>
      <div class="fa-card" style="padding:var(--fa-space-4)">${devFrames((k2) => `screen.html?ctx=${ctx}&id=${id}${themeQ()}${prodQ()}`)}<p class="fa-t-caption" style="margin:var(--fa-space-3) 0 0">Это живые экраны на ширине 390, 820 и 1280, поэтому адаптив работает как на устройстве. Тексты в примерах условные, настоящие пишет продукт.</p></div></section>`,
  after(root) {
    bindSeg(root, 'il-pal', (v) => { ilPalDetail = v; route(); });
    $$('#il-ctx .fa-pill', root).forEach((b) => b.addEventListener('click', () => { IL.ctx = b.dataset.c; route(); }));
    watchDevs(root);
  } };
}
RENDER.illustrations = pIllustrations;

/* ---------- responsive ---------- */
const RS = { page: 'overview', dev: 'all', land: false };
const RS_PAGES = [['overview', 'Обзор'], ['color/gold', 'Цвет'], ['cards/all', 'Карточки'], ['components/buttons', 'Элементы'], ['motion/flow', 'Движение'], ['loading', 'Загрузка'], ['falcon/everywhere', 'Сокол'], ['illustrations/catalog', 'Иллюстрации'], ['illustrations/FAI-041', 'Иллюстрация 404']];
function pResponsive(sub = 'screens') {
  const tabs = pills(P('responsive').sub, sub, 'responsive');
  if (sub === 'screens') {
    const spec = { phone: RS.land ? [844, 390] : [390, 844], tablet: RS.land ? [1180, 820] : [820, 1180], desktop: [1280, 800] };
    const names = { phone: 'Телефон', tablet: 'Планшет', desktop: 'Ноутбук' };
    const devs = Object.keys(spec).filter((d) => RS.dev === 'all' || RS.dev === d).map((d) => [d, spec[d][0], spec[d][1], `${names[d]} ${spec[d][0]}x${spec[d][1]}`]);
    const tools = `<select class="fa-select" id="rs-page" aria-label="Экран" style="width:auto;min-width:200px">${RS_PAGES.map(([v, l]) => `<option value="${v}" ${v === RS.page ? 'selected' : ''}>${l}</option>`).join('')}</select>${seg('rs-dev', [['all', 'Все'], ['phone', 'Телефон'], ['tablet', 'Планшет'], ['desktop', 'Ноутбук']], RS.dev)}${seg('rs-or', [['p', 'Портрет'], ['l', 'Альбом']], RS.land ? 'l' : 'p')}`;
    return { html: `${head(tabs, tools)}<div class="fa-card" style="padding:var(--fa-space-4)">${devFrames(() => `index.html?embed=1${RS.page.startsWith('illustrations') ? '' : ''}#/${RS.page}`, devs)}<p class="fa-t-caption" style="margin:var(--fa-space-3) 0 0">Окна живые: внутри тот же брендбук на реальной ширине экрана. Сайдбар на телефоне становится панелью, bento-сетка 12, 6, 1 колонка, подсказки только по фокусу.</p></div>`,
      after(root) {
        $('#rs-page', root).addEventListener('change', (e) => { RS.page = e.target.value; route(); });
        bindSeg(root, 'rs-dev', (v) => { RS.dev = v; route(); }); bindSeg(root, 'rs-or', (v) => { RS.land = v === 'l'; route(); });
        watchDevs(root);
      } };
  }
  if (sub === 'rules') {
    const rows = [['до 560 px', 'Телефон', 'Один столбец, переключатель размера карточек скрыт, подписи в тулбаре убраны'], ['до 760 px', 'Телефон и малый планшет', 'Сайдбар становится панелью по кнопке меню, поиск остаётся иконкой, bento-сетка в одну колонку'], ['761 до 1100 px', 'Планшет', 'Рельса 64 px или сайдбар 240 px, bento в 6 колонок, касания от 44 px'], ['от 1100 px', 'Ноутбук и широкий экран', 'Сайдбар-остров, bento в 12 колонок, строки таблицы 44 или 36']];
    return { html: `${head(tabs)}<div class="pv-grid" style="--min:300px">${rows.map(([b, n, d]) => `<article class="fa-card pv-stack"><div class="pv-row"><span class="fa-badge pv-num">${b}</span><b class="fa-t-label">${n}</b></div><span class="fa-card__sub">${d}</span></article>`).join('')}</div>
      <div class="pv-grid" style="--min:300px;margin-top:var(--fa-space-4)">${[['Сетки карточек', 'Колонки считаются по минимальной ширине карточки. Однотипные карточки в ряду одного размера на любом экране.'], ['Иллюстрации', 'Один SVG вписывается в квадрат, горизонталь и вертикаль. На телефоне рисунок над текстом и 55 до 70 процентов ширины.'], ['Тексты', 'Заголовок Tektur не мельче 20 px. Поля ввода 16 px на телефоне, чтобы браузер не увеличивал страницу.'], ['Наведение', 'Подъём карточек только при hover: hover и pointer: fine. На касании остаётся нажатие со сжатием 0,96.'], ['Подсказки', 'Мышь: через 350 мс. Клавиатура: сразу на фокусе. Касание: подсказка не заменяет подпись.'], ['Безопасные зоны', 'Нижние панели и главные кнопки учитывают safe area и экранную клавиатуру.']].map(([t, d]) => `<article class="fa-card pv-stack"><b class="fa-card__title">${t}</b><span class="fa-card__sub">${d}</span></article>`).join('')}</div>`, after() {} };
  }
  const T = [['44', 'Кнопка и поле', flat.size.control], ['48', 'Крупная кнопка и зона нажатия', flat.size['control-lg']], ['56', 'Главная кнопка водителя', flat.size['touch-primary']], ['36', 'Мелкая кнопка, только с мышью', flat.size['control-sm']]];
  return { html: `${head(tabs)}<div class="pv-grid" style="--min:260px">${T.map(([n, d, v]) => `<article class="fa-card pv-stack"><div class="pv-stage" style="min-height:120px"><button class="fa-btn fa-btn--default" style="min-height:${v}px;min-width:140px">${n} px</button></div><b class="fa-t-label">${d}</b><span class="fa-t-caption">Высота ${v} px, pill. Между соседними зонами не меньше 8 px.</span></article>`).join('')}</div>
    <div class="pv-grid" style="--min:300px;margin-top:var(--fa-space-4)">${[['Главное внизу', 'Главное действие в нижней трети экрана, в пределах досягаемости большого пальца.'], ['Нажатие', 'Сжатие до 0,96 за 120 мс подтверждает касание, без блеска и объёма.'], ['Зона 40 px', 'Если элемент визуально меньше, зона нажатия расширяется до 40 px через псевдоэлемент.']].map(([t, d]) => `<article class="fa-card pv-stack"><b class="fa-card__title">${t}</b><span class="fa-card__sub">${d}</span></article>`).join('')}</div>`, after() {} };
}
RENDER.responsive = pResponsive;
