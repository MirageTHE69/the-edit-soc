// The Edit Society — customer dashboard.
import { getApi, VIDEO_TYPES, STATUS, PLAN_LABEL, MAX_BYTES, DEMO } from './api.js';
import { esc, $, $$, ic, TYPE_ICON, fmtDate, fmtDateTime, ago, fmtSize, initials, chip, tierChip, refNo, toast, modal, loading, errorBox, shell, router } from './ui.js';
import { MAX_UPLOAD_MB } from './config.js';

const api = await getApi('customer');
if (!(await api.session())) location.replace('login.html');
let me = await api.me();
if (!me) location.replace('login.html');
if (me.role === 'admin' && !DEMO) location.replace('admin.html');

const ACTIVE = ['submitted', 'in_progress', 'in_review', 'revision'];
let cache = [];
const sub = () => me.subscription;
const left = () => (sub() ? Math.max(0, sub().credits_total - sub().credits_used) : 0);
const typeLabel = (t) => (VIDEO_TYPES.find((x) => x.id === t) || { label: t }).label;
const firstName = () => (me.full_name || '').split(' ')[0] || 'there';

function planWidget() {
  const s = sub(); if (!s) return `<div class="planw glass"><span class="muted" style="font-size:13px">No active plan</span><a class="btn sm" href="index.html#pricing">See plans</a></div>`;
  const pct = Math.round((left() / s.credits_total) * 100);
  return `<div class="planw glass"><span class="dim" style="font-size:12px;letter-spacing:.08em;text-transform:uppercase">Your plan</span><b>${PLAN_LABEL[s.plan]} <span class="serif" style="font-weight:400;color:#8C8A86">${s.pack_size}-pack</span></b>
    <div class="bar"><i style="width:${pct}%"></i></div><span class="muted" style="font-size:13px">${left()} of ${s.credits_total} videos left</span></div>`;
}

async function frame(fn, args) {
  try { cache = await api.listRequests(); } catch (e) { cache = []; }
  const review = cache.filter((r) => r.status === 'in_review').length;
  const main = shell({
    me, title: 'Client dashboard', planHtml: planWidget(), onSignOut: async () => { await api.signOut(); location.replace(DEMO ? 'login.html' : 'login.html'); },
    nav: [
      { href: '#/', icon: 'home', label: 'Overview', short: 'Home' },
      { href: '#/new', icon: 'plus', label: 'New request', short: 'New', cta: true },
      { href: '#/requests', icon: 'list', label: 'My requests', short: 'Requests', badge: review || '', match: (h) => h.startsWith('#/request') },
      { href: '#/account', icon: 'user', label: 'Account' }
    ]
  });
  main.innerHTML = '<div class="main-in" id="view">' + loading() + '</div>';
  window.scrollTo(0, 0);
  try { await fn($('#view'), ...args); } catch (e) { $('#view').innerHTML = errorBox(e); }
}

