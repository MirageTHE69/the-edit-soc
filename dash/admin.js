// The Edit Society — admin (studio) dashboard.
import { getApi, VIDEO_TYPES, STATUS, PLAN_LABEL, DEMO } from './api.js';
import { esc, $, $$, ic, fmtDate, fmtDateTime, ago, fmtSize, initials, chip, tierChip, refNo, toast, modal, loading, errorBox, shell, router } from './ui.js';

const api = await getApi('admin');
if (!(await api.session())) location.replace('login.html');
const me = await api.me();
if (!me) location.replace('login.html');
if (me.role !== 'admin') location.replace('dashboard.html');

let cache = [];
const typeLabel = (t) => (VIDEO_TYPES.find((x) => x.id === t) || { label: t }).label;
const client = (r) => (r.profiles && (r.profiles.company || r.profiles.full_name)) || 'Client';
const COLS = [['submitted', 'New'], ['in_progress', 'Editing'], ['revision', 'Revisions'], ['in_review', 'With client'], ['completed', 'Completed']];

async function frame(fn, args) {
  try { cache = await api.listRequests(); } catch (e) { cache = []; }
  const newCount = cache.filter((r) => r.status === 'submitted' || r.status === 'revision').length;
  const main = shell({
    me, title: 'Studio admin', onSignOut: async () => { await api.signOut(); location.replace('login.html'); },
    nav: [
      { href: '#/', icon: 'home', label: 'Overview', short: 'Home' },
      { href: '#/board', icon: 'board', label: 'Board', badge: newCount || '' },
      { href: '#/requests', icon: 'list', label: 'All requests', short: 'Requests', match: (h) => h.startsWith('#/request') },
      { href: '#/clients', icon: 'users', label: 'Clients' }
    ]
  });
  main.innerHTML = '<div class="main-in" id="view">' + loading() + '</div>';
  window.scrollTo(0, 0);
  try { await fn($('#view'), ...args); } catch (e) { $('#view').innerHTML = errorBox(e); }
}
const row = (r) => `<a class="rrow" href="#/request/${r.id}"><span class="num">${refNo(r)}</span><span class="tt"><b>${esc(r.title)}</b><small>${esc(client(r))} · ${esc(typeLabel(r.video_type))} · ${PLAN_LABEL[r.tier]}</small></span><span class="stc">${chip(r.status)}</span><span class="when">${ago(r.updated_at || r.created_at)}</span><span class="go">${ic('arrow', 16)}</span></a>`;

