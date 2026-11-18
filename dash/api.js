// The Edit Society — data layer for the dashboards.
// One interface, two backends: Supabase (real) and an in-memory demo (no keys configured).
import { SUPABASE_URL, SUPABASE_ANON_KEY, MAX_UPLOAD_MB, DEMO } from './config.js';

export const VIDEO_TYPES = [
  { id: 'reel', label: 'Instagram Reel', hint: '9:16 · up to 90 sec' },
  { id: 'short', label: 'YouTube Short / TikTok', hint: '9:16 · up to 60 sec' },
  { id: 'youtube', label: 'Long-form YouTube', hint: '16:9 · talking head, vlog' },
  { id: 'podcast', label: 'Podcast clips', hint: 'Multicam · captions' },
  { id: 'ad', label: 'Ad / UGC creative', hint: 'Hook variants · CTA' },
  { id: 'motion', label: 'Motion graphics', hint: 'Titles · explainers' },
  { id: 'colour', label: 'Colour grade only', hint: 'Log · RAW · phone' },
  { id: 'brand-film', label: 'Brand film', hint: 'Launch · campaign' }
];
export const STATUS = {
  submitted: { label: 'Submitted', step: 0 },
  in_progress: { label: 'Editing', step: 1 },
  in_review: { label: 'Draft ready', step: 2 },
  revision: { label: 'Revising', step: 1 },
  completed: { label: 'Completed', step: 3 },
  cancelled: { label: 'Cancelled', step: -1 }
};
export const PLAN_LABEL = { simple: 'Simple', complex: 'Complex', premium: 'Premium' };
export const MAX_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
export { DEMO };

/* =====================================================================
   Supabase backend
   ===================================================================== */
async function supabaseApi() {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
  const must = ({ data, error }) => { if (error) throw new Error(error.message); return data; };
  const uid = async () => (await sb.auth.getUser()).data.user?.id;

  const api = {
    demo: false,
    async session() { return (await sb.auth.getSession()).data.session; },
    async signIn(email, password) { must(await sb.auth.signInWithPassword({ email, password })); },
    async signOut() { await sb.auth.signOut(); },
    async resetPassword(email) {
      must(await sb.auth.resetPasswordForEmail(email, { redirectTo: new URL('login.html?reset=1', location.href).href }));
    },
    async updatePassword(password) { must(await sb.auth.updateUser({ password })); },
    onAuth(cb) { sb.auth.onAuthStateChange((evt, s) => cb(evt, s)); },

    async me() {
      const id = await uid(); if (!id) return null;
      const profile = must(await sb.from('profiles').select('*').eq('id', id).single());
      const subs = must(await sb.from('subscriptions').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(1));
      return { ...profile, subscription: subs[0] || null };
    },
    async updateProfile(fields) { must(await sb.from('profiles').update(fields).eq('id', await uid())); },

    async listRequests() {
      return must(await sb.from('requests').select('*, profiles(full_name,email,company)').order('created_at', { ascending: false }));
    },
    async getRequest(id) {
      const r = must(await sb.from('requests').select('*, profiles(full_name,email,company,phone)').eq('id', id).single());
      const files = must(await sb.from('request_files').select('*').eq('request_id', id).order('created_at'));
      const messages = must(await sb.from('messages').select('*, profiles(full_name,role)').eq('request_id', id).order('created_at'));
      return { ...r, files, messages };
    },
    async createRequest(payload) { return must(await sb.rpc('create_request', { payload })); },
    async requestRevision(id, note) { must(await sb.rpc('request_revision', { rid: id, note })); },
    async approve(id) { must(await sb.rpc('approve_request', { rid: id })); },
    async addMessage(id, body) { must(await sb.from('messages').insert({ request_id: id, sender_id: await uid(), body, kind: 'note' })); },

    // Upload with progress (XHR to the Storage REST endpoint), then record the file row.
    async uploadFile(requestId, kind, file, onProgress, version = 1) {
      if (file.size > MAX_BYTES) throw new Error(`${file.name} is larger than ${MAX_UPLOAD_MB} MB — share it as a Drive/Dropbox link instead.`);
      const session = await api.session();
      const safe = file.name.replace(/[^\w.\-]+/g, '_');
      const path = `${requestId}/${kind}/${Date.now()}_${safe}`;
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/files/${path}`);
        xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
        xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
        xhr.setRequestHeader('x-upsert', 'false');
        if (file.type) xhr.setRequestHeader('Content-Type', file.type);
        xhr.upload.onprogress = (e) => e.lengthComputable && onProgress && onProgress(e.loaded / e.total);
        xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText.slice(0, 160)}`)));
        xhr.onerror = () => reject(new Error('Upload failed — check your connection.'));
        xhr.send(file);
      });
      must(await sb.from('request_files').insert({ request_id: requestId, uploader_id: await uid(), kind, path, name: file.name, size: file.size, version }));
    },
    async fileUrl(path, download) {
      const d = must(await sb.storage.from('files').createSignedUrl(path, 3600, download ? { download: true } : undefined));
      return d.signedUrl;
    },

    // ----- admin -----
    async setStatus(id, status, note) { must(await sb.rpc('admin_set_status', { rid: id, new_status: status, note: note || null })); },
    async assign(id, assignee) { must(await sb.from('requests').update({ assignee }).eq('id', id)); },
    async listClients() {
      const profiles = must(await sb.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false }));
      const subs = must(await sb.from('subscriptions').select('*').order('created_at', { ascending: false }));
      return profiles.map((p) => ({ ...p, subscription: subs.find((s) => s.user_id === p.id) || null }));
    },
    async saveSubscription(userId, fields, id) {
      if (id) must(await sb.from('subscriptions').update(fields).eq('id', id));
      else must(await sb.from('subscriptions').insert({ user_id: userId, ...fields }));
    }
  };
  return api;
}