/* ---------------- overview ---------------- */
async function overview(v) {
  const s = sub();
  const count = (st) => cache.filter((r) => st.includes(r.status)).length;
  const review = cache.filter((r) => r.status === 'in_review');
  v.innerHTML = `
  <div class="ph fadeup"><div><h1>Hi ${esc(firstName())}, <span class="serif">let’s make something</span></h1><p>Here’s what’s happening with your edits.</p></div>
    <a class="btn accent" href="#/new">${ic('plus')} New request</a></div>
  ${review.length ? `<div class="card glass fadeup" style="border-color:#6B3FD666;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap">
    <div style="display:flex;gap:14px;align-items:center"><span class="chip st-in_review">Draft ready</span><span><b>${esc(review[0].title)}</b><span class="muted"> ${review.length > 1 ? `and ${review.length - 1} more are` : 'is'} waiting for your review.</span></span></div>
    <a class="btn sm" href="#/request/${review[0].id}">Watch draft ${ic('arrow', 16)}</a></div>` : ''}
  <div class="grid g4 fadeup">
    <div class="stat glass"><span>Videos left</span><b>${left()}<em>/${s ? s.credits_total : 0}</em></b></div>
    <div class="stat glass"><span>In production</span><b>${count(['submitted', 'in_progress', 'revision'])}</b></div>
    <div class="stat glass"><span>Ready to review</span><b>${count(['in_review'])}</b></div>
    <div class="stat glass"><span>Completed</span><b>${count(['completed'])}</b></div>
  </div>
  <div class="grid g21 fadeup">
    <div class="card glass"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h2>Recent requests</h2><a class="link" href="#/requests">View all</a></div>
      ${cache.length ? `<div class="rlist">${cache.slice(0, 5).map(row).join('')}</div>` : emptyState()}</div>
    ${planCard()}
  </div>`;
}
function planCard() {
  const s = sub();
  if (!s) return `<div class="plancard glass"><div class="glow"></div><span class="dim" style="font-size:12px;letter-spacing:.08em;text-transform:uppercase">No active plan</span><p class="muted" style="margin:0">Pick a pack to start sending footage.</p><a class="btn" href="index.html#pricing">See plans</a></div>`;
  const active = cache.filter((r) => ACTIVE.includes(r.status)).length;
  return `<div class="plancard glass"><div class="glow"></div>
    <span class="dim" style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;position:relative">Your plan</span>
    <div style="position:relative"><span class="pn">${PLAN_LABEL[s.plan]}</span> <span class="serif muted" style="font-size:22px">${s.pack_size}-pack</span></div>
    <div style="position:relative;display:flex;flex-direction:column;gap:8px"><div class="bar"><i style="width:${Math.round((left() / s.credits_total) * 100)}%"></i></div><span class="muted" style="font-size:13px">${left()} of ${s.credits_total} videos left</span></div>
    <div style="position:relative">
      <div class="kv"><span>Active requests</span><b>${active} / ${s.max_active}</b></div>
      <div class="kv"><span>Revisions per video</span><b>${s.max_revisions} rounds</b></div>
      <div class="kv"><span>Valid until</span><b>${fmtDate(s.valid_until)}</b></div>
    </div>
    <a class="btn ghost sm" href="index.html#pricing" style="position:relative;align-self:flex-start">Top up or upgrade</a></div>`;
}
const emptyState = () => `<div class="empty"><b>No requests yet</b><span>Send your first footage — your first cut lands in 48–72 hours.</span><a class="btn sm" href="#/new">${ic('plus', 16)} New request</a></div>`;
const row = (r) => `<a class="rrow" href="#/request/${r.id}"><span class="num">${refNo(r)}</span><span class="tt"><b>${esc(r.title)}</b><small>${esc(typeLabel(r.video_type))} · ${PLAN_LABEL[r.tier]}</small></span><span class="stc">${chip(r.status)}</span><span class="when">${ago(r.updated_at || r.created_at)}</span><span class="go">${ic('arrow', 16)}</span></a>`;

/* ---------------- list ---------------- */
async function list(v) {
  const groups = [['all', 'All', () => true], ['active', 'In production', (r) => ['submitted', 'in_progress', 'revision'].includes(r.status)], ['review', 'Draft ready', (r) => r.status === 'in_review'], ['done', 'Completed', (r) => r.status === 'completed']];
  let f = 'all';
  const draw = () => {
    const g = groups.find((x) => x[0] === f), rows = cache.filter(g[2]);
    v.innerHTML = `<div class="ph fadeup"><div><h1>My <span class="serif">requests</span></h1><p>Every video you’ve sent us, newest first.</p></div><a class="btn accent" href="#/new">${ic('plus')} New request</a></div>
      <div class="filters">${groups.map((x) => `<button class="fbtn ${x[0] === f ? 'on' : ''}" data-f="${x[0]}">${x[1]}<em>${cache.filter(x[2]).length}</em></button>`).join('')}</div>
      <div class="card glass fadeup">${rows.length ? `<div class="rlist"><div class="rrow head"><span>No.</span><span>Request</span><span>Status</span><span>Updated</span><span></span></div>${rows.map(row).join('')}</div>` : emptyState()}</div>`;
    $$('.fbtn', v).forEach((b) => b.addEventListener('click', () => { f = b.dataset.f; draw(); }));
  };
  draw();
}

