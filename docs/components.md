# Компоненты

Компоненты это CSS-классы `fa-*` (файл [`src/components.css`](../src/components.css)) и три небольших скрипта без зависимостей. Живые примеры, состояния и размеры смотрите в брендбуке (`npm start`, раздел «Элементы» и «Карточки»).

Общие правила: все цвета, радиусы, отступы и движение берутся из токенов, у каждого интерактивного элемента есть состояния (обычное, наведение, фокус, нажатие, отключено, загрузка), у каждой анимации есть вариант для `prefers-reduced-motion`.

## Страница

```html
<body class="fa-app" data-theme="light">
```

Типографика: классы `fa-t-display`, `fa-t-title`, `fa-t-kpi`, `fa-t-section`, `fa-t-body-lg`, `fa-t-body`, `fa-t-table`, `fa-t-label`, `fa-t-caption`, `fa-t-id`. Размеры в [tokens.md](tokens.md).

## Кнопки

```html
<button class="fa-btn fa-btn--default">Сохранить</button>
<button class="fa-btn fa-btn--secondary">Отмена</button>
<button class="fa-btn fa-btn--destructive">Удалить</button>
<button class="fa-btn fa-btn--ghost fa-btn--icon" aria-label="Закрыть">...</button>
```

| Вариант | Для чего |
|---|---|
| `fa-btn--default` | Янтарная главная кнопка. Одна на экран |
| `fa-btn--cta` | Главное действие на тёмном острове |
| `fa-btn--secondary` | Второстепенное действие |
| `fa-btn--outline` | Светлая заливка с мягкой тенью |
| `fa-btn--ghost` | Без заливки |
| `fa-btn--destructive` | Опасное действие |

Размеры: `fa-btn--sm` (36, только мышь), обычный 44, `fa-btn--lg` (48), `fa-btn--xl` (56, главная кнопка водителя). `fa-btn--icon` делает кнопку квадратной под иконку.

Состояния: `:hover`, `:focus-visible`, `:active` (масштаб 0,96), `disabled`, `data-state="loading"`. Для демонстрации состояния принудительно: `data-state="hover|pressed|loading|disabled"`. Hover включается только на устройствах, которые умеют наводиться. Кнопки плоские: без обводки, блеска и объёма.

## Поля

```html
<div class="fa-field">
  <label for="mc">Номер MC</label>
  <input id="mc" class="fa-input" value="MC 784321">
  <span class="fa-field-hint">Подсказка под полем</span>
</div>

<div class="fa-field">
  <label for="ins">Страховка до</label>
  <input id="ins" class="fa-input" aria-invalid="true">
  <span class="fa-field-error">Срок истёк. Загрузите новый сертификат.</span>
</div>

<textarea class="fa-textarea" placeholder="Комментарий"></textarea>
```

Поле 44 px, pill. `fa-textarea` с радиусом 16. Ошибка включается атрибутом `aria-invalid="true"` и текстом `fa-field-error`.

## Список (select)

Обычный `select` с классом `fa-select` превращается скриптом `falcon-select.js` в pill-кнопку со списком в стиле кита. Нативный `select` остаётся в DOM: значение формы и событие `change` работают как раньше.

```html
<div class="fa-field">
  <label for="status">Статус</label>
  <select id="status" class="fa-select">
    <option>На проверке</option>
    <option selected>Проверено</option>
    <option>Отклонено</option>
  </select>
</div>

<script src="falcon-sheet.js"></script>
<script src="falcon-select.js"></script>
```

Что умеет:

- `optgroup` превращается в группы с подписью, `disabled` у `option` делает пункт недоступным;
- больше 8 пунктов: появляется поле фильтра;
- клавиатура: стрелки, Home, End, Enter, Space, Esc, набор букв прыгает к пункту; список, открытый с клавиатуры, появляется без анимации;
- список растёт из кнопки (origin по триггеру), сам переворачивается вверх, если снизу нет места;
- на телефоне (узкий экран и касание) список открывается нижним листом, если подключён `falcon-sheet.js`;
- `aria-invalid="true"` на `select` красит рамку, как у поля с ошибкой.

