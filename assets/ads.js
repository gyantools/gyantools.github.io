/*!
 * GyanTools – Global Ads Loader (Adsterra)
 * ----------------------------------------
 * Ek hi file, poori site ke liye. Ise har page me </body> se pehle load kiya gaya hai:
 *     <script defer src="/assets/ads.js"></script>
 *
 * Isme 3 ads hain:
 *   AD 1 -> Popunder        (per page 1 baar, site-wide)
 *   AD 2 -> Banner responsive (desktop 468x60 / mobile 320x50) x2 slots, iframe-safe
 *   AD 3 -> Social Bar      (per page 1 baar, site-wide)
 *   AD 4 -> Native Banner   (content ke end me, 1 per page - highest CTR)
 *   AD 5 -> Smart/Direct Link (ek soft CTA card, sirf blog + tools pages par)
 *
 * Kisi bhi ad ko band karna ho to neeche CONFIG me false kar do.
 */
(function () {
  "use strict";

  var CONFIG = {
    popunder:  true,
    banner:    true,
    socialbar: true,
    native:    true,
    smartlink: true,

    popunderSrc:  "https://pl31482627.profitableratecpmnetwork.com/93/1e/39/931e39403e715fe31d4eacef738517b0.js",
    socialbarSrc: "https://pl31482630.profitableratecpmnetwork.com/3d/4c/94/3d4c94ab00ca2c911bb7164398d48dbb.js",
    // AD 2 – Banner (device ke hisaab se apne aap size chunta hai)
    bannerDesktop: { key: "162cde40b339e785aa9b73e10808923b", w: 468, h: 60 },
    bannerMobile:  { key: "3249ac24f703bb9c60d2b370045791c6", w: 320, h: 50 },
    mobileBreakpoint: 520,

    // Mobile par 320x50 ko screen ke neeche chipka doon? (Social Bar bhi neeche
    // aata hai, isliye default OFF. Social Bar band karo to ise true kar sakte ho.)
    stickyMobile: false,

    // AD 4 – Native Banner (ek page par sirf 1 baar, container id fix hai)
    nativeKey: "16790b47506774e79c7202d1efbbc1bd",
    nativeSrc: "https://pl31482628.profitableratecpmnetwork.com/16790b47506774e79c7202d1efbbc1bd/invoke.js",

    // AD 5 – Smart / Direct Link
    smartlinkUrl: "https://www.profitableratecpmnetwork.com/vnsmfznj?key=78d71440669d5b6c1a722ce971738b27",
    smartlinkText: "🎁 आज के टॉप ऑफर और कमाई के मौके देखें",
    smartlinkSub: "प्रायोजित · नए टैब में खुलेगा",

    // Sabse zyada banner slots kitne? (Adsterra ko spam se bachane ke liye limit)
    maxBanners: 2,

    // In pages par koi ad nahi (policy/legal pages – clean rakhna behtar hai)
    skipPages: ["privacy-policy.html", "terms-conditions.html", "disclaimer.html", "404.html"]
  };

  var path = location.pathname.split("/").pop() || "index.html";
  var isMobile = window.matchMedia
    ? window.matchMedia("(max-width:" + CONFIG.mobileBreakpoint + "px)").matches
    : window.innerWidth <= CONFIG.mobileBreakpoint;
  // Device ke hisaab se sahi banner unit chun liya
  var BAN = isMobile ? CONFIG.bannerMobile : CONFIG.bannerDesktop;
  for (var s = 0; s < CONFIG.skipPages.length; s++) {
    if (path === CONFIG.skipPages[s]) return;
  }
  if (window.__gtAdsLoaded) return;
  window.__gtAdsLoaded = true;

  /* ---------- helpers ---------- */
  function loadScript(src) {
    var sc = document.createElement("script");
    sc.src = src;
    sc.async = true;
    sc.referrerPolicy = "no-referrer-when-downgrade";
    (document.body || document.documentElement).appendChild(sc);
  }

  function injectStyle() {
    if (document.getElementById("gt-ads-style")) return;
    var st = document.createElement("style");
    st.id = "gt-ads-style";
    st.textContent =
      ".gt-ad{margin:22px auto;text-align:center;max-width:100%;overflow:hidden;" +
      "clear:both;min-height:" + (BAN.h + 18) + "px}" +
      ".gt-sticky{position:fixed;left:0;right:0;bottom:0;z-index:9999;margin:0;padding:4px 0;" +
      "background:rgba(255,255,255,.96);box-shadow:0 -2px 10px rgba(0,0,0,.12);min-height:" +
      (BAN.h + 8) + "px}" +
      ".gt-sticky .gt-ad-label{display:none}" +
      "body.gt-has-sticky{padding-bottom:" + (BAN.h + 14) + "px}" +
      ".gt-ad-label{display:block;font-size:11px;letter-spacing:.5px;color:#9aa0a6;" +
      "text-transform:uppercase;margin-bottom:6px;font-family:system-ui,Arial,sans-serif}" +
      ".gt-ad iframe{border:0;display:block;margin:0 auto;max-width:100%}" +
      ".gt-native{margin:26px auto;max-width:100%;min-height:200px;clear:both}" +
      ".gt-sl{display:block;margin:24px auto;max-width:640px;padding:14px 18px;" +
      "border:1px solid #e3e6ea;border-radius:12px;background:linear-gradient(135deg,#f8fbff,#eef4ff);" +
      "text-decoration:none;color:#1a73e8;font-weight:600;font-size:16px;text-align:center;" +
      "font-family:system-ui,Arial,sans-serif;box-shadow:0 1px 3px rgba(0,0,0,.06);" +
      "transition:transform .15s ease,box-shadow .15s ease}" +
      ".gt-sl:hover{transform:translateY(-2px);box-shadow:0 4px 14px rgba(26,115,232,.18)}" +
      ".gt-sl small{display:block;margin-top:4px;font-weight:400;font-size:11px;color:#9aa0a6;" +
      "text-transform:uppercase;letter-spacing:.4px}" +
      "@media(max-width:520px){.gt-ad{margin:16px auto}.gt-sl{font-size:15px;padding:12px 14px}}";
    document.head.appendChild(st);
  }

  /* ---------- AD 2: Banner 468x60 (isolated iframe, page JS ko touch nahi karta) ---------- */
  function renderBanner(box) {
    var f = document.createElement("iframe");
    f.width = BAN.w;
    f.height = BAN.h;
    f.scrolling = "no";
    f.frameBorder = "0";
    f.setAttribute("title", "Advertisement");
    f.setAttribute("loading", "lazy");
    f.style.cssText = "border:0;overflow:hidden;width:" + BAN.w + "px;height:" +
                      BAN.h + "px;max-width:100%";
    box.appendChild(f);
    var d = f.contentWindow.document;
    d.open();
    d.write(
      '<!DOCTYPE html><html><head><meta charset="utf-8">' +
      '<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style>' +
      "</head><body>" +
      "<script>atOptions={'key':'" + BAN.key + "','format':'iframe','height':" +
      BAN.h + ",'width':" + BAN.w + ",'params':{}};<\/script>" +
      '<script src="https://www.highrevenueformat.com/' + BAN.key + '/invoke.js"><\/script>' +
      "</body></html>"
    );
    d.close();
  }

  function makeSlot() {
    var box = document.createElement("div");
    box.className = "gt-ad";
    box.setAttribute("aria-hidden", "true");
    var lbl = document.createElement("span");
    lbl.className = "gt-ad-label";
    lbl.textContent = "विज्ञापन";
    box.appendChild(lbl);
    return box;
  }

  /* Banner kahan lagega – smart placement, har page type ke hisaab se */
  function placeBanners() {
    var slots = [];

    // 1) Pehla slot: tool/calculator ke result box ya pehle bade section ke baad
    var anchor =
      document.querySelector(".tool-box, .calc-box, .card, main > section, .container > section") ||
      document.querySelector("main > div, article > p:nth-of-type(2)") ||
      null;
    if (anchor && anchor.parentNode) {
      var s1 = makeSlot();
      anchor.parentNode.insertBefore(s1, anchor.nextSibling);
      slots.push(s1);
    }

    // 2) Doosra slot: footer se theek pehle (har page par milega)
    var footer = document.querySelector("footer");
    if (slots.length < CONFIG.maxBanners) {
      var s2 = makeSlot();
      if (footer && footer.parentNode) footer.parentNode.insertBefore(s2, footer);
      else document.body.appendChild(s2);
      slots.push(s2);
    }

    // 3) Mobile sticky bottom banner (optional – CONFIG.stickyMobile)
    if (isMobile && CONFIG.stickyMobile) {
      var s3 = makeSlot();
      s3.className = "gt-ad gt-sticky";
      document.body.appendChild(s3);
      document.body.classList.add("gt-has-sticky");
      renderBanner(s3);
    }

    // Lazy render – jab user paas pahunche tabhi ad load ho (speed + CLS friendly)
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { io.unobserve(e.target); renderBanner(e.target); }
        });
      }, { rootMargin: "300px 0px" });
      slots.forEach(function (el) { io.observe(el); });
    } else {
      slots.forEach(renderBanner);
    }
  }

  /* ---------- AD 4: Native Banner (content ke end me, footer se pehle) ---------- */
  function placeNative() {
    if (document.getElementById("container-" + CONFIG.nativeKey)) return;

    var wrap = document.createElement("div");
    wrap.className = "gt-native";
    var lbl = document.createElement("span");
    lbl.className = "gt-ad-label";
    lbl.textContent = "आपके लिए सुझाव";
    var box = document.createElement("div");
    box.id = "container-" + CONFIG.nativeKey;
    wrap.appendChild(lbl);
    wrap.appendChild(box);

    // Article/tool content ke turant baad, footer se pehle
    var host = document.querySelector("article, main, .container") || document.body;
    var footer = document.querySelector("footer");
    if (footer && footer.parentNode) footer.parentNode.insertBefore(wrap, footer);
    else host.appendChild(wrap);

    var load = function () {
      var sc = document.createElement("script");
      sc.src = CONFIG.nativeSrc;
      sc.async = true;
      sc.setAttribute("data-cfasync", "false");
      document.body.appendChild(sc);
    };

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { io.disconnect(); load(); }
      }, { rootMargin: "400px 0px" });
      io.observe(wrap);
    } else { load(); }
  }

  /* ---------- AD 5: Smart / Direct Link – soft CTA card ---------- */
  function placeSmartlink() {
    // Sirf blog + tools + games pages par (homepage clean rahe = better SEO)
    if (location.pathname === "/" || path === "index.html") return;

    var a = document.createElement("a");
    a.className = "gt-sl";
    a.href = CONFIG.smartlinkUrl;
    a.target = "_blank";
    a.rel = "nofollow sponsored noopener";
    a.innerHTML = CONFIG.smartlinkText + "<small>" + CONFIG.smartlinkSub + "</small>";

    // Content ke beech me – pehle bade heading (h2) se ठीक pehle
    var h2 = document.querySelectorAll("h2");
    if (h2.length >= 2 && h2[1].parentNode) {
      h2[1].parentNode.insertBefore(a, h2[1]);
    } else {
      var footer = document.querySelector("footer");
      if (footer && footer.parentNode) footer.parentNode.insertBefore(a, footer);
      else document.body.appendChild(a);
    }
  }

  function boot() {
    injectStyle();
    if (CONFIG.banner)    placeBanners();
    if (CONFIG.native)    placeNative();
    if (CONFIG.smartlink) placeSmartlink();
    if (CONFIG.popunder)  loadScript(CONFIG.popunderSrc);
    if (CONFIG.socialbar) setTimeout(function () { loadScript(CONFIG.socialbarSrc); }, 1200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
