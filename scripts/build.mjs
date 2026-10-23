#!/usr/bin/env node
// Falcon tokens build. Zero dependencies, Node 18+.
// Reads tokens/tokens.json, runs the WCAG gate, writes dist/.
// Usage: node scripts/build.mjs [--tokens path/to/tokens.json] [--out dir]
// Exit code 1 if any contrast rule fails (nothing is written in that case).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const TOKENS = resolve(arg('--tokens', join(ROOT, 'tokens/tokens.json')));
const OUT = resolve(arg('--out', join(ROOT, 'dist')));
const tokens = JSON.parse(readFileSync(TOKENS, 'utf8'));

// ---------- resolve references ----------
const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
function resolveValue(v, seen = []) {
  const m = typeof v === 'string' && v.match(/^\{(.+)\}$/);
  if (!m) return v;
  if (seen.includes(m[1])) throw new Error('circular ref ' + m[1]);
  const node = getPath(tokens, m[1]);
  if (!node || node.$value === undefined) throw new Error('unknown ref ' + m[1]);
  return resolveValue(node.$value, [...seen, m[1]]);
}
const resolveGroup = (g) => Object.fromEntries(
  Object.entries(g).filter(([k]) => !k.startsWith('$')).map(([k, t]) => [k, resolveValue(t.$value).toUpperCase()]));

const themes = { light: resolveGroup(tokens.semantic.light), dark: resolveGroup(tokens.semantic.dark) };
const ACCENT_KEYS = ['accent', 'accent-hover', 'accent-press', 'on-accent', 'accent-border', 'island-accent'];
const products = {};
for (const [name, p] of Object.entries(tokens.product)) {
  if (name.startsWith('$')) continue;
  const o = { light: resolveGroup(p.light || {}), dark: resolveGroup(p.dark || {}) };
  for (const th of ['light', 'dark']) for (const k of Object.keys(o[th])) {
    if (!ACCENT_KEYS.includes(k)) throw new Error(`product ${name}: ${k} is not overridable`);
  }
  products[name] = o;
}

