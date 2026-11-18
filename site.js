/* The Edit Society — inner pages: shared nav/footer, page renderers, video autoplay, transitions.
   Content lives in site-data.js. */
(function () {
  'use strict';
  var D = window.TES;
  var BOOK = D.bookUrl;
  var page = document.body.getAttribute('data-page');
  var app = document.getElementById('app');
  var q = new URLSearchParams(location.search);

  /* ---------- small helpers ---------- */
  var ARROW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>';
  var NE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"></path></svg>';
  var CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>';
  function pad(n) { return String(n).padStart(2, '0'); }
  function vid(name, extra) {
    return '<video src="./assets/video/' + name + '.mp4" poster="./assets/video/' + name + '.jpg" autoplay muted loop playsinline preload="metadata" aria-hidden="true"' + (extra || '') + '></video>';
  }
  function btn(href, label, cls) { return '<a class="' + (cls || 'btn') + '" href="' + href + '">' + label + '<span class="dot" aria-hidden="true">' + ARROW + '</span></a>'; }
  function svc(slug) { for (var i = 0; i < D.services.length; i++) if (D.services[i].slug === slug) return D.services[i]; return null; }
  function proj(slug) { for (var i = 0; i < D.projects.length; i++) if (D.projects[i].slug === slug) return D.projects[i]; return null; }
  function svcUrl(slug) { return 'service.html?s=' + slug; }
  function projUrl(slug) { return 'project.html?p=' + slug; }
  function title2(a, b) { return '<span class="ln"><span>' + a + '</span></span><span class="ln"><span>' + b + '</span></span>'; }
  function crumbs(list) {
    return '<nav class="crumbs fade-in" aria-label="Breadcrumb">' + list.map(function (c, i) {
      return (i ? '<span aria-hidden="true">/</span>' : '') + (c[1] ? '<a href="' + c[1] + '">' + c[0] + '</a>' : '<span style="color:#C9C7C2">' + c[0] + '</span>');
    }).join('') + '</nav>';
  }
  function setMeta(title, desc) {
    document.title = title + ' — The Edit Society';
    var m = document.querySelector('meta[name="description"]'); if (m && desc) m.setAttribute('content', desc);
  }
  function pcard(p, opts) {
    opts = opts || {};
    return '<a class="pcard ' + (opts.cls || '') + (p.shape === 'land' ? ' land' : '') + '" href="' + projUrl(p.slug) + '" data-cat="' + p.cat + '">' +
      '<div class="media">' + vid(p.video) + '<span class="tag">' + p.cat + '</span><span class="view">View</span></div>' +
      '<div class="pmeta"><b>' + p.title + '</b><span>' + p.client + '</span></div></a>';
  }
  function ctaBand(h, sub) {
    return '<section class="sec"><div class="wrap ctaband">' +
      '<span class="pill line rv">Let’s work together</span>' +
      '<h2 class="sans">' + h + '</h2>' +
      '<p class="lead rv" style="text-align:center">' + sub + '</p>' +
      '<div class="rv" style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">' + btn(BOOK, 'Book a free call') + btn('index.html#pricing', 'See memberships', 'btn2') + '</div>' +
      '</div></section>';
  }
  function faqList(items) {
    return items.map(function (f, i) {
      return '<div class="faqi rv2' + (i === 0 ? ' open' : '') + '"><button type="button" aria-expanded="' + (i === 0) + '"><span>' + f[0] + '</span><span class="ic" aria-hidden="true">+</span></button>' +
        '<div class="a"><div><p>' + f[1] + '</p></div></div></div>';
    }).join('');
  }
  var STEPS = [
    ['01', 'Pick a plan', 'Choose a 4- or 12-video membership and get onboarded on a quick call.'],
    ['02', 'Share footage + brief', 'Drop a Drive link, two reference videos and your fonts. That’s it.'],
    ['03', 'Review & post', 'Your edit lands in 48–72 hours. Two revision rounds, then hit publish.']
  ];
  function stepsHtml() {
    return '<div class="steps">' + STEPS.map(function (s, i) {
      return '<div class="step rv2' + (i ? ' d' + i : '') + '"><span class="serif num numslide" style="display:inline-block">' + s[0] + '</span><h3 class="sans">' + s[1] + '</h3><p>' + s[2] + '</p></div>';
    }).join('') + '</div>';
  }

  /* ---------- nav, mobile menu, footer ---------- */
  function navHtml() {
    var links = [['Home', 'index.html', 'home'], ['Work', 'work.html', 'work'], ['Services', 'services.html', 'services'], ['Memberships', 'index.html#pricing'], ['FAQ', 'index.html#faq']];
    var cur = page === 'project' ? 'work' : page === 'service' ? 'services' : page;
    return '<header class="nav"><nav class="nav-in" aria-label="Main">' +
      '<a class="logo" href="index.html"><span class="sans" style="font-weight:600">the</span><span class="serif"> edit </span><span class="sans" style="font-weight:600">society</span></a>' +
      '<div class="navlinks">' + links.map(function (l) { return '<a class="pill' + (l[2] === cur ? ' on' : '') + '" href="' + l[1] + '">' + l[0] + '</a>'; }).join('') + '</div>' +
      '<div class="nav-r"><a class="pill navcta" href="' + BOOK + '" style="border-color:#34343A;color:#F2F0EC">Book a call</a>' +
      '<button type="button" class="burger" aria-label="Open menu" aria-expanded="false" aria-controls="menu"><span></span></button></div>' +
      '</nav></header>' +
      '<div class="menu" id="menu" aria-hidden="true">' +
      links.map(function (l) { return '<a class="big" href="' + l[1] + '"><span>' + l[0] + '</span></a>'; }).join('') +
      '<div class="mfoot"><span>Delivered in 48–72 hrs</span>' + btn(BOOK, 'Book a call') + '</div></div>';
  }
  function footHtml() {
    var ico = function (label, path) { return '<a href="' + BOOK + '" aria-label="' + label + '"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">' + path + '</svg></a>'; };
    return '<footer class="foot"><div class="foot-in">' +
      '<div class="foot-top"><span>• Human-edited</span><span>• Editing worldwide</span></div>' +
      '<div class="foot-cards">' +
      '<div class="glass fcard a"><span aria-hidden="true" class="serif bgword">tes</span>' +
      '<div style="position:relative;display:flex;flex-direction:column;gap:12px"><span style="font-size:30px;line-height:1"><span class="sans" style="font-weight:600">the</span><span class="serif" style="font-size:33px"> edit </span><span class="sans" style="font-weight:600">society</span></span>' +
      '<p style="margin:0;max-width:340px;font-size:14px;color:#8C8A86">We edit for <span style="color:#F2F0EC">creators</span>, brands and agencies who post every week. A <span style="color:#F2F0EC">Marca Creatives</span> studio.</p></div>' +
      '<div style="position:relative;display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap"><span style="font-size:12px;color:#6E6C68">The Edit Society © 2026. All rights reserved.</span>' +
      '<div class="fpills"><a class="pill" href="work.html">Work</a><a class="pill" href="services.html">Services</a><a class="pill" href="index.html#pricing">Memberships</a><a class="pill" href="index.html#faq">FAQ</a><a class="pill" href="' + BOOK + '">Editors — join us</a><a class="pill" href="' + BOOK + '">Privacy</a></div></div></div>' +
      '<div class="glass fcard b"><div style="display:flex;flex-direction:column;gap:18px"><span class="sans" style="font-size:22px;font-weight:500;line-height:1.2">Follow the<br>Society</span><div class="social">' +
      ico('Instagram', '<rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle>') +
      ico('YouTube', '<rect x="2" y="5" width="20" height="14" rx="4"></rect><path d="M10 9l5 3-5 3z"></path>') +
      ico('LinkedIn', '<path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 10v7"></path>') +
      ico('WhatsApp', '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"></path>') +
      '</div></div><div style="display:flex;flex-direction:column;gap:10px"><label for="nl" style="font-size:13px;color:#C9C7C2">Monthly editing tips for creators</label>' +
      '<div class="nl"><input id="nl" type="email" placeholder="Your email"><button type="button" aria-label="Subscribe">' + ARROW + '</button></div>' +
      '<span style="font-size:11px;color:#6E6C68">By subscribing you accept our <a href="' + BOOK + '" style="text-decoration:underline">Privacy Policy</a></span></div></div>' +
      '</div></div></footer>';
  }

  /* ---------- pages ---------- */
  function renderServices() {
    setMeta('Services', 'Reels, Shorts, long-form YouTube, podcast clips, ads, motion graphics, colour grading and brand films — edited by humans, delivered in 48–72 hours.');
    var rows = D.services.map(function (s, i) {
      return '<a class="srow rv2" href="' + svcUrl(s.slug) + '" data-video="' + s.video + '">' +
        '<span class="n">' + pad(i + 1) + '</span>' +
        '<span class="thumb media">' + vid(s.video) + '</span>' +
        '<span class="tt"><span class="t sans">' + s.title + '</span><span class="d">' + s.short + '</span></span>' +
        '<span class="go" aria-hidden="true">' + ARROW + '</span></a>';
    }).join('');
    var marq = [];
    for (var k = 0; k < 2; k++) D.services.forEach(function (s) { marq.push('<span class="disp" style="font-size:18px;letter-spacing:-.01em;white-space:nowrap">' + s.title + '</span><span aria-hidden="true" style="width:7px;height:7px;border-radius:50%;background:#FF5A1F;flex-shrink:0"></span>'); });
    var aud = D.audiences.map(function (a, i) {
      return '<div class="glass acard tilt' + (i ? ' d' + i : '') + '"' + (a.hot ? ' style="border-color:#34343A"' : '') + '>' + (a.hot ? '<div class="glow" aria-hidden="true"></div>' : '') +
        '<div style="position:relative;display:flex;flex-direction:column;gap:6px;text-align:center;align-items:center;padding:18px 0 6px"><span class="serif" style="font-size:18px;color:#8C8A86">for</span><h3 class="sans">' + a.title + '</h3><p style="margin:0;font-size:15px;color:#8C8A86;max-width:300px">' + a.desc + '</p></div>' +
        '<div style="position:relative;display:flex;flex-direction:column;margin-top:auto">' + a.items.map(function (it) { return '<a class="row" href="' + svcUrl(it[1]) + '">' + it[0] + '<span aria-hidden="true" style="color:#4A4A50;display:inline-grid;place-items:center">' + NE + '</span></a>'; }).join('') + '</div></div>';
    }).join('');
    app.innerHTML =
      '<section class="phero"><div class="wrap">' + crumbs([['Home', 'index.html'], ['Services']]) +
      '<h1 class="ptitle disp">' + title2('Every format,', '<span class="serif" style="font-size:1.08em">one</span> team') + '</h1>' +
      '<div class="hrow"><p class="lead fade-in d-1">Seven services, one studio. Human editors who cut for retention, caption, colour-grade and deliver in 48–72 hours — at a flat price per video.</p>' +
      '<div class="fade-in d-2">' + btn(BOOK, 'Book a free call') + '</div></div></div>' +
      '<div class="wide"><div class="media hmedia heroclip fade-in d-3">' + vid('behind', ' style="filter:saturate(1.1)"') + '</div></div></section>' +
      '<section style="padding:40px 0 0;overflow:hidden"><div style="border-top:1px solid #1A1A1D;border-bottom:1px solid #1A1A1D;padding:22px 0;overflow:hidden"><div class="marq" style="gap:36px;align-items:center">' + marq.join('') + '</div></div></section>' +
      '<section class="sec"><div class="wrap"><div style="display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap;margin-bottom:56px">' +
      '<h2 class="h2 sans"><span class="ln"><span class="up">What we</span></span><span class="ln"><span class="up"><span class="serif">edit</span></span></span></h2>' +
      '<span class="kicker rv">' + pad(D.services.length) + ' services</span></div>' +
      '<div class="slist">' + rows + '</div></div></section>' +
      '<section style="padding:0 0 160px"><div class="wrap"><div style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:22px;margin-bottom:64px"><span class="pill line rv">Who it’s for</span>' +
      '<h2 class="h2 sans"><span class="ln"><span class="up">Built for <span class="serif">how</span></span></span><span class="ln"><span class="up">you publish</span></span></h2></div>' +
      '<div class="cards3">' + aud + '</div></div></section>' +
      '<section style="padding:0 0 60px"><div class="wrap"><div style="display:flex;flex-direction:column;gap:22px;margin-bottom:56px"><span class="pill line rv" style="align-self:flex-start">How it works</span>' +
      '<h2 class="disp" style="margin:0;font-size:clamp(44px,4.8vw,76px);line-height:.9"><span style="display:block;overflow:hidden"><span class="up">Upload. Brief.</span></span><span style="display:block;overflow:hidden"><span class="up"><span class="serif" style="font-size:1.1em">Approve.</span></span></span></h2></div>' +
      stepsHtml() + '</div></section>' +
      ctaBand('Not sure <span class="serif">what</span><br>you need?', 'Tell us what you post and how often. We’ll recommend the right mix of services on a free 15-minute call.') +
      '';
    initHoverPreview();
  }

  function renderService() {
    var s = svc(q.get('s'));
    if (!s) { location.replace('services.html'); return; }
    var idx = D.services.indexOf(s), next = D.services[(idx + 1) % D.services.length];
    setMeta(s.title, s.short + ' ' + s.lead);
    var work = s.work.map(proj).filter(Boolean);
    app.innerHTML =
      '<section class="phero"><div class="wrap">' + crumbs([['Home', 'index.html'], ['Services', 'services.html'], [s.title]]) +
      '<div class="eyebrow fade-in" style="margin-bottom:22px"><i></i>Service ' + pad(idx + 1) + ' / ' + pad(D.services.length) + '</div>' +
      '<h1 class="ptitle disp"><span class="ln"><span>' + s.titleHtml + '</span></span></h1>' +
      '<div class="fade-in d-1" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:32px">' + s.chips.map(function (c) { return '<span class="chip">' + c + '</span>'; }).join('') + '</div>' +
      '<div class="hrow"><p class="lead fade-in d-1">' + s.lead + '</p>' +
      '<div class="fade-in d-2" style="display:flex;gap:12px;flex-wrap:wrap">' + btn(BOOK, 'Book this service') + btn('#pricing', 'See pricing', 'btn2') + '</div></div></div>' +
      '<div class="wide"><div class="media hmedia heroclip fade-in d-3">' + vid(s.video) + '</div></div></section>' +

      '<section class="sec"><div class="wrap split"><div class="sticky"><span class="pill line rv" style="align-self:flex-start">What’s included</span>' +
      '<h2 class="h2 sans"><span class="ln"><span class="up">Everything</span></span><span class="ln"><span class="up"><span class="serif">in the edit</span></span></span></h2>' +
      '<p class="rv muted" style="margin:0;max-width:360px">Every ' + s.title.toLowerCase() + ' edit comes with this as standard — no add-on surprises.</p></div>' +
      '<div class="ilist">' + s.includes.map(function (t, i) { return '<div class="irow rv2"><span class="n">' + pad(i + 1) + '</span><span>' + t + '</span><span class="ck">' + CHECK + '</span></div>'; }).join('') + '</div></div></section>' +

      '<section style="padding:0 0 160px"><div class="wrap"><div class="specs">' + s.specs.map(function (sp, i) {
        return '<div class="glass spec tilt' + (i % 3 ? ' d' + (i % 3) : '') + '"><span>' + sp[0] + '</span><b>' + sp[1] + '</b></div>';
      }).join('') + '</div></div></section>' +

      '<section style="padding:0 0 160px"><div class="wrap"><div style="display:flex;flex-direction:column;gap:22px;margin-bottom:56px"><span class="pill line rv" style="align-self:flex-start">How it works</span>' +
      '<h2 class="h2 sans"><span class="ln"><span class="up">Three steps,</span></span><span class="ln"><span class="up"><span class="serif">zero chasing</span></span></span></h2></div>' + stepsHtml() + '</div></section>' +

      (work.length ? '<section style="padding:0 0 160px"><div class="wrap"><div style="display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap;margin-bottom:48px">' +
        '<h2 class="h2 sans"><span class="ln"><span class="up">Selected</span></span><span class="ln"><span class="up"><span class="serif">work</span></span></span></h2>' +
        '<a class="ulink rv" href="work.html">All work <span class="dot" aria-hidden="true">' + ARROW + '</span></a></div>' +
        '<div class="rgrid">' + work.map(function (p) { return pcard(p, { cls: 'rv' }); }).join('') + '</div></div></section>' : '') +

      '<section id="pricing" style="padding:0 0 160px;scroll-margin-top:90px"><div class="wrap"><div class="glass pricecard statsin"><div class="glow glowc" aria-hidden="true"></div>' +
      '<div style="position:relative;display:flex;flex-direction:column;gap:14px"><span class="kicker">Pricing</span>' +
      '<div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap">' + (s.pre ? '<span class="serif" style="font-size:24px;color:#8C8A86">' + s.pre + '</span>' : '') + '<span class="price">' + s.price + '</span><span style="color:#6E6C68">' + s.unit + '</span></div>' +
      '<span class="muted" style="font-size:15px;max-width:440px">Flat price, no hourly billing. Save 15% on a 12-video membership. Pause or cancel anytime.</span></div>' +
      '<div style="position:relative;display:flex;gap:12px;flex-wrap:wrap">' + btn('index.html#pricing', 'Become a member') + btn(BOOK, 'Book a call', 'btn2') + '</div></div>' +
      '<p style="margin:16px 0 0;text-align:center;font-size:13px;color:#6E6C68">Prices excl. GST</p></div></section>' +

      '<section style="padding:0 0 160px"><div class="wrap split"><div class="sticky"><span class="pill line rv" style="align-self:flex-start">FAQ</span>' +
      '<h2 class="h2 sans"><span class="ln"><span class="up">Good</span></span><span class="ln"><span class="up"><span class="serif">questions</span></span></span></h2></div>' +
      '<div>' + faqList(s.faqs) + '</div></div></section>' +

      '<section style="padding:0 0 40px"><div class="wide"><a class="nextbig" href="' + svcUrl(next.slug) + '">' + vid(next.video) +
      '<div class="in"><span class="eyebrow" style="color:#D9D7D2"><i></i>Next service</span><h2 class="t disp">' + next.titleHtml + '</h2>' +
      '<span style="display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap"><span style="color:#D9D7D2;max-width:420px">' + next.short + '</span><span class="btn">View service<span class="dot" aria-hidden="true">' + ARROW + '</span></span></span></div></a></div></section>' +
      ctaBand('Got footage?<br><span class="serif">Let’s cut it.</span>', 'Book a free 15-minute call and get your first ' + s.title.toLowerCase() + ' edit back in 48–72 hours.');
  }

  function renderWork() {
    setMeta('Work', 'Selected edits by The Edit Society — reels, long-form YouTube, podcast clips, ads, motion graphics, colour grading and brand films.');
    var cats = ['All'];
    D.projects.forEach(function (p) { if (cats.indexOf(p.cat) < 0) cats.push(p.cat); });
    app.innerHTML =
      '<section class="phero"><div class="wrap">' + crumbs([['Home', 'index.html'], ['Work']]) +
      '<h1 class="ptitle disp">' + title2('Selected', '<span class="serif" style="font-size:1.08em">work</span>') + '</h1>' +
      '<div class="hrow"><p class="lead fade-in d-1">Reels, YouTube, podcasts, ads and brand films — a few of the edits we’ve shipped for creators and brands who post every week.</p>' +
      '<span class="count fade-in d-2"><span id="wcount">' + pad(D.projects.length) + '</span> projects</span></div>' +
      '<div class="filters fade-in d-2" role="tablist" aria-label="Filter projects" style="margin-top:48px">' + cats.map(function (c, i) {
        return '<button type="button" role="tab" class="pill' + (i ? '' : ' on') + '" aria-selected="' + (!i) + '" data-f="' + c + '">' + c + '</button>';
      }).join('') + '</div></div></section>' +
      '<section style="padding:72px 0 0"><div class="wrap"><div class="pgrid" id="pgrid">' + D.projects.map(function (p) { return pcard(p, { cls: 'pin' }); }).join('') + '</div></div></section>' +
      ctaBand('Your edit<br><span class="serif">could be next.</span>', 'Send us your footage and we’ll send back something you’ll want to post — in 48–72 hours.');
    var grid = document.getElementById('pgrid');
    function stagger() {
      var vis = [].filter.call(grid.children, function (c) { return !c.classList.contains('hide'); });
      [].forEach.call(grid.children, function (c) { c.classList.remove('offset'); });
      vis.forEach(function (c, i) { if (i % 2) c.classList.add('offset'); });
      document.getElementById('wcount').textContent = pad(vis.length);
    }
    stagger();
    app.querySelector('.filters').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var f = b.getAttribute('data-f');
      [].forEach.call(this.children, function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
      [].forEach.call(grid.children, function (c, i) {
        var show = f === 'All' || c.getAttribute('data-cat') === f;
        c.classList.toggle('hide', !show);
        if (show) { c.classList.remove('pin'); void c.offsetWidth; c.style.animationDelay = (i * 0.04) + 's'; c.classList.add('pin'); }
      });
      stagger();
    });
  }

  function renderProject() {
    var p = proj(q.get('p'));
    if (!p) { location.replace('work.html'); return; }
    var idx = D.projects.indexOf(p), next = D.projects[(idx + 1) % D.projects.length], s = svc(p.service);
    setMeta(p.title, p.brief);
    var res = p.results.map(function (r) {
      var m = /^(\[?[^\d\[]*)([\d.,]+)(.*)$/.exec(r[0]);
      var big = m ? m[1] + m[2] + '<em>' + m[3] + '</em>' : r[0];
      return '<div><b>' + big + '</b><span>' + r[1] + '</span></div>';
    }).join('');
    app.innerHTML =
      '<section class="phero"><div class="wrap">' + crumbs([['Home', 'index.html'], ['Work', 'work.html'], [p.title]]) +
      '<div class="eyebrow fade-in" style="margin-bottom:22px"><i></i>' + p.cat + ' · ' + p.year + '</div>' +
      '<h1 class="ptitle disp" style="font-size:clamp(46px,7.6vw,128px)"><span class="ln"><span>' + p.title + '</span></span></h1>' +
      '<div class="meta4 fade-in d-1">' +
      '<div><span>Client</span><b>' + p.client + '</b></div>' +
      '<div><span>Service</span><b>' + (s ? '<a href="' + svcUrl(s.slug) + '" style="text-decoration:underline;text-underline-offset:4px">' + s.title + '</a>' : p.cat) + '</b></div>' +
      '<div><span>Deliverables</span><b>' + p.deliverables + '</b></div>' +
      '<div><span>Turnaround</span><b>' + p.turnaround + '</b></div></div></div>' +
      '<div class="wide"><div class="media hmedia heroclip fade-in d-2">' + vid(p.video) + '</div></div></section>' +

      '<section class="sec"><div class="wrap split"><div class="sticky"><span class="pill line rv" style="align-self:flex-start">The brief</span><span class="kicker rv">Platform · ' + p.platform + '</span></div>' +
      '<p class="prose rv">' + p.brief + '</p></div></section>' +

      '<section style="padding:0 0 140px"><div class="wrap split"><div class="sticky"><span class="pill line rv" style="align-self:flex-start">The edit</span>' +
      '<h2 class="h2 sans"><span class="ln"><span class="up">What we</span></span><span class="ln"><span class="up"><span class="serif">did</span></span></span></h2></div>' +
      '<div class="ilist">' + p.approach.map(function (t, i) { return '<div class="irow rv2"><span class="n">' + pad(i + 1) + '</span><span>' + t + '</span><span class="ck">' + CHECK + '</span></div>'; }).join('') + '</div></div></section>' +

      '<section style="padding:0 0 140px"><div class="wide"><div class="gallery">' +
      '<div class="media rv"><img class="par" src="./assets/video/' + p.video + '-a.jpg" alt="' + p.title + ' — frame" loading="lazy"></div>' +
      '<div class="media rv"><img class="par" src="./assets/video/' + p.video + '-b.jpg" alt="' + p.title + ' — frame" loading="lazy"></div>' +
      '<div class="media full cliprev">' + vid(p.video) + '</div></div></div></section>' +

      '<section style="padding:0 0 140px"><div class="wide"><div class="glass stats statsin">' + res + '</div></div></section>' +

      '<section style="padding:0 0 160px"><div class="wrap" style="max-width:1000px"><span class="pill line rv" style="display:flex;width:max-content;margin:0 auto 40px">Client says</span>' +
      '<blockquote class="quote rv">“' + p.quote[0] + '<span class="serif">' + p.quote[1] + '</span>' + p.quote[2] + '”</blockquote>' +
      '<div class="who rv"><span class="av"></span><div><span style="font-weight:500">' + p.who[0] + '</span><small>' + p.who[1] + '</small></div></div>' +
      '<p class="note">Sample results &amp; quote — replace with real client data</p></div></section>' +

      '<section style="padding:0 0 40px"><div class="wide"><a class="nextbig" href="' + projUrl(next.slug) + '">' + vid(next.video) +
      '<div class="in"><span class="eyebrow" style="color:#D9D7D2"><i></i>Next project</span><h2 class="t disp">' + next.title + '</h2>' +
      '<span style="display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap"><span style="color:#D9D7D2">' + next.client + ' — ' + next.cat + '</span><span class="btn">View project<span class="dot" aria-hidden="true">' + ARROW + '</span></span></span></div></a></div></section>' +
      ctaBand('Want results<br><span class="serif">like these?</span>', 'Tell us about your channel or brand on a free 15-minute call. First edit back in 48–72 hours.');
  }

  /* ---------- behaviours ---------- */
  function initHoverPreview() {
    if (!window.matchMedia('(hover:hover)').matches) return;
    var box = document.createElement('div'); box.className = 'hoverprev'; box.setAttribute('aria-hidden', 'true');
    var v = document.createElement('video'); v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    box.appendChild(v); document.body.appendChild(box);
    var x = 0, y = 0, cx = 0, cy = 0, raf = 0, on = false;
    function loop() { cx += (x - cx) * 0.18; cy += (y - cy) * 0.18; box.style.left = cx + 'px'; box.style.top = cy + 'px'; raf = on ? requestAnimationFrame(loop) : 0; }
    [].forEach.call(document.querySelectorAll('.srow'), function (r) {
      r.addEventListener('mouseenter', function (e) {
        var src = './assets/video/' + r.getAttribute('data-video') + '.mp4';
        if (v.getAttribute('src') !== src) { v.src = src; }
        v.play().catch(function () {});
        if (!on) { cx = x = e.clientX; cy = y = e.clientY; }
        on = true; box.classList.add('on'); if (!raf) raf = requestAnimationFrame(loop);
      });
      r.addEventListener('mouseleave', function () { on = false; box.classList.remove('on'); });
      r.addEventListener('mousemove', function (e) { x = e.clientX; y = e.clientY; });
    });
  }

  function initMenu() {
    var b = document.querySelector('.burger'), m = document.getElementById('menu');
    if (!b) return;
    function set(open) {
      document.documentElement.classList.toggle('menu-open', open);
      b.setAttribute('aria-expanded', open); b.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      m.setAttribute('aria-hidden', !open);
    }
    b.addEventListener('click', function () { set(!document.documentElement.classList.contains('menu-open')); });
    m.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  }

  function initFaq() {
    document.addEventListener('click', function (e) {
      var b = e.target.closest('.faqi button'); if (!b) return;
      var it = b.parentNode, open = !it.classList.contains('open');
      it.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
    });
  }

  // Curtain transition when leaving for another page of the site.
  function initTransitions() {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest('a[href]'); if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      var u = new URL(a.href, location.href);
      if (u.origin !== location.origin) return;
      if (u.pathname === location.pathname && u.search === location.search) return; // same page / hash link
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      e.preventDefault();
      document.documentElement.classList.add('leaving');
      setTimeout(function () { location.href = u.href; }, 480);
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) document.documentElement.classList.remove('leaving', 'menu-open'); });
  }

  // Background videos: muted inline autoplay that also works on phones (same as home page).
  function initVideos() {
    var vids = [];
    function tryPlay(v) { if (!v.paused) return; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
      es.forEach(function (e) { var v = e.target; v.__vis = e.isIntersecting; if (v.__vis) tryPlay(v); else v.pause(); });
    }, { threshold: 0.01 }) : null;
    function prep(v) {
      if (v.__bg || v.closest('.hoverprev')) return; v.__bg = 1; vids.push(v);
      v.muted = true; v.defaultMuted = true; v.playsInline = true; v.controls = false;
      v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
      v.setAttribute('disablepictureinpicture', ''); v.setAttribute('disableremoteplayback', '');
      if (io) io.observe(v); else { v.__vis = true; tryPlay(v); }
    }
    function scan() { [].forEach.call(document.getElementsByTagName('video'), prep); }
    function kick() { vids.forEach(function (v) { if (v.isConnected && v.__vis) tryPlay(v); }); }
    ['touchstart', 'touchend', 'pointerdown', 'click', 'keydown'].forEach(function (t) { window.addEventListener(t, kick, { passive: true, capture: true }); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
    scan();
  }

  /* ---------- boot ---------- */
  document.getElementById('nav').innerHTML = navHtml();
  ({ services: renderServices, service: renderService, work: renderWork, project: renderProject }[page] || function () {})();
  document.getElementById('foot').innerHTML = footHtml();
  initMenu(); initFaq(); initTransitions(); initVideos();
})();