/* =====================================================================
   Demo backend (sample data, nothing saved)
   ===================================================================== */
function demoApi(role) {
  const now = Date.now(), H = 3600e3, Dd = 24 * H;
  const iso = (t) => new Date(t).toISOString();
  const clientId = 'u-client', adminId = 'u-admin';
  const people = {
    [clientId]: { id: clientId, email: 'test@theeditsociety.in', full_name: 'Riya Kapoor', company: 'Riya Moves', phone: '+91 90000 00000', role: 'customer', created_at: iso(now - 40 * Dd) },
    'u-2': { id: 'u-2', email: 'arjun@example.com', full_name: 'Arjun Mehta', company: 'Money Matters', role: 'customer', created_at: iso(now - 70 * Dd) },
    'u-3': { id: 'u-3', email: 'studio@example.com', full_name: 'Nisha Rao', company: 'Founder Talks', role: 'customer', created_at: iso(now - 15 * Dd) },
    [adminId]: { id: adminId, email: 'admin@theeditsociety.in', full_name: 'Studio Admin', role: 'admin', created_at: iso(now - 200 * Dd) }
  };
  const subs = [
    { id: 's-1', user_id: clientId, plan: 'premium', pack_size: 12, credits_total: 12, credits_used: 5, max_active: 5, max_revisions: 3, status: 'active', starts_at: iso(now - 20 * Dd), valid_until: iso(now + 40 * Dd) },
    { id: 's-2', user_id: 'u-2', plan: 'complex', pack_size: 8, credits_total: 8, credits_used: 6, max_active: 1, max_revisions: 2, status: 'active', starts_at: iso(now - 30 * Dd), valid_until: iso(now + 30 * Dd) },
    { id: 's-3', user_id: 'u-3', plan: 'simple', pack_size: 4, credits_total: 4, credits_used: 1, max_active: 1, max_revisions: 2, status: 'active', starts_at: iso(now - 5 * Dd), valid_until: iso(now + 55 * Dd) }
  ];
  let ref = 1040;
  const reqs = [];
  const mk = (o) => { const r = { id: 'r-' + (++ref), ref, revision_count: 0, assignee: null, files: [], messages: [], platform: 'Instagram', aspect_ratio: '9:16', length: '30–60 sec', captions: 'Bold animated', music: 'Upbeat, trending', style_notes: '', reference_links: '', footage_links: '', deadline: null, ...o }; reqs.push(r); return r; };
  mk({ user_id: clientId, title: 'Sunday run club — week 12', video_type: 'reel', tier: 'premium', status: 'in_review', assignee: 'Kabir (Editor)', revision_count: 0, brief: 'Fast cuts to the beat, open on the sunrise shot. Keep captions short. End on the group photo with “See you Sunday”.', footage_links: 'https://drive.google.com/…/runclub-w12', created_at: iso(now - 2 * Dd), updated_at: iso(now - 3 * H),
    files: [{ id: 'f1', kind: 'raw', name: 'runclub_A001.mp4', size: 46e6, path: 'demo/raw', created_at: iso(now - 2 * Dd) }, { id: 'f2', kind: 'deliverable', name: 'runclub_w12_v1.mp4', size: 31e6, version: 1, path: 'demo/v1', created_at: iso(now - 3 * H), demoSrc: 'assets/video/lifestyle.mp4' }],
    messages: [{ kind: 'system', body: 'Request submitted.', sender: clientId, created_at: iso(now - 2 * Dd) }, { kind: 'system', body: 'Kabir started editing.', sender: adminId, created_at: iso(now - 40 * H) }, { kind: 'note', body: 'First cut is up — we used the sunrise shot as the hook. Let us know what you think!', sender: adminId, created_at: iso(now - 3 * H) }] });
  mk({ user_id: clientId, title: 'Gear review: best running shoes 2026', video_type: 'youtube', tier: 'premium', status: 'in_progress', platform: 'YouTube', aspect_ratio: '16:9', length: '10–12 min', assignee: 'Meera (Editor)', brief: 'Talking head + b-roll of each shoe. Add chapters and a comparison table graphic.', created_at: iso(now - 1 * Dd), updated_at: iso(now - 10 * H), files: [{ id: 'f3', kind: 'raw', name: 'shoes_cam_A.mp4', size: 48e6, path: 'demo', created_at: iso(now - Dd) }], messages: [{ kind: 'system', body: 'Request submitted.', sender: clientId, created_at: iso(now - Dd) }] });
  mk({ user_id: clientId, title: 'Podcast ep. 7 — 3 clips', video_type: 'podcast', tier: 'complex', status: 'submitted', brief: 'Pick the three strongest moments about injury recovery.', created_at: iso(now - 3 * H), updated_at: iso(now - 3 * H), messages: [{ kind: 'system', body: 'Request submitted.', sender: clientId, created_at: iso(now - 3 * H) }] });
  mk({ user_id: clientId, title: 'Brand collab — protein bar ad', video_type: 'ad', tier: 'premium', status: 'completed', revision_count: 1, assignee: 'Kabir (Editor)', brief: 'Three hook variants for Meta ads.', created_at: iso(now - 9 * Dd), updated_at: iso(now - 6 * Dd), completed_at: iso(now - 6 * Dd), files: [{ id: 'f4', kind: 'deliverable', name: 'protein_ad_v2.mp4', size: 22e6, version: 2, path: 'demo', created_at: iso(now - 6 * Dd), demoSrc: 'assets/video/app.mp4' }], messages: [] });
  mk({ user_id: clientId, title: 'Morning routine reel', video_type: 'reel', tier: 'premium', status: 'completed', created_at: iso(now - 14 * Dd), updated_at: iso(now - 12 * Dd), completed_at: iso(now - 12 * Dd), files: [{ id: 'f5', kind: 'deliverable', name: 'morning_v1.mp4', size: 18e6, version: 1, path: 'demo', created_at: iso(now - 12 * Dd), demoSrc: 'assets/video/travel.mp4' }], messages: [] });
  mk({ user_id: 'u-2', title: 'Why I quit my 9–5 (long-form)', video_type: 'youtube', tier: 'complex', status: 'revision', revision_count: 1, platform: 'YouTube', aspect_ratio: '16:9', assignee: 'Meera (Editor)', brief: 'Restructure around three turning points.', created_at: iso(now - 4 * Dd), updated_at: iso(now - 5 * H), messages: [{ kind: 'revision', body: 'Can we tighten the intro to under 20 seconds?', sender: 'u-2', created_at: iso(now - 5 * H) }] });
  mk({ user_id: 'u-3', title: 'Founder Talks — ep. 41 clip', video_type: 'podcast', tier: 'simple', status: 'submitted', brief: 'Best 60 seconds on fundraising.', created_at: iso(now - 6 * H), updated_at: iso(now - 6 * H), messages: [] });

  const meId = role === 'admin' ? adminId : clientId;
  let signedIn = true;
  const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));
  const withProfile = (r) => ({ ...r, profiles: people[r.user_id] });
  const subOf = (u) => subs.find((s) => s.user_id === u) || null;

  return {
    demo: true,
    async session() { return signedIn ? { user: { id: meId } } : null; },
    async signIn() { await wait(); signedIn = true; },
    async signOut() { signedIn = false; },
    async resetPassword() { await wait(); },
    async updatePassword() { await wait(); },
    onAuth() {},
    async me() { return signedIn ? { ...people[meId], subscription: subOf(meId) } : null; },
    async updateProfile(f) { Object.assign(people[meId], f); },
    async listRequests() { await wait(120); return reqs.filter((r) => role === 'admin' || r.user_id === meId).map(withProfile).sort((a, b) => b.created_at.localeCompare(a.created_at)); },
    async getRequest(id) {
      await wait(120); const r = reqs.find((x) => x.id === id); if (!r) throw new Error('Request not found.');
      return { ...withProfile(r), messages: r.messages.map((m) => ({ ...m, profiles: people[m.sender] })) };
    },
    async createRequest(p) {
      await wait(400); const s = subOf(meId);
      if (s.credits_used >= s.credits_total) throw new Error('You’ve used all videos in your pack.');
      const active = reqs.filter((r) => r.user_id === meId && ['submitted', 'in_progress', 'in_review', 'revision'].includes(r.status)).length;
      if (active >= s.max_active) throw new Error(`Your plan allows ${s.max_active} active request(s) at a time. (Demo mode)`);
      s.credits_used++;
      const r = mk({ ...p, user_id: meId, tier: s.plan === 'premium' ? (p.tier || 'premium') : s.plan, status: 'submitted', created_at: iso(Date.now()), updated_at: iso(Date.now()), messages: [{ kind: 'system', body: 'Request submitted.', sender: meId, created_at: iso(Date.now()) }] });
      return r.id;
    },
    async requestRevision(id, note) { const r = reqs.find((x) => x.id === id); r.status = 'revision'; r.revision_count++; r.messages.push({ kind: 'revision', body: note || 'Revision requested.', sender: meId, created_at: iso(Date.now()) }); },
    async approve(id) { const r = reqs.find((x) => x.id === id); r.status = 'completed'; r.completed_at = iso(Date.now()); r.messages.push({ kind: 'system', body: 'Draft approved — project completed.', sender: meId, created_at: iso(Date.now()) }); },
    async addMessage(id, body) { reqs.find((x) => x.id === id).messages.push({ kind: 'note', body, sender: meId, created_at: iso(Date.now()) }); },
    async uploadFile(id, kind, file, onProgress, version = 1) {
      if (file.size > MAX_BYTES) throw new Error(`${file.name} is larger than ${MAX_UPLOAD_MB} MB — share it as a Drive/Dropbox link instead.`);
      for (let i = 1; i <= 10; i++) { await wait(60); onProgress && onProgress(i / 10); }
      reqs.find((x) => x.id === id).files.push({ id: 'f' + Math.random(), kind, name: file.name, size: file.size, version, path: 'demo', created_at: iso(Date.now()), demoSrc: kind === 'deliverable' ? URL.createObjectURL(file) : null });
    },
    async fileUrl(path, download, f) { return f && f.demoSrc ? f.demoSrc : '#'; },
    async setStatus(id, status, note) { const r = reqs.find((x) => x.id === id); r.status = status; if (status === 'completed') r.completed_at = iso(Date.now()); r.messages.push({ kind: 'system', body: note || 'Status changed to ' + STATUS[status].label + '.', sender: meId, created_at: iso(Date.now()) }); },
    async assign(id, a) { reqs.find((x) => x.id === id).assignee = a; },
    async listClients() { return Object.values(people).filter((p) => p.role === 'customer').map((p) => ({ ...p, subscription: subOf(p.id) })); },
    async saveSubscription(userId, fields, id) { const s = subs.find((x) => x.id === id); if (s) Object.assign(s, fields); else subs.push({ id: 's-' + Math.random(), user_id: userId, credits_used: 0, status: 'active', ...fields }); }
  };
}

export async function getApi(role) { return DEMO ? demoApi(role) : supabaseApi(); }
