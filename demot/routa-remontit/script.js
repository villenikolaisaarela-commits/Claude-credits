/* Routa Remontit — konseptisivusto (v2). Vanilla JS, ei riippuvuuksia (Lenis valinnainen). */
(function () {
  'use strict';

  var html = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var vh = window.innerHeight;
  var vw = window.innerWidth;

  /* ---------- Pehmeä vieritys (Lenis, MIT) ---------- */
  var lenis = null;
  if (!reduced && typeof window.Lenis === 'function') {
    try {
      lenis = new window.Lenis({ lerp: 0.105, smoothWheel: true, autoRaf: true, anchors: false });
    } catch (e) { lenis = null; }
  }

  function scrollToEl(el) {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    if (document.body.classList.contains('menu-open')) {
      closeMenu(false);
      setTimeout(function () { scrollToEl(target); }, 380);
    } else {
      scrollToEl(target);
    }
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  });

  /* ---------- Latausintro (≤ 1,2 s) ---------- */
  var loader = $('.loader');
  function loaded() { html.classList.add('is-loaded'); }
  if (!loader || reduced) {
    if (loader) loader.remove();
    loaded();
  } else {
    var countEl = $('.loader__count', loader);
    var t0 = performance.now();
    requestAnimationFrame(function () { loader.classList.add('is-ready'); });
    (function count(now) {
      var p = clamp((now - t0) / 620, 0, 1);
      countEl.textContent = String(Math.round((1 - Math.pow(1 - p, 3)) * 100)).padStart(2, '0');
      if (p < 1) requestAnimationFrame(count);
    })(t0);
    setTimeout(function () { loader.classList.add('is-leaving'); loaded(); }, 600);
    setTimeout(function () { loader.remove(); }, 1250);
  }

  /* ---------- Tekstin pilkkominen sanoiksi ---------- */
  function splitWords(root, wrapFn) {
    var idx = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/([ \t\n\r]+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (part) {
            if (!part) return;
            if (/^[ \t\n\r]+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            frag.appendChild(wrapFn(part, idx++));
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && !child.hasAttribute('aria-hidden') && child.tagName !== 'BR') {
          walk(child);
        }
      });
    })(root);
    return idx;
  }

  $$('[data-split]').forEach(function (el) {
    splitWords(el, function (word, i) {
      var w = document.createElement('span'); w.className = 'w';
      var wi = document.createElement('span'); wi.className = 'wi'; wi.style.setProperty('--i', i);
      wi.textContent = word; w.appendChild(wi); return w;
    });
  });

  /* ---------- Paljastukset näkymään tultaessa ---------- */
  var revealEls = $$('[data-reveal], [data-split]');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Manifesti: sanat syttyvät vierittäessä ---------- */
  var manifesto = $('[data-manifesto]');
  var mWords = [];
  if (manifesto && !reduced) {
    splitWords(manifesto, function (word) {
      var s = document.createElement('span'); s.className = 'mw'; s.textContent = word; return s;
    });
    mWords = $$('.mw', manifesto);
    manifesto.classList.add('is-scrub');
  }
  var mLit = -1;
  function updateManifesto() {
    if (!mWords.length) return;
    var r = manifesto.getBoundingClientRect();
    var p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.25), 0, 1);
    var n = Math.max(mLit, Math.round(p * mWords.length * 1.08));
    if (n === mLit) return;
    mLit = n;
    for (var i = 0; i < mWords.length; i++) mWords[i].classList.toggle('on', i < n);
  }

  /* ---------- Laskurit ---------- */
  var counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduced) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var el = en.target, to = +el.getAttribute('data-count'), t0 = performance.now(), dur = 1500;
        (function step(now) {
          var p = clamp((now - t0) / dur, 0, 1);
          el.textContent = Math.round((1 - Math.pow(1 - p, 4)) * to);
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---------- Parallaksi ---------- */
  var parallax = reduced ? [] : $$('[data-parallax]').map(function (el) {
    return { el: el, f: parseFloat(el.getAttribute('data-parallax')) || 0.08, box: el.parentElement };
  });
  function updateParallax() {
    parallax.forEach(function (p) {
      var r = p.box.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var c = (r.top + r.height / 2 - vh / 2);
      p.el.style.transform = 'translate3d(0,' + (c * -p.f).toFixed(2) + 'px,0)';
    });
  }

  /* ---------- Ylätunniste ---------- */
  var hdr = $('[data-hdr]');
  var lastY = window.scrollY;
  function updateHeader(y) {
    if (document.body.classList.contains('menu-open')) return;
    hdr.classList.toggle('is-solid', y > 40);
    if (y > 240 && y > lastY + 4) hdr.classList.add('is-hidden');
    else if (y < lastY - 4 || y <= 240) hdr.classList.remove('is-hidden');
    lastY = y;
  }
  hdr.addEventListener('focusin', function () { hdr.classList.remove('is-hidden'); });

  // Aktiivinen osio navigaatiossa
  var navLinks = $$('.nav a');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['alku', 'studio', 'materiaalit', 'palvelut', 'tyot', 'prosessi', 'lupaukset', 'ukk'].forEach(function (id) {
      var s = document.getElementById(id); if (s) nio.observe(s);
    });
  }

  /* ---------- Kello ---------- */
  var clock = $('[data-clock]');
  function tickClock() {
    try {
      clock.textContent = new Intl.DateTimeFormat('fi-FI', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Helsinki' }).format(new Date()).replace('.', ':');
    } catch (e) { clock.textContent = ''; }
  }
  if (clock) { tickClock(); setInterval(tickClock, 20000); }

  /* ---------- Mobiilivalikko ---------- */
  var menu = $('[data-menu]');
  var menuBtn = $('[data-menu-btn]');
  var menuTimer;
  function openMenu() {
    clearTimeout(menuTimer);
    menu.hidden = false;
    document.body.classList.add('menu-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.querySelector('.menu-btn__label').textContent = 'Sulje';
    if (lenis) lenis.stop();
    requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add('is-open'); }); });
    var first = $('a', menu); if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 60);
  }
  function closeMenu(returnFocus) {
    menu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.querySelector('.menu-btn__label').textContent = 'Valikko';
    if (lenis) lenis.start();
    menuTimer = setTimeout(function () { menu.hidden = true; }, reduced ? 0 : 700);
    if (returnFocus !== false) menuBtn.focus();
  }
  if (menu && menuBtn) {
    menuBtn.addEventListener('click', function () {
      if (document.body.classList.contains('menu-open')) closeMenu(); else openMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (!document.body.classList.contains('menu-open')) return;
      if (e.key === 'Escape') { closeMenu(); return; }
      if (e.key === 'Tab') {
        var f = [menuBtn].concat($$('a', menu));
        var i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1180 && document.body.classList.contains('menu-open')) closeMenu(false);
    });
  }

  /* ---------- Materiaalit: sticky-kuvan vaihto ---------- */
  var craftItems = $$('[data-craft]');
  var craftImgs = $$('.craft__frame img');
  var craftNum = $('[data-craft-num]');
  var craftActive = 0;
  function setCraft(i) {
    if (i === craftActive) return;
    craftItems.forEach(function (it, k) { it.classList.toggle('is-active', k === i); });
    craftImgs.forEach(function (im, k) {
      im.classList.remove('was-active');
      if (k === craftActive) im.classList.add('was-active');
      im.classList.toggle('is-active', k === i);
    });
    craftActive = i;
    if (craftNum) craftNum.textContent = String(i + 1).padStart(2, '0');
  }
  if (craftItems.length && 'IntersectionObserver' in window) {
    var crio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) setCraft(+en.target.getAttribute('data-craft'));
      });
    }, { rootMargin: '-48% 0px -48% 0px' });
    craftItems.forEach(function (it) { crio.observe(it); });
    // Ladataan kaikki vaihtokuvat ajoissa, kun osio lähestyy
    var preio = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { craftImgs.forEach(function (im) { im.loading = 'eager'; }); preio.disconnect(); }
    }, { rootMargin: '600px 0px' });
    preio.observe($('#materiaalit'));
  }

  /* ---------- Palvelut: kursoria seuraava kuva ---------- */
  var svcList = $('[data-svc]');
  var cursor = $('[data-svc-cursor]');
  var cur = { x: 0, y: 0, tx: 0, ty: 0, on: false, built: false };
  if (svcList && cursor && finePointer && !reduced) {
    var rows = $$('.svc__row', svcList);
    var imgs = [];
    var build = function () {
      if (cur.built) return; cur.built = true;
      var box = $('.svc-cursor__in', cursor);
      rows.forEach(function (r) {
        var im = new Image(); im.src = r.getAttribute('data-img'); im.alt = ''; im.decoding = 'async';
        box.appendChild(im); imgs.push(im);
      });
    };
    cursor.style.display = 'block';
    svcList.addEventListener('pointerenter', build);
    rows.forEach(function (r, i) {
      r.addEventListener('pointerenter', function (e) {
        if (window.innerWidth < 768) return;
        build();
        imgs.forEach(function (im, k) { im.classList.toggle('is-active', k === i); });
        if (!cur.on) { cur.x = cur.tx = e.clientX; cur.y = cur.ty = e.clientY; }
        cur.on = true; cursor.classList.add('is-on');
      });
    });
    svcList.addEventListener('pointerleave', function () { cur.on = false; cursor.classList.remove('is-on'); });
    svcList.addEventListener('pointermove', function (e) { cur.tx = e.clientX; cur.ty = e.clientY; });
  }
  function updateCursor() {
    if (!cursor || !cur.built) return;
    cur.x += (cur.tx - cur.x) * 0.16;
    cur.y += (cur.ty - cur.y) * 0.16;
    var w = cursor.offsetWidth, h = cursor.offsetHeight;
    var rot = clamp((cur.tx - cur.x) * 0.04, -6, 6);
    cursor.style.transform = 'translate3d(' + (cur.x - w / 2).toFixed(1) + 'px,' + (cur.y - h / 2).toFixed(1) + 'px,0) rotate(' + rot.toFixed(2) + 'deg)';
  }

  /* ---------- Ennen / jälkeen -liukusäädin ---------- */
  var ba = $('[data-ba]');
  if (ba) {
    var stage = $('.ba__stage', ba);
    var range = $('.ba__range', ba);
    var touched = false;
    var setPos = function (v) { stage.style.setProperty('--pos', v + '%'); };
    range.addEventListener('input', function () { touched = true; setPos(range.value); });
    range.addEventListener('pointerdown', function () { touched = true; stage.classList.add('is-drag'); });
    window.addEventListener('pointerup', function () { stage.classList.remove('is-drag'); });
    if (!reduced && 'IntersectionObserver' in window) {
      var bio = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        bio.disconnect();
        var keys = [[0, 50], [700, 18], [1500, 78], [2200, 50]];
        var t0 = performance.now() + 250;
        (function sweep(now) {
          if (touched) return;
          var t = now - t0;
          if (t < 0) { requestAnimationFrame(sweep); return; }
          var k = 1;
          while (k < keys.length - 1 && t > keys[k][0]) k++;
          var a = keys[k - 1], b = keys[k];
          var p = clamp((t - a[0]) / (b[0] - a[0]), 0, 1);
          p = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
          var v = a[1] + (b[1] - a[1]) * p;
          setPos(v.toFixed(2)); range.value = v;
          if (t < keys[keys.length - 1][0]) requestAnimationFrame(sweep);
        })(performance.now());
      }, { threshold: 0.6 });
      bio.observe(stage);
    }
  }

  /* ---------- Vaakagalleria (kiinnitetty työpöydällä) ---------- */
  var gallery = $('[data-gallery]');
  var track = $('[data-gallery-track]');
  var gProgress = $('[data-gallery-progress]');
  var gCount = $('[data-gallery-count]');
  var projs = $$('.proj', track || document);
  var g = { pinned: false, top: 0, dist: 0, lastP: -1 };
  var mqPin = window.matchMedia('(min-width: 900px)');

  function measureGallery() {
    if (!gallery) return;
    var shouldPin = mqPin.matches && !reduced;
    if (shouldPin !== g.pinned) {
      g.pinned = shouldPin;
      gallery.classList.toggle('is-pinned', shouldPin);
      if (shouldPin) track.removeAttribute('tabindex'); else track.setAttribute('tabindex', '0');
      if (!shouldPin) { gallery.style.height = ''; track.style.transform = ''; }
    }
    if (!g.pinned) return;
    g.dist = Math.max(0, track.scrollWidth - window.innerWidth);
    gallery.style.height = (window.innerHeight + g.dist) + 'px';
    g.top = gallery.getBoundingClientRect().top + window.scrollY;
    g.lastP = -1;
  }
  function setGalleryUI(p) {
    if (gProgress) gProgress.style.setProperty('--p', (0.08 + p * 0.92).toFixed(4));
    if (gCount && projs.length) {
      var center = p * (g.pinned ? g.dist : Math.max(0, track.scrollWidth - track.clientWidth)) + window.innerWidth / 2;
      var best = 0, bd = Infinity;
      projs.forEach(function (pr, k) {
        var d = Math.abs(pr.offsetLeft + pr.offsetWidth / 2 - center);
        if (d < bd) { bd = d; best = k; }
      });
      gCount.textContent = String(best + 1).padStart(2, '0');
    }
  }
  function updateGallery(y) {
    if (!gallery || !g.pinned) return;
    var p = g.dist ? clamp((y - g.top) / g.dist, 0, 1) : 0;
    if (Math.abs(p - g.lastP) < 0.0001) return;
    g.lastP = p;
    track.style.transform = 'translate3d(' + (-p * g.dist).toFixed(2) + 'px,0,0)';
    setGalleryUI(p);
  }
  if (track) {
    track.addEventListener('scroll', function () {
      if (g.pinned) return;
      var max = track.scrollWidth - track.clientWidth;
      setGalleryUI(max > 0 ? track.scrollLeft / max : 0);
    }, { passive: true });
  }

  /* ---------- Asiakaspalautteet ---------- */
  var voices = $$('[data-voice]');
  var vNav = $('[data-voices-nav]');
  if (voices.length && vNav) {
    vNav.hidden = false;
    var vBtns = $$('button', vNav);
    vBtns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        voices.forEach(function (v, k) { v.classList.toggle('is-active', k === i); v.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
        vBtns.forEach(function (bb, k) { bb.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      });
    });
    voices.forEach(function (v, k) { v.setAttribute('aria-hidden', k === 0 ? 'false' : 'true'); });
  }

  /* ---------- UKK: yksi auki kerrallaan ---------- */
  var faqs = $$('[data-faq] details');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
      if (lenis) lenis.resize();
    });
  });

  /* ---------- Yksi rAF-silmukka ---------- */
  var prevY = -1;
  function frame() {
    var y = window.scrollY;
    if (y !== prevY) {
      updateHeader(y);
      updateParallax();
      updateManifesto();
      updateGallery(y);
      prevY = y;
    }
    updateCursor();
    requestAnimationFrame(frame);
  }

  function onResize() {
    vh = window.innerHeight; vw = window.innerWidth;
    measureGallery();
    prevY = -1;
  }
  var rT;
  window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(onResize, 120); });
  window.addEventListener('load', onResize);
  measureGallery();
  requestAnimationFrame(frame);
})();
