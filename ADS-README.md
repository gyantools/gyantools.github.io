# GyanTools – Adsterra Ads Setup (A2Z Guide)

## Kya kya badla gaya
1. **Google AdSense hataya** – saare 186 pages se `<meta name="google-adsense-account" ...>` remove.
2. **`ads.txt` delete** – Google wali line hata di. Adsterra ko ads.txt chahiye hi nahi (unke panel me ye option hi nahi hai), isliye file hi hata di. Galat/khali ads.txt rakhne se aage dikkat hoti hai.
3. **`privacy-policy.html`** – AdSense wale section ki jagah Adsterra ka ad-disclosure (policy compliance ke liye zaroori).
4. **`/assets/ads.js`** (NAYI FILE) – teeno ads ka ek hi global loader.
5. **Saare 187 HTML pages** me `</body>` se pehle ek line add ki gayi:
   ```html
   <script defer src="/assets/ads.js"></script>
   ```

## Ads ki placement (kyun yahan)
| Ad | Jagah | Wajah |
|---|---|---|
| **Popunder** | Site-wide, har page par 1 baar | Sabse zyada CPM, layout kharab nahi karta |
| **Banner (responsive)** | (a) Tool/calculator box ke turant baad  (b) Footer se ठीक pehle | Desktop par **468x60**, mobile (≤520px) par apne aap **320x50** – dono unit sahi jagah, kahin overflow nahi |
| **Social Bar** | Site-wide, 1.2 sec delay ke baad | Delay se page speed / Core Web Vitals kharab nahi hote |
| **Native Banner** | Content ke end me, footer se pehle (1/page) | Native ka CTR sabse high, content jaisa dikhta hai |
| **Smart/Direct Link** | Blog & tools pages me doosre `<h2>` se pehle (CTA card) | Reading flow me natural, homepage clean rehta hai (SEO) |

## Smart cheezein jo daali gayi hain
- **Lazy loading** – banner tabhi load hota hai jab user uske 300px paas aata hai (speed + CLS fix).
- **Iframe isolation** – banner ka `atOptions` alag iframe me chalta hai, isliye kisi bhi calculator ka JS conflict nahi karega, aur ek page par 2 banner bhi sahi chalenge (`document.write` ka problem khatam).
- **Clean pages** – `privacy-policy`, `terms-conditions`, `disclaimer`, `404` par koi ad nahi (ad-network + SEO dono ke liye safe practice).
- **Auto responsive banner** – mobile par 320x50 unit, desktop par 468x60 unit; page kabhi side me scroll nahi hoga.
- **Optional sticky** – `stickyMobile: true` karne par mobile par 320x50 screen ke neeche chipak jayega (Social Bar band karke hi use karein, warna dono takraayenge).
- **"विज्ञापन" label** – har ad ke upar label, taaki accidental clicks / policy issue na ho.

## Control panel
`assets/ads.js` ke top par `CONFIG` object hai:
```js
popunder: true, banner: true, socialbar: true,
native: true, smartlink: true,                   // kisi ko band karna ho -> false
smartlinkText: "🎁 आज के टॉप ऑफर..."             // CTA ka text yahan badlo
maxBanners: 2,                                   // banner slots ki limit
skipPages: [...]                                 // jin pages par ad nahi chahiye
```
Sirf yahi file edit karni hai – poori site par asar ho jayega. 187 files dobara chhune ki zaroorat nahi.

## GitHub par kaise upload karein (drag & drop)
1. ZIP extract karein.
2. github.com par apni repo `gyantools/gyantools.github.io` kholen.
3. **Add file → Upload files** par click karein.
4. Extract kiye folder ke **saare files + folders** (`assets`, `tools`, `blog`, `games`, `images`, `index.html`, `ads.txt`, ...) ek saath drag & drop karein.
5. Commit message: `Remove AdSense, add Adsterra ads (popunder + banner + social bar)` → **Commit changes**.
6. 1-2 minute me GitHub Pages live ho jayega. Ctrl+F5 se hard refresh karein.

> Tip: `assets` folder zaroor upload ho – warna ads load nahi honge. Check: `https://gyantools.github.io/assets/ads.js` browser me khulna chahiye.

## Testing checklist
- [ ] `/assets/ads.js` 200 OK deta hai
- [ ] Kisi tool page par scroll karne par banner dikhe
- [ ] Page par pehle click par popunder khule (1 baar)
- [ ] Social bar niche/side me aaye
- [ ] Footer se pehle Native Banner (सुझाव wale cards) dikhe
- [ ] Blog page par neela CTA card dikhe, click par smartlink naye tab me khule
- [ ] Adsterra dashboard me impressions count hon (10-30 min lag sakta hai)
