/* BOULANGERIE LA FOURMI — interactions (sans librairie)
   Paramètres d'URL : ?intro=0 saute l'ouverture · ?qa coupe ouverture et animations. */
(function () {
  'use strict';
  var d = document, w = window, root = d.documentElement, body = d.body;
  var QA = location.search.indexOf('qa') !== -1;
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  if (QA || reduce) root.classList.add('no-fx');
  $('#yr').textContent = new Date().getFullYear();

  /* ---------- Ouvert / fermé, à l'heure de Paris ---------- */
  function paris() {
    try {
      var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date()), o = {};
      p.forEach(function (x) { o[x.type] = x.value; });
      return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), m: (+o.hour % 24) * 60 + (+o.minute) };
    } catch (e) { var n = new Date(); return { d: n.getDay(), m: n.getHours() * 60 + n.getMinutes() }; }
  }
  function status() {
    var n = paris(), wk = n.d >= 1 && n.d <= 5, open = wk && n.m >= 420 && n.m < 1140, t;
    if (open) t = 'Ouvert<span class="full"> · jusqu’à 19h</span>';
    else if (wk && n.m < 420) t = 'Fermé<span class="full"> · ouvre à 7h</span>';
    else if (n.d >= 1 && n.d <= 4) t = 'Fermé<span class="full"> · demain 7h</span>';
    else t = 'Fermé<span class="full"> · lundi 7h</span>';
    $$('[data-status]').forEach(function (s) { s.classList.toggle('is-open', open); $('[data-status-txt]', s).innerHTML = t; });
    $$('#hours tr').forEach(function (tr) { tr.classList.toggle('is-today', +tr.dataset.d === n.d); });
  }
  status(); setInterval(status, 60000);

  /* ---------- Ouverture : les lettres du logo tombent, puis le logo prend sa place ---------- */
  var logo = $('#heroLogo'), letters = $$('#heroWm .lt');
  function ready() { body.classList.add('is-ready'); }
  var seen = false;
  try { seen = sessionStorage.getItem('fourmi-intro') === '1'; sessionStorage.setItem('fourmi-intro', '1'); } catch (e) {}
  var skipIntro = QA || reduce || location.search.indexOf('intro=0') !== -1;
  if (skipIntro) {
    ready();
  } else {
    /* ordre de chute mélangé, comme dans le pied de page */
    var order = letters.map(function (_, i) { return i; }).sort(function () { return Math.random() - .5; });
    letters.forEach(function (l) { l.style.transform = 'translateY(' + (seen ? -40 : -140) + 'vh) rotate(' + (Math.random() * 50 - 25).toFixed(1) + 'deg)'; });
    var center = !seen;
    if (center) {
      body.classList.add('is-intro');
      var r = logo.getBoundingClientRect(), vh = w.innerHeight;
      var dy = vh / 2 - (r.top + r.height / 2), sc = Math.min(1.12, (w.innerWidth * .9) / r.width);
      logo.style.transform = 'translateY(' + dy.toFixed(1) + 'px) scale(' + sc.toFixed(3) + ')';
    }
    var step = seen ? 28 : 55;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        order.forEach(function (idx, k) {
          var l = letters[idx];
          setTimeout(function () {
            l.style.transition = 'transform 1.05s cubic-bezier(.3,1.45,.45,1),translate .5s cubic-bezier(.3,1.7,.4,1)';
            l.style.transform = '';
          }, 120 + k * step);
        });
      });
    });
    var land = 120 + letters.length * step + (seen ? 500 : 750);
    setTimeout(function () {
      if (center) {
        logo.style.transition = 'transform 1.1s cubic-bezier(.7,0,.2,1)';
        logo.style.transform = '';
        setTimeout(function () { body.classList.remove('is-intro'); }, 700);
        setTimeout(ready, 450);
      } else ready();
    }, land);
  }

  /* ---------- Apparitions au défilement ---------- */
  var targets = $$('.gt, .ln, .r-up, .pop, .card');
  if (QA || reduce || !('IntersectionObserver' in w)) {
    targets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
    $$('.awards .aw').forEach(function (el, i) { el.style.transitionDelay = (i * 0.12) + 's'; });
    $$('.notes .note').forEach(function (el, i) { el.style.transitionDelay = (i * 0.09) + 's'; });
    $$('.hist__ph .hp').forEach(function (el, i) { el.style.transitionDelay = (i * 0.18) + 's'; });
  }
  $$('.snap').forEach(function (el, i) { el.style.transitionDelay = (i * 0.08) + 's'; });

  /* ---------- Mobile : rangées à glisser, compteurs, pile d'avis ---------- */
  var small = w.matchMedia('(max-width: 760px)');
  $$('.rack__row').forEach(function (row) {
    var bar = d.createElement('div'); bar.className = 'rack__bar'; bar.innerHTML = '<i></i>'; row.parentNode.appendChild(bar);
    row.addEventListener('scroll', function () {
      var max = row.scrollWidth - row.clientWidth; bar.style.setProperty('--p', max > 0 ? (row.scrollLeft / max).toFixed(3) : 0);
    }, { passive: true });
  });
  $('.brand').addEventListener('click', function (e) { e.preventDefault(); w.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---------- Menu ---------- */
  var burger = $('#burger'), drawer = $('#drawer');
  function menu(open) {
    body.classList.toggle('is-menu', open); burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu'); drawer.setAttribute('aria-hidden', !open);
    body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { menu(!body.classList.contains('is-menu')); });
  $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') menu(false); });

  /* ---------- Boucle de défilement ----------
     Positions mesurées au chargement / redimensionnement, puis le défilement
     n'écrit que des transforms et des classes. */
  var hdr = $('#hdr'), hero = $('.hero'), prize = $('.prize'), racks = $$('[data-rack]'), cards = $$('#deck .card');
  var mbar = $('#mbar'), infos = $('#infos'), lastBar = null;
  var pos = {}, lastY = 0, lastSolid = null, lastHidden = null, lastDark = null, ticking = false;
  function absTop(el) { var t = 0; while (el) { t += el.offsetTop; el = el.offsetParent; } return t; }
  function measure() {
    pos.vh = w.innerHeight;
    pos.heroEnd = hero.offsetHeight - 40;
    pos.prTop = absTop(prize); pos.prEnd = pos.prTop + prize.offsetHeight;
    pos.inTop = absTop(infos); pos.inEnd = pos.inTop + infos.offsetHeight;
    pos.racks = racks.map(function (r) { return { el: r.querySelector('.rack__row'), top: absTop(r), h: r.offsetHeight, dir: +r.dataset.rack }; });
    pos.cards = cards.map(function (c) { return { el: c, top: absTop(c), h: c.offsetHeight, stick: parseFloat(getComputedStyle(c).top) || 96 }; });
  }
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function onScroll() {
    var y = w.scrollY, vh = pos.vh;
    var solid = y > 30;
    if (solid !== lastSolid) { hdr.classList.toggle('is-solid', solid); lastSolid = solid; }
    var dark = y < pos.heroEnd || (y + 38 > pos.prTop && y + 38 < pos.prEnd);
    if (dark !== lastDark) { hdr.classList.toggle('is-dark', dark); lastDark = dark; }
    if (!body.classList.contains('is-menu')) {
      var hidden = y > lastY && y > vh * .7;
      if (hidden !== lastHidden) { hdr.classList.toggle('is-hidden', hidden); lastHidden = hidden; }
    }
    lastY = y;
    if (mbar) { var showBar = y > pos.heroEnd * .55 && (y + vh < pos.inTop + 120 || y > pos.inEnd); if (showBar !== lastBar) { mbar.classList.toggle('is-on', showBar); lastBar = showBar; } }
    if (QA || reduce) { ticking = false; return; }

    /* cartes empilées : la carte recouverte recule doucement */
    pos.cards.forEach(function (c, i) {
      var next = pos.cards[i + 1];
      if (!next) return;
      var p = clamp((y + vh - next.top) / (vh - next.stick));
      c.el.style.transform = p > 0 ? 'scale(' + (1 - p * .06).toFixed(4) + ')' : '';
      c.el.style.filter = p > 0 ? 'brightness(' + (1 - p * .12).toFixed(3) + ')' : '';
    });

    /* étagères : chaque rayon glisse en place */
    if (w.innerWidth > 760) pos.racks.forEach(function (r) {
      var rt = r.top - y;
      if (rt < vh && rt + r.h > 0) {
        var p = clamp((vh - rt) / (vh * .75));
        r.el.style.transform = 'translate3d(' + ((1 - p) * r.dir * 9).toFixed(2) + 'vw,0,0)';
      }
    });
    ticking = false;
  }
  function relayout() { measure(); onScroll(); }
  w.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  var rz; w.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(relayout, 120); });
  w.addEventListener('load', relayout);
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(relayout);
  relayout();

  /* ---------- Pied de page : les lettres du logo rebondissent à l'arrivée ---------- */
  var fw = $('#footWm');
  if (fw && !QA && !reduce && 'IntersectionObserver' in w) {
    var lts = $$('.lt', fw);
    lts.forEach(function (l) { l.style.transform = 'translateY(-130%) rotate(' + (Math.random() * 30 - 15).toFixed(1) + 'deg)'; l.style.opacity = '0'; });
    var fo = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; fo.disconnect();
      lts.forEach(function (l, i) {
        setTimeout(function () { l.style.transition = 'transform 1.1s cubic-bezier(.3,1.45,.45,1),opacity .4s,translate .5s cubic-bezier(.3,1.7,.4,1)'; l.style.transform = ''; l.style.opacity = '1'; }, i * 60);
      });
    }, { threshold: 0.35 });
    fo.observe(fw);
  }
})();
