# Подключение

Во всех вариантах кит это CSS-классы `fa-*` и CSS-переменные `--fa-*`. React-обёрток нет: компоненты это разметка с классами, поэтому они одинаково работают в любом стеке.

Содержание: [Как получить файлы](#как-получить-файлы) · [HTML и CSS](#html-и-css) · [React](#react) · [Next.js](#nextjs) · [Tailwind v4](#tailwind-v4) · [Flutter](#flutter) · [Темы и акцент продукта](#темы-и-акцент-продукта)

## Как получить файлы

Три способа, выберите один.

**1. Зависимость из GitHub (рекомендуется для JS-проектов).** Нужен доступ к приватному репозиторию по SSH.

```bash
npm install git+ssh://git@github.com/FalconAI-team/falcon-branding.git
```

Файлы окажутся в `node_modules/falcon-branding/`. Шрифты подключаются относительным путём `../../fonts`, поэтому структура внутри пакета сохраняется.

**2. Копия папок.** Скопируйте `dist/` и `fonts/` в проект так, чтобы они лежали рядом (например `public/falcon/dist` и `public/falcon/fonts`). Для логотипа и сокола добавьте `assets/logo/` и `assets/falcon/`, для иллюстраций `assets/illustrations/`.

**3. Git submodule.** `git submodule add git@github.com:FalconAI-team/falcon-branding.git vendor/falcon-branding`.

Дальше в примерах путь `falcon-branding/...` означает любой из этих вариантов.

## HTML и CSS

```html
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/falcon/dist/css/falcon.css">
</head>
<body class="fa-app" data-theme="light">
  <button class="fa-btn fa-btn--default">Запросить сертификат</button>
  <span class="fa-badge fa-badge--danger">Истекла</span>

  <!-- по желанию: подсказки, выпадающий список, нижний лист -->
  <script src="/falcon/dist/js/falcon-tooltip.js"></script>
  <script src="/falcon/dist/js/falcon-sheet.js"></script>
  <script src="/falcon/dist/js/falcon-select.js"></script>
</body>
</html>
```

`falcon.css` подключает шрифты, токены и компоненты. Нужна только часть: подключайте `fonts.css`, `tokens.css` и `components.css` по отдельности.

Класс `fa-app` на `<body>` задаёт фон холста, цвет текста и шрифт. Порядок подключения скриптов: `falcon-sheet.js` перед `falcon-select.js` (на телефоне список открывается нижним листом).

## React

Установите зависимость (способ 1) и подключите стили один раз в точке входа:

```jsx
// src/main.jsx
import 'falcon-branding/dist/css/falcon.css';
```

Компоненты это обычная разметка с классами:

```jsx
export function CarrierBadge({ expired }) {
  return (
    <span className={`fa-badge ${expired ? 'fa-badge--danger' : 'fa-badge--success'}`}>
      {expired ? 'Истекла' : 'Действует'}
    </span>
  );
}

export function Save({ loading, children }) {
  return <button className="fa-btn fa-btn--default" data-state={loading ? 'loading' : undefined}>{children}</button>;
}
```

Тема и класс `fa-app`:

```jsx
<body className="fa-app" data-theme="light">
```

JS-части (подсказки, список, лист) это скрипты с глобальными объектами. В React подключите их один раз:

```jsx
// src/falcon-js.js
import 'falcon-branding/dist/js/falcon-tooltip.js';
import 'falcon-branding/dist/js/falcon-sheet.js';
import 'falcon-branding/dist/js/falcon-select.js';
```

- Подсказки работают сами для любого `[data-tip]`.
- Выпадающий список подхватывает `select.fa-select`. Для полей, которые React добавляет позже, вызывайте `window.FaSelect.enhance(контейнер)` в `useEffect` после отрисовки.
- Нижний лист открывается вызовом `window.FaSheet.open({ title, body, actions })`.

## Next.js

App Router. Стили в корневом layout:

```tsx
// app/layout.tsx
import 'falcon-branding/dist/css/falcon.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" data-theme="light">
      <body className="fa-app">{children}</body>
    </html>
  );
}
```

Скрипты трогают `window`, поэтому подключайте их на клиенте:

```tsx
// app/falcon-client.tsx
'use client';
import { useEffect } from 'react';

export function FalconClient() {
  useEffect(() => {
    import('falcon-branding/dist/js/falcon-tooltip.js');
    import('falcon-branding/dist/js/falcon-sheet.js');
    import('falcon-branding/dist/js/falcon-select.js');
  }, []);
  return null;
}
```

Добавьте `<FalconClient />` в `layout.tsx` внутрь `<body>`. Если файлы скопированы в `public/falcon/`, подключайте CSS обычным `<link>` и скрипты через `next/script` с `strategy="afterInteractive"`.

Шрифты: `fonts.css` ссылается на `../../fonts/...`. При импорте из `node_modules` Next.js обработает пути сам. При копии в `public/` сохраните структуру `dist/css` и `fonts` рядом.

## Tailwind v4

Кит подключается к Tailwind через `@theme inline`, и утилиты следуют активной теме, потому что указывают на CSS-переменные.

```css
/* app.css */
@import "tailwindcss";
@import "falcon-branding/dist/css/fonts.css";
@import "falcon-branding/dist/css/tokens.css";
@import "falcon-branding/dist/tailwind/theme.css";
```

Если нужны и готовые компоненты `fa-*`, добавьте `@import "falcon-branding/dist/css/components.css";`.

Доступные утилиты: `bg-canvas`, `bg-card`, `bg-inset`, `bg-island`, `text-text`, `text-text-2`, `bg-accent`, `text-on-accent`, `border-line`, `font-display`, `font-sans`, `font-mono`, `rounded-card`, `rounded-island`, `rounded-pill`, `shadow-card`, `shadow-overlay`. Полный список имён лежит в `dist/tailwind/theme.css`.

```html
<div class="bg-card rounded-card shadow-card p-4">
  <button class="bg-accent text-on-accent rounded-pill px-4 h-11">Сохранить</button>
</div>
```

Тёмная тема: `data-theme="dark"` на любом предке (вариант `dark:` настроен на этот атрибут).

Необязательно: `dist/css/shadcn-aliases.css` сопоставляет имена переменных shadcn/ui (`--background`, `--primary` и т. д.) с токенами Falcon. Это упрощает миграцию проектов, которые уже используют shadcn.

## Flutter

1. Скопируйте `dist/flutter/falcon_theme.dart` в `lib/`.
2. Добавьте шрифты. Flutter нужны TTF или OTF, а в репозитории woff2: сконвертируйте файлы из `fonts/` или возьмите TTF из репозитория Google Fonts. Записи для `pubspec.yaml` лежат в `dist/flutter/pubspec_fonts.yaml`. Шрифты должны входить в приложение (загрузки из сети нет).
3. Подключите тему:

```dart
import 'falcon_theme.dart';

MaterialApp(
  theme: falconTheme(Brightness.light),
  darkTheme: falconTheme(Brightness.dark),
  themeMode: ThemeMode.system,
);
```

Цвета вне Material (острова, статусы, фокус острова):

```dart
final c = Theme.of(context).extension<FalconColors>()!;
Container(color: c.island);
```

Размеры, радиусы и отступы лежат в `FalconTokens` (`FalconTokens.radiusCard`, `FalconTokens.space4`, `FalconTokens.sizeControl`).

`flutter analyze` на `falcon_theme.dart` проходит без замечаний. Приложение на устройстве с этой темой не запускалось.

## Темы и акцент продукта

```html
<html data-theme="dark">                 <!-- принудительно тёмная -->
<section data-theme="light">...</section> <!-- любой фрагмент -->
```

Без атрибута действует тема системы (`prefers-color-scheme`). Акцент продукта задаётся атрибутом `data-product` на любом элементе:

```html
<body class="fa-app" data-product="gold">
```

Переопределяется только группа акцента: `accent`, `accent-hover`, `accent-press`, `on-accent`, `accent-border`, `island-accent`. Остальное ядро остаётся общим. Подробнее в [tokens.md](tokens.md).
