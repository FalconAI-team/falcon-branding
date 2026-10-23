#!/usr/bin/env node
// Copies the illustration set into the design system and builds assets/illustrations/illustrations.json.
// Source (read only): a folder with ILLUSTRATION-CATALOG.md and svg/FAI-NNN-illustration.svg.
// Usage: node scripts/sync-illustrations.mjs --src path/to/illustrations   (default: ../illustrations next to the repository)
// Safe to re-run: it only writes inside assets/illustrations. Files in assets/illustrations/fixes/ win over the source.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const SRC = resolve(arg('--src', join(ROOT, '..', 'illustrations')));
const OUT = join(ROOT, 'assets', 'illustrations');
const dash = (s) => s.replace(/[\u2013\u2014]/g, '-'); // the project writes only the plain hyphen

if (!existsSync(join(SRC, 'ILLUSTRATION-CATALOG.md'))) {
  console.error(`Illustration source not found: ${SRC}\nPass it explicitly: node scripts/sync-illustrations.mjs --src path/to/illustrations`);
  process.exit(1);
}

// ---------- catalog ----------
const md = readFileSync(join(SRC, 'ILLUSTRATION-CATALOG.md'), 'utf8').split(/\r?\n/);
const SECTIONS = [];
const items = [];
let cur = null;
for (const line of md) {
  const h = line.match(/^## (\d+)\.\s+(.+)$/);
  if (h) { cur = { n: +h[1], title: dash(h[2].trim()) }; SECTIONS.push(cur); continue; }
  const r = line.match(/^\| (FAI-\d{3}) \| (.+?) \| (.+?) \|$/);
  if (r && cur) items.push({ id: r[1], title: dash(r[2].trim()), scenario: dash(r[3].trim()), section: cur.n });
  const r2 = line.match(/^\| (FAI-\d{3}) \| (.+?) \| (.+) \|$/); // rows with only two text columns
  if (!r && !r2 && /^\| FAI-/.test(line)) console.warn('unparsed row:', line.slice(0, 60));
}
// sections 5 uses a two-column table in the catalog text: "ID | title | scenario"; keep the same shape.

// ---------- meaning of every section ----------
const KIND = { 1: 'hero', 2: 'onboarding', 3: 'empty', 4: 'media', 5: 'error', 6: 'auth', 7: 'file', 8: 'team', 9: 'domain', 10: 'domain', 11: 'domain', 12: 'domain', 13: 'domain', 14: 'domain', 15: 'domain' };
const PRODUCT = { 9: 'Криптобанк', 10: 'CRM грузоперевозок', 11: 'Платформа найма', 12: 'Vitrino', 13: 'Agents', 14: 'Агрегатор моделей', 15: 'AI-маркетинг' };

// ---------- svg files ----------
mkdirSync(join(OUT, 'svg'), { recursive: true });
for (const f of readdirSync(join(OUT, 'svg'))) rmSync(join(OUT, 'svg', f));
const FORBIDDEN = /<(image|script|foreignObject|filter|linearGradient|radialGradient|animate|animateTransform)\b|@keyframes|animation:|base64|xlink:href|href="http|onload=|onclick=/i;
const problems = [];
const idOwners = new Map();
let copied = 0;
for (const it of items) {
  const file = join(SRC, 'svg', `${it.id}-illustration.svg`);
  const fix = join(ROOT, 'assets', 'illustrations', 'fixes', `${it.id}.svg`); // owner-requested redraws win over the Codex source
  let text;
  try { text = readFileSync(existsSync(fix) ? fix : file, 'utf8'); } catch { problems.push(`${it.id}: svg missing`); it.svg = null; continue; }
  let clean = dash(text);
  // ids are prefixed with the illustration id, so 128 inline svgs never collide on one page
  const pfx = it.id.toLowerCase().replace('-', '');
  const own = [...clean.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]).filter((x) => !x.startsWith(pfx));
  for (const old of new Set(own)) {
    const nw = `${pfx}-${old}`;
    const q = old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    clean = clean
      .replace(new RegExp(`\\bid="${q}"`, 'g'), `id="${nw}"`)
      .replace(new RegExp(`url\\(#${q}\\)`, 'g'), `url(#${nw})`)
      .replace(new RegExp(`href="#${q}"`, 'g'), `href="#${nw}"`)
      .replace(new RegExp(`aria-(labelledby|describedby)="${q}"`, 'g'), `aria-$1="${nw}"`);
  }
  if (!/viewBox="0 0 \d+ \d+"/.test(clean)) problems.push(`${it.id}: no viewBox`);
  if (FORBIDDEN.test(clean)) problems.push(`${it.id}: forbidden element`);
  if (/<text\b/i.test(clean)) problems.push(`${it.id}: text inside drawing`);
  for (const m of clean.matchAll(/\bid="([^"]+)"/g)) {
    if (idOwners.has(m[1]) && idOwners.get(m[1]) !== it.id) problems.push(`${it.id}: id ${m[1]} also in ${idOwners.get(m[1])}`);
    idOwners.set(m[1], it.id);
  }
  const vb = clean.match(/viewBox="0 0 (\d+) (\d+)"/);
  it.w = vb ? +vb[1] : 1254; it.h = vb ? +vb[2] : 1254;
  it.roles = [...new Set([...clean.matchAll(/--illustration-([a-z]+)/g)].map((m) => m[1]))].sort();
  it.bytes = Buffer.byteLength(clean);
  writeFileSync(join(OUT, 'svg', `${it.id}.svg`), clean);
  it.svg = `svg/${it.id}.svg`;
  copied++;
}