JS-интерфейс:

```js
FaSelect.enhance(контейнер); // подхватить select.fa-select, добавленные позже
FaSelect.close();            // закрыть открытый список
```

Скрипт сам вызывает `enhance(document)` при загрузке.

## Переключатели

```html
<label class="fa-switch"><input type="checkbox" role="switch" aria-label="Уведомления"><span></span></label>
<label class="fa-check"><input type="checkbox" aria-label="Согласен"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></label>
<label class="fa-radio"><input type="radio" name="r" aria-label="Вариант 1"><i></i></label>
```

## Вкладки, сегменты, чипы

```html
<!-- вкладки-пилюли -->
<div class="fa-pills" role="tablist">
  <a class="fa-pill" role="tab" href="#a" aria-selected="true">Все</a>
  <a class="fa-pill" role="tab" href="#b" aria-selected="false">Проверки</a>
</div>

<!-- сегменты со скользящим индикатором: --n количество, --i активный (с нуля) -->
<div class="fa-seg" style="--n:3;--i:0" role="group">
  <button aria-pressed="true">S</button>
  <button aria-pressed="false">M</button>
  <button aria-pressed="false">L</button>
</div>

<!-- чипы статуса: тёмный текст и цветная точка -->
<span class="fa-badge fa-badge--success">Действует</span>
<span class="fa-badge fa-badge--warning">Через 3 дня</span>
<span class="fa-badge fa-badge--danger">Истекла</span>
<span class="fa-badge fa-badge--info">В пути</span>
<span class="fa-badge fa-badge--ai">Предложение AI</span>
```

Цвета для AI нет: это подпись и искра. У критичных статусов добавляйте иконку.

## Карточки

Базовая карточка `fa-card` (радиус 24, белая, мягкая тень). Виды:

| Класс | Назначение |
|---|---|
| `fa-card--stat` | Показатель |
| `fa-card--person` | Человек |
| `fa-card--file` | Файл с прогрессом |
| `fa-card--notify` | Уведомление |
| `fa-card--media` | Картинка и подпись |
| `fa-card--action` | Действие (кнопка-карточка) |
| `fa-card--choice` | Выбор роли |
| `fa-card--setting` | Настройки с переключателями |
| `fa-card--ai` | Предложение AI с источником |
| `fa-card--trip` | Следующий шаг рейса |
| `fa-card--empty` | Пустое состояние |
| `fa-card--color` | Цветовая карточка |
| `.fa-island.fa-banner` | Баннер-остров |

Составные части: `fa-card__head`, `fa-card__title`, `fa-card__sub`, `fa-card__body`, `fa-card__foot`.

**Правило сетки.** Однотипные карточки в одном ряду одного размера (и по ширине, и по высоте). Разные виды имеют размер по смыслу и собираются в bento-сетку рядами одной высоты. Один и тот же вид в режиме skeleton занимает тот же размер.

## Острова и сайдбар

```html
<div class="fa-shell">
  <aside class="fa-sidebar">
    <div class="fa-sidebar__head fa-brand">...</div>
    <nav class="fa-nav">
      <div class="fa-nav-label">Начало</div>
      <a class="fa-nav-item" href="#/overview" aria-current="page">Обзор</a>
      <a class="fa-nav-item" href="#/color">Цвет</a>
    </nav>
    <div class="fa-sidebar__foot">...</div>
  </aside>
  <main class="fa-main">
    <header class="fa-toolbar">...</header>
    <div class="fa-page">...</div>
  </main>
</div>
```

- Сайдбар это остров 240 px (рельса 64 при `data-collapsed` на `.fa-shell`). Сворачивание мгновенное.
- Активный пункт (`aria-current="page"`) вырастает из холста справа (260 мс) с вогнутыми углами. Углы нарисованы масками, без градиентов. Пункт доходит до края острова, поэтому на `.fa-nav` нельзя ставить полосу прокрутки: используйте тонкий индикатор поверх (см. `navBar()` в брендбуке).
- Группа «Дополнительно»: `fa-nav-more` (кнопка) и `fa-nav-more__body` (содержимое, атрибут `data-open`).
- `fa-sidebar__falcon` внутри сайдбара рисует портрет сокола внизу.
- До 760 px сайдбар становится панелью по кнопке меню.

