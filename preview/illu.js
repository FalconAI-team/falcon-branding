'use strict';
/* Shared by the brandbook and by screen.html: loads the illustration catalog and the svg markup bundle. */
window.FaIllu = {
  data: null, bundle: null, byId: {},
  async load() {
    if (this.data) return this;
    const [data, bundle] = await Promise.all(['../assets/illustrations/illustrations.json', '../assets/illustrations/illustrations.bundle.json'].map((u) => fetch(u).then((r) => r.json())));
    this.data = data; this.bundle = bundle;
    this.byId = Object.fromEntries(data.items.map((i) => [i.id, i]));
    return this;
  },
  /* Decorative by default: the text is always next to the drawing, so it is hidden from screen readers. */
  art(id, cls = '', label = '') {
    const aria = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
    return `<span class="fa-illu ${cls}" ${aria}>${this.bundle[id] || ''}</span>`;
  },
  /* Which interface contexts make sense for a drawing: decided by the catalog section, never by guesswork. */
  CONTEXTS: {
    hero: ['hero'], onboarding: ['onboarding', 'dialog'], empty: ['empty', 'inline', 'dialog'], media: ['media', 'card'],
    error: ['error', 'dialog'], auth: ['auth', 'dialog'], file: ['dialog', 'empty'], team: ['panel', 'empty'], domain: ['state', 'dialog', 'empty'],
  },
  CONTEXT_NAMES: {
    hero: 'Hero на странице', onboarding: 'Шаг онбординга', dialog: 'Диалог', empty: 'Пустое состояние страницы', inline: 'Пусто внутри таблицы',
    media: 'Слот: квадрат, горизонталь, вертикаль', card: 'Карточка без медиа', error: 'Страница ошибки', auth: 'Экран входа',
    panel: 'Боковая панель', state: 'Состояние продукта',
  },
  contexts(item) { return this.CONTEXTS[item.kind] || ['state']; },
};
