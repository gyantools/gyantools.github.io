/*!
 * GyanTools — Google Analytics 4 Loader (assets/ga.js)
 * ------------------------------------------------
 * GA4 Measurement ID : G-4KFSJSLG7B
 * Ek hi file, poori site ke liye — bilkul ads.js ki tarah.
 *
 * NOTE (v2): Ab standard gtag.js snippet HAR page ke <head> me inline hai.
 * Ye file sirf FALLBACK loader + event-tracking karti hai:
 *   - Inline snippet mila -> sirf events (scroll, tool_use, ad_click...)
 *   - Inline snippet nahi -> khud gtag.js load + config (double-guard ke saath)
 *
 * Install: har page me </body> se pehle:
 *     <script defer src="/assets/ga.js"></script>
 *
 * (Blog/tools/games pages me path relative hai, isliye wahan
 *  "../assets/ga.js" use karein — patch-ga4.py ye khud handle karta hai.)
 *
 * Features:
 *  1. GA4 + Consent Mode v2 (default consent state set)
 *  2. Enhanced measurement (scroll, outbound click, site search, video)
 *  3. Calculator tracking -> 'tool_use' event (kis tool ka kitna use ho raha hai)
 *  4. Result-image download -> 'result_image_download'
 *  5. Ad click / smartlink click -> 'ad_click' (sponsored, nofollow)
 *  6. Page-type + tool-name custom dimensions
 *  7. ads.js ke saath conflict-free (dono defer hain, order matter nahi)
 *
 * Config neeche CONFIG me hai — sirf wahi edit karni hai.
 */
