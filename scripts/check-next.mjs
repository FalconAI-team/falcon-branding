// Проверка черновика 0.3: контраст палитры и наличие файлов, на которые ссылается next/.
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const t = JSON.parse(readFileSync("next/tokens.next.json", "utf8"));
const L = t.color.light, D = t.color.dark;
// [текст, фон, минимум]
const pairs = [
  ["ink/paper", L.ink, L.paper, 7], ["ink/card", L.ink, L.card, 7], ["ink/tint", L.ink, L.tint, 7],
  ["muted/paper", L.muted, L.paper, 4.5], ["muted/card", L.muted, L.card, 4.5], ["muted/tint", L.muted, L.tint, 4.5],
  ["voice/paper", L.voice, L.paper, 4.5], ["voice/tint", L.voice, L.tint, 4.5], ["onVoice/voice", L.onVoice, L.voice, 4.5],
  ["ink/signal", L.ink, L.signal, 4.5], ["ok/paper", L.ok, L.paper, 4.5], ["bad/paper", L.bad, L.paper, 4.5],
  ["d.ink/paper", D.ink, D.paper, 7], ["d.ink/card", D.ink, D.card, 7], ["d.muted/paper", D.muted, D.paper, 4.5], ["d.muted/tint", D.muted, D.tint, 4.5],
  ["d.voiceText/paper", D.voiceText, D.paper, 4.5], ["d.voiceText/tint", D.voiceText, D.tint, 4.5], ["d.onVoice/voice", D.onVoice, D.voice, 4.5],
  ["d.ok/paper", D.ok, D.paper, 4.5], ["d.bad/paper", D.bad, D.paper, 4.5],
];
let fail = 0;
for (const [name, fg, bg, min] of pairs) { const r = ratio(fg, bg); const ok = r >= min; if (!ok) fail++; console.log(`${ok ? "ok  " : "FAIL"} ${name.padEnd(20)} ${r.toFixed(2)} (>= ${min})`); }
// токены и CSS не должны расходиться
const css = readFileSync("next/next.css", "utf8");
for (const [k, v] of [...Object.entries(L), ...Object.entries(D)]) if (!css.toLowerCase().includes(v.toLowerCase())) { fail++; console.log(`FAIL токен ${k}=${v} не найден в next.css`); }
// ссылки на файлы
for (const f of ["next/index.html", "next/next.css"]) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/(?:src|href)="([^"#]+)"|url\("([^"]+)"\)/g)) {
    const u = m[1] || m[2];
    if (/^(https?:|data:|#)/.test(u)) continue;
    const p = resolve(dirname(f), u.split("?")[0]);
    if (!existsSync(p)) { fail++; console.log(`FAIL ${f}: нет файла ${u}`); }
  }
}
console.log(fail ? `\nОшибок: ${fail}` : "\nЧерновик 0.3: проверки пройдены");
process.exit(fail ? 1 : 0);
