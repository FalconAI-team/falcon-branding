// Тема: «авто» следует системе, выбор запоминается. Больше скриптов на странице нет.
(function () {
  var KEY = "falcon-brand-next-theme";
  var root = document.documentElement;
  function apply(mode) {
    if (mode === "light" || mode === "dark") root.setAttribute("data-theme", mode);
    else root.removeAttribute("data-theme");
    document.querySelectorAll("[data-set-theme]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-set-theme") === (mode || "auto")));
    });
  }
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  var forced = new URLSearchParams(location.search).get("theme");
  apply(forced || saved || "auto");
  document.addEventListener("DOMContentLoaded", function () {
    apply(forced || saved || "auto");
    document.querySelectorAll("[data-set-theme]").forEach(function (b) {
      b.addEventListener("click", function () {
        var mode = b.getAttribute("data-set-theme");
        try { localStorage.setItem(KEY, mode); } catch (e) {}
        apply(mode);
      });
    });
  });
})();
