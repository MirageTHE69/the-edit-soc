// The Edit Society — create the admin login and a test customer with a Premium pack.
//
// Run ONCE on your own computer after running supabase/schema.sql:
//   PowerShell:  $env:SUPABASE_URL="https://xxxx.supabase.co"; $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."; node scripts/seed.mjs
//   bash:        SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/seed.mjs
//
// Optional overrides: ADMIN_EMAIL, ADMIN_PASSWORD, TEST_EMAIL, TEST_PASSWORD.
// The service_role key is secret — never commit it or put it in dash/config.js.
import { randomBytes } from 'node:crypto';

const URL_ = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';
if (!URL_ || !KEY) { console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first (see the top of this file).'); process.exit(1); }

const pw = () => randomBytes(9).toString('base64').replace(/[+/=]/g, '').slice(0, 10) + '#7a';
const ADMIN = { email: process.env.ADMIN_EMAIL || 'admin@theeditsociety.in', password: process.env.ADMIN_PASSWORD || pw(), full_name: 'Studio Admin' };
const TEST = { email: process.env.TEST_EMAIL || 'test@theeditsociety.in', password: process.env.TEST_PASSWORD || pw(), full_name: 'Test Client', company: 'Test Brand' };

// New-style keys (sb_secret_…) go in the apikey header only; legacy service_role JWTs also go in Authorization.
const H = KEY.startsWith('sb_') ? { apikey: KEY, 'Content-Type': 'application/json' } : { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
async function call(method, path, body, extra = {}) {
  const res = await fetch(URL_ + path, { method, headers: { ...H, ...extra }, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text(); let data; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  return data;
}

// Create the auth user, or reset the password if the email already exists.
async function ensureUser(u) {
  try {
    const d = await call('POST', '/auth/v1/admin/users', { email: u.email, password: u.password, email_confirm: true, user_metadata: { full_name: u.full_name } });
    return d.id || d.user?.id;
  } catch (e) {
    if (!/already|registered|exists|422/i.test(e.message)) throw e;
    for (let page = 1; page < 50; page++) {
      const list = await call('GET', `/auth/v1/admin/users?page=${page}&per_page=200`);
      const users = list.users || list;
      const found = users.find((x) => (x.email || '').toLowerCase() === u.email.toLowerCase());
      if (found) { await call('PUT', `/auth/v1/admin/users/${found.id}`, { password: u.password, email_confirm: true }); return found.id; }
      if (!users.length) break;
    }
    throw new Error('User exists but could not be found: ' + u.email);
  }
}

const adminId = await ensureUser(ADMIN);
const testId = await ensureUser(TEST);

// Profiles are created by a trigger; upsert to be safe and set roles/details.
await call('POST', '/rest/v1/profiles?on_conflict=id', [
  { id: adminId, email: ADMIN.email, full_name: ADMIN.full_name, company: 'The Edit Society', role: 'admin' },
  { id: testId, email: TEST.email, full_name: TEST.full_name, company: TEST.company, role: 'customer' }
], { Prefer: 'resolution=merge-duplicates' });

// Premium 12-pack for the test customer (replaces any previous test pack).
await call('DELETE', `/rest/v1/subscriptions?user_id=eq.${testId}`);
await call('POST', '/rest/v1/subscriptions', {
  user_id: testId, plan: 'premium', pack_size: 12, credits_total: 12, credits_used: 0, max_active: 3, max_revisions: 3,
  status: 'active', valid_until: new Date(Date.now() + 60 * 864e5).toISOString()
});

console.log('\nDone. Save these logins somewhere safe (they are not stored anywhere else):\n');
console.log(`  ADMIN     ${ADMIN.email}   /   ${ADMIN.password}`);
console.log(`  TEST USER ${TEST.email}   /   ${TEST.password}   (Premium 12-pack, 60 days)\n`);
console.log('Log in at /login.html — admins go to the studio dashboard, customers to their dashboard.');
