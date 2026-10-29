# GyanTools 🧰

Hindi mein free online calculators, aasan guides aur browser games — bina login, bina fees, aur saara calculation aapke browser mein hi hota hai (koi server nahi, data kahin nahi jaata).

🌐 **Live site:** https://gyantools.in/ (purana GitHub Pages address apne aap yahin 301 redirect hota hai)

## Kya hai isme?

- **73 Tools** (`tools/`) + **tools hub** `tools/index.html` (8 shreniyan, search box)
- **87 Hindi guides** (`blog/`, hub: `blog/index.html`)
- **18 Games** (`games/`, hub: `games/index.html`)
- **Trust pages:** `about.html`, `contact.html`, `editorial-policy.html` (sampadkiya niti + sources), `privacy-policy.html` (AdSense-ready), `terms-conditions.html`, `disclaimer.html`, `sitemap.html` (HTML sitemap — workflow khud update karti hai), `404.html`
- **Assets** (`assets/`) — `site.css` (header/footer/hub design), `site.js` (footer ka saal apne aap, search filter, mobile menu), `ga.js` (Google Analytics 4 + Consent Mode v2), `result-image.js`
- `favicon.ico`, `images/logo.png`, `images/og-image.png` (1200×630, gyantools.in)
- `ads.txt` (AdSense line workflow khud jodti hai), `robots.txt`, `sitemap.xml`, IndexNow key file (`<32-hex>.txt`)

> Site par **koi third-party ad network nahi hai** (purane Adsterra ads poori tarah hata diye gaye).

## Tech stack

Plain **HTML + CSS + JavaScript** — koi framework/build step nahi. GitHub Pages par serve hota hai (`.nojekyll`). Custom domain `CNAME` file se — **CNAME file kabhi delete mat karna**.

## Local mein kaise dekhein?

```bash
python3 -m http.server 8000
# browser: http://localhost:8000
```

## Workflows (`.github/workflows/`)

### 1. `deploy-zip.yml` — har push par apne aap
1. **ZIP deploy:** root mein `site.zip` upload karo → purani site replace, zip delete.
2. **Domain guard:** `CNAME` hamesha `gyantools.in`; purane github.io URLs apne aap theek.
3. **AdSense (optional):** repo **Variable** `ADSENSE_PUB_ID` = `pub-1234567890123456` set karo → har page ke `<head>` mein AdSense code + `google-adsense-account` meta, aur `ads.txt` mein Google ki line. Variable hatao → sab hat jaata hai. (404 aur noindex pages par code nahi lagta.)
4. **Search Console verification (optional):** repo **Variable** `GOOGLE_SITE_VERIFICATION` = HTML-tag ka token → homepage `<head>` mein `google-site-verification` meta (purani github.io property ko Change of Address ke liye verified rakhne ke kaam aata hai).
5. **Sitemap:** `sitemap.xml` (canonical URL + asli lastmod) aur `sitemap.html` dono apne aap update; `robots.txt` ki Sitemap line pakki.
6. **IndexNow:** badle hue pages Bing/Yandex/Naver/Seznam/Yep ko apne aap ping (Google IndexNow support nahi karta). Pehli baar: Actions → Run workflow → `indexnow_all = true`.

### 2. `google-indexing.yml` — sirf manual, optional
Google Indexing API officially sirf JobPosting/BroadcastEvent pages ke liye hai — is site ke liye recommended nahi. Agar phir bhi chalana ho: service-account JSON ko repo **Secret** `GOOGLE_INDEXING_KEY` mein rakho (repo mein kabhi nahi), max 20 URLs/run.

> ZIP deploy ke time `.git`, `.github/`, `CNAME`, `google*.html`, `README.md`, `.gitignore`, `LICENSE`, `AUDIT-REPORT.md` delete nahi hote (zip mein naye versions hon to update ho jaate hain).

## Maintenance — kya kabhi update karna padega?

- **Kuch bhi zaroori nahi.** Footer ka saal, sitemap, HTML sitemap, IndexNow, AdSense code — sab automatic.
- Rate wale tools (PPF, SSY, FD, gold…) mein dar ka khana user khud badal sakta hai; har zaroori page par **"आधिकारिक स्रोत"** box hai, jo seedha sarkari website par le jaata hai.
- Saal-wise content (Income-tax slab FY 2026-27, ITR AY 2026-27, rate-list posts) apne saal ke label ke saath sahi rehta hai. Naya Budget aane par chaaho to tax calculator update karwa lena — optional.

## Audit

Aakhri deep audit + upgrade: **29 October 2026** — summary `AUDIT-REPORT.md` mein.

## License

© GyanTools — Pawan Verma (PAWANGAMINGSTUDIO).
