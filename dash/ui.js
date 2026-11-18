// The Edit Society — shared dashboard UI helpers (shell, router, icons, formatting).
import { STATUS, PLAN_LABEL, DEMO } from './api.js';

export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const $ = (sel, el = document) => el.querySelector(sel);
export const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

const P = {
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .7 3.3 2.6 3.8 5.5"/>',
  board: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="7" rx="1.5"/>',
  logout: '<path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4M6 12h11"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>',
  download: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/>',
  file: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/>',
  film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  send: '<path d="M4 12l16-8-6 16-3-7z"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7L11.5 6.8"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  play: '<rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="M10 9l5 3-5 3z"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  ad: '<path d="M3 10v4l11 5V5z"/><path d="M14 9a3 3 0 0 1 0 6M6 14l1 5h3l-1-4"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.7 0 2-1.2 1.4-2.3-.7-1.2.1-2.7 1.5-2.7H18a3 3 0 0 0 3-3c0-5.5-4-10-9-10z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
  clapper: '<path d="M3 9h18v11H3z"/><path d="M3 9l2.5-5 15 0L18 9M8.5 4L6 9M14 4l-2.5 5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>'
};
export const ic = (name, size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
export const TYPE_ICON = { reel: 'phone', short: 'phone', youtube: 'play', podcast: 'mic', ad: 'ad', motion: 'spark', colour: 'palette', 'brand-film': 'clapper' };

export function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'; }
export function fmtDateTime(d) { return d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—'; }
export function ago(d) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + ' min ago';
  if (s < 86400) return Math.floor(s / 3600) + ' h ago';
  if (s < 86400 * 7) return Math.floor(s / 86400) + ' d ago';
  return fmtDate(d);
}
export function fmtSize(b) { if (!b && b !== 0) return ''; const u = ['B', 'KB', 'MB', 'GB']; let i = 0; while (b >= 1024 && i < 3) { b /= 1024; i++; } return b.toFixed(i ? 1 : 0) + ' ' + u[i]; }
export const initials = (n) => (n || '?').split(/\s+/).map((x) => x[0]).slice(0, 2).join('').toUpperCase();
export const chip = (s) => `<span class="chip st-${s}">${esc((STATUS[s] || {}).label || s)}</span>`;
export const tierChip = (t) => `<span class="tierchip tier-${t}">${esc(PLAN_LABEL[t] || t)}</span>`;
export const refNo = (r) => '#' + r.ref;

export function toast(msg, bad) {
  const t = document.createElement('div'); t.className = 'toast' + (bad ? ' bad' : ''); t.textContent = msg; t.setAttribute('role', 'status');
  document.body.appendChild(t); setTimeout(() => t.remove(), 3200);
}
export function modal(html) {
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="box glass" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(m);
  const close = () => m.remove();
  m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', k); } });
  const f = m.querySelector('textarea,input,select'); if (f) setTimeout(() => f.focus(), 50);
  return { el: m.firstElementChild, close };
}
export const loading = () => '<div class="loading"><div class="spin"></div></div>';
export const errorBox = (e) => `<div class="err">${esc(e && e.message ? e.message : e)}</div>`;

// Renders the app frame (sidebar on desktop, top bar + bottom tabs on mobile) and returns the main element.
export function shell({ me, nav, title, onSignOut, planHtml }) {
  const root = document.getElementById('root');
  const hash = location.hash || '#/';
  const isOn = (n) => (n.match ? n.match(hash) : hash === n.href);
  root.innerHTML = `
    ${DEMO && !new URLSearchParams(location.search).has('shot') ? '<div class="demo-bar">Demo mode — sample data, nothing is saved. Add your Supabase keys in dash/config.js to go live.</div>' : ''}
    <div class="app">
      <aside class="side">
        <a class="logo" href="index.html"><span class="sans" style="font-weight:600">the</span><span class="serif"> edit </span><span class="sans" style="font-weight:600">society</span><small>${esc(title)}</small></a>
        <nav class="snav" aria-label="Dashboard">${nav.map((n) => `<a href="${n.href}" class="${isOn(n) ? 'on' : ''}">${ic(n.icon)}<span>${n.label}</span>${n.badge ? `<span class="badge">${n.badge}</span>` : ''}</a>`).join('')}</nav>
        <div class="grow"></div>
        ${planHtml || ''}
        <div class="who"><span class="av">${esc(initials(me.full_name))}</span><span class="t" style="flex:1"><span>${esc(me.full_name || me.email)}</span><small>${esc(me.email)}</small></span><button class="iconbtn" id="signout" title="Log out" aria-label="Log out">${ic('logout', 16)}</button></div>
      </aside>
      <div>
        <div class="mtop"><a class="logo" href="index.html" style="padding:0;font-size:19px"><span class="sans" style="font-weight:600">the</span><span class="serif" style="font-size:21px"> edit </span><span class="sans" style="font-weight:600">society</span></a>
          <div style="display:flex;align-items:center;gap:8px"><span class="av" style="width:32px;height:32px;font-size:12px">${esc(initials(me.full_name))}</span><button class="iconbtn" id="signout2" aria-label="Log out">${ic('logout', 16)}</button></div></div>
        <main class="main" id="main"></main>
      </div>
    </div>
    <nav class="mtabs" aria-label="Dashboard">${nav.filter((n) => !n.desktopOnly).map((n) => `<a href="${n.href}" class="${isOn(n) ? 'on' : ''}${n.cta ? ' cta' : ''}">${ic(n.icon, 20)}<span>${n.short || n.label}</span></a>`).join('')}</nav>`;
  ['signout', 'signout2'].forEach((id) => document.getElementById(id).addEventListener('click', onSignOut));
  return document.getElementById('main');
}

// Minimal hash router: routes = [[/^#\/request\/(.+)$/, fn], ...]
export function router(routes, render) {
  const go = () => {
    const h = location.hash || '#/';
    for (const [re, fn] of routes) { const m = h.match(re); if (m) { render(fn, m.slice(1)); return; } }
    location.hash = '#/';
  };
  window.addEventListener('hashchange', go); go();
}

// Background video autoplay (muted, inline) — same behaviour as the marketing site.
export function autoplay(root = document) {
  $$('video[data-bg]', root).forEach((v) => { v.muted = true; v.playsInline = true; v.setAttribute('muted', ''); v.play().catch(() => {}); });
}
