# 🔍 GyanTools — Deep Audit Report

**Site:** https://gyantools.github.io/ · **Repo:** github.com/gyantools/gyantools.github.io
**Audit date:** 9 October 2026 · **Pages audited:** 193 HTML · **Links checked:** 6,156 · **JS blocks checked:** 679 (374 executable + 305 JSON-LD)

---

## 📊 Summary

| Category | Result |
|---|---|
| Broken internal links | **0** ✅ |
| JS syntax errors (inline + assets) | **0** ✅ |
| Invalid JSON-LD blocks | **0 / 305** ✅ |
| HTML tag-balance issues | **0 / 193 pages** ✅ |
| Missing canonical tags | **0 / 192** (sirf Google verification file mein nahi — woh zaroori bhi nahi) ✅ |
| Live site HTTP status (key pages) | **All 200** ✅, 404 page sahi kaam karta hai ✅ |
| Calculator math (EMI, GST, Age, BMI, CAGR, SIP…) | **Sahi hai** ✅ |
| Input validation in tools | **Solid** ✅ |
| Images (logo, og-image) | **Valid PNG**, sahi dimensions ✅ |
| Duplicate HTML ids | **0** ✅ |
| **Critical bugs found** | **2** 🔴 |
| **Medium issues fixed** | **4** 🟡 |
| **Hygiene improvements** | **3** 🟢 |
| **Owner action required** | **1** ⚠️ (ads.txt) |

---

## 🔴 Critical Bugs (FIXED)

### Bug 1 — Workflow sitemap hamesha KHAALI banta tha (indentation bug)
**File:** `.github/workflows/deploy-zip.yml` (step: *Sitemap ko actual files se sync karo*)

Python heredoc mein yeh lines galat indent thi — `if … continue` block ke andar thi, toh kabhi execute hi nahi hoti (dead code):

```python
if fn == '404.html' or fn.startswith('google'):
    continue
    rel = os.path.relpath(...)   # ← dead code (continue ke baad)
    urls.add(...)                # ← dead code (continue ke baad)
```

**Impact:** Har zip-deploy par sitemap.xml **0 URLs** ke saath banta tha. Live site ka sitemap bilkul khaali tha → Google ko site ke kisi bhi page ka pata nahi chal raha tha (SEO ke liye sabse bada nuksaan). Yeh confirm kiya gaya: same code ko locally run karne par `total URLs = 0` aaya despite 193 pages.

**Fix:** Indentation sahi ki — `rel = …` aur `urls.add(…)` ko loop-body level par daala. Ab same script **186 URLs** generate karta hai. Safety check bhi add ki: agar 50 se kam URLs bante hain toh step fail ho jaati hai (khaali sitemap kabhi commit nahi hoga).

### Bug 2 — Sitemap se 13 valid blog posts bahar ho rahe the
**File:** `.github/workflows/deploy-zip.yml` (same step)

Purana filter `fn.startswith('google')` filename check tha — isliye yeh 13 bilkul sahi, indexable blog posts bhi exclude ho jaate the, sirf isliye ki unke naam `google-…` se shuru hote hain:

```
blog/google-account-security.html, blog/google-chrome-tips.html,
blog/google-maps-tips.html, blog/google-pay-tips.html … (13 total)
```

Intent sirf root par rakhi gayi Google Search Console verification file (`google8a2277c04ad2d889.html`) ko exclude karna tha.

**Fix:** Ab verification file sirf **root level** par exclude hoti hai (`os.path.dirname(path) == '.'`). 13 blog posts ab sitemap mein hain.

### Bug 3 — Live `sitemap.xml` khaali tha
**File:** `sitemap.xml`

Repo mein committed sitemap.xml mein `<urlset>` ke andar ek bhi `<url>` nahi tha (Bug 1 ka asar).

**Fix:** Sitemap regenerate kiya — ab **186 URLs** hain:
- ✅ Homepage + saare 73 tools + 88 blog + 19 games + static pages
- ✅ 13 `blog/google-*` posts (Bug 2 fix)
- ❌ `404.html`, Google verification file, aur 5 noindex redirect stubs (purane root calculators) excluded — yeh Google guidelines ke mutabiq sahi hai
- ✅ Valid XML, `lastmod`/`changefreq`/`priority` ke saath

---

## 🟡 Medium Issues (FIXED)

### Issue 4 — ZIP deploy repo-level files ko delete kar deta tha
**File:** `.github/workflows/deploy-zip.yml` (step: *Purani site delete karke nayi lagao*)

Delete step sirf `.git`, `.github`, `CNAME`, `google*.html`, `*.zip`, `_site` ko bachata tha. `README.md`, `.gitignore`, `LICENSE`, `AUDIT-REPORT.md` jaisi repo files **har zip-deploy par delete ho jaati**. Simulation se verify kiya.

