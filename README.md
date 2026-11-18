# The Edit Society — live design preview

Static site, ready to host. No build step.

## Deploy on Vercel
**Option A — CLI (fastest)**
1. Open a terminal in this folder.
2. Run `npx vercel` → log in → press Enter on every question (no build command, output = this folder).
3. Run `npx vercel --prod` to get the production URL.

**Option B — GitHub**
1. Push this folder to a new GitHub repo.
2. vercel.com → Add New → Project → import the repo.
3. Framework preset: **Other**. Build command: *empty*. Output directory: *empty* (root). Deploy.

## Files
- `index.html` — the home page
- `services.html`, `service.html?s=…`, `work.html`, `project.html?p=…` — inner pages
- `site-data.js` — **all text for the inner pages** (services, projects, prices, FAQs). Edit here.
- `site.css`, `site.js` — shared styles and behaviour for the inner pages
- `support.js`, `vendor/` — runtime that renders the page (keep as is)
- `assets/` — images (placeholder stills; replace with real ones using the SAME file names)
- `vercel.json` — caching for assets

To test locally: `npx serve .` then open the printed URL (double-clicking index.html won't work).