/* ---------------- new request wizard ---------------- */
async function newRequest(v) {
  const s = sub();
  if (!s) { v.innerHTML = `<div class="ph"><div><h1>New <span class="serif">request</span></h1></div></div><div class="card glass">${planCard()}</div>`; return; }
  const active = cache.filter((r) => ACTIVE.includes(r.status)).length;
  const blocked = left() <= 0 ? 'You’ve used every video in your pack. Top up to send more footage.' : active >= s.max_active ? `Your ${PLAN_LABEL[s.plan]} plan allows ${s.max_active} active request${s.max_active > 1 ? 's' : ''} at a time. Approve a finished draft to start the next one.` : '';
  const d = { video_type: '', tier: s.plan === 'premium' ? 'premium' : s.plan, title: '', platform: 'Instagram', aspect_ratio: '9:16', length: '30–60 sec', deadline: '', brief: '', style_notes: '', captions: 'Bold animated captions', music: 'You pick (trending / upbeat)', reference_links: '', footage_links: '' };
  const files = [];
  let step = 0;
  const STEPS = ['Video type', 'Details', 'Footage', 'Review'];

  const draw = () => {
    v.innerHTML = `<div class="ph fadeup"><div><div class="crumb"><a href="#/">Overview</a><span>/</span><span>New request</span></div><h1>New <span class="serif">request</span></h1><p>Takes about two minutes. Uses 1 of your ${left()} remaining videos.</p></div></div>
      ${blocked ? `<div class="err">${esc(blocked)}</div>` : ''}
      <div class="wiz">${STEPS.map((t, i) => `${i ? '<span class="ln"></span>' : ''}<span class="s ${i === step ? 'on' : i < step ? 'done' : ''}"><i>${i < step ? ic('check', 14) : i + 1}</i>${t}</span>`).join('')}</div>
      <div class="card glass fadeup" id="stepbox"></div>`;
    const box = $('#stepbox', v);
    const foot = (nextLabel = 'Continue') => `<div class="formfoot"><button class="btn ghost" id="back" ${step === 0 ? 'style="visibility:hidden"' : ''}>${ic('back', 16)} Back</button><button class="btn" id="next" ${blocked ? 'disabled' : ''}>${nextLabel} ${ic('arrow', 16)}</button></div>`;

    if (step === 0) {
      box.innerHTML = `<div style="display:flex;flex-direction:column;gap:22px"><div><h2>What are we editing?</h2><p class="muted" style="margin:6px 0 0">Pick the closest match — you can explain the rest in the brief.</p></div>
        <div class="typegrid">${VIDEO_TYPES.map((t) => `<button type="button" class="tcard ${d.video_type === t.id ? 'on' : ''}" data-t="${t.id}"><span class="ic">${ic(TYPE_ICON[t.id], 20)}</span><span><b>${t.label}</b><small>${t.hint}</small></span></button>`).join('')}</div>
        ${s.plan === 'premium' ? `<div class="field"><span class="lbl">Edit style</span><div class="seg" id="tier">${['simple', 'complex', 'premium'].map((t) => `<button type="button" data-v="${t}" class="${d.tier === t ? 'on' : ''}">${PLAN_LABEL[t]}</button>`).join('')}</div><small>Simple: clean cuts & captions · Complex: motion graphics & retention edits · Premium: full campaign-level finish.</small></div>`
          : `<div class="kv" style="border:0;padding:0"><span>Edit style on your plan</span><b>${PLAN_LABEL[s.plan]}</b></div>`}
        <div id="e0"></div>${foot()}</div>`;
      $$('.tcard', box).forEach((b) => b.addEventListener('click', () => { d.video_type = b.dataset.t; const vt = VIDEO_TYPES.find((x) => x.id === d.video_type);
        if (['youtube', 'brand-film'].includes(d.video_type)) { d.aspect_ratio = '16:9'; d.platform = 'YouTube'; d.length = d.video_type === 'youtube' ? '8–12 min' : '1–3 min'; }
        else if (d.video_type === 'short') { d.platform = 'YouTube Shorts'; d.aspect_ratio = '9:16'; }
        $$('.tcard', box).forEach((x) => x.classList.toggle('on', x === b)); void vt; }));
      $$('#tier button', box).forEach((b) => b.addEventListener('click', () => { d.tier = b.dataset.v; $$('#tier button', box).forEach((x) => x.classList.toggle('on', x === b)); }));
    }

    if (step === 1) {
      const opt = (arr, cur) => arr.map((o) => `<option ${o === cur ? 'selected' : ''}>${o}</option>`).join('');
      box.innerHTML = `<div style="display:flex;flex-direction:column;gap:22px"><div><h2>Tell us about the video</h2><p class="muted" style="margin:6px 0 0">The more context, the closer the first cut.</p></div>
        <div class="fgrid">
          <div class="field full"><label for="f-title">Video title *</label><input class="in" id="f-title" maxlength="120" placeholder="e.g. Sunday run club — week 13" value="${esc(d.title)}"></div>
          <div class="field"><label for="f-platform">Where will it be posted?</label><select class="in" id="f-platform">${opt(['Instagram', 'YouTube', 'YouTube Shorts', 'TikTok', 'LinkedIn', 'Website', 'Ads (Meta / Google)', 'Other'], d.platform)}</select></div>
          <div class="field"><span class="lbl">Format</span><div class="seg" id="f-ar">${['9:16', '4:5', '1:1', '16:9'].map((a) => `<button type="button" data-v="${a}" class="${d.aspect_ratio === a ? 'on' : ''}">${a}</button>`).join('')}</div></div>
          <div class="field"><label for="f-len">Final length</label><select class="in" id="f-len">${opt(['Under 30 sec', '30–60 sec', '60–90 sec', '1–3 min', '3–8 min', '8–12 min', '12–20 min', '20 min +'], d.length)}</select></div>
          <div class="field"><label for="f-dl">Need it by (optional)</label><input class="in" id="f-dl" type="date" value="${esc(d.deadline)}" min="${new Date().toISOString().slice(0, 10)}"></div>
          <div class="field full"><label for="f-brief">Brief *</label><textarea class="in" id="f-brief" placeholder="What’s the video about? What should the hook be? Anything to cut, keep or highlight?">${esc(d.brief)}</textarea><small>Tip: tell us the hook, the story, and the call-to-action at the end.</small></div>
          <div class="field"><label for="f-cap">Captions</label><select class="in" id="f-cap">${opt(['Bold animated captions', 'Clean minimal captions', 'My brand style (see notes)', 'No captions'], d.captions)}</select></div>
          <div class="field"><label for="f-music">Music</label><select class="in" id="f-music">${opt(['You pick (trending / upbeat)', 'Calm / cinematic', 'Use the audio in my footage', 'I’ll send a track'], d.music)}</select></div>
          <div class="field full"><label for="f-style">Style notes (optional)</label><input class="in" id="f-style" placeholder="Fonts, colours, pacing, things you love or hate" value="${esc(d.style_notes)}"></div>
          <div class="field full"><label for="f-ref">Reference videos (optional)</label><textarea class="in" id="f-ref" style="min-height:76px" placeholder="Paste 1–3 links to videos you want this to feel like">${esc(d.reference_links)}</textarea></div>
        </div><div id="e1"></div>${foot()}</div>`;
      $$('#f-ar button', box).forEach((b) => b.addEventListener('click', () => { d.aspect_ratio = b.dataset.v; $$('#f-ar button', box).forEach((x) => x.classList.toggle('on', x === b)); }));
    }

    if (step === 2) {
      box.innerHTML = `<div style="display:flex;flex-direction:column;gap:22px"><div><h2>Send your footage</h2><p class="muted" style="margin:6px 0 0">Upload files up to ${MAX_UPLOAD_MB} MB each, or paste a link for bigger footage. Raw phone footage is totally fine.</p></div>
        <label class="drop" id="drop" for="f-files"><span class="ic">${ic('upload', 22)}</span><b>Drop files here or <span style="text-decoration:underline">browse</span></b><span class="muted" style="font-size:13px">Video, audio, images, fonts, logos — up to ${MAX_UPLOAD_MB} MB each</span></label>
        <input id="f-files" type="file" multiple class="hide">
        <div class="flist" id="flist"></div>
        <div class="field"><label for="f-links">Footage links (Google Drive, Dropbox, WeTransfer)</label><textarea class="in" id="f-links" style="min-height:90px" placeholder="https://drive.google.com/…  — make sure the link is set to “Anyone with the link can view”">${esc(d.footage_links)}</textarea></div>
        <div id="e2"></div>${foot()}</div>`;
      const drawFiles = () => { $('#flist', box).innerHTML = files.map((f, i) => `<div class="frow"><span class="fi">${ic(f.type.startsWith('video') ? 'film' : 'file', 16)}</span><span class="nm"><b>${esc(f.name)}</b><small>${fmtSize(f.size)}</small></span><button type="button" class="iconbtn" data-rm="${i}" aria-label="Remove ${esc(f.name)}">${ic('x', 14)}</button></div>`).join('');
        $$('[data-rm]', box).forEach((b) => b.addEventListener('click', () => { files.splice(+b.dataset.rm, 1); drawFiles(); })); };
      const add = (list) => { const bad = []; [...list].forEach((f) => (f.size > MAX_BYTES ? bad.push(f.name) : files.push(f))); drawFiles();
        $('#e2', box).innerHTML = bad.length ? `<div class="err">${esc(bad.join(', '))} ${bad.length > 1 ? 'are' : 'is'} over ${MAX_UPLOAD_MB} MB — upload ${bad.length > 1 ? 'them' : 'it'} to Google Drive or Dropbox and paste the link below.</div>` : ''; };
      $('#f-files', box).addEventListener('change', (e) => add(e.target.files));
      const dz = $('#drop', box);
      ['dragenter', 'dragover'].forEach((t) => dz.addEventListener(t, (e) => { e.preventDefault(); dz.classList.add('over'); }));
      ['dragleave', 'drop'].forEach((t) => dz.addEventListener(t, (e) => { e.preventDefault(); dz.classList.remove('over'); }));
      dz.addEventListener('drop', (e) => add(e.dataTransfer.files));
      drawFiles();
    }

    if (step === 3) {
      const kv = (k, val) => `<div class="kv"><span>${k}</span><b>${esc(val || '—')}</b></div>`;
      box.innerHTML = `<div style="display:flex;flex-direction:column;gap:22px"><div><h2>Review & submit</h2><p class="muted" style="margin:6px 0 0">Check everything looks right. Your editor starts as soon as you submit.</p></div>
        <div class="grid g2 summary"><div>${kv('Video type', typeLabel(d.video_type))}${kv('Edit style', PLAN_LABEL[d.tier])}${kv('Title', d.title)}${kv('Platform', d.platform)}${kv('Format', d.aspect_ratio)}${kv('Length', d.length)}</div>
        <div>${kv('Need it by', d.deadline ? fmtDate(d.deadline) : 'Standard (48–72 hrs)')}${kv('Captions', d.captions)}${kv('Music', d.music)}${kv('Files to upload', files.length ? files.length + ' file' + (files.length > 1 ? 's' : '') + ' · ' + fmtSize(files.reduce((a, f) => a + f.size, 0)) : 'None')}${kv('Footage links', d.footage_links ? 'Added' : 'None')}</div></div>
        <div class="field"><span class="lbl">Brief</span><div class="card" style="background:#0F0F10;border:1px solid #1E1E21;padding:16px;border-radius:14px;white-space:pre-wrap">${esc(d.brief)}</div></div>
        <div class="ok">This uses <b>1 of your ${left()}</b> remaining videos. First cut in 48–72 hours · ${s.max_revisions} revision rounds included.</div>
        <div id="e3"></div>${foot('Submit request')}</div>`;
    }

    $('#back', box).addEventListener('click', () => { collect(); step--; draw(); });
    $('#next', box).addEventListener('click', async () => {
      collect();
      const err = validate(); const eb = $('#e' + step, box);
      if (err) { eb.innerHTML = `<div class="err">${esc(err)}</div>`; return; }
      if (step < 3) { step++; draw(); return; }
      await submit();
    });
  };

  function collect() {
    const val = (id) => { const el = $('#' + id, v); return el ? el.value.trim() : null; };
    if (step === 1) Object.assign(d, { title: val('f-title'), platform: val('f-platform'), length: val('f-len'), deadline: val('f-dl'), brief: val('f-brief'), captions: val('f-cap'), music: val('f-music'), style_notes: val('f-style'), reference_links: val('f-ref') });
    if (step === 2) d.footage_links = val('f-links');
  }
  function validate() {
    if (step === 0 && !d.video_type) return 'Choose a video type to continue.';
    if (step === 1 && !d.title) return 'Give the video a title.';
    if (step === 1 && (!d.brief || d.brief.length < 10)) return 'Add a short brief (at least a sentence) so your editor knows the goal.';
    if (step === 2 && !files.length && !d.footage_links) return 'Upload at least one file or paste a footage link.';
    return '';
  }
  async function submit() {
    const btn = $('#next', v); btn.disabled = true; btn.innerHTML = 'Submitting…';
    let id;
    try { id = await api.createRequest(d); }
    catch (e) { $('#e3', v).innerHTML = errorBox(e); btn.disabled = false; btn.innerHTML = 'Submit request'; return; }
    if (files.length) {
      const m = modal(`<h2 class="sans" style="margin:0">Uploading footage…</h2><p class="muted" style="margin:0">Keep this tab open until all files finish.</p><div class="flist" id="up"></div><div id="uerr"></div>`);
      const up = $('#up', m.el);
      up.innerHTML = files.map((f, i) => `<div class="frow"><span class="fi">${ic('film', 16)}</span><span class="nm"><b>${esc(f.name)}</b><small id="us${i}">Waiting…</small></span><span></span><span class="pb"><i id="ub${i}"></i></span></div>`).join('');
      const failed = [];
      for (let i = 0; i < files.length; i++) {
        try { await api.uploadFile(id, 'raw', files[i], (p) => { $('#ub' + i, m.el).style.width = Math.round(p * 100) + '%'; $('#us' + i, m.el).textContent = Math.round(p * 100) + '%'; }); $('#us' + i, m.el).textContent = 'Uploaded'; }
        catch (e) { failed.push(files[i].name); $('#us' + i, m.el).textContent = 'Failed — ' + e.message; }
      }
      if (failed.length) { $('#uerr', m.el).innerHTML = `<div class="err">Your request was submitted, but ${failed.length} file(s) didn’t upload. You can add them from the request page.</div><button class="btn" data-close>Go to request</button>`; await new Promise((r) => m.el.parentNode.addEventListener('click', (e) => e.target.closest('[data-close]') && r())); }
      m.close();
    }
    me = await api.me();
    toast('Request submitted — your editor is on it.');
    location.hash = '#/request/' + id;
  }
  draw();
}

