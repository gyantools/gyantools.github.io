# GyanTools 🧰

Hindi mein free online tools aur Google/सरकारी-योजना guides — bina login, bina fees, aur saara calculation aapke browser mein hi hota hai (koi server nahi, data kahin nahi jaata).

🌐 **Live site:** https://gyantools.github.io/

## Kya hai isme?

- **73 Tools** (`tools/`) — EMI, GST, SIP, PPF, Age, BMI, Word Counter, Unit Converter, aur bhi bahut kuch
- **88 Blog guides** (`blog/`) — sarkari yojna, banking, Google tips, safety guides
- **19 Games** (`games/`) — Snake, Chess, Sudoku, 2048, Tic-Tac-Toe, aur bhi
- **Static pages** — `index.html`, `about.html`, `contact.html`, `privacy-policy.html`, `terms-conditions.html`, `disclaimer.html`, `404.html`
- **Assets** (`assets/`) — `ads.js` (Adsterra ads loader), `ga.js` (Google Analytics 4 + Consent Mode v2), `result-image.js` (result ko image mein download)

## Tech stack

Bilkul plain **HTML + CSS + JavaScript** — koi framework, koi build step, koi dependency. GitHub Pages par directly serve hota hai (`.nojekyll` file hai, isliye Jekyll processing off hai).

## Local mein kaise dekhein?

Koi bhi static file server chalao, jaise:

```bash
# Python se (sabse easy)
python3 -m http.server 8000
# phir browser mein khole:
# http://localhost:8000
```

Ya bas `index.html` ko seedha browser mein khol lo — sab kuch client-side hai.

## Deploy kaise hota hai?

Do tareeke:

1. **Direct push (aasan):** `main` branch par push karo — GitHub Pages automatic deploy kar deta hai.
2. **ZIP se auto-deploy (`.github/workflows/deploy-zip.yml`):**
   - Poori site ko zip karo ( naam rakho `site.zip` )
   - GitHub par "Add files → Upload files" se `site.zip` upload karo
   - Workflow automatic chalegi: zip extract karegi, purani site replace karegi, **sitemap.xml ko regenerate** karegi (saari pages se), aur changes commit kar degi
   - Workflow sirf root ki `*.zip` files par trigger hoti hai

> ⚠️ Note: ZIP deploy ke time `.github/`, `google*.html` (Search Console verification), aur repo-level files (`README.md`, `.gitignore`, `LICENSE`, `AUDIT-REPORT.md`) delete nahi hoti — baaki sab kuch zip se replace hota hai. Agar naye tools add karne hain to unhe hamesha zip mein include karna.

## SEO notes

- `sitemap.xml` — workflow khud banata hai (haath se edit karne ki zaroorat nahi). 404, verification files, aur noindex redirect stubs isme nahi aate.
- `robots.txt` — sitemap ka link hai.
- Har page par canonical URL, OG tags, Twitter cards, aur JSON-LD (Schema.org) hai.
- `ads.txt` — **action required:** AdSense/Adsterra ki exact line daalni hai (file mein comments dekho).

## License

© GyanTools — free to use. Content aur tools public ke liye hain.
