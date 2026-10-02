/* Lähde Arkkitehdit — konseptisivusto. Ei kirjastoja. */
(function () {
  'use strict';
  window.LAHDE_OK = true;
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


  /* Reveal: kuvat avautuvat alhaalta, tekstit nousevat, piirrokset piirtyvät. */
  var items = document.querySelectorAll('.reveal, [data-reveal]');
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    /* Leikattua kuvaa (clip-path) ei voi tarkkailla suoraan, joten tarkkaillaan sen kehystä. */
    var map = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        (map.get(e.target) || []).forEach(function (el) { whenReady(el, function () { el.classList.add('is-in'); }); });
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px 15% 0px', threshold: 0 });
    items.forEach(function (el) {
      var t = el.classList.contains('frame') ? el.parentNode : el; // kehys tarkkaillaan figuren kautta
      if (!map.has(t)) { map.set(t, []); io.observe(t); }
      map.get(t).push(el);
    });
  }

  /* Hidas parallaksi täysleveissä maisemakuvissa. */
  var full = [].slice.call(document.querySelectorAll('.full .frame img'));
  var wide = window.matchMedia('(min-width: 761px)');
  if (full.length && !reduce) {
    var ticking = false;
    var update = function () {
      ticking = false;
      if (!wide.matches) { full.forEach(function (img) { img.style.translate = ''; }); return; }
      var vh = window.innerHeight;
      full.forEach(function (img) {
        var r = img.parentNode.getBoundingClientRect();
        if (r.bottom < -50 || r.top > vh + 50) return;
        var t = (r.top + r.height / 2 - vh / 2) / (vh + r.height); // -0.5 … 0.5
        img.style.translate = '0 ' + (t * -10).toFixed(2) + '%';
      });
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* Mobiilivalikko. */
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    var setOpen = function (open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'Sulje' : 'Valikko';
      nav.classList.toggle('is-open', open);
      root.style.overflow = open ? 'hidden' : '';
    };
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setOpen(false); btn.focus(); }
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  }

  /* Lomake ei lähetä mitään. */
  document.querySelectorAll('[data-concept-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form__status');
      if (status) status.textContent = 'Kiitos. Tämä on konseptisivusto, joten viestiä ei lähetetty eikä tallennettu.';
    });
  });
})();
