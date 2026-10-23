/* Falcon tooltip. One look for every [data-tip] element, never clipped by scroll containers.
   Include once: <script src="dist/js/falcon-tooltip.js"></script>. No dependencies.
   Side: data-tip-side="top|bottom|right|left", or the classes fa-tip--below / fa-tip--right. Flips and clamps to the viewport. */
(() => {
  const root = document.documentElement;
  root.setAttribute('data-fa-tooltips', '');
  const GAP = 8, EDGE = 8, SHOW_DELAY = 350, WARM = 500;
  let tip = null, target = null, timer = 0, lastHide = 0;

  const ensure = () => {
    if (tip) return tip;
    tip = document.createElement('div');
    tip.className = 'fa-tooltip'; tip.id = 'fa-tooltip'; tip.setAttribute('role', 'tooltip');
    document.body.append(tip);
    return tip;
  };
  const sideOf = (el) => el.dataset.tipSide || (el.classList.contains('fa-tip--right') ? 'right' : el.classList.contains('fa-tip--below') ? 'bottom' : 'top');

  function place(el) {
    const t = ensure(), r = el.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
    t.textContent = el.dataset.tip;
    t.removeAttribute('data-show');
    t.style.left = '0px'; t.style.top = '0px';
    const w = t.offsetWidth, h = t.offsetHeight;
    let side = sideOf(el);
    const fits = { top: r.top - GAP - h >= EDGE, bottom: r.bottom + GAP + h <= vh - EDGE, left: r.left - GAP - w >= EDGE, right: r.right + GAP + w <= vw - EDGE };
    if (!fits[side]) side = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }[side];
    let x, y;
    if (side === 'top' || side === 'bottom') { x = r.left + r.width / 2 - w / 2; y = side === 'top' ? r.top - GAP - h : r.bottom + GAP; }
    else { y = r.top + r.height / 2 - h / 2; x = side === 'left' ? r.left - GAP - w : r.right + GAP; }
    x = Math.min(Math.max(EDGE, x), vw - EDGE - w); y = Math.min(Math.max(EDGE, y), vh - EDGE - h);
    t.style.left = Math.round(x) + 'px'; t.style.top = Math.round(y) + 'px';
    t.dataset.side = side;
  }
  function show(el, instant) {
    if (!el.dataset.tip) return;
    clearTimeout(timer);
    const go = () => {
      target = el; place(el);
      const t = ensure();
      t.toggleAttribute('data-instant', instant || Date.now() - lastHide < WARM);
      void t.offsetWidth; t.setAttribute('data-show', '');
      el.setAttribute('aria-describedby', 'fa-tooltip');
    };
    if (instant || Date.now() - lastHide < WARM) go(); else timer = setTimeout(go, SHOW_DELAY);
  }
  function hide() {
    clearTimeout(timer);
    if (target) { target.removeAttribute('aria-describedby'); target = null; lastHide = Date.now(); }
    if (tip) tip.removeAttribute('data-show');
  }
  const host = (n) => (n && n.closest ? n.closest('[data-tip]') : null);

  document.addEventListener('pointerover', (e) => { if (e.pointerType !== 'mouse') return; const el = host(e.target); if (el && el !== target) { hide(); show(el); } });
  document.addEventListener('pointerout', (e) => { const el = host(e.target); if (el && !el.contains(e.relatedTarget)) hide(); });
  document.addEventListener('focusin', (e) => { const el = host(e.target); if (el && el.matches(':focus-visible')) show(el, true); });
  document.addEventListener('focusout', hide);
  document.addEventListener('pointerdown', hide);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
  addEventListener('scroll', hide, true);
  addEventListener('resize', hide);
})();
