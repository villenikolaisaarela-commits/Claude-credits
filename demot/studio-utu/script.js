/* Studio Utu – small progressive enhancements. Content works without JS. */
(function () {
  'use strict';
  window.UTU_OK = true;
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* Start an image reveal only when its images are loaded and decoded, so the animation never runs over an empty frame. */
  var whenReady = function (el, cb) {
    var imgs = [].slice.call(el.querySelectorAll('img')); if (el.tagName === 'IMG') imgs.push(el);
    var done = false, go = function () { if (!done) { done = true; requestAnimationFrame(cb); } };
    if (!imgs.length || !window.Promise) return go();
    Promise.all(imgs.map(function (i) {
      if (i.loading === 'lazy') i.loading = 'eager';
      var loaded = (i.complete && i.naturalWidth) ? Promise.resolve() : new Promise(function (r) { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); });
      return loaded.then(function () { return i.decode ? i.decode().catch(function () {}) : null; });
    })).then(go);
    setTimeout(go, 4000);
  };

  /* Reveal on scroll */
  var items = [].slice.call(document.querySelectorAll('.reveal, [data-reveal]'));
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { var t = e.target; io.unobserve(t); whenReady(t, function () { t.classList.add('is-in'); }); }
      });
    }, { rootMargin: '0px 0px 15% 0px', threshold: 0 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* Room index: shows which room is in view, one at a time */
  var dex = document.querySelector('[data-roomdex]');
  var rooms = [].slice.call(document.querySelectorAll('[data-room]'));
  if (dex && rooms.length && 'IntersectionObserver' in window) {
    var no = dex.querySelector('[data-roomdex-no]');
    var nm = dex.querySelector('[data-roomdex-name]');
    var visible = new Map();
    var update = function () {
      var best = null, bestRatio = 0;
      visible.forEach(function (r, el) { if (r > bestRatio) { bestRatio = r; best = el; } });
      if (!best || bestRatio <= 0.25) { dex.classList.remove('is-on'); return; }
      no.textContent = best.getAttribute('data-room');
      nm.textContent = best.getAttribute('data-room-name');
      /* step aside while a caption passes behind the index */
      var d = dex.getBoundingClientRect(), clash = false;
      [].forEach.call(document.querySelectorAll('.room__cap'), function (cap) {
        var r = cap.getBoundingClientRect();
        if (r.left < d.right + 12 && r.right > d.left - 12 && r.top < d.bottom + 12 && r.bottom > d.top - 12) clash = true;
      });
      dex.classList.toggle('is-on', !clash);
    };
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      window.requestAnimationFrame(function () { ticking = false; update(); });
    }, { passive: true });
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) visible.set(e.target, e.intersectionRatio); else visible.delete(e.target);
      });
      update();
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
    rooms.forEach(function (r) { ro.observe(r); });
  }

  /* Mobile menu */
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.getElementById('valikko');
  if (toggle && nav) {
    var label = toggle.querySelector('[data-menu-label]');
    var setOpen = function (open) {
      root.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (label) label.textContent = open ? 'Sulje' : 'Valikko';
      if (open) { var first = nav.querySelector('a'); if (first) first.focus(); }
    };
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('menu-open')) { setOpen(false); toggle.focus(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760 && root.classList.contains('menu-open')) setOpen(false);
    });
  }

  /* Form never sends: this is a concept site */
  var form = document.querySelector('[data-form]');
  if (form) {
    var status = form.querySelector('[data-form-status]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (status) status.textContent = 'Kiitos. Tämä on konseptisivu, joten viestiä ei lähetetty. Oikealla sivustolla vastaisimme kahden arkipäivän kuluessa.';
    });
  }
})();