## Подсказки

```html
<button class="fa-btn fa-btn--ghost fa-btn--icon" data-tip="Свернуть панель" aria-label="Свернуть панель">...</button>
```

Скрипт `falcon-tooltip.js` показывает один и тот же вид подсказки для любого `[data-tip]`. Подсказка не обрезается контейнерами (позиционируется через `fixed`), переворачивается и прижимается к краям экрана. Первая появляется с задержкой 350 мс, следующие сразу. На сенсорных устройствах только по фокусу.

Сторона: `data-tip-side="top|bottom|left|right"`. Без `falcon-tooltip.js` работает упрощённый CSS-вариант (`fa-tip`).

## Нижний лист

Скрипт `falcon-sheet.js`:

```js
const sheet = FaSheet.open({
  title: 'Новый перевозчик',
  body: '<div class="fa-field">...</div>',      // строка HTML или DOM-узел
  actions: '<button class="fa-btn fa-btn--ghost" data-close>Отмена</button>' +
           '<button class="fa-btn fa-btn--default" data-close>Сохранить</button>',
  tall: false,                                  // высокий лист
  onClose: (why) => {},                         // 'esc' | 'scrim' | 'button' | 'drag' | 'api'
});

sheet.close();       // закрыть из кода
FaSheet.closeAll();  // закрыть все
```

Содержимое с `data-close` закрывает лист по клику. Элемент с `data-autofocus` получает фокус при открытии (для опасных действий ставьте его на безопасную кнопку).

Поведение:

- открытие 320 мс на `ease-drawer`, закрытие 220 мс (быстрее открытия);
- закрывают Esc, касание затемнения, кнопка, свайп вниз; быстрый жест (скорость выше 0,11 пикс/мс) закрывает на любом расстоянии, вверх лист тянется с сопротивлением;
- фокус удерживается внутри листа (Tab по кругу) и возвращается на кнопку, которая открыла лист;
- страница под листом не прокручивается;
- при `prefers-reduced-motion` только плавное появление.

Верхний радиус 32 (остров). `FaSelect` внутри листа работает: список открывается поверх.

## Загрузка

```html
<div class="fa-card fa-skel-stack">
  <span class="fa-skel fa-skel--title"></span>
  <span class="fa-skel fa-skel--text"></span>
  <span class="fa-skel fa-skel--text" style="width:80%"></span>
</div>
```

Skeleton повторяет форму будущего содержимого: `fa-skel--title`, `--text`, `--avatar`, `--kpi`, `--block`, `--btn`, `--chip`. Волна shimmer двигается через `transform` (маска, без градиентов в фоне). Загрузчик с соколом: `fa-falcon-loader`. Плавная замена skeleton на содержимое: `fa-reveal`. При `prefers-reduced-motion` shimmer заменяется мягким пульсом.

## Уведомления

`fa-toast` (тёмная пилюля со знаком) внутри контейнера `fa-toasts`. В брендбуке функция `toast(msg)` в `preview/app.js` показывает пример появления и ухода.

## Сокол и логотип

```html
<span class="fa-mark"></span>       <!-- знак сокола из mask -->
<span class="fa-lockup"></span>     <!-- знак с надписью -->
```

Размер задаётся высотой (`style="height:24px"`). Цвет берётся из `--fa-color-logo` (navy на светлом, белый на тёмном). Логотип только исходный SVG из `assets/logo/`, растягивать, обводить и добавлять свечение нельзя. Фото сокола нейтральное: `fa-falcon-white` на островах, `fa-falcon-gray` на светлом.

## Иллюстрации

Классы `fa-illu`, `fa-slot` (`--square`, `--wide`, `--tall`), `fa-state` для пустых состояний и страниц ошибок. Подробности в [illustrations.md](illustrations.md).
