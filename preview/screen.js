'use strict';
/* One illustration in one interface context: screen.html?ctx=error&id=FAI-041[&theme=dark][&product=gold].
   Texts are samples only. In a product the real text, code and buttons come from the interface. */
(async () => {
  const q = new URLSearchParams(location.search);
  const root = document.documentElement;
  let theme = q.get('theme');
  if (!theme) { try { theme = localStorage.getItem('fa-theme'); } catch (e) {} }
  if (theme && theme !== 'auto') root.setAttribute('data-theme', theme);
  if (q.get('product')) root.setAttribute('data-product', q.get('product'));

  await FaIllu.load();
  const id = q.get('id') || 'FAI-017';
  const it = FaIllu.byId[id] || FaIllu.data.items[0];
  const ctx = q.get('ctx') || FaIllu.contexts(it)[0];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const art = (cls = '', style = '') => `<span class="${cls}" style="${style}">${FaIllu.art(id)}</span>`;
  const small = (n) => FaIllu.art(id).replace('class="fa-illu ', `style="width:${n}px;height:${n}px;display:block" class="fa-illu `);

  /* sample copy by the state of the drawing */
  const TEXT = {
    empty: ['Здесь пока ничего нет. Добавьте первый элемент, и он появится в списке.', 'Добавить', 'Позже'],
    problem: ['Что-то пошло не так. Проверьте данные и попробуйте ещё раз.', 'Повторить', 'Назад'],
    success: ['Всё получилось. Подробности остаются в истории.', 'Готово', 'История'],
    waiting: ['Это займёт немного времени. Мы сообщим, когда всё будет готово.', 'Обновить', 'Позже'],
    neutral: ['Короткое объяснение рядом с рисунком. Текст пишет сам продукт.', 'Продолжить', 'Назад'],
  };
  const [text, primary, secondary] = TEXT[it.state] || TEXT.neutral;
  const badge = { problem: '<span class="fa-badge fa-badge--danger"><svg viewBox="0 0 24 24"><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/></svg>Нужно действие</span>', waiting: '<span class="fa-badge fa-badge--warning">Ожидает</span>', success: '<span class="fa-badge fa-badge--success">Готово</span>', empty: '<span class="fa-badge">Пусто</span>', neutral: '<span class="fa-badge fa-badge--info">Сведения</span>' }[it.state];
  const btns = (a = primary, b = secondary) => `<div class="fa-state__actions"><button class="fa-btn fa-btn--default">${a}</button><button class="fa-btn fa-btn--secondary">${b}</button></div>`;
  const top = `<header class="sc-top"><span class="fa-mark"></span><nav><span class="fa-pill" aria-selected="true">Обзор</span><span class="fa-pill">Задачи</span><span class="fa-pill">Команда</span></nav><span class="fa-avatar fa-avatar--sm"><span class="fa-mark" style="height:10px"></span></span></header>`;
  const code = (it.title.match(/\b(\d{3})\b/) || [])[1];
  const title = code ? it.title.replace(/,?\s*\d{3}\b/, '').trim() : it.title;

  const SCREENS = {
    hero: () => `${top}<section class="sc-hero"><div><h1>${esc(it.title)}</h1><p>Одно предложение о продукте. Заголовок и текст пишет сам продукт, рисунок только поддерживает мысль.</p><div class="fa-state__actions" style="justify-content:flex-start"><button class="fa-btn fa-btn--default fa-btn--lg">Начать</button><button class="fa-btn fa-btn--secondary fa-btn--lg">Подробнее</button></div></div>${art()}</section>`,
    onboarding: () => `<div class="sc-center"><div class="fa-card" style="width:min(100%,560px)"><div class="sc-steps"><i data-on></i><i data-on></i><i></i><i></i></div><div class="fa-state" style="--art:min(60vw,220px)">${art('fa-state__art')}<h3 class="fa-state__title">${esc(it.title)}</h3><p class="fa-state__text">Шаг 2 из 4. Одно действие на экран, объяснение в подсказке.</p><div class="fa-state__actions"><button class="fa-btn fa-btn--ghost">Назад</button><button class="fa-btn fa-btn--default">Далее</button></div></div></div></div>`,
    empty: () => `${top}<div class="sc-body"><div class="sc-head"><h2>Раздел</h2><button class="fa-btn fa-btn--default fa-btn--sm">${primary}</button></div><div class="fa-card"><div class="fa-state" style="--art:min(56vw,200px)">${art('fa-state__art')}<h3 class="fa-state__title">${esc(it.title)}</h3><p class="fa-state__text">${text}</p>${btns()}</div></div></div>`,
    inline: () => `${top}<div class="sc-body"><div class="fa-card" style="padding:0;overflow:hidden"><table class="fa-table"><thead><tr><th>Название</th><th>Статус</th><th>Обновлено</th></tr></thead></table><div class="fa-state fa-state--row" style="--art:min(28vw,110px)">${art('fa-state__art')}<h3 class="fa-state__title" style="font-size:20px;line-height:26px">${esc(it.title)}</h3><p class="fa-state__text">${text}</p><div class="fa-state__actions"><button class="fa-btn fa-btn--default fa-btn--sm">${primary}</button></div></div></div></div>`,
    dialog: () => `<div class="sc-dim"><div class="sc-bg"><span class="fa-skel"></span><span class="fa-skel"></span><span class="fa-skel"></span></div><div class="fa-card"><div class="fa-state" style="--art:min(40vw,150px)">${art('fa-state__art')}<h3 class="fa-state__title" style="font-size:22px;line-height:28px">${esc(it.title)}</h3><p class="fa-state__text">${text}</p>${btns()}</div></div></div>`,
    media: () => `<div class="sc-body"><div class="sc-head"><h2>Один рисунок, три контейнера</h2></div><div class="sc-media">${[['square', 'Квадрат'], ['wide', 'Горизонталь 16:9'], ['tall', 'Вертикаль 3:4']].map(([k, n]) => `<article class="fa-card fa-card--media"><div class="fa-slot fa-slot--${k}">${FaIllu.art(id)}</div><div class="fa-card__body"><b class="fa-t-label">Карточка</b><span class="fa-t-caption">${n}</span></div></article>`).join('')}</div></div>`,
    card: () => `<div class="sc-center"><article class="fa-card fa-card--media" style="width:min(100%,360px)"><div class="fa-slot fa-slot--wide">${FaIllu.art(id)}</div><div class="fa-card__body" style="padding:var(--fa-space-4) var(--fa-space-5) var(--fa-space-5);display:grid;gap:var(--fa-space-2)"><b class="fa-card__title">Название карточки</b><span class="fa-card__sub">Короткое описание. Без фотографии показывается нейтральный рисунок категории.</span><span class="fa-badge">Без медиа</span></div></article></div>`,
    error: () => `${top}<div class="sc-center"><div class="fa-state" style="--art:min(64vw,260px)">${art('fa-state__art')}${code ? `<p class="sc-code">${code}</p>` : ''}<h3 class="fa-state__title">${esc(title)}</h3><p class="fa-state__text">${text}</p><div class="fa-state__actions"><button class="fa-btn fa-btn--default">Повторить</button><button class="fa-btn fa-btn--secondary">На главную</button></div></div></div>`,
    auth: () => `<div class="sc-auth"><div class="sc-auth__art fa-island" style="border-radius:0">${art()}</div><form class="sc-auth__form" onsubmit="return false"><h1>${esc(it.title)}</h1><div class="fa-field"><label for="e">Почта</label><input id="e" class="fa-input" placeholder="name@company.com" autocomplete="email"></div><div class="fa-field"><label for="p">Пароль</label><input id="p" class="fa-input" type="password" value="123456789" autocomplete="current-password"></div><button class="fa-btn fa-btn--default fa-btn--lg">Продолжить</button><button class="fa-btn fa-btn--ghost">Забыли пароль</button></form></div>`,
    panel: () => `${top}<div class="sc-body"><div class="sc-panel"><div class="sc-rows"><span class="fa-skel"></span><span class="fa-skel"></span><span class="fa-skel"></span><span class="fa-skel"></span></div><aside class="fa-card"><div class="fa-state" style="--art:min(50vw,170px);padding:var(--fa-space-4)">${art('fa-state__art')}<h3 class="fa-state__title" style="font-size:20px;line-height:26px">${esc(it.title)}</h3><p class="fa-state__text">${text}</p>${btns()}</div></aside></div></div>`,
    state: () => `${top}<div class="sc-body"><div class="sc-product"><span class="fa-mark" style="height:12px"></span>${esc(it.product)}</div><div class="fa-card"><div class="fa-card__head"><b class="fa-card__title">${esc(it.title)}</b>${badge}</div><div class="fa-state" style="--art:min(56vw,190px)">${art('fa-state__art')}<p class="fa-state__text">${text}</p>${btns()}</div></div></div>`,
  };
  document.getElementById('screen').innerHTML = (SCREENS[ctx] || SCREENS.state)();
  document.title = `${it.id} ${ctx}`;
})();
