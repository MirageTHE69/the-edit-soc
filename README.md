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

## Client & admin dashboards
- `login.html` — one login for everyone; admins go to `admin.html`, clients to `dashboard.html`
- `dashboard.html` — clients: plan & videos left, new request (type → brief → footage upload/Drive links → submit), drafts, approve / request changes, messages
- `admin.html` — studio: overview, production board, all requests, deliver drafts (v1, v2…), change status, assign editor, clients & plans
- `dash/` — dashboard code · `supabase/schema.sql` — database · `scripts/seed.mjs` — creates the admin + test logins

Until Supabase keys are added, the dashboards run in **demo mode** (sample data, nothing saved). `?demo` in the URL forces demo mode.

### Go live with Supabase (one time)
1. Create a free project at supabase.com.
2. **SQL Editor → New query** → paste all of `supabase/schema.sql` → **Run**.
3. **Authentication → Sign In / Providers → Email**: turn **off** “Allow new users to sign up” (you create client logins yourself).
4. **Authentication → URL Configuration**: set Site URL to your live site and add `https://YOUR-SITE/login.html` to Redirect URLs (for password resets).
5. Put the **Project URL** and **anon public key** (Project Settings → API) into `dash/config.js`, commit, push.
6. On your computer, create the admin + Premium test user (prints the passwords):
   `SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed.mjs`
   Never commit the service_role key.
7. New clients: Supabase → Authentication → Users → **Add user** (tick “Auto confirm”), then give them a plan in **admin.html → Clients**.

Uploads are limited to 50 MB per file on Supabase’s free plan (clients can paste Drive/Dropbox links for bigger footage). Raise `MAX_UPLOAD_MB` in `dash/config.js` and the bucket limit on a paid plan.