/* ---------------- overview ---------------- */
async function overview(v) {
  const n = (s) => cache.filter((r) => s.includes(r.status)).length;
  const month = new Date(); month.setDate(1); month.setHours(0, 0, 0, 0);
  const doneMonth = cache.filter((r) => r.status === 'completed' && new Date(r.completed_at || r.updated_at) >= month).length;
  const attention = cache.filter((r) => ['submitted', 'revision'].includes(r.status)).sort((a, b) => a.updated_at.localeCompare(b.updated_at));
  const late = cache.filter((r) => ['submitted', 'in_progress', 'revision'].includes(r.status) && Date.now() - new Date(r.created_at) > 72 * 3600e3);
  v.innerHTML = `<div class="ph fadeup"><div><h1>Studio <span class="serif">overview</span></h1><p>${fmtDate(new Date())} · everything in the queue right now.</p></div><a class="btn" href="#/board">${ic('board')} Open board</a></div>
  <div class="grid g4 fadeup">
    <div class="stat glass"><span>New requests</span><b>${n(['submitted'])}</b></div>
    <div class="stat glass"><span>In editing</span><b>${n(['in_progress', 'revision'])}</b></div>
    <div class="stat glass"><span>With client</span><b>${n(['in_review'])}</b></div>
    <div class="stat glass"><span>Done this month</span><b>${doneMonth}</b></div>
  </div>
  ${late.length ? `<div class="err fadeup">${late.length} request${late.length > 1 ? 's are' : ' is'} past 72 hours without a delivered draft: ${late.map((r) => `<a href="#/request/${r.id}" style="text-decoration:underline">${refNo(r)}</a>`).join(', ')}</div>` : ''}
  <div class="grid g21 fadeup">
    <div class="card glass"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h2>Needs action</h2><span class="muted" style="font-size:13px">New + revision requests, oldest first</span></div>
      ${attention.length ? `<div class="rlist">${attention.map(row).join('')}</div>` : '<div class="empty"><b>All caught up</b><span>No new or revision requests waiting.</span></div>'}</div>
    <div class="card glass"><h2 style="margin-bottom:12px">Recently delivered</h2>
      ${cache.filter((r) => r.status === 'in_review').slice(0, 5).map((r) => `<a class="kv" href="#/request/${r.id}" style="align-items:center"><span style="color:#F2F0EC;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.title)}</span>${chip(r.status)}</a>`).join('') || '<span class="muted">Nothing waiting on clients.</span>'}</div>
  </div>`;
}

/* ---------------- board ---------------- */
async function board(v) {
  v.innerHTML = `<div class="ph fadeup"><div><h1>Production <span class="serif">board</span></h1><p>Every request by stage. Open a card to deliver or update it.</p></div></div>
  <div class="board fadeup">${COLS.map(([s, t]) => { const items = cache.filter((r) => r.status === s).slice(0, s === 'completed' ? 8 : 99);
    return `<div class="col"><h4>${t}<span class="dim">${cache.filter((r) => r.status === s).length}</span></h4>${items.map((r) => `<a class="kcard" href="#/request/${r.id}"><div class="meta"><span>${refNo(r)}</span>${tierChip(r.tier)}</div><b>${esc(r.title)}</b><div class="meta"><span>${esc(client(r))}</span><span>${ago(r.updated_at)}</span></div>${r.assignee ? `<div class="meta"><span>${ic('user', 13)} ${esc(r.assignee)}</span></div>` : ''}</a>`).join('') || '<span class="dim" style="font-size:13px;padding:6px">Empty</span>'}</div>`; }).join('')}</div>`;
}

/* ---------------- all requests ---------------- */
async function list(v) {
  let f = 'all', q = '';
  const draw = () => {
    const rows = cache.filter((r) => (f === 'all' || r.status === f) && (!q || (r.title + ' ' + client(r) + ' ' + refNo(r)).toLowerCase().includes(q)));
    $('#res', v).innerHTML = rows.length ? `<div class="rlist"><div class="rrow head"><span>No.</span><span>Request · client</span><span>Status</span><span>Updated</span><span></span></div>${rows.map(row).join('')}</div>` : '<div class="empty"><b>No matches</b></div>';
    $$('.fbtn', v).forEach((b) => b.classList.toggle('on', b.dataset.f === f));
  };
  v.innerHTML = `<div class="ph fadeup"><div><h1>All <span class="serif">requests</span></h1><p>${cache.length} total</p></div><input class="in" id="q" placeholder="Search title, client or #number" style="max-width:320px"></div>
    <div class="filters"><button class="fbtn on" data-f="all">All<em>${cache.length}</em></button>${COLS.map(([s, t]) => `<button class="fbtn" data-f="${s}">${t}<em>${cache.filter((r) => r.status === s).length}</em></button>`).join('')}</div>
    <div class="card glass fadeup" id="res"></div>`;
  $$('.fbtn', v).forEach((b) => b.addEventListener('click', () => { f = b.dataset.f; draw(); }));
  $('#q', v).addEventListener('input', (e) => { q = e.target.value.trim().toLowerCase(); draw(); });
  draw();
}

/* ---------------- request detail ---------------- */
async function detail(v, id) {
  const r = await api.getRequest(id);
  const p = r.profiles || {};
  const deliv = r.files.filter((f) => f.kind === 'deliverable').sort((a, b) => (b.version || 0) - (a.version || 0));
  const raws = r.files.filter((f) => f.kind !== 'deliverable');
  const nextVer = (deliv[0] ? deliv[0].version || deliv.length : 0) + 1;
  const kv = (k, val) => `<div class="kv"><span>${k}</span><b>${esc(val || '—')}</b></div>`;
  const lastRevision = [...r.messages].reverse().find((m) => m.kind === 'revision');

  v.innerHTML = `
  <div class="ph fadeup"><div><div class="crumb"><a href="#/requests">All requests</a><span>/</span><span>${refNo(r)}</span></div>
    <h1>${esc(r.title)}</h1><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:12px">${chip(r.status)}${tierChip(r.tier)}<span class="muted" style="font-size:13px">${esc(typeLabel(r.video_type))} · ${esc(client(r))} · submitted ${fmtDateTime(r.created_at)}</span></div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${r.status === 'submitted' || r.status === 'revision' ? `<button class="btn accent" data-st="in_progress">${ic('film', 16)} Start editing</button>` : ''}
      ${r.status === 'in_review' ? `<button class="btn ghost" data-st="completed">${ic('check', 16)} Mark completed</button>` : ''}
      ${!['completed', 'cancelled'].includes(r.status) ? `<button class="btn ghost sm" data-st="cancelled">Cancel</button>` : ''}
      ${['completed', 'cancelled'].includes(r.status) ? `<button class="btn ghost sm" data-st="in_progress">Reopen</button>` : ''}
    </div></div>
  ${r.status === 'revision' && lastRevision ? `<div class="card glass fadeup" style="border-color:#E8B03A55"><span class="chip st-revision">Revision ${r.revision_count} requested</span><p style="margin:12px 0 0;white-space:pre-wrap">${esc(lastRevision.body)}</p></div>` : ''}
  <div class="grid g21 fadeup">
    <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
      <div class="card glass" style="display:flex;flex-direction:column;gap:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><h2>Deliver edit</h2><span class="muted" style="font-size:13px">Next upload becomes <b style="color:#F2F0EC">v${nextVer}</b></span></div>
        <label class="drop" for="dfile" id="ddrop"><span class="ic">${ic('upload', 22)}</span><b>Upload draft v${nextVer}</b><span class="muted" style="font-size:13px">The client is moved to “Draft ready” and can approve or request changes.</span></label>
        <input type="file" id="dfile" accept="video/*,image/*,.zip" class="hide">
        <div class="field"><label for="dnote">Note to client (optional)</label><input class="in" id="dnote" placeholder="e.g. Used the sunrise shot as the hook — let us know!"></div>
        <div id="dprog"></div>
        ${deliv.length ? `<div class="flist">${deliv.map((f) => fileRow(f, 'v' + (f.version || 1))).join('')}</div>` : '<span class="muted" style="font-size:14px">No drafts delivered yet.</span>'}
      </div>
      <div class="card glass detail-brief" style="display:flex;flex-direction:column;gap:12px"><h2>Brief</h2><p>${esc(r.brief || '—')}</p>
        ${r.style_notes ? `<p class="muted"><b style="color:#C9C7C2">Style:</b> ${esc(r.style_notes)}</p>` : ''}
        ${r.reference_links ? `<p class="muted"><b style="color:#C9C7C2">References:</b> ${linkify(r.reference_links)}</p>` : ''}</div>
      <div class="card glass" style="display:flex;flex-direction:column;gap:14px"><h2>Client footage</h2>
        ${r.footage_links ? `<div class="frow"><span class="fi">${ic('link', 16)}</span><span class="nm"><b>Footage links</b><small>${linkify(r.footage_links)}</small></span><span></span></div>` : ''}
        <div class="flist">${raws.map((f) => fileRow(f)).join('') || (r.footage_links ? '' : '<span class="muted">No files uploaded.</span>')}</div></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
      <div class="card glass"><h2 style="margin-bottom:8px">Client</h2>
        <div class="who" style="padding:4px 0 10px"><span class="av">${esc(initials(p.full_name))}</span><span class="t"><span>${esc(p.full_name)}</span><small>${esc(p.email)}</small></span></div>
        ${kv('Brand', p.company)}${kv('WhatsApp', p.phone)}</div>
      <div class="card glass"><h2 style="margin-bottom:8px">Job</h2>${kv('Request', refNo(r))}${kv('Platform', r.platform)}${kv('Format', r.aspect_ratio)}${kv('Length', r.length)}${kv('Need it by', r.deadline ? fmtDate(r.deadline) : 'Standard 48–72 h')}${kv('Captions', r.captions)}${kv('Music', r.music)}${kv('Revisions used', String(r.revision_count))}
        <form id="asg" style="display:flex;gap:8px;margin-top:12px"><input class="in" id="asgin" placeholder="Assign editor (name)" value="${esc(r.assignee)}"><button class="btn sm ghost">Save</button></form></div>
      <div class="card glass" style="display:flex;flex-direction:column;gap:14px"><h2>Messages</h2>
        <div class="thread" id="thread">${thread(r.messages)}</div>
        <form class="compose" id="compose"><textarea class="in" id="msgin" placeholder="Message the client…" rows="1"></textarea><button class="iconbtn" style="width:48px;height:48px" aria-label="Send">${ic('send', 18)}</button></form></div>
    </div>
  </div>`;

  const th = $('#thread', v); th.scrollTop = th.scrollHeight;
  const reload = () => detail(v, id);
  $$('[data-st]', v).forEach((b) => b.addEventListener('click', async () => {
    const st = b.dataset.st;
    if (st === 'cancelled' && !confirm('Cancel this request? The client will see it as cancelled.')) return;
    try { await api.setStatus(r.id, st, st === 'in_progress' ? `${me.full_name || 'The studio'} started editing.` : null); toast('Status updated'); reload(); } catch (e) { toast(e.message, true); }
  }));
  $$('[data-file]', v).forEach((b) => b.addEventListener('click', async () => { const f = r.files.find((x) => x.id === b.dataset.file); const u = await api.fileUrl(f.path, true, f); if (u && u !== '#') window.open(u, '_blank', 'noopener'); else toast('Downloads work once Supabase is connected.'); }));
  $('#asg', v).addEventListener('submit', async (e) => { e.preventDefault(); try { await api.assign(r.id, $('#asgin', v).value.trim()); toast('Editor assigned'); } catch (err) { toast(err.message, true); } });
  $('#compose', v).addEventListener('submit', async (e) => { e.preventDefault(); const t = $('#msgin', v).value.trim(); if (!t) return;
    try { await api.addMessage(r.id, t); const fresh = await api.getRequest(id); th.innerHTML = thread(fresh.messages); th.scrollTop = th.scrollHeight; $('#msgin', v).value = ''; } catch (err) { toast(err.message, true); } });
  const deliver = async (f) => {
    if (!f) return;
    const prog = $('#dprog', v);
    prog.innerHTML = `<div class="frow"><span class="fi">${ic('film', 16)}</span><span class="nm"><b>${esc(f.name)}</b><small id="dps">Uploading…</small></span><span></span><span class="pb"><i id="dpb"></i></span></div>`;
    try {
      await api.uploadFile(r.id, 'deliverable', f, (x) => { $('#dpb', v).style.width = Math.round(x * 100) + '%'; $('#dps', v).textContent = Math.round(x * 100) + '%'; }, nextVer);
      const note = $('#dnote', v).value.trim();
      await api.setStatus(r.id, 'in_review', `Draft v${nextVer} is ready for review.`);
      if (note) await api.addMessage(r.id, note);
      toast(`Draft v${nextVer} delivered`); reload();
    } catch (e) { prog.innerHTML = errorBox(e); }
  };
  $('#dfile', v).addEventListener('change', (e) => deliver(e.target.files[0]));
  const dz = $('#ddrop', v);
  ['dragenter', 'dragover'].forEach((t) => dz.addEventListener(t, (e) => { e.preventDefault(); dz.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((t) => dz.addEventListener(t, (e) => { e.preventDefault(); dz.classList.remove('over'); }));
  dz.addEventListener('drop', (e) => deliver(e.dataTransfer.files[0]));
}
function fileRow(f, tag) { return `<div class="frow"><span class="fi">${ic(/\.(mp4|mov|m4v|webm|avi|mkv)$/i.test(f.name) ? 'film' : 'file', 16)}</span><span class="nm"><b>${tag ? `<span class="tierchip" style="margin-right:6px">${tag}</span>` : ''}${esc(f.name)}</b><small>${fmtSize(f.size)} · ${ago(f.created_at)}</small></span><button class="iconbtn" data-file="${f.id}" aria-label="Download ${esc(f.name)}">${ic('download', 15)}</button></div>`; }
function linkify(t) { return esc(t).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener" style="text-decoration:underline;overflow-wrap:anywhere">$1</a>'); }
function thread(ms) {
  if (!ms.length) return '<span class="muted" style="font-size:14px">No messages yet.</span>';
  return ms.map((m) => {
    const p = m.profiles || {}; const staff = p.role === 'admin';
    if (m.kind === 'system') return `<div class="msg system"><div class="bub">${esc(m.body)} · ${ago(m.created_at)}</div></div>`;
    return `<div class="msg ${staff ? 'me' : ''} ${m.kind === 'revision' ? 'revision' : ''}"><span class="av">${esc(initials(p.full_name || '?'))}</span><div class="bub"><small>${esc(p.full_name || '')}${staff ? ' · Studio' : ' · Client'}${m.kind === 'revision' ? ' · revision request' : ''} · ${ago(m.created_at)}</small>${esc(m.body)}</div></div>`;
  }).join('');
}

/* ---------------- clients ---------------- */
async function clients(v) {
  const list = await api.listClients();
  v.innerHTML = `<div class="ph fadeup"><div><h1><span class="serif">Clients</span> &amp; plans</h1><p>${list.length} client${list.length === 1 ? '' : 's'}. Edit a plan to top up videos or extend validity.</p></div></div>
  <div class="card glass fadeup ctable"><div class="rlist">
    <div class="rrow head"><span>Client</span><span>Plan</span><span>Videos used</span><span>Valid until</span><span></span></div>
    ${list.map((c) => { const s = c.subscription; return `<div class="rrow"><span class="tt"><b>${esc(c.full_name || c.email)}</b><small>${esc(c.company || '')} ${esc(c.email)}</small></span>
      <span>${s ? tierChip(s.plan) + ` <span class="dim" style="font-size:12px">${s.pack_size}-pack</span>` : '<span class="dim">None</span>'}</span>
      <span class="when">${s ? `${s.credits_used} / ${s.credits_total}` : '—'}</span><span class="when">${s ? fmtDate(s.valid_until) : '—'}</span>
      <button class="btn sm ghost" data-edit="${c.id}">${s ? 'Edit plan' : 'Add plan'}</button></div>`; }).join('') || '<div class="empty"><b>No clients yet</b><span>Create logins in Supabase → Authentication → Users.</span></div>'}
  </div></div>
  <p class="dim" style="font-size:13px;margin:0">New client logins are created in Supabase (Authentication → Users → Add user) or with <code>scripts/seed.mjs</code>. They then appear here so you can assign a plan.</p>`;
  $$('[data-edit]', v).forEach((b) => b.addEventListener('click', () => editPlan(list.find((c) => c.id === b.dataset.edit), () => clients(v))));
}
function editPlan(c, done) {
  const s = c.subscription || { plan: 'simple', pack_size: 4, credits_total: 4, credits_used: 0, max_active: 1, max_revisions: 2, status: 'active', valid_until: new Date(Date.now() + 60 * 864e5).toISOString() };
  const m = modal(`<h2 class="sans" style="margin:0">${c.subscription ? 'Edit' : 'Add'} plan — ${esc(c.full_name || c.email)}</h2>
    <div class="fgrid">
      <div class="field"><label for="p-plan">Plan</label><select class="in" id="p-plan">${['simple', 'complex', 'premium'].map((p) => `<option value="${p}" ${s.plan === p ? 'selected' : ''}>${PLAN_LABEL[p]}</option>`).join('')}</select></div>
      <div class="field"><label for="p-pack">Pack size</label><select class="in" id="p-pack">${[4, 8, 12, 20, 30].map((n) => `<option ${+s.pack_size === n ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      <div class="field"><label for="p-tot">Videos in pack</label><input class="in" id="p-tot" type="number" min="0" value="${s.credits_total}"></div>
      <div class="field"><label for="p-used">Videos used</label><input class="in" id="p-used" type="number" min="0" value="${s.credits_used}"></div>
      <div class="field"><label for="p-act">Active at a time</label><input class="in" id="p-act" type="number" min="1" value="${s.max_active}"></div>
      <div class="field"><label for="p-rev">Revisions per video</label><input class="in" id="p-rev" type="number" min="0" value="${s.max_revisions}"></div>
      <div class="field"><label for="p-until">Valid until</label><input class="in" id="p-until" type="date" value="${s.valid_until.slice(0, 10)}"></div>
      <div class="field"><label for="p-st">Status</label><select class="in" id="p-st">${['active', 'paused', 'expired'].map((x) => `<option ${s.status === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
    </div><div id="perr"></div>
    <div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn ghost" data-close>Cancel</button><button class="btn" id="psave">Save plan</button></div>`);
  $('#p-plan', m.el).addEventListener('change', (e) => { const p = e.target.value; $('#p-act', m.el).value = p === 'premium' ? 3 : 1; $('#p-rev', m.el).value = p === 'premium' ? 3 : 2; });
  $('#p-pack', m.el).addEventListener('change', (e) => { $('#p-tot', m.el).value = e.target.value; });
  $('#psave', m.el).addEventListener('click', async () => {
    const g = (id) => $('#' + id, m.el).value;
    const fields = { plan: g('p-plan'), pack_size: +g('p-pack'), credits_total: +g('p-tot'), credits_used: +g('p-used'), max_active: +g('p-act'), max_revisions: +g('p-rev'), valid_until: new Date(g('p-until') + 'T23:59:59').toISOString(), status: g('p-st') };
    try { await api.saveSubscription(c.id, fields, c.subscription && c.subscription.id); m.close(); toast('Plan saved'); done(); } catch (e) { $('#perr', m.el).innerHTML = errorBox(e); }
  });
}

router([
  [/^#\/$/, overview],
  [/^#\/board$/, board],
  [/^#\/requests$/, list],
  [/^#\/request\/([\w-]+)$/, detail],
  [/^#\/clients$/, clients]
], frame);
