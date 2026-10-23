/* Falcon bottom sheet. FaSheet.open({ title, body, actions, tall, onClose }) returns { close, el, body }.
   body is an HTML string or a node. Esc, scrim click and drag down close it. Focus is trapped and restored.
   Enter 320 ms and exit 220 ms on --fa-motion-ease-drawer. Under prefers-reduced-motion it only fades. */
(function () {
  'use strict';
  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  var stack = [];
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var reduced = function () { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; };

  function open(o) {
    o = o || {};
    var from = document.activeElement;
    var root = document.createElement('div');
    root.className = 'fa-sheet-root';
    var id = 'fa-sheet-' + Math.random().toString(36).slice(2, 8);
    root.innerHTML = '<div class="fa-scrim"></div>' +
      '<section class="fa-sheet' + (o.tall ? ' fa-sheet--tall' : '') + '" role="dialog" aria-modal="true" aria-labelledby="' + id + '-t">' +
      '<div class="fa-sheet__grip"><i></i></div>' +
      '<header class="fa-sheet__head"><b class="fa-sheet__title" id="' + id + '-t">' + esc(o.title || '') + '</b>' +
      '<button class="fa-btn fa-btn--ghost fa-btn--icon fa-btn--sm" type="button" data-close aria-label="Закрыть"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></header>' +
      '<div class="fa-sheet__body"></div>' +
      (o.actions ? '<footer class="fa-sheet__foot"></footer>' : '') + '</section>';
    var sheet = root.querySelector('.fa-sheet'), scrim = root.querySelector('.fa-scrim'), body = root.querySelector('.fa-sheet__body');
    if (typeof o.body === 'string') body.innerHTML = o.body; else if (o.body) body.appendChild(o.body);
    if (o.actions) {
      var foot = root.querySelector('.fa-sheet__foot');
      if (typeof o.actions === 'string') foot.innerHTML = o.actions; else foot.appendChild(o.actions);
    }
    document.body.appendChild(root);
    if (window.FaSelect) window.FaSelect.enhance(root);
    document.documentElement.setAttribute('data-fa-sheet-lock', '');
    var closed = false;

    function close(why) {
      if (closed) return; closed = true;
      stack.splice(stack.indexOf(api), 1);
      if (!stack.length) document.documentElement.removeAttribute('data-fa-sheet-lock');
      root.setAttribute('data-out', ''); sheet.style.transform = ''; sheet.style.transition = '';
      document.removeEventListener('keydown', onKey, true);
      var finished = false;
      var done = function () {
        if (finished) return; finished = true;
        root.remove();
        if (from && from.focus) from.focus({ preventScroll: true });
        if (o.onClose) o.onClose(why);
      };
      var t = setTimeout(done, reduced() ? 140 : 260);
      sheet.addEventListener('transitionend', function (e) { if (e.target === sheet) { clearTimeout(t); done(); } }, { once: true });
    }
    function onKey(e) {
      if (stack[stack.length - 1] !== api) return;
      if (document.querySelector('.fa-menu[data-open]')) return; // an open select list owns Esc and arrows
      if (e.key === 'Escape') { e.stopPropagation(); close('esc'); return; }
      if (e.key !== 'Tab') return;
      var f = [].filter.call(sheet.querySelectorAll(FOCUSABLE), function (x) { return x.offsetParent !== null; });
      if (!f.length) { e.preventDefault(); return; }
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKey, true);
    scrim.addEventListener('click', function () { close('scrim'); });
    root.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) close('button'); });

    /* Drag down: grip and header always, body only when scrolled to the top.
       A fast flick (velocity over 0.11 px/ms) closes at any distance. Dragging up has friction. */
    var drag = null;
    sheet.addEventListener('pointerdown', function (e) {
      if (drag || (e.pointerType === 'mouse' && e.button !== 0)) return;
      var inBody = !!e.target.closest('.fa-sheet__body');
      if (e.target.closest('button,input,select,textarea,a') || (inBody && body.scrollTop > 0)) return;
      drag = { id: e.pointerId, y: e.clientY, t: performance.now(), dy: 0, moved: false, body: inBody };
    });
    sheet.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dy = e.clientY - drag.y;
      if (!drag.moved) {
        if (drag.body && dy < -4) { drag = null; return; }
        if (Math.abs(dy) < 6) return;
        drag.moved = true; sheet.setPointerCapture(e.pointerId); sheet.style.transition = 'none';
      }
      drag.dy = dy < 0 ? -Math.pow(-dy, 0.6) : dy;
      sheet.style.transform = 'translateY(' + drag.dy + 'px)';
    });
    function end(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag; drag = null;
      if (!d.moved) return;
      var v = d.dy / Math.max(1, performance.now() - d.t);
      sheet.style.transition = '';
      if (d.dy > sheet.offsetHeight * 0.4 || v > 0.11) close('drag'); else sheet.style.transform = '';
    }
    sheet.addEventListener('pointerup', end);
    sheet.addEventListener('pointercancel', end);

    var api = { el: sheet, body: body, close: close };
    stack.push(api);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.setAttribute('data-in', '');
        var f = sheet.querySelector('[data-autofocus]') || sheet.querySelector('.fa-sheet__body [tabindex],.fa-sheet__body button,.fa-sheet__body input,.fa-sheet__body select,.fa-sheet__body a[href]') || sheet.querySelector('[data-close]');
        if (f) f.focus({ preventScroll: true });
      });
    });
    return api;
  }

  window.FaSheet = { open: open, closeAll: function () { stack.slice().forEach(function (s) { s.close('api'); }); } };
})();
