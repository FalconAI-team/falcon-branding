/* Falcon select. Turns <select class="fa-select"> into a pill trigger with a popover list.
   The native <select> stays in the DOM (form value, change event). Keyboard: arrows, Home/End, Enter, Space, Esc, type-ahead.
   Lists over 8 options get a filter field. On phones (coarse pointer, narrow) the list opens in a bottom sheet when FaSheet is loaded.
   FaSelect.enhance(root) upgrades selects added later. */
(function () {
  'use strict';
  var CHEV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  var CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var cur = null, uid = 0;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var phone = function () { return window.FaSheet && matchMedia('(max-width: 560px) and (pointer: coarse)').matches; };

  function rowsOf(sel) {
    var out = [];
    [].forEach.call(sel.children, function (n) {
      if (n.tagName === 'OPTGROUP') {
        out.push({ group: n.label });
        [].forEach.call(n.children, function (o) { out.push({ o: o }); });
      } else if (n.tagName === 'OPTION') out.push({ o: n });
    });
    return out;
  }

  function enhance(root) {
    [].forEach.call((root || document).querySelectorAll('select.fa-select:not([data-fa-done])'), build);
  }

  function build(sel) {
    sel.setAttribute('data-fa-done', '');
    var wrap = document.createElement('span');
    wrap.className = 'fa-selectx';
    if (sel.style.cssText) { wrap.style.cssText = sel.style.cssText; sel.style.cssText = ''; }
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);
    sel.classList.add('fa-select--native');
    sel.tabIndex = -1;
    sel.setAttribute('aria-hidden', 'true');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fa-select-btn';
    btn.setAttribute('role', 'combobox');
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span class="fa-select-btn__v"></span>' + CHEV;
    wrap.appendChild(btn);
    var aria = sel.getAttribute('aria-label');
    if (aria) btn.setAttribute('aria-label', aria);
    var label = sel.id ? document.querySelector('label[for="' + sel.id + '"]') : null;
    if (label) {
      label.id = label.id || 'fa-l-' + sel.id;
      btn.setAttribute('aria-labelledby', label.id);
      label.addEventListener('click', function (e) { e.preventDefault(); btn.focus(); });
    }
    function sync() {
      var o = sel.options[sel.selectedIndex];
      btn.firstChild.textContent = o ? o.text : '';
      btn.disabled = sel.disabled;
      if (sel.getAttribute('aria-invalid')) btn.setAttribute('aria-invalid', sel.getAttribute('aria-invalid')); else btn.removeAttribute('aria-invalid');
    }
    sync();
    new MutationObserver(sync).observe(sel, { childList: true, subtree: true, attributes: true });
    sel.addEventListener('change', sync);
    btn.addEventListener('click', function (e) {
      if (cur && cur.btn === btn) close(); else show(sel, btn, e.detail === 0);
    });
    btn.addEventListener('keydown', function (e) {
      if (cur && cur.btn === btn) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(sel, btn, true); }
    });
  }

  function list(sel, pick, opts) {
    var el = document.createElement('div');
    var id = 'fa-menu-' + (++uid);
    el.className = 'fa-menu__list';
    el.setAttribute('role', 'listbox');
    el.id = id;
    var rows = rowsOf(sel), nodes = [], q = '', act = -1;
    function paint() {
      el.innerHTML = '';
      nodes = [];
      act = -1;
      var any = false, group = null, groupNode = null;
      rows.forEach(function (r) {
        if (r.group !== undefined) { group = r; groupNode = null; return; }
        var o = r.o;
        if (q && o.text.toLowerCase().indexOf(q) < 0) return;
        if (group && !groupNode) {
          groupNode = document.createElement('div');
          groupNode.className = 'fa-menu__group';
          groupNode.setAttribute('role', 'presentation');
          groupNode.textContent = group.group;
          el.appendChild(groupNode);
        }
        var n = document.createElement('div');
        n.className = 'fa-menu__opt';
        n.id = id + '-' + nodes.length;
        n.setAttribute('role', 'option');
        n.setAttribute('aria-selected', String(o.selected));
        if (o.disabled) n.setAttribute('aria-disabled', 'true');
        n.innerHTML = '<span>' + esc(o.text) + '</span>' + CHECK;
        n._o = o;
        nodes.push(n);
        el.appendChild(n);
        any = true;
      });
      if (!any) {
        var e = document.createElement('div');
        e.className = 'fa-menu__empty';
        e.textContent = 'Ничего не найдено';
        el.appendChild(e);
      }
    }
    paint();
    function setActive(i, scroll) {
      if (!nodes.length) return;
      i = Math.max(0, Math.min(nodes.length - 1, i));
      if (act > -1 && nodes[act]) nodes[act].removeAttribute('data-active');
      act = i;
      nodes[i].setAttribute('data-active', '');
      if (opts.owner) opts.owner.setAttribute('aria-activedescendant', nodes[i].id);
      if (scroll) nodes[i].scrollIntoView({ block: 'nearest' });
    }
    function step(d) {
      var i = act;
      do { i += d; } while (nodes[i] && nodes[i]._o.disabled);
      if (nodes[i]) setActive(i, true);
    }
    el.addEventListener('pointermove', function (e) {
      var n = e.target.closest('.fa-menu__opt');
      if (n && !n._o.disabled) setActive(nodes.indexOf(n), false);
    });
    el.addEventListener('click', function (e) {
      var n = e.target.closest('.fa-menu__opt');
      if (n && !n._o.disabled) pick(n._o);
    });
    var typed = '', tt;
    return {
      el: el,
      first: function () {
        var i = nodes.findIndex(function (n) { return n._o.selected; });
        setActive(i < 0 ? 0 : i, true);
      },
      filter: function (v) { q = v.trim().toLowerCase(); paint(); setActive(0, true); },
      key: function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); step(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); step(-1); }
        else if (e.key === 'Home') { e.preventDefault(); setActive(0, true); }
        else if (e.key === 'End') { e.preventDefault(); setActive(nodes.length - 1, true); }
        else if (e.key === 'Enter' || (e.key === ' ' && !opts.search)) { e.preventDefault(); if (nodes[act]) pick(nodes[act]._o); }
        else if (!opts.search && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          clearTimeout(tt);
          typed += e.key.toLowerCase();
          tt = setTimeout(function () { typed = ''; }, 600);
          var i = nodes.findIndex(function (n) { return n._o.text.toLowerCase().indexOf(typed) === 0; });
          if (i > -1) setActive(i, true);
        }
      }
    };
  }

  function show(sel, btn, byKey) {
    close(true);
    function pick(o) {
      sel.value = o.value;
      sel.dispatchEvent(new Event('input', { bubbles: true }));
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      close();
      btn.focus({ preventScroll: true });
    }
    var L;
    if (phone()) {
      var sh;
      L = list(sel, function (o) { pick(o); }, { search: false });
      var lab = document.getElementById(btn.getAttribute('aria-labelledby') || '');
      var title = btn.getAttribute('aria-label') || (lab && lab.textContent) || 'Выбор';
      sh = window.FaSheet.open({ title: title, body: L.el, onClose: function () { if (cur && cur.sheet === sh) { cur = null; btn.setAttribute('aria-expanded', 'false'); } } });
      cur = { btn: btn, sheet: sh };
      btn.setAttribute('aria-expanded', 'true');
      L.first();
      return;
    }
    var menu = document.createElement('div');
    menu.className = 'fa-menu';
    if (byKey) menu.setAttribute('data-instant', '');
    var input = null;
    if (sel.options.length > 8) {
      input = document.createElement('input');
      input.className = 'fa-menu__search';
      input.placeholder = 'Поиск';
      input.setAttribute('aria-label', 'Поиск по списку');
      menu.appendChild(input);
    }
    L = list(sel, pick, { search: !!input, owner: input || btn });
    menu.appendChild(L.el);
    document.body.appendChild(menu);
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-controls', L.el.id);
    place(menu, btn);
    L.first();
    var onDown = function (e) { if (!menu.contains(e.target) && !btn.contains(e.target)) close(); };
    var onKey = function (e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); btn.focus({ preventScroll: true }); return; }
      if (e.key === 'Tab') { close(); return; }
      if (input && e.target === input && (e.key.length === 1 || e.key === 'Backspace')) return;
      L.key(e);
    };
    var onScroll = function (e) { if (!menu.contains(e.target)) close(); };
    var onResize = function () { close(); };
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    if (input) {
      input.addEventListener('input', function () { L.filter(input.value); place(menu, btn); });
      input.focus({ preventScroll: true });
    }
    cur = {
      btn: btn, menu: menu,
      off: function () {
        document.removeEventListener('pointerdown', onDown, true);
        document.removeEventListener('keydown', onKey, true);
        window.removeEventListener('scroll', onScroll, true);
        window.removeEventListener('resize', onResize);
      }
    };
    requestAnimationFrame(function () { menu.setAttribute('data-open', ''); });
  }

  function place(menu, btn) {
    var r = btn.getBoundingClientRect(), vh = innerHeight, vw = innerWidth, gap = 6, edge = 8;
    var listEl = menu.querySelector('.fa-menu__list'), search = menu.querySelector('.fa-menu__search');
    menu.style.minWidth = r.width + 'px';
    menu.style.maxHeight = '';
    if (listEl) listEl.style.maxHeight = '';
    var natural = menu.offsetHeight, below = vh - r.bottom - gap - edge, above = r.top - gap - edge;
    var down = below >= Math.min(natural, 240) || below >= above;
    var h = Math.min(natural, down ? below : above, 360);
    menu.style.maxHeight = h + 'px';
    if (listEl) listEl.style.maxHeight = (h - (search ? search.offsetHeight + 6 : 0) - 12) + 'px';
    var left = Math.min(Math.max(edge, r.left), Math.max(edge, vw - menu.offsetWidth - edge));
    menu.style.left = left + 'px';
    menu.style.top = (down ? r.bottom + gap : r.top - gap - menu.offsetHeight) + 'px';
    menu.setAttribute('data-side', down ? 'bottom' : 'top');
    menu.style.transformOrigin = Math.max(0, r.left + Math.min(r.width, 160) / 2 - left) + 'px ' + (down ? 'top' : 'bottom');
  }

  function close(now) {
    if (!cur) return;
    var c = cur;
    cur = null;
    c.btn.setAttribute('aria-expanded', 'false');
    c.btn.removeAttribute('aria-controls');
    if (c.sheet) { c.sheet.close('select'); return; }
    c.off();
    var m = c.menu;
    m.removeAttribute('data-open');
    m.setAttribute('data-out', '');
    setTimeout(function () { m.remove(); }, now ? 0 : 140);
  }

  window.FaSelect = { enhance: enhance, close: close };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { enhance(); }); else enhance();
})();