// ---------- WCAG ----------
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lum = (h) => rgb(h).reduce((s, c, i) => s + [0.2126, 0.7152, 0.0722][i] * (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4), 0);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const mix = (a, b, t) => '#' + rgb(a).map((x, i) => Math.round((x * t + rgb(b)[i] * (1 - t)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const TINT = 0.14; // status chip background: status colour 14% over the surface
const STATUSES = ['success', 'warning', 'danger', 'info'];
const SURFACES = ['canvas', 'card', 'inset'];
const ISLAND_SURFACES = ['island', 'island-raised'];

function gate(themeName, t, label = '') {
  const rows = [];
  const add = (rule, fg, bg, min, fgName, bgName) => {
    const r = ratio(t[fg] ?? fg, t[bg] ?? bg);
    rows.push({ theme: themeName + label, rule, fg: fgName ?? fg, bg: bgName ?? bg, fgHex: t[fg] ?? fg, bgHex: t[bg] ?? bg, ratio: +r.toFixed(2), min, pass: r >= min });
  };
  for (const s of SURFACES) {
    add('text', 'text', s, 4.5); add('text', 'text-2', s, 4.5);
    add('text', 'link', s, 4.5);
    add('control-boundary', 'line-strong', s, 3); add('focus', 'focus', s, 3);
    add('control-boundary', 'accent-border', s, 3);
    add('logo', 'logo', s, 4.5);
  }
  for (const k of ['accent', 'accent-hover', 'accent-press']) add('text', 'on-accent', k, 4.5);
  for (const st of STATUSES) {
    // Chips are dark text plus a coloured dot: the dot must be visible, the -text variant is for inline messages.
    for (const s of ['card', 'inset']) add('status-dot', st, s, 3);
    for (const s of ['canvas', 'card']) add('status-text', st + '-text', s, 4.5);
  }
  add('text', 'on-danger', 'danger-solid', 4.5);
  for (const s of ISLAND_SURFACES) {
    add('island-text', 'island-text', s, 4.5); add('island-text', 'island-text-2', s, 4.5);
    add('island-accent', 'island-accent', s, 3);
    add('island-focus', 'island-focus', s, 3);
  }
  add('island-text', 'on-accent', 'island-accent', 4.5);
  return rows;
}
// Tokens used by Flutter ColorScheme pairs that are not covered above.
function gateExtra(themeName, t) {
  const white = '#FFFFFF';
  const rows = [];
  const r2 = ratio(white, t.link);
  if (themeName === 'light') rows.push({ theme: 'light', rule: 'flutter-onSecondary', fg: 'white', bg: 'link', fgHex: white, bgHex: t.link, ratio: +r2.toFixed(2), min: 4.5, pass: r2 >= 4.5 });
  return rows;
}

let results = [];
for (const th of ['light', 'dark']) { results.push(...gate(th, themes[th])); results.push(...gateExtra(th, themes[th])); }
for (const [name, p] of Object.entries(products)) for (const th of ['light', 'dark']) {
  if (Object.keys(p[th]).length) results.push(...gate(th, { ...themes[th], ...p[th] }, ` [product ${name}]`));
}
const failed = results.filter((r) => !r.pass);
const minByRule = {};
for (const r of results) minByRule[r.rule] = Math.min(minByRule[r.rule] ?? 99, r.ratio);
console.log(`contrast gate: ${results.length} checks, ${failed.length} failed`);
if (failed.length) {
  for (const r of failed) console.error(`  FAIL ${r.theme} ${r.rule}: ${r.fg} (${r.fgHex}) on ${r.bg} (${r.bgHex}) = ${r.ratio}, need ${r.min}`);
  process.exit(1);
}

// ---------- helpers for output ----------
const px = (n) => (typeof n === 'number' ? `${n}px` : n);
const kebab = (s) => s;
const semNames = Object.keys(themes.light);
const colorVars = (t, indent = '  ') => semNames.map((k) => `${indent}--fa-color-${k}: ${t[k]};`).join('\n');
const staticVars = () => {
  const L = [];
  for (const [k, t] of Object.entries(tokens.font)) if (!k.startsWith('$')) L.push(`--fa-font-${k}: ${t.$value};`);
  for (const [k, t] of Object.entries(tokens.text)) {
    if (k.startsWith('$')) continue;
    L.push(`--fa-text-${k}-family: var(--fa-font-${t.family});`, `--fa-text-${k}-size: ${t.size}px;`, `--fa-text-${k}-line: ${t.line}px;`, `--fa-text-${k}-weight: ${t.weight};`);
  }
  for (const grp of ['radius', 'space', 'size']) for (const [k, t] of Object.entries(tokens[grp])) if (!k.startsWith('$')) L.push(`--fa-${grp}-${k}: ${px(t.$value)};`);
  for (const [k, t] of Object.entries(tokens.motion)) if (!k.startsWith('$')) L.push(`--fa-motion-${k}: ${t.$value};`);
  return L.map((l) => '  ' + l).join('\n');
};
const header = (c) => `${c} GENERATED by scripts/build.mjs from tokens/tokens.json. Do not edit.`;
const write = (rel, body) => { const p = join(OUT, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, body); };

// ---------- CSS ----------
const shadowNames = Object.keys(tokens.shadow).filter((k) => !k.startsWith('$'));
const shadowVars = (th) => shadowNames.map((k) => `  --fa-shadow-${k}: ${tokens.shadow[k][th]};`).join('\n');
const themeBlock = (th) => `${colorVars(themes[th])}\n${shadowVars(th)}`;
let css = `/* ${header('')} */\n/* Theme: data-theme="light|dark" on any element; without it the system theme applies. */\n\n`;
css += `:root,\n[data-theme="light"] {\n  color-scheme: light;\n${themeBlock('light')}\n}\n\n`;
css += `@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n    color-scheme: dark;\n${themeBlock('dark').replace(/^ {2}/gm, '    ')}\n  }\n}\n\n`;
css += `[data-theme="dark"] {\n  color-scheme: dark;\n${themeBlock('dark')}\n}\n\n`;
css += `:root {\n${staticVars()}\n}\n`;
for (const [name, p] of Object.entries(products)) {
  if (!Object.keys(p.light).length && !Object.keys(p.dark).length) continue;
  const v = (o) => Object.entries(o).map(([k, h]) => `  --fa-color-${k}: ${h};`).join('\n');
  css += `\n[data-product="${name}"] {\n${v(p.light)}\n}\n`;
  css += `@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) [data-product="${name}"], [data-product="${name}"]:not([data-theme="light"]) {\n${v(p.dark).replace(/^ {2}/gm, '    ')}\n  }\n}\n`;
  css += `[data-theme="dark"] [data-product="${name}"], [data-theme="dark"][data-product="${name}"] {\n${v(p.dark)}\n}\n`;
}
write('css/tokens.css', css);

const ff = (family, file, weight, extra = '') => `@font-face {\n  font-family: '${family}';\n  src: url('../../fonts/${file}') format('woff2');\n  font-weight: ${weight};\n  font-style: normal;\n  font-display: swap;${extra}\n}\n`;
write('css/fonts.css', `/* ${header('')} */\n/* Self-hosted OFL fonts. Paths are relative to dist/css. Copy fonts/ with it. */\n\n`
  + ff('Tektur', 'tektur/Tektur-VF.woff2', '400 900')
  + ff('IBM Plex Sans', 'ibm-plex-sans/IBMPlexSans-VF.woff2', '100 700')
  + ff('IBM Plex Mono', 'ibm-plex-mono/IBMPlexMono-Regular.woff2', 400)
  + ff('IBM Plex Mono', 'ibm-plex-mono/IBMPlexMono-Medium.woff2', 500));

write('css/components.css', readFileSync(join(ROOT, 'src/components.css'), 'utf8'));
write('js/falcon-tooltip.js', readFileSync(join(ROOT, 'src/tooltip.js'), 'utf8'));
write('js/falcon-select.js', readFileSync(join(ROOT, 'src/select.js'), 'utf8'));
write('js/falcon-sheet.js', readFileSync(join(ROOT, 'src/sheet.js'), 'utf8'));
write('css/falcon.css', `/* ${header('')} */\n/* One-file entry for plain HTML: fonts, tokens, components. */\n@import url('./fonts.css');\n@import url('./tokens.css');\n@import url('./components.css');\n`);

// ---------- Tailwind v4 ----------
let tw = `/* ${header('')} */\n/* Import after dist/css/tokens.css. Utilities follow the active theme because they point at CSS variables. */\n\n`;
tw += `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));\n\n@theme inline {\n`;
for (const k of semNames) tw += `  --color-${k}: var(--fa-color-${k});\n`;
for (const k of Object.keys(tokens.font)) if (!k.startsWith('$')) tw += `  --font-${k}: var(--fa-font-${k});\n`;
for (const k of Object.keys(tokens.radius)) if (!k.startsWith('$')) tw += `  --radius-${k}: var(--fa-radius-${k});\n`;
for (const k of shadowNames) tw += `  --shadow-${k}: var(--fa-shadow-${k});\n`;
for (const k of ['ease-out', 'ease-in-out', 'ease-tab', 'ease-drawer']) tw += `  --${k.replace('ease-', 'ease-fa-')}: ${tokens.motion[k].$value};\n`;
tw += '}\n';
write('tailwind/theme.css', tw);

// shadcn/ui name aliases (for a later migration of apps that already use these names)
const alias = {
  background: 'canvas', foreground: 'text', card: 'card', 'card-foreground': 'text', popover: 'card', 'popover-foreground': 'text',
  primary: 'accent', 'primary-foreground': 'on-accent', secondary: 'inset', 'secondary-foreground': 'text',
  muted: 'inset', 'muted-foreground': 'text-2', accent: 'inset', 'accent-foreground': 'text',
  sidebar: 'island', 'sidebar-foreground': 'island-text', 'sidebar-accent': 'island-raised', 'sidebar-border': 'island-line', 'sidebar-primary': 'island-accent',
  destructive: 'danger', border: 'line', input: 'line-strong', ring: 'focus',
};
write('css/shadcn-aliases.css', `/* ${header('')} */\n/* Optional. Maps shadcn/ui variable names to Falcon tokens. Not used by the kit itself. */\n\n:root {\n${Object.entries(alias).map(([k, v]) => `  --${k}: var(--fa-color-${v});`).join('\n')}\n  --radius: var(--fa-radius-sm);\n}\n`);

// ---------- Flutter ----------
const dc = (h) => `Color(0xFF${h.slice(1)})`;
const camel = (s) => s.replace(/-(\w)/g, (_, c) => c.toUpperCase());
const fields = semNames.map(camel);
const tint = (th, st) => mix(themes[th][st], themes[th].card, TINT);
let dart = `// ${header('')}\n// ignore_for_file: lines_longer_than_80_chars\nimport 'package:flutter/material.dart';\n\n`;
dart += `abstract final class FalconTokens {\n`;
for (const grp of ['radius', 'space', 'size']) for (const [k, t] of Object.entries(tokens[grp])) if (!k.startsWith('$')) dart += `  static const double ${camel(grp + '-' + k)} = ${t.$value}${Number.isInteger(t.$value) ? '.0' : ''};\n`;
dart += `  static const String fontDisplay = 'Tektur';\n  static const String fontSans = 'IBM Plex Sans';\n  static const String fontMono = 'IBM Plex Mono';\n}\n\n`;
dart += `@immutable\nclass FalconColors extends ThemeExtension<FalconColors> {\n  const FalconColors({\n${fields.map((f) => `    required this.${f},`).join('\n')}\n  });\n\n`;
dart += fields.map((f) => `  final Color ${f};`).join('\n') + '\n\n';
for (const th of ['light', 'dark']) {
  dart += `  static const ${th} = FalconColors(\n${semNames.map((k) => `    ${camel(k)}: ${dc(themes[th][k])},`).join('\n')}\n  );\n\n`;
}
dart += `  /// Status chip background: status colour 14% over the surface (same rule as the contrast gate).\n  Color statusBackground(Color status, Color surface) => Color.alphaBlend(status.withValues(alpha: ${TINT}), surface);\n\n`;
dart += `  @override\n  FalconColors copyWith({\n${fields.map((f) => `    Color? ${f},`).join('\n')}\n  }) =>\n      FalconColors(\n${fields.map((f) => `        ${f}: ${f} ?? this.${f},`).join('\n')}\n      );\n\n`;
dart += `  @override\n  FalconColors lerp(ThemeExtension<FalconColors>? other, double t) {\n    if (other is! FalconColors) return this;\n    return FalconColors(\n${fields.map((f) => `      ${f}: Color.lerp(${f}, other.${f}, t)!,`).join('\n')}\n    );\n  }\n}\n\n`;
const scheme = (th) => {
  const t = themes[th];
  const light = th === 'light';
  return `ColorScheme(\n    brightness: Brightness.${th},\n`
    + `    primary: ${dc(light ? t.text : t.accent)},
    onPrimary: ${dc(light ? t.canvas : t['on-accent'])},
`
    + `    primaryContainer: ${dc(t.accent)},\n    onPrimaryContainer: ${dc(t['on-accent'])},\n`
    + `    secondary: ${dc(t.link)},\n    onSecondary: ${dc(light ? '#FFFFFF' : t.canvas)},\n`
    + `    secondaryContainer: ${dc(t.inset)},\n    onSecondaryContainer: ${dc(t.text)},\n`
    + `    error: ${dc(t['danger-text'])},\n    onError: ${dc(light ? '#FFFFFF' : t.canvas)},\n`
    + `    errorContainer: ${dc(tint(th, 'danger'))},\n    onErrorContainer: ${dc(t['danger-text'])},\n`
    + `    surface: ${dc(t.canvas)},\n    onSurface: ${dc(t.text)},\n    onSurfaceVariant: ${dc(t['text-2'])},\n`
    + `    surfaceContainerLowest: ${dc(t.card)},\n    surfaceContainerLow: ${dc(t.card)},\n    surfaceContainer: ${dc(t.card)},\n`
    + `    surfaceContainerHigh: ${dc(t.inset)},\n    surfaceContainerHighest: ${dc(t.inset)},\n`
    + `    outline: ${dc(t['line-strong'])},\n    outlineVariant: ${dc(t.line)},\n  )`;
};
dart += `const ColorScheme falconLightScheme = ${scheme('light')};\n\nconst ColorScheme falconDarkScheme = ${scheme('dark')};\n\n`;
const ts = (k) => { const t = tokens.text[k]; const fam = { display: 'FalconTokens.fontDisplay', sans: 'FalconTokens.fontSans', mono: 'FalconTokens.fontMono' }[t.family]; return `TextStyle(fontFamily: ${fam}, fontSize: ${t.size}, height: ${(t.line / t.size).toFixed(4)}, fontWeight: FontWeight.w${t.weight})`; };
dart += `/// Text styles that have no Material slot.\nabstract final class FalconText {\n  static const TextStyle kpi = ${ts('kpi')};\n  static const TextStyle id = ${ts('id')};\n}\n\n`;
dart += `TextTheme _falconTextTheme(ColorScheme c) => TextTheme(\n  headlineMedium: ${ts('display')},\n  headlineSmall: ${ts('title')},\n  titleMedium: ${ts('section')},\n  bodyLarge: ${ts('body-lg')},\n  bodyMedium: ${ts('body')},\n  bodySmall: ${ts('caption')},\n  labelLarge: ${ts('label')},\n).apply(bodyColor: c.onSurface, displayColor: c.onSurface);\n\n`;
dart += `ThemeData falconTheme(Brightness brightness) {\n  final dark = brightness == Brightness.dark;\n  final scheme = dark ? falconDarkScheme : falconLightScheme;\n  final colors = dark ? FalconColors.dark : FalconColors.light;\n  final controlShape = RoundedRectangleBorder(borderRadius: BorderRadius.circular(FalconTokens.radiusMd));\n  return ThemeData(\n    useMaterial3: true,\n    colorScheme: scheme,\n    scaffoldBackgroundColor: scheme.surface,\n    fontFamily: FalconTokens.fontSans,\n    textTheme: _falconTextTheme(scheme),\n    extensions: [colors],\n    cardTheme: CardThemeData(\n      color: scheme.surfaceContainerLow,\n      elevation: 0,\n      shape: RoundedRectangleBorder(\n        borderRadius: BorderRadius.circular(FalconTokens.radiusCard),\n        side: BorderSide(color: scheme.outlineVariant),\n      ),\n    ),\n    filledButtonTheme: FilledButtonThemeData(\n      style: FilledButton.styleFrom(\n        backgroundColor: scheme.primaryContainer,\n        foregroundColor: scheme.onPrimaryContainer,\n        minimumSize: const Size(0, FalconTokens.sizeControlLg),\n        shape: controlShape,\n      ),\n    ),\n    inputDecorationTheme: InputDecorationTheme(\n      border: OutlineInputBorder(borderRadius: BorderRadius.circular(FalconTokens.radiusMd), borderSide: BorderSide(color: scheme.outline)),\n      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(FalconTokens.radiusMd), borderSide: BorderSide(color: colors.focus, width: FalconTokens.sizeFocusWidth)),\n    ),\n  );\n}\n`;
write('flutter/falcon_theme.dart', dart);
write('flutter/pubspec_fonts.yaml', `# ${header('')}\n# Paste under flutter: in pubspec.yaml. Fonts must ship inside the app (no network loading).\n# Flutter needs TTF/OTF; convert the woff2 files in fonts/ or take the TTFs from the Google Fonts repository.\n# Variable-font weights are selected through the weight entries below.\nfonts:\n  - family: Tektur\n    fonts:\n      - asset: assets/fonts/Tektur-VF.ttf\n  - family: IBM Plex Sans\n    fonts:\n      - asset: assets/fonts/IBMPlexSans-VF.ttf\n  - family: IBM Plex Mono\n    fonts:\n      - asset: assets/fonts/IBMPlexMono-Regular.ttf\n      - asset: assets/fonts/IBMPlexMono-Medium.ttf\n        weight: 500\n`);

// ---------- flat json + contrast report ----------
const clean = (g) => Object.fromEntries(Object.entries(g).filter(([k]) => !k.startsWith('$')));
const vals = (g) => Object.fromEntries(Object.entries(clean(g)).map(([k, t]) => [k, t.$value]));
write('tokens.flat.json', JSON.stringify({
  color: themes, products,
  text: clean(tokens.text), radius: vals(tokens.radius), space: vals(tokens.space), size: vals(tokens.size),
  motion: vals(tokens.motion), shadow: clean(tokens.shadow), font: vals(tokens.font),
}, null, 2) + '\n');
write('contrast.json', JSON.stringify({ tint: TINT, checks: results.length, minByRule, results }, null, 2) + '\n');
console.log('built:', OUT);
console.log('min ratio by rule:', JSON.stringify(minByRule));