/* ---------------- request detail ---------------- */
async function detail(v, id) {
  const r = await api.getRequest(id);
  const s = sub();
  const deliv = r.files.filter((f) => f.kind === 'deliverable').sort((a, b) => (b.version || 0) - (a.version || 0));
  const raws = r.files.filter((f) => f.kind !== 'deliverable');
  const maxRev = (s && s.max_revisions) || 2, revLeft = Math.max(0, maxRev - r.revision_count);
  const stepNow = (STATUS[r.status] || {}).step;
  const steps = [['Submitted', 0], [r.status === 'revision' ? 'Revising' : 'Editing', 1], ['Draft ready', 2], ['Completed', 3]];
  const kv = (k, val) => `<div class="kv"><span>${k}</span><b>${esc(val || '—')}</b></div>`;
  let cur = deliv[0];

  v.innerHTML = `
  <div class="ph fadeup"><div><div class="crumb"><a href="#/requests">My requests</a><span>/</span><span>${refNo(r)}</span></div>
    <h1>${esc(r.title)}</h1><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:12px">${chip(r.status)}${tierChip(r.tier)}<span class="muted" style="font-size:13px">${esc(typeLabel(r.video_type))} · submitted ${fmtDate(r.created_at)}</span></div></div></div>
  <div class="card glass fadeup"><div class="tl">${steps.map(([t, n]) => `<div class="st ${r.status === 'completed' || n < stepNow ? 'done' : n === stepNow ? 'now' : ''}"><i>${r.status === 'completed' || n < stepNow ? ic('check', 14) : ''}</i>${t}</div>`).join('')}</div></div>
  <div class="grid g21 fadeup">
    <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
      <div class="card glass" style="display:flex;flex-direction:column;gap:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><h2>${deliv.length ? 'Your edit' : 'Draft'}</h2>
          <div class="vers">${deliv.map((f, i) => `<button class="fbtn ${i === 0 ? 'on' : ''}" data-ver="${i}">v${f.version || deliv.length - i}${i === 0 ? ' · latest' : ''}</button>`).join('')}</div></div>
        <div class="player" id="player">${deliv.length ? '<div class="ph-empty"><div class="spin"></div></div>' : `<div class="ph-empty"><div style="display:flex;flex-direction:column;align-items:center;gap:10px">${ic('clock', 28)}<b style="color:#C9C7C2">Your first cut is on the way</b><span style="font-size:13px">Drafts land within 48–72 hours of a complete brief.${r.assignee ? ' Editor: ' + esc(r.assignee) : ''}</span></div></div>`}</div>
        ${deliv.length ? `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><span class="muted" style="font-size:13px" id="vname">${esc(cur.name)} · ${fmtSize(cur.size)}</span><button class="btn ghost sm" id="dl">${ic('download', 16)} Download</button></div>` : ''}
        ${r.status === 'in_review' ? `<div style="display:flex;gap:10px;flex-wrap:wrap;padding-top:14px;border-top:1px solid #1E1E21;align-items:center">
          <button class="btn accent" id="approve">${ic('check', 16)} Approve & finish</button>
          <button class="btn ghost" id="revise" ${revLeft ? '' : 'disabled'}>Request changes</button>
          <span class="muted" style="font-size:13px">${revLeft} of ${maxRev} revision rounds left</span></div>` : ''}
        ${r.status === 'completed' ? `<div class="ok">Approved and completed${r.completed_at ? ' on ' + fmtDate(r.completed_at) : ''}. Download your final file any time.</div>` : ''}
      </div>
      <div class="card glass detail-brief" style="display:flex;flex-direction:column;gap:12px"><h2>Brief</h2><p>${esc(r.brief || '—')}</p>
        ${r.style_notes ? `<p class="muted"><b style="color:#C9C7C2">Style:</b> ${esc(r.style_notes)}</p>` : ''}
        ${r.reference_links ? `<p class="muted"><b style="color:#C9C7C2">References:</b> ${linkify(r.reference_links)}</p>` : ''}</div>
      <div class="card glass" style="display:flex;flex-direction:column;gap:14px"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><h2>Your footage</h2>
        ${r.status !== 'completed' ? `<label class="btn ghost sm" for="more">${ic('upload', 16)} Add files</label><input type="file" id="more" multiple class="hide">` : ''}</div>
        ${r.footage_links ? `<div class="frow"><span class="fi">${ic('link', 16)}</span><span class="nm"><b>Footage links</b><small>${linkify(r.footage_links)}</small></span><span></span></div>` : ''}
        <div class="flist" id="raws">${raws.map(fileRow).join('') || (r.footage_links ? '' : '<span class="muted">No files uploaded.</span>')}</div></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
      <div class="card glass"><h2 style="margin-bottom:8px">Details</h2>${kv('Request', refNo(r))}${kv('Platform', r.platform)}${kv('Format', r.aspect_ratio)}${kv('Length', r.length)}${kv('Need it by', r.deadline ? fmtDate(r.deadline) : 'Standard')}${kv('Captions', r.captions)}${kv('Music', r.music)}${kv('Editor', r.assignee || 'Being assigned')}${kv('Revisions used', r.revision_count + ' of ' + maxRev)}</div>
      <div class="card glass" style="display:flex;flex-direction:column;gap:14px"><h2>Messages</h2>
        <div class="thread" id="thread">${thread(r.messages)}</div>
        <form class="compose" id="compose"><textarea class="in" id="msgin" placeholder="Message your editor…" rows="1"></textarea><button class="iconbtn" style="width:48px;height:48px" aria-label="Send">${ic('send', 18)}</button></form></div>
    </div>
  </div>`;

  const th = $('#thread', v); th.scrollTop = th.scrollHeight;
  async function play(f) {
    cur = f; const url = await api.fileUrl(f.path, false, f);
    $('#player', v).innerHTML = url && url !== '#' ? `<video src="${esc(url)}" controls playsinline preload="metadata"></video>` : `<div class="ph-empty">Preview not available in demo mode</div>`;
    const n = $('#vname', v); if (n) n.textContent = `${f.name} · ${fmtSize(f.size)}`;
  }
  if (deliv.length) play(deliv[0]);
  $$('[data-ver]', v).forEach((b) => b.addEventListener('click', () => { $$('[data-ver]', v).forEach((x) => x.classList.toggle('on', x === b)); play(deliv[+b.dataset.ver]); }));
  $('#dl', v)?.addEventListener('click', async () => { const u = await api.fileUrl(cur.path, true, cur); if (u && u !== '#') window.open(u, '_blank', 'noopener'); else toast('Downloads work once Supabase is connected.'); });
  $$('[data-file]', v).forEach((b) => b.addEventListener('click', async () => { const f = r.files.find((x) => x.id === b.dataset.file); const u = await api.fileUrl(f.path, true, f); if (u && u !== '#') window.open(u, '_blank', 'noopener'); else toast('Downloads work once Supabase is connected.'); }));
  $('#approve', v)?.addEventListener('click', () => {
    const m = modal(`<h2 class="sans" style="margin:0">Approve this edit?</h2><p class="muted" style="margin:0">We’ll mark the project as completed and your final file stays available to download.</p><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn ghost" data-close>Not yet</button><button class="btn accent" id="yes">Approve</button></div>`);
    $('#yes', m.el).addEventListener('click', async () => { try { await api.approve(r.id); m.close(); toast('Approved — thanks!'); detail(v, id); } catch (e) { toast(e.message, true); } });
  });
  $('#revise', v)?.addEventListener('click', () => {
    const m = modal(`<h2 class="sans" style="margin:0">What should we change?</h2><p class="muted" style="margin:0">Be specific — timestamps help a lot (e.g. “0:12 — cut the pause”). This uses 1 of your ${revLeft} remaining rounds.</p><textarea class="in" id="note" placeholder="0:05 — make the hook text bigger&#10;0:21 — swap this clip for the sunrise shot"></textarea><div id="merr"></div><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn ghost" data-close>Cancel</button><button class="btn" id="send">Send changes</button></div>`);
    $('#send', m.el).addEventListener('click', async () => { const note = $('#note', m.el).value.trim(); if (note.length < 5) { $('#merr', m.el).innerHTML = '<div class="err">Describe the changes you want.</div>'; return; }
      try { await api.requestRevision(r.id, note); m.close(); toast('Changes sent to your editor.'); detail(v, id); } catch (e) { $('#merr', m.el).innerHTML = errorBox(e); } });
  });
  $('#compose', v).addEventListener('submit', async (e) => { e.preventDefault(); const t = $('#msgin', v).value.trim(); if (!t) return;
    try { await api.addMessage(r.id, t); const fresh = await api.getRequest(id); th.innerHTML = thread(fresh.messages); th.scrollTop = th.scrollHeight; $('#msgin', v).value = ''; } catch (err) { toast(err.message, true); } });
  $('#more', v)?.addEventListener('change', async (e) => {
    const list = [...e.target.files]; if (!list.length) return;
    const box = $('#raws', v);
    for (const f of list) {
      const el = document.createElement('div'); el.className = 'frow'; el.innerHTML = `<span class="fi">${ic('film', 16)}</span><span class="nm"><b>${esc(f.name)}</b><small>Uploading…</small></span><span></span><span class="pb"><i></i></span>`; box.appendChild(el);
      try { await api.uploadFile(r.id, 'raw', f, (p) => { el.querySelector('.pb i').style.width = Math.round(p * 100) + '%'; }); el.querySelector('small').textContent = fmtSize(f.size) + ' · uploaded'; }
      catch (err) { el.querySelector('small').textContent = err.message; el.querySelector('small').style.color = '#FF9A70'; }
    }
  });
}
function fileRow(f) { return `<div class="frow"><span class="fi">${ic(/\.(mp4|mov|m4v|webm|avi|mkv)$/i.test(f.name) ? 'film' : 'file', 16)}</span><span class="nm"><b>${esc(f.name)}</b><small>${fmtSize(f.size)} · ${ago(f.created_at)}</small></span><button class="iconbtn" data-file="${f.id}" aria-label="Download ${esc(f.name)}">${ic('download', 15)}</button></div>`; }
function linkify(t) { return esc(t).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener" style="text-decoration:underline;overflow-wrap:anywhere">$1</a>'); }
function thread(ms) {
  if (!ms.length) return '<span class="muted" style="font-size:14px">No messages yet. Questions about the edit? Ask here.</span>';
  return ms.map((m) => {
    const p = m.profiles || {}; const mine = (m.sender_id || m.sender) === me.id;
    if (m.kind === 'system') return `<div class="msg system"><div class="bub">${esc(m.body)} · ${ago(m.created_at)}</div></div>`;
    return `<div class="msg ${mine ? 'me' : ''} ${m.kind === 'revision' ? 'revision' : ''}"><span class="av">${esc(initials(p.full_name || 'TES'))}</span><div class="bub"><small>${esc(mine ? 'You' : p.role === 'admin' ? (p.full_name || 'Studio') + ' · Studio' : p.full_name || '')}${m.kind === 'revision' ? ' · revision request' : ''} · ${ago(m.created_at)}</small>${esc(m.body)}</div></div>`;
  }).join('');
}

/* ---------------- account ---------------- */
async function account(v) {
  v.innerHTML = `<div class="ph fadeup"><div><h1>Your <span class="serif">account</span></h1><p>Profile, plan and password.</p></div></div>
  <div class="grid g21 fadeup">
    <form class="card glass" id="prof" style="display:flex;flex-direction:column;gap:18px"><h2>Profile</h2>
      <div class="fgrid"><div class="field"><label for="a-name">Full name</label><input class="in" id="a-name" value="${esc(me.full_name)}"></div>
      <div class="field"><label for="a-co">Brand / channel</label><input class="in" id="a-co" value="${esc(me.company)}"></div>
      <div class="field"><label for="a-ph">WhatsApp number</label><input class="in" id="a-ph" value="${esc(me.phone)}" placeholder="+91 …"></div>
      <div class="field"><label>Email</label><input class="in" value="${esc(me.email)}" disabled></div></div>
      <div id="pmsg"></div><div><button class="btn">Save changes</button></div></form>
    ${planCard()}
  </div>
  <form class="card glass fadeup" id="pwf" style="display:flex;flex-direction:column;gap:18px;max-width:560px"><h2>Change password</h2>
    <div class="field"><label for="a-pw">New password</label><input class="in" id="a-pw" type="password" minlength="8" autocomplete="new-password"></div><div id="pwmsg"></div><div><button class="btn ghost">Update password</button></div></form>`;
  $('#prof', v).addEventListener('submit', async (e) => { e.preventDefault();
    try { await api.updateProfile({ full_name: $('#a-name', v).value.trim(), company: $('#a-co', v).value.trim(), phone: $('#a-ph', v).value.trim() }); me = await api.me(); $('#pmsg', v).innerHTML = '<div class="ok">Saved.</div>'; } catch (err) { $('#pmsg', v).innerHTML = errorBox(err); } });
  $('#pwf', v).addEventListener('submit', async (e) => { e.preventDefault(); const p = $('#a-pw', v).value;
    if (p.length < 8) { $('#pwmsg', v).innerHTML = '<div class="err">Use at least 8 characters.</div>'; return; }
    try { await api.updatePassword(p); $('#pwmsg', v).innerHTML = '<div class="ok">Password updated.</div>'; $('#a-pw', v).value = ''; } catch (err) { $('#pwmsg', v).innerHTML = errorBox(err); } });
}

router([
  [/^#\/$/, overview],
  [/^#\/new$/, newRequest],
  [/^#\/requests$/, list],
  [/^#\/request\/([\w-]+)$/, detail],
  [/^#\/account$/, account]
], frame);