**Fix:** Preserve list mein `README.md`, `.gitignore`, `LICENSE`, `AUDIT-REPORT.md` add ki. End-to-end simulation mein verify kiya ki yeh files ab bachti hain.

### Issue 5 — HTML comment mein literal `<script>` text
**File:** `index.html` (line 26)

```html
<!-- ===== GOOGLE ADSENSE: … AdSense ka <script> tag paste karein ===== -->
```

Browser ke liye yeh comment hi hai (nuksaan nahi), **lekin** yeh ek latent hazard hai: koi bhi naive HTML parser/minifier/validator is `<script>` ko asli tag samajh sakta hai aur uske baad wale JSON-LD block ko tod sakta hai. Isko ek baar bhi parse kiya toh `SyntaxError: Unexpected identifier 'paste'` aaya.

**Fix:** Comment reword kiya — ab angle brackets nahi hain (`ka script tag paste karein`).

### Issue 6 — Google verification file mein ads/GA scripts the
**File:** `google8a2277c04ad2d889.html`

Is file ka kaam sirf Search Console verification hai, lekin isme `ads.js` aur `ga.js` bhi load ho rahe the (bekaar requests + ads ek verification file par). Google extra content tolerate karta hai toh verification kharaab nahi hoti, par yeh safai zaroori thi.

**Fix:** File mein ab sirf verification line hai.

### Issue 7 — Sitemap mein noindex pages aane ka risk
**File:** `.github/workflows/deploy-zip.yml`

Purane 5 redirect stubs (`age-calculator.html`, `emi-calculator.html`, `gst-calculator.html`, `percentage-calculator.html`, `sip-calculator.html` — root par) `noindex` hain. Google guidelines: sitemap mein sirf indexable, canonical URLs honi chahiye.

**Fix:** Sitemap generator ab har page ke head mein `robots … noindex` check karta hai aur aisi pages skip kar deta hai.

---

## 🟢 Hygiene Improvements (ADDED)

1. **`README.md`** — repo mein koi README nahi tha. Ab hai: site ka description, structure, local mein kaise chalayein, deploy ke dono tareeke (direct push + zip workflow), SEO notes.
2. **`.gitignore`** — naya file: `_site/`, `_tmp/`, `.DS_Store`, editor files, logs. (`*.zip` ko jaan-boojhkar nahi daala — workflow ko trigger karne ke liye root par `site.zip` push karni hoti hai.)
3. **`AUDIT-REPORT.md`** — yeh report. Dono naye files workflow ki preserve list mein bhi add ki gayi hain.

---

## ⚠️ Owner Action Required (fix nahi kar sakta — aapki IDs chahiye)

### `ads.txt` mein koi entry nahi hai
File mein sirf comments hain, koi actual ads line nahi. Iska matlab:
- **AdSense** "Earnings at risk" / ads.txt warning dega (jab approval mile, yeh COMPULSORY hai)
- Ad network aapka domain spoof karke aapke naam par ads bech sakta hai

**Kya karein:** Apne Adsterra dashboard → Websites → apni site → "ads.txt" section se exact line copy karke `ads.txt` mein paste karein:

```
adsterra.com, PUB-XXXXXX, DIRECT
```

AdSense approval milne ke baad:
```
google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
```

(Actual publisher IDs aapke paas hain — isliye maine placeholder nahi daala, galat ID daalna behtar nahi hoga.)

---

## ✅ Verification (post-fix)

Fixed repo par poora audit dobara chalaya:

- Workflow YAML — valid ✅
- Sitemap step (exact script from YAML, `bash -e` se run) — **186 URLs**, exit 0 ✅
- Sitemap XML — valid ✅ · stubs/404/verification excluded ✅ · `blog/google-*` included ✅
- **Full workflow simulation** (zip push → extract → delete → sitemap → commit):
  - Naya tool zip se deploy hua ✅ · jo page zip mein nahi thi woh delete hui ✅
  - `README.md`, `.gitignore`, `.github/`, `google*.html` bach gaye ✅ · `site.zip` cleanup hua ✅
  - Sitemap auto-regenerate hua (nayi page andar, delete hui page bahar) ✅ · Auto-deploy commit bana ✅
- Inline JS — 0 syntax errors ✅ · JSON-LD — 0 invalid ✅ · Links — 0 broken ✅ · Tag balance — 0 issues ✅

## 🚀 Deploy kaise karein?

1. **Aasan tareeka:** Ye fixed files `main` branch par push karo — GitHub Pages automatic deploy kar dega.
2. **Zip tareeka:** Site files ko `site.zip` bana ke GitHub par upload karo — workflow sab kuch khud kar degi (ab sahi sitemap ke saath).

Search Console mein jaake sitemap (`https://gyantools.github.io/sitemap.xml`) dobara submit karein — ab 186 URLs dikhenge.

---

*Audit by Arena.ai Agent — 9 Oct 2026*
