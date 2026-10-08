/*!
 * GyanTools — Result Image Downloader (assets/result-image.js)
 * Har tool ke result box ke niche "📷 रिज़ल्ट इमेज डाउनलोड करें" button jodta hai.
 * Result ko ek branded image card (PNG) mein render karke download karta hai.
 * 100% client-side — koi server, koi dependency nahi.
 *
 * Page config (</body> se pehle):
 * <script>window.GT_RESULT_IMAGE = {
 *   target : '#out',            // result container (default '#out')
 *   anchor : '#someEl',         // (optional) button kahan insert ho
 *   title  : 'EMI कैलकुलेटर',    // image card ka heading
 *   slug   : 'emi-calculator',  // filename ke liye
 *   alwaysShow : false,         // result khali ho to bhi button dikhao
 *   collect: function(){ ... }  // (optional) custom lines — return {items:[...]}; null = chhupao
 * };</script>
 * <script src="../assets/result-image.js"></script>
 */
(function () {
  'use strict';
  var CFG = window.GT_RESULT_IMAGE || {};
  var TARGET_SEL = CFG.target || '#out';
  var TITLE = CFG.title || document.title.split('–')[0].split('|')[0].trim();
  var SLUG = CFG.slug || (location.pathname.split('/').pop() || 'tool').replace(/\.html$/, '');

  var BLUE = '#1a73e8', DARK = '#202124', GRAY = '#5f6368', BORDER = '#dadce0';
  var FONT = "system-ui,-apple-system,'Segoe UI',Roboto,'Noto Sans Devanagari',sans-serif";

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function init() {
    var target = document.querySelector(TARGET_SEL);
    if (!target) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gt-dl-img-btn';
    btn.setAttribute('aria-label', 'रिज़ल्ट इमेज डाउनलोड करें');
    btn.textContent = '📷 रिज़ल्ट इमेज डाउनलोड करें';
    btn.style.cssText = 'display:none;margin:14px 0 4px;background:linear-gradient(135deg,#1a73e8,#1557b0);color:#fff;border:none;'
      + 'padding:12px 26px;border-radius:24px;font-size:1rem;font-weight:600;font-family:inherit;cursor:pointer;'
      + 'box-shadow:0 2px 6px rgba(26,115,232,.35);';
    btn.addEventListener('mouseover', function () { btn.style.filter = 'brightness(1.08)'; });
    btn.addEventListener('mouseout', function () { btn.style.filter = 'none'; });
    btn.addEventListener('click', function () {
      var data = getItems();
      if (!data || !data.length) { toast('⚠️ पहले कुछ calculate करें'); return; }
      download(render(data));
      toast('✅ इमेज डाउनलोड हो गई!');
    });

    var anchor = CFG.anchor ? document.querySelector(CFG.anchor) : null;
    var host = document.createElement('div');
    host.appendChild(btn);
    (anchor || target).parentNode.insertBefore(host, (anchor || target).nextSibling);

    function refresh() {
      var items = null;
      try { items = getItems(); } catch (e) { items = null; }
      var show = CFG.alwaysShow ? true : !!(items && items.length);
      btn.style.display = show ? 'inline-block' : 'none';
    }
    function getItems() {
      if (CFG.collect) {
        var c = CFG.collect();
        if (!c) return null;
        if (c === 'auto') return visibleAndExtract(target);
        return c.items || c.lines || c || null;
      }
      return visibleAndExtract(target);
    }
    new MutationObserver(refresh).observe(target, { childList: true, subtree: true, attributes: true, characterData: true });
    // input/select ke value changes DOM mutation nahi hote — isliye events bhi sunte hain
    ['input', 'change', 'click', 'keyup'].forEach(function (ev) {
      document.addEventListener(ev, refresh, true);
    });
    refresh();
  }

  /* ---------- Result box se lines/tables nikalna ---------- */
  function isErrorText(t) {
    // chhote ⚠️ validation messages = error (button chhupao); lambe ⚠️ results (jaise FD-TDS) = legit result
    if (!/^\s*⚠️/.test(t)) return false;
    return t.length < 130;
  }

  function visibleAndExtract(root) {
    if (root.offsetParent === null && getComputedStyle(root).position !== 'fixed') return null;
    var raw = (root.innerText || root.textContent || '').trim();
    if (!raw || isErrorText(raw)) return null;
    var items = [];
    Array.prototype.forEach.call(root.childNodes, function (ch) {
      if (ch.nodeType === 3) { // text node
        var t = ch.textContent.replace(/\s+/g, ' ').trim();
        if (t) items.push({ text: t });
        return;
      }
      if (ch.nodeType !== 1) return;
      var tag = ch.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'BUTTON') return;
      if (tag === 'TABLE') { pushTable(items, ch); return; }
      if (tag === 'UL' || tag === 'OL') {
        Array.prototype.forEach.call(ch.children, function (li) {
          var lt = li.textContent.replace(/\s+/g, ' ').trim();
          if (lt) items.push({ text: (tag === 'OL' ? '' : '• ') + lt });
        });
        return;
      }
      if (tag === 'HR' || tag === 'BR') return;
      if (ch.querySelector && ch.querySelector('table') && !(ch.innerText || '').replace(/\s/g, '').length > 0 === false) {
        // div jiske andar table hai (jaise .tblwrap)
        var onlyTables = true, txt = '';
        Array.prototype.forEach.call(ch.childNodes, function (n2) {
          if (n2.nodeType === 3) txt += n2.textContent;
          else if (n2.nodeType === 1 && n2.tagName !== 'TABLE') onlyTables = false;
        });
        if (onlyTables) {
          Array.prototype.forEach.call(ch.querySelectorAll('table'), function (tb) { pushTable(items, tb); });
          return;
        }
      }
      if (tag === 'DIV' && ch.querySelector('progress, .bar')) { /* progress bar: text hi kaafi hai */ }
      var big = ch.classList && ch.classList.contains('big');
      var inner = (ch.innerText || ch.textContent || '').replace(/\n{2,}/g, '\n').trim();
      if (!inner) return;
      if (big) {
        items.push({ text: inner.replace(/\n/g, ' '), big: true });
      } else {
        var segs = segments(ch);
        if (segs.length) items.push({ segs: segs });
      }
    });
    return items.length ? items : null;
  }

  function pushTable(items, tb) {
    var rows = [];
    Array.prototype.forEach.call(tb.rows, function (tr) {
      var cells = [];
      Array.prototype.forEach.call(tr.cells, function (td) {
        var bold = td.tagName === 'TH' || !!td.querySelector('strong,b');
        cells.push({ text: (td.innerText || td.textContent || '').replace(/\s+/g, ' ').trim(), bold: bold });
      });
      if (cells.length) rows.push(cells);
    });
    if (rows.length) items.push({ table: rows });
  }

  /* Segments: strong/b → bold */
  function segments(el) {
    var out = [];
    (function walk(node, bold) {
      Array.prototype.forEach.call(node.childNodes, function (n) {
        if (n.nodeType === 3) {
          var t = n.textContent;
          if (t) out.push({ text: t, bold: bold });
        } else if (n.nodeType === 1) {
          if (n.tagName === 'BR') { out.push({ br: true }); return; }
          if (n.tagName === 'SCRIPT' || n.tagName === 'STYLE' || n.tagName === 'BUTTON' || n.tagName === 'TABLE') return;
          walk(n, bold || n.tagName === 'STRONG' || n.tagName === 'B' || n.tagName === 'TH');
        }
      });
    })(el, false);
    // ek line mein flatten (br → alag line)
    var lines = [[]];
    out.forEach(function (s) {
      if (s.br) { lines.push([]); return; }
      var parts = s.text.split('\n');
      parts.forEach(function (p, i) {
        if (i > 0) lines.push([]);
        if (p) lines[lines.length - 1].push({ text: p, bold: s.bold });
      });
    });
    lines = lines.filter(function (l) { return l.length; });
    if (!lines.length) return [];
    // single line hi expected; multi ho to \n join karke pehli rakhein? Nahi — sab lines ko items banao:
    // simplicity: pehli line ke segments return karo, baaki ignore (rare case)
    return lines[0];
  }

  /* ---------- Canvas rendering ---------- */
  function render(items) {
    var W = 1080, PAD = 60;
    var scale = 2;
    var meas = document.createElement('canvas').getContext('2d');

    // tables ki rows cap
    var MAXROWS = 22;
    items = items.map(function (it) {
      if (it.table && it.table.length > MAXROWS) {
        var note = it.table.length - MAXROWS;
        return { table: it.table.slice(0, MAXROWS), overflow: note };
      }
      return it;
    });

    function lineWidth(segs, size, weight) {
      meas.font = (weight || 400) + ' ' + size + 'px ' + FONT;
      var w = 0;
      segs.forEach(function (s) {
        meas.font = ((s.bold ? 700 : 400)) + ' ' + size + 'px ' + FONT;
        w += meas.measureText(s.text).width;
      });
      return w;
    }

    // ---------- Height measure ----------
    var bodyTop = 190, bodyH = 0, y = 0;
    var layout = [];
    items.forEach(function (it) {
      if (it.big) {
        meas.font = '700 44px ' + FONT;
        var lines = wrapPlain(it.text, W - PAD * 2, meas, '700 44px ' + FONT);
        layout.push({ type: 'big', lines: lines, h: lines.length * 58 + 24, y0: y });
        y += lines.length * 58 + 24;
      } else if (it.table) {
        var t = layoutTable(meas, it.table, W - PAD * 2, 25);
        t.overflow = it.overflow;
        layout.push({ type: 'table', t: t, h: t.height + (it.overflow ? 40 : 0) + 20, y0: y });
        y += t.height + (it.overflow ? 40 : 0) + 20;
      } else {
        var segs = it.segs || [{ text: String(it.text == null ? '' : it.text), bold: !!it.bold }];
        var segLines = wrapSegs(segs, W - PAD * 2, 29, meas);
        layout.push({ type: 'segs', lines: segLines, h: segLines.length * 42 + 10, y0: y });
        y += segLines.length * 42 + 10;
      }
    });
    bodyH = y + 10;
    var FOOT = 96;
    var H = bodyTop + bodyH + FOOT;

    var cv = document.createElement('canvas');
    cv.width = W * scale; cv.height = H * scale;
    var ctx = cv.getContext('2d');
    ctx.scale(scale, scale);

    // background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // ---------- Header ----------
    var grad = ctx.createLinearGradient(0, 0, W, 190);
    grad.addColorStop(0, '#1a73e8'); grad.addColorStop(1, '#0b47a8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, 190);
    // accent line
    ctx.fillStyle = '#e8710a';
    ctx.fillRect(0, 186, W, 4);
    // brand
    ctx.textBaseline = 'alphabetic';
    ctx.font = '700 30px ' + FONT;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Gyan', 40, 62);
    var gw = ctx.measureText('Gyan').width;
    ctx.fillStyle = '#ffb300';
    ctx.fillText('Tools', 40 + gw, 62);
    // date right
    ctx.font = '500 22px ' + FONT;
    ctx.fillStyle = 'rgba(255,255,255,.92)';
    var d = new Date();
    var dstr = d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      + ', ' + d.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
    ctx.fillText(dstr, W - 40 - ctx.measureText(dstr).width, 60);
    // title
    ctx.font = '700 42px ' + FONT;
    ctx.fillStyle = '#ffffff';
    var tl = TITLE;
    while (ctx.measureText(tl).width > W - 80 && tl.length > 8) tl = tl.slice(0, -2);
    ctx.fillText(tl, 40, 128);
    ctx.font = '500 22px ' + FONT;
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.fillText('गणना का नतीजा — gyantools.github.io', 40, 164);

    // ---------- Body ----------
    ctx.textAlign = 'left';
    layout.forEach(function (L) {
      var ly = bodyTop + L.y0;
      if (L.type === 'big') {
        ctx.textAlign = 'center';
        ctx.fillStyle = BLUE;
        L.lines.forEach(function (ln, i) {
          ctx.font = '700 44px ' + FONT;
          ctx.fillText(ln, W / 2, ly + 44 + i * 58);
        });
        ctx.textAlign = 'left';
      } else if (L.type === 'segs') {
        L.lines.forEach(function (line, i) {
          var x = PAD, base = ly + 32 + i * 42;
          line.forEach(function (s) {
            ctx.font = (s.bold ? 700 : 400) + ' 29px ' + FONT;
            ctx.fillStyle = s.bold ? DARK : '#3c4043';
            ctx.fillText(s.text, x, base);
            x += ctx.measureText(s.text).width;
          });
        });
      } else if (L.type === 'table') {
        drawTable(ctx, L.t, PAD, ly, DARK, GRAY, BORDER);
        if (L.t.overflow) {
          ctx.font = '400 24px ' + FONT;
          ctx.fillStyle = GRAY;
          ctx.fillText('… और ' + L.t.overflow + ' पंक्तियां (पूरी टेबल वेबसाइट पर देखें)', PAD, ly + L.t.height + 34);
        }
      }
    });

    // ---------- Footer ----------
    var fy = H - FOOT;
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, fy, W, FOOT);
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, fy + 0.5); ctx.lineTo(W, fy + 0.5); ctx.stroke();
    ctx.font = '600 24px ' + FONT;
    ctx.fillStyle = BLUE;
    ctx.fillText('GyanTools', PAD, fy + 42);
    ctx.font = '400 22px ' + FONT;
    ctx.fillStyle = GRAY;
    ctx.fillText(' • फ्री ऑनलाइन टूल्स हिंदी में — gyantools.github.io', PAD + ctx.measureText('GyanTools').width + 14, fy + 42);
    ctx.font = '400 20px ' + FONT;
    ctx.fillStyle = '#9aa0a6';
    ctx.fillText('⚠️ यह गणना केवल जानकारी/अनुमान के लिए है', PAD, fy + 74);

    return cv;
  }

  function wrapPlain(text, maxW, meas, font) {
    meas.font = font;
    var words = text.split(/\s+/), lines = [], cur = '';
    words.forEach(function (w) {
      var t = cur ? cur + ' ' + w : w;
      if (meas.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; }
      else cur = t;
    });
    if (cur) lines.push(cur);
    return lines;
  }

  function wrapSegs(segs, maxW, size, meas) {
    // segments → words with bold flag
    var words = [];
    segs.forEach(function (s) {
      s.text.split(/(\s+)/).forEach(function (p) {
        if (p) words.push({ text: p, bold: s.bold });
      });
    });
    var lines = [], cur = [], curW = 0;
    meas.font = '400 ' + size + 'px ' + FONT;
    words.forEach(function (w) {
      meas.font = (w.bold ? 700 : 400) + ' ' + size + 'px ' + FONT;
      var ww = meas.measureText(w.text).width;
      if (curW + ww > maxW && cur.length) {
        // trailing spaces hatao
        while (cur.length && /^\s+$/.test(cur[cur.length - 1].text)) { curW -= meas.measureText(cur.pop().text).width; }
        lines.push(cur); cur = []; curW = 0;
        if (/^\s+$/.test(w.text)) return;
      }
      cur.push(w); curW += ww;
    });
    if (cur.length) lines.push(cur);
    return lines.length ? lines : [[]];
  }

  function layoutTable(meas, rows, availW, cap) {
    if (rows.length > cap) rows = rows.slice(0, cap);
    var nCols = Math.max.apply(null, rows.map(function (r) { return r.length; }));
    var size = rows.length > 12 ? 24 : 26, pad = 12;
    // column widths
    var colW = [];
    for (var c = 0; c < nCols; c++) {
      var mw = 0;
      rows.forEach(function (r) {
        var cell = r[c] || { text: '' };
        meas.font = (cell.bold ? 700 : 400) + ' ' + size + 'px ' + FONT;
        var w = meas.measureText(cell.text).width;
        if (w > mw) mw = w;
      });
      colW.push(Math.ceil(mw) + pad * 2);
    }
    var tot = colW.reduce(function (a, b) { return a + b; }, 0);
    if (tot > availW) {
      var k = (availW - nCols) / tot;
      colW = colW.map(function (w) { return Math.max(60, Math.floor(w * k)); });
    } else {
      var extra = availW - tot;
      colW = colW.map(function (w) { return w + Math.floor(extra / nCols); });
    }
    // row heights (text wrap per cell)
    var rowH = rows.map(function (r) {
      var maxLines = 1;
      for (var c2 = 0; c2 < nCols; c2++) {
        var cell = r[c2] || { text: '' };
        meas.font = (cell.bold ? 700 : 400) + ' ' + size + 'px ' + FONT;
        var n = wrapPlain(cell.text, colW[c2] - pad * 2, meas, meas.font).length;
        if (n > maxLines) maxLines = n;
      }
      return maxLines * (size + 9) + pad * 2;
    });
    var height = rowH.reduce(function (a, b) { return a + b; }, 0);
    return { rows: rows, colW: colW, rowH: rowH, height: height, size: size, pad: pad };
  }

  function drawTable(ctx, t, x0, y0) {
    var y = y0;
    t.rows.forEach(function (r, ri) {
      var x = x0, rh = t.rowH[ri];
      var isHead = ri === 0;
      ctx.fillStyle = isHead ? BLUE : (ri % 2 === 0 ? '#ffffff' : '#f8f9fa');
      ctx.fillRect(x0, y, t.colW.reduce(function (a, b) { return a + b; }, 0), rh);
      r.forEach(function (cell, ci) {
        var cw = t.colW[ci] || t.colW[t.colW.length - 1];
        // cell border
        ctx.strokeStyle = BORDER; ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, cw - 1, rh - 1);
        // text
        ctx.font = ((cell.bold || isHead) ? 700 : 400) + ' ' + t.size + 'px ' + FONT;
        ctx.fillStyle = isHead ? '#ffffff' : (cell.bold ? DARK : '#3c4043');
        var lines = wrapPlain(cell.text, cw - t.pad * 2, ctx, ctx.font);
        lines.forEach(function (ln, li) {
          ctx.fillText(ln, x + t.pad, y + t.pad + t.size + li * (t.size + 9) - 3);
        });
        x += cw;
      });
      y += rh;
    });
  }

  /* ---------- Download + toast ---------- */
  function download(canvas) {
    var done = false;
    if (canvas.toBlob) {
      canvas.toBlob(function (blob) {
        if (!blob) { fallback(); return; }
        save(URL.createObjectURL(blob));
      }, 'image/png');
    } else fallback();
    function fallback() {
      try { save(canvas.toDataURL('image/png')); } catch (e) { toast('⚠️ डाउनलोड नहीं हो सका'); }
    }
    function save(url) {
      var a = document.createElement('a');
      a.href = url;
      a.download = 'gyantools-' + SLUG + '-result.png';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        if (url.indexOf('blob:') === 0) URL.revokeObjectURL(url);
        a.remove();
      }, 4000);
    }
  }

  var toastTimer = null;
  function toast(msg) {
    var el = document.getElementById('gt-dl-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'gt-dl-toast';
      el.style.cssText = 'position:fixed;bottom:26px;left:50%;transform:translateX(-50%);background:#202124;color:#fff;'
        + 'padding:12px 22px;border-radius:24px;font-size:.95rem;font-family:system-ui,sans-serif;z-index:9999;'
        + 'box-shadow:0 4px 12px rgba(0,0,0,.3);transition:opacity .3s;opacity:0;pointer-events:none;';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.style.opacity = '0'; }, 2500);
  }

  ready(init);
})();