(function () {
  "use strict";

  var CONFIG = {
    measurementId: "G-4KFSJSLG7B",

    // DPDP Act 2023 (India) ke liye: analytics_storage granted rakha hai
    // taaki data milta rahe. Agar consent banner lagate ho to ise
    // "denied" karo aur banner ke "Accept" par gtag('consent','update') chalao.
    analyticsConsent: "granted",

    // EEA/UK/CH traffic ke liye — agar wahan traffic nahi hai to bhi
    // denied rakhna safe hai (koi nuksaan nahi).
    adStorage: "denied",

    debug: false,           // console me events dekhne ke liye true karo
    trackScrollDepth: true,
    trackOutbound: true,
    trackToolUse: true,
    trackResultImage: true,
    trackAdClicks: true
  };

  var GA_ID = CONFIG.measurementId;

  /* ---------- Kya ye asli GA property hai? Placeholder check ---------- */
  if (!GA_ID || !/^G-[A-Z0-9]{6,}$/i.test(GA_ID)) {
    if (CONFIG.debug) console.warn("[gt-ga] Invalid Measurement ID:", GA_ID);
    return;
  }

  /* ---------- dataLayer + gtag shim ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  /* ---------- 1. Consent Mode v2 — defaults (gtag.js se PEHLE chalta hai) ---------- */
  gtag("consent", "default", {
    ad_storage: CONFIG.adStorage,
    ad_user_data: CONFIG.adStorage,
    ad_personalization: CONFIG.adStorage,
    analytics_storage: CONFIG.analyticsConsent,
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500
  });

  /* ---------- 2. gtag.js loader (SAFE — double-load guard) ----------
     Ab har page ke <head> me standard gtag.js snippet inline hai.
     Agar wo already maujood hai to yahan se library dobara load NAHI karte
     aur config bhi dobara push nahi karte — warna page_view DOUBLE ho jata. */
  var libPresent = !!document.querySelector('script[src*="googletagmanager.com/gtag/js"]');

  if (!libPresent) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    s.setAttribute("data-cfasync", "false");
    (document.head || document.documentElement).appendChild(s);
    gtag("js", new Date());
  }

  function pageType() {
    var p = location.pathname;
    if (p === "/" || p.indexOf("index.html") > -1) return p.indexOf("/blog/") > -1 ? "blog-index" : "home";
    if (p.indexOf("/tools/") > -1) return "tool";
    if (p.indexOf("/blog/") > -1) return "blog";
    if (p.indexOf("/games/") > -1) return "game";
    return "page";
  }

  function slug() {
    var f = location.pathname.split("/").pop() || "index";
    return f.replace(/\.html$/, "");
  }

  if (libPresent) {
    /* Inline snippet ne config bhej di hai — hum sirf event-enrichment karte hain. */
  } else gtag("config", GA_ID, {
    // Enhanced measurement GA4 me auto-on hota hai; yahan explicit rakha hai
    send_page_view: true,
    cookie_flags: "SameSite=None;Secure",
    // Custom dimensions (GA4 admin me bhi register karein -> better reports)
    custom_map: {
      dimension1: "page_type",
      dimension2: "content_slug"
    },
    page_type: pageType(),
    content_slug: slug()
  });

  /* Extra page_view event? Nahi — config ka send_page_view:true kaafi hai.
     Dobara bhejne se pageviews double ho jayenge. */

  function send(name, params) {
    params = params || {};
    try { gtag("event", name, params); } catch (e) {}
    if (CONFIG.debug) console.log("[gt-ga]", name, params);
  }

  /* ---------- 4. Scroll depth (25/50/75/90%) ---------- */
  if (CONFIG.trackScrollDepth) {
    var marks = [25, 50, 75, 90], sentMarks = {};
    var onScroll = function () {
      var h = document.documentElement;
      var total = h.scrollHeight - h.clientHeight;
      if (total <= 0) return;
      var pct = Math.round((h.scrollTop / total) * 100);
      for (var i = 0; i < marks.length; i++) {
        var m = marks[i];
        if (pct >= m && !sentMarks[m]) {
          sentMarks[m] = 1;
          send("scroll_depth", { percent_scrolled: m, content_slug: slug() });
        }
      }
      if (sentMarks[90]) window.removeEventListener("scroll", onScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- 5. Outbound + ad clicks ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";

    // 5a. Sponsored / smartlink / ad-network clicks
    if (CONFIG.trackAdClicks) {
      var isAd = a.rel && /sponsored/.test(a.rel);
      var isAdHost = /profitableratecpmnetwork|highrevenueformat|adsterra|googlesyndication|doubleclick/.test(href);
      if (isAd || isAdHost) {
        send("ad_click", {
          link_url: href,
          link_text: (a.textContent || "").trim().slice(0, 100),
          content_slug: slug(),
          page_type: pageType()
        });
        return;
      }
    }

    // 5b. Normal outbound
    if (CONFIG.trackOutbound && /^https?:\/\//i.test(href)) {
      var host = "";
      try { host = new URL(href, location.href).hostname; } catch (err) {}
      if (host && host !== location.hostname && !/gyantools\.github\.io$/.test(host)) {
        send("outbound_click", {
          link_domain: host,
          link_url: href,
          content_slug: slug()
        });
      }
    }
  }, true);

  /* ---------- 6. Calculator / tool use tracking ----------
     Tool pages par button click, form submit, ya "result" box
     dikhne par ek hi event bhejta hai (debounced). */
  if (CONFIG.trackToolUse) {
    var toolFired = false;
    function fireTool(trigger) {
      if (toolFired) return;
      toolFired = true;
      send("tool_use", {
        tool_name: slug(),
        page_type: pageType(),
        trigger: trigger
      });
    }

    document.addEventListener("click", function (e) {
      var el = e.target;
      if (!el) return;
      var btn = el.closest && el.closest("button, input[type=submit], .btn, [onclick]");
      if (btn && pageType() === "tool") fireTool("button_click");
    }, true);

    // Result box #out me content aane par bhi fire karo
    var out = document.querySelector("#out, .result, [data-result]");
    if (out && "MutationObserver" in window) {
      var mo = new MutationObserver(function () {
        if ((out.textContent || "").trim().length > 20) fireTool("result_shown");
      });
      mo.observe(out, { childList: true, subtree: true, characterData: true });
    }
  }

  /* ---------- 7. Result image download tracking ---------- */
  if (CONFIG.trackResultImage) {
    document.addEventListener("click", function (e) {
      var el = e.target;
      var btn = el && el.closest && el.closest("[data-gt-result-image], .gt-ri-btn, a[download]");
      if (btn) {
        send("result_image_download", { tool_name: slug(), page_type: pageType() });
      }
    }, true);
  }

  /* ---------- 8. Blog engagement: 60s read milestone ---------- */
  if (pageType() === "blog") {
    setTimeout(function () {
      send("blog_read_60s", { content_slug: slug() });
    }, 60000);
  }

  /* ---------- 9. Errors (chhote signal ke liye — tool crash pakadne me help) ---------- */
  window.addEventListener("error", function (ev) {
    if (!ev || !ev.message) return;
    send("js_error", {
      error_message: String(ev.message).slice(0, 150),
      content_slug: slug()
    });
  });

  /* ---------- 10. Public helper — kisi bhi page se custom event ----------
     window.gtTrack('my_event', { foo: 'bar' });
  -------------------------------------------------------------------- */
  window.gtTrack = send;
})();
