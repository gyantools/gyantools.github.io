/*! GyanTools – shared site script (footer saal, mobile menu, search filter). Koi tracking nahi. */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    // 1) Footer ka saal apne aap (har saal page edit karne ki zarurat nahi)
    var y = new Date().getFullYear();
    var ys = document.querySelectorAll(".gt-year");
    for (var i = 0; i < ys.length; i++) {
      var v = parseInt(ys[i].textContent, 10);
      if (!v || v < y) ys[i].textContent = String(y);
    }

    // 2) Mobile par menu ek line me scroll hota hai – current section wala link nazar me rahe
    var nav = document.querySelector(".site-header nav");
    var cur = nav && nav.querySelector('a[aria-current="page"]');
    if (nav && cur && nav.scrollWidth > nav.clientWidth) {
      var left = cur.offsetLeft - (nav.clientWidth - cur.offsetWidth) / 2;
      nav.scrollLeft = Math.max(0, left);
    }

    // 3) Search filter: <input data-gt-filter data-gt-scope="#id" data-gt-items=".card" data-gt-groups=".group">
    function norm(s) {
      return (s || "").toLowerCase()
        .replace(/\u093c/g, "")          // nukta (ज़ -> ज)
        .replace(/\u0901/g, "\u0902")    // chandrabindu -> anusvara
        .replace(/[\u200c\u200d]/g, "")
        .replace(/\s+/g, " ").trim();
    }
    var inputs = document.querySelectorAll("input[data-gt-filter]");
    Array.prototype.forEach.call(inputs, function (inp) {
      var scope = document.querySelector(inp.getAttribute("data-gt-scope") || "body") || document.body;
      var items = scope.querySelectorAll(inp.getAttribute("data-gt-items") || ".card");
      var groups = inp.getAttribute("data-gt-groups") ? scope.querySelectorAll(inp.getAttribute("data-gt-groups")) : [];
      var none = scope.querySelector(".gt-noresult");
      var index = Array.prototype.map.call(items, function (el) {
        return norm(el.textContent + " " + (el.getAttribute("data-k") || ""));
      });
      function run() {
        var q = norm(inp.value);
        var words = q ? q.split(" ") : [];
        var shown = 0;
        Array.prototype.forEach.call(items, function (el, k) {
          var ok = true;
          for (var w = 0; w < words.length; w++) { if (index[k].indexOf(words[w]) === -1) { ok = false; break; } }
          el.classList.toggle("gt-hide", !ok);
          if (ok) shown++;
        });
        Array.prototype.forEach.call(groups, function (g) {
          var vis = g.querySelectorAll(inp.getAttribute("data-gt-items") || ".card");
          var any = false;
          for (var j = 0; j < vis.length; j++) { if (!vis[j].classList.contains("gt-hide")) { any = true; break; } }
          g.classList.toggle("gt-hide", !any);
        });
        if (none) none.style.display = shown ? "none" : "block";
      }
      inp.addEventListener("input", run);
      // ?q=emi jaise link se search pehle se bhara mile
      try {
        var q0 = new URLSearchParams(location.search).get("q");
        if (q0) { inp.value = q0; run(); }
      } catch (e) {}
    });
  });
})();
