# GyanTools — Audit Report

## v2 upgrade (29 October 2026, dopahar) — AdSense-ready + evergreen + naya design

| Check | v1 ke baad | v2 ke baad |
|---|---|---|
| Third-party ads (Adsterra banner/native/smartlink) | 187 pages par | **0** — `assets/ads.js` delete, saare tags/CSS/mentions hata diye |
| Header / footer | 9 alag-alag versions, mobile par logo/menu kinare se chipka | **1 unified** header (logo mark, scrollable mobile menu, active link) + 4-column footer |
| Trust pages | About, Contact, Privacy, Terms, Disclaimer | + **Editorial policy**, **HTML sitemap**, Privacy me Google AdSense ke zaroori clauses + DPDP Act |
| Tools hub | nahi tha (nav "टूल्स" = homepage anchor) | **/tools/** — 8 shreniyan, search, 73 tools |
| Homepage | 157 cards ek lambi list | shreni-wise tools, search box + category chips, nayi hero, compact mobile cards |
| Structured data | 14 blog posts me galat (Aadhaar wali) description, HRA tool me "Percentage Calculator", tools par SoftwareApplication (GSC errors) | Article (author+publisher+image+dates) sab sahi, tools/games = WebPage, hubs = CollectionPage, **BreadcrumbList sab pages par**, About/Contact page types |
| Evergreen | ~70 titles me "2026", stale "जुलाई–सितंबर 2026" dar-labels, "अगली MPC 2–4 दिसंबर" | evergreen titles (saal sirf jahan zaroori: FY/AY/rate-list), dated labels updated, future-dated lines hataye, footer saal JS se |
| Official sources | 141 pages par koi official link nahi | **"आधिकारिक स्रोत" box** 130 tools/guides par (RBI, incometax, EPFO, India Post, NSI, PFRDA, UIDAI, cybercrime…) |
| Gold tools | stale default bhav (₹7,200/g, ₹1,00,000/10g) | default hataya — "आज का भाव डालें" + IBJA link + validation |
| Game pages | 139–230 words | +history + FAQ (12 games), sab 320+ words |
| OG image | "gyantools.github.io" likha tha | naya image **gyantools.in** ke saath |
| Clean URLs | /blog/index.html, ../index.html | `/`, `/tools/`, `/blog/`, `/games/` (canonical bhi) |
| Workflow | zip + domain guard + sitemap | + AdSense toggle (repo variable), HTML sitemap, IndexNow ping; optional manual Google Indexing workflow |

Verification (29 Oct 2026): audit.py → 0 broken links / 0 JSON-LD errors / 0 ads; jsdom click-test 181 pages (sirf canvas false-positives);
Chromium 182 pages × 360/390/1280px → 0 console errors, 0 overflow; workflow simulation fresh clone par pass.

---

## v1 — Deep Audit + Fix Report (29 October 2026, subah)

**Site:** https://gyantools.in/ (naya custom domain, 28 Oct 2026 se) · **Repo:** github.com/gyantools/gyantools.github.io
**Pichhla audit:** 9 Oct 2026 (us report ki jagah ab yeh report hai)

---

## 1. Site kya hai?

GyanTools ek Hindi-first static website hai: **73 free calculators/tools**, **87 Hindi guides (blog)** aur **18 browser games** —
plain HTML/CSS/JS, GitHub Pages par hosted, koi login/server nahi. Analytics: GA4 (`G-4KFSJSLG7B`), ads: Adsterra (v2 me hata diye gaye).

## 2. Scorecard — pehle vs ab

| Check | Pehle | Ab |
|---|---|---|
| Pages par purana `gyantools.github.io` (canonical/og/twitter/JSON-LD) | 198 files, 981 jagah | **0** |
| sitemap.xml / robots.txt domain | github.io | **gyantools.in** (186 URLs = 186 canonicals) |
| Sitemap `lastmod` | har run par sabka "aaj" | **asli aakhri badlav** (git history) |
| Chess game | **poori tarah toota** (koi mohra move nahi hota) | ✅ chalta hai (desktop + mobile) |
| Mobile horizontal overflow | 31 pages (390px par) | **0** (360 / 390 / 1280px teeno par) |
| JS runtime errors (179 pages, real Chromium) | 1 (chess) | **0** |
| Galat/purani financial jaankari | 6 tools/guides | ✅ update |
| Privacy Policy accuracy (GA disclosure) | ❌ "koi analytics nahi" (jabki GA chal raha tha) | ✅ |
| 404 page links (nested URL par) | toote | ✅ |
| Games hub analytics/ads | ❌ nahi the | ✅ |

## 3. Critical bugs (fix kiye)

1. **Chess game broken** (`games/chess.html`) — global `var history` browser ke read-only `window.history` se takra raha tha;
   har move par `history.push is not a function` error → koi bhi mohra move nahi hota tha. Variable ka naam `moveHist` kiya.
   Live site par Chromium se confirm kiya, fix ke baad move + undo + vs-computer test pass.
2. **Domain migration adhoora** — CNAME to `gyantools.in` tha, lekin 192 canonicals, og:url, og:image, twitter:image,
   JSON-LD, sitemap aur robots.txt sab purane github.io par the (Google ko galat canonical signal). Sab `gyantools.in` kiye.
   Downloaded result-image ka watermark bhi ab `gyantools.in`.
3. **Deploy workflow** har zip deploy par sitemap ko phir se github.io URLs se bana deta (BASE hardcoded) — rewrite kiya (section 7).

## 4. Calculation / jaankari ki galtiyan (fix kiye)

| Page | Galti | Fix |
|---|---|---|
| `tools/old-vs-new-tax-regime-calculator.html` | Nayi regime me **87A marginal relief** nahi tha — ₹12.85L gross par ₹63,960 tax dikhata (sahi ₹10,400); ₹13L par ₹66,300 (sahi ₹26,000) | Marginal relief joda; 80D cap ₹1L; `income-tax-calculator` se match |
| `tools/nps-calculator.html` + `blog/nps-pension-guide.html` + `blog/atal-pension-yojana-2026-guide.html` + homepage | Purane NPS niyam: 60/40 fixed, umar 18–70, "3 baar" partial, "75 saal"; **80CCD(1B) ko "nayi regime me bhi" bataya** (galat) | PFRDA Exit Regulations (Dec 2025): non-govt 80% tak lumpsum, ₹8L tak 100%, ₹8–12L par ₹6L + SUR, govt 60:40, umar 85 tak, 4 partial withdrawals; tax-free 60% vs taxable hissa alag; 80CCD(1B) sirf purani regime; employer 80CCD(2) 14% |
| `tools/gratuity-calculator.html` | Naya Labour Code (21 Nov 2025) nahi — fixed-term employees ko 1 saal par gratuity; FAQ "4 saal 7 mahine" vs calculator "5 saal" contradiction; ÷30 case me galat rounding | Employee type option (permanent 5 saal / fixed-term 1 saal), 4 saal 240 din note, 50% wage rule (optional), ÷30 me sirf poore saal |
| `tools/gold-loan-calculator.html` | RBI tier "gap zone" bug — ₹3L ke sone par ₹2.4L loan dikhata (sahi ₹2.5L, 83% LTV allowed) | Max allowed loan = max(min(85%, ₹2.5L), min(80%, ₹5L), 75%) |
| `tools/currency-converter.html` | Rates 1 Sep 2026 ke hard-coded (EUR 5% galat); "rate khud badlo" ka option tha hi nahi; 3 alag-alag dates | Live rates (ExchangeRate-API, 6 ghante cache) + 29 Oct snapshot fallback + apni bank rate ka option + 18 currencies |
| `tools/age-calculator.html` | Bhavishya ki cut-off date (exam age-limit) select nahi hoti thi; 29 Feb walon ki umar vs agla janmdin me contradiction | Future date allowed; 29 Feb → non-leap year me 1 March (har jagah ek jaisa) |
| `blog/repo-rate-guide-2026.html` (+ blog index, homepage, home-loan guide) | "Repo 5.25% sthir" — RBI ne **7 Oct 2026 ko 5.50%** kiya (SDF 5.25%, MSF 5.75%) | Poora article update (63rd MPC, EMI asar, SBI EBLR 8.15%, agli MPC 2–4 Dec 2026), section numbering theek |

Verified (sahi the): small savings rates Oct–Dec 2026 (PPF 7.1, SSY 8.2, SCSS 8.2, NSC 7.7, KVP 7.5, MIS 7.4, TD, RD 6.7),
EPF 8.25%, FY 2026-27 income-tax slabs/87A/standard deduction, income-tax calculator, FD-TDS, in-hand salary, home-loan-tax (80EEA 2019–22 note).

## 5. Mobile / UX

- 314 static tables ko horizontal-scroll wrapper (`.gt-tw`) me rakha; result tables (JS se bante) mobile par scroll hote hain.
- Lambe shabd (jaise `(PAWANGAMINGSTUDIO)`, `1,2,4,…,1024`) ab toot kar wrap hote hain.
- Chess / Nine Men's Morris canvas, Checkers / Reversi / Connect-4 boards chhoti screen (≤400px) par fit hote hain.
- Contact page ka lamba email wrap hota hai.
- Tools/blog/static pages ke nav me **"गेम्स"** link (pehle games hub sirf homepage se linked tha).
- `favicon.ico` joda (pehle 404); homepage Zodiac card emoji.

## 6. Compliance / legal pages

- **Privacy Policy:** "koi analytics nahi" likha tha jabki har page par GA4 chal raha tha (Google Analytics Terms violation +
  AdSense review risk). Ab GA4, cookies (`_ga`), EEA consent, opt-out link, currency-API, sahi ad formats (popunder/social bar band) — sab likha hai.
- **About / Disclaimer / Terms:** "Google AdSense se kamai" galat tha (ads Adsterra ke hain) — theek kiya.
- **Consent Mode v2:** default consent ab `gtag('config')` se **pehle** set hota hai (pehle ga.js me baad me chalta tha);
  EEA/UK/CH me denied, baaki (India) granted — future AdSense ke liye personalized ads block nahi honge.
- `ga.js`: outbound-click filter ab `gyantools.in` ko internal maanta hai.

## 7. Deploy workflow (`.github/workflows/deploy-zip.yml`) — naya

- Har push par chalta hai (sirf zip par nahi) + "Run workflow" bina zip ke bhi safe (pehle fail hota tha).
- `SITE_DOMAIN: gyantools.in` — CNAME hamesha sahi; zip ka CNAME ignore.
- **Domain guard:** koi bhi purana github.io URL apne aap `gyantools.in`.
- Sitemap = har page ka canonical; `lastmod` = git history; robots.txt Sitemap line hamesha sahi.
- Checkout latest branch state par + push retry (back-to-back uploads par conflict nahi).

## 8. Kaise verify kiya

- Custom audit script (meta/canonical/og/twitter/H1/alt/duplicate ids/broken links+anchors/JSON-LD/JS syntax/mixed content/old domain): **0 errors**.
- jsdom runtime test: 73 tools + 19 games + 88 blog pages, har button click → 0 NaN/undefined outputs.
- Real Chromium (Playwright): 179 pages × 3 viewports (360/390/1280px) → 0 JS errors, 0 overflow.
- Scenario tests: tax regime (₹12.75L–₹25L), NPS (7 cases), gratuity (8 cases), gold loan (9 values), age (6 cases incl. 29 Feb), currency (live/offline/custom), chess (move/undo, desktop+mobile), 404 (nested path).
- Workflow ko locally simulate kiya (bina zip + zip ke saath).

## 9. Owner ke karne ke kaam (code se nahi ho sakte)

1. **DNS (Hostinger):** IPv6 ke liye 4 AAAA records `@` par: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`.
2. **GitHub → Settings → Pages:** "Enforce HTTPS" ON; domain verify karne ke liye GitHub ka diya TXT record (`_github-pages-challenge-gyantools`) add karo.
3. **Search Console:** `https://gyantools.in/` (Domain ya URL-prefix) property add karo (root ki `google8a2277c04ad2d889.html` verification file maujood hai) → `sitemap.xml` submit → purani github.io property me **Settings → Change of Address** → `gyantools.in`.
4. **ads.txt:** AdSense approve hone par `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0` line (aur Adsterra ki line, agar woh de) daalo.
5. GA4 Admin → Data streams me stream URL `https://gyantools.in` update karo.

## 10. Jaan-boojh kar nahi badla (low priority)

- 67 titles > 70 chars aur 61 descriptions > 170 chars — domain move ke turant baad sab titles badalna ranking ke liye risky; dheere-dheere chhote karein.
- Root ke 5 purane redirect stubs (`age-calculator.html` etc.) — noindex + canonical ke saath theek hain, rehne do (purane backlinks).
- `ads.js` smartlink placement — business decision, chhua nahi.