// ---------- baked palettes for plain <img src>, which cannot inherit CSS variables ----------
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => '#' + rgb(a).map((x, i) => Math.round(x * t + rgb(b)[i] * (1 - t)).toString(16).padStart(2, '0')).join('').toUpperCase();
let flat = null;
try { flat = JSON.parse(readFileSync(join(ROOT, 'dist', 'tokens.flat.json'), 'utf8')); } catch { console.warn('dist/tokens.flat.json missing: run node scripts/build.mjs first, baked variants skipped'); }
const bundle = {};
for (const it of items) { if (it.svg) bundle[it.id] = readFileSync(join(OUT, 'svg', `${it.id}.svg`), 'utf8'); }
writeFileSync(join(OUT, 'illustrations.bundle.json'), JSON.stringify(bundle) + '\n');
if (flat) {
  for (const th of ['light', 'dark']) {
    const c = flat.color[th];
    const role = { ink: c.text, fill: mix(c.text, c.card, 0.38), muted: c.inset, accent: c.accent, paper: c.card, skin: c['illu-skin'] };
    const dir = join(OUT, th);
    mkdirSync(dir, { recursive: true });
    for (const f of readdirSync(dir)) rmSync(join(dir, f));
    for (const it of items) {
      if (!it.svg) continue;
      const baked = bundle[it.id].replace(/var\(--illustration-([a-z]+)\s*,\s*[^)]+\)/g, (m, r) => role[r] || m);
      writeFileSync(join(dir, `${it.id}.svg`), baked);
    }
  }
}

// ---------- enrich ----------
const secTitle = Object.fromEntries(SECTIONS.map((s) => [s.n, s.title]));
for (const it of items) {
  it.kind = KIND[it.section] || 'domain';
  it.product = PRODUCT[it.section] || 'Все продукты';
  it.sectionTitle = secTitle[it.section];
}
// state of the drawing, from the title: used to pick sensible interface copy in the brandbook
const STATE = [
  [/ошибк|не удал|не загруз|не воспроизв|отклон|не поддерж|не найден|недоступ|потеря|превышен|истек|слишком|не подход|нет подключ|не создан/i, 'problem'],
  [/пока нет|ещё не|пуст|нет /i, 'empty'],
  [/выполнен|доставлен|готов|завершен|завершён|разобрано/i, 'success'],
  [/ожида|на согласов|на модерации|на паузе|задержк|требуется|требует|проверк/i, 'waiting'],
];
for (const it of items) { it.state = (STATE.find(([re]) => re.test(it.title)) || [0, 'neutral'])[1]; }
// explicit corrections where the title words mislead the guess
const STATE_FIX = { 'FAI-053': 'problem', 'FAI-054': 'problem', 'FAI-120': 'problem', 'FAI-111': 'problem', 'FAI-044': 'problem', 'FAI-109': 'waiting', 'FAI-088': 'waiting', 'FAI-039': 'problem', 'FAI-040': 'problem', 'FAI-104': 'neutral', 'FAI-055': 'waiting' };
for (const it of items) if (STATE_FIX[it.id]) it.state = STATE_FIX[it.id];
// limits: sentences of the catalog that restrict use ("Без ...", "Только ...", "Не ...")
for (const it of items) {
  const parts = it.scenario.split(/(?<=\.)\s+/).map((x) => x.trim()).filter(Boolean);
  it.limits = parts.filter((x) => /^(Без|Только|Не|Нельзя|Цифры|Тексты|Причина)(?=\s)|без символов|без выдуманн|не выдавать|не подменять|не путать|не имитир/i.test(x)).map((x) => x.replace(/\.$/, ''));
  it.place = parts.filter((x) => !it.limits.includes(x.replace(/\.$/, ''))).pop() || parts[parts.length - 1] || '';
}
// pairs that the catalog says must not be confused
const PAIRS = [['FAI-017', 'FAI-092', 'Отсутствие результатов поиска и поиск специалиста'], ['FAI-101', 'FAI-103', 'Создание объявления и завершённая публикация'], ['FAI-005', 'FAI-081', 'Hero логистики и стандартная сцена перевозки'], ['FAI-012', 'FAI-068', 'Шаг приглашения и список команды без участников'], ['FAI-044', 'FAI-111', 'Общий offline и потеря подключения интеграции'], ['FAI-036', 'FAI-035', 'Формат видео и ошибка загрузки видео'], ['FAI-039', 'FAI-059', 'Недоступный предпросмотр и неподходящий формат файла']];
const byId = Object.fromEntries(items.map((i) => [i.id, i]));
for (const [a, b, why] of PAIRS) { for (const [x, y] of [[a, b], [b, a]]) { (byId[x].related ||= []).push({ id: y, why }); } }

const data = {
  generated: new Date().toISOString().slice(0, 10),
  source: 'falcon-branding/illustrations (read only)',
  count: items.length,
  sections: SECTIONS.filter((s) => s.n <= 15),
  items,
};
writeFileSync(join(OUT, 'illustrations.json'), JSON.stringify(data, null, 2) + '\n');
console.log(`illustrations: ${items.length} in catalog, ${copied} svg copied, ${problems.length} problems`);
for (const p of problems.slice(0, 30)) console.log('  ' + p);
if (problems.length) process.exitCode = 1;
