/* Studio Kuusela · script.js · v1. The site works without this file. */
(function () {
  'use strict';
  window.KS_OK = true;
  var d = document;
  var root = d.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Run an image reveal only after its images are loaded and decoded, so the animation never plays over an empty frame. */
  var whenReady = function (el, cb) {
    var imgs = [].slice.call(el.querySelectorAll('img'));
    var done = false;
    var go = function () { if (!done) { done = true; window.requestAnimationFrame(cb); } };
    if (!imgs.length || !window.Promise) { go(); return; }
    Promise.all(imgs.map(function (i) {
      if (i.loading === 'lazy') i.loading = 'eager';
      var loaded = (i.complete && i.naturalWidth) ? Promise.resolve() : new Promise(function (r) {
        i.addEventListener('load', r, { once: true });
        i.addEventListener('error', r, { once: true });
      });
      return loaded.then(function () { return i.decode ? i.decode().catch(function () {}) : null; });
    })).then(go);
    setTimeout(go, 4000);
  };

  /* Reveal on scroll, triggered a little before the element enters the view */
  var items = [].slice.call(d.querySelectorAll('.reveal, [data-reveal]'));
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target;
        io.unobserve(t);
        whenReady(t, function () { t.classList.add('is-in'); });
      });
    }, { rootMargin: '0px 0px 12% 0px', threshold: 0 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* Phone menu */
  var toggle = d.querySelector('[data-menu-toggle]');
  var nav = d.getElementById('valikko');
  if (toggle && nav) {
    var label = toggle.querySelector('[data-menu-label]');
    var setOpen = function (open, focusToggle) {
      root.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (label) label.textContent = open ? 'Sulje' : 'Valikko';
      if (open) {
        var first = nav.querySelector('a');
        if (first) first.focus();
      } else if (focusToggle) {
        toggle.focus();
      }
    };
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    d.addEventListener('keydown', function (e) {
      if (!root.classList.contains('menu-open')) return;
      if (e.key === 'Escape') { setOpen(false, true); return; }
      if (e.key === 'Tab') {
        var f = [toggle].concat([].slice.call(nav.querySelectorAll('a')));
        var i = f.indexOf(d.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860 && root.classList.contains('menu-open')) setOpen(false);
    });
  }

  /* Project filter on the Kohteet page */
  var bar = d.querySelector('[data-filter]');
  if (bar) {
    var buttons = [].slice.call(bar.querySelectorAll('button'));
    var cards = [].slice.call(d.querySelectorAll('[data-type]'));
    var status = d.querySelector('[data-filter-status]');
    bar.hidden = false;
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-value');
        var n = 0;
        buttons.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        cards.forEach(function (c) {
          var show = v === 'kaikki' || c.getAttribute('data-type') === v;
          c.hidden = !show;
          if (show) { n++; c.querySelectorAll('.reveal').forEach(function (r) { r.classList.add('is-in'); }); }
        });
        if (status) status.textContent = n === 1 ? 'Näytetään 1 kohde.' : 'Näytetään ' + n + ' kohdetta.';
      });
    });
  }

  /* Contact form: validates, never sends */
  var form = d.querySelector('[data-form]');
  if (form) {
    form.setAttribute('novalidate', '');
    var out = form.querySelector('[data-form-status]');
    var msg = {
      nimi: 'Kirjoita nimesi.',
      sahkoposti: 'Tarkista sähköpostiosoite.',
      viesti: 'Kerro kohteesta muutamalla sanalla.',
      lupa: 'Hyväksy tietojen käsittely.'
    };
    var check = function (el) {
      var err = d.getElementById(el.id + '-err');
      var bad = false;
      if (el.type === 'checkbox') bad = el.required && !el.checked;
      else if (el.type === 'email') bad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim());
      else bad = el.required && !el.value.trim();
      el.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (err) err.textContent = bad ? (msg[el.name] || 'Tarkista tämä kenttä.') : '';
      return !bad;
    };
    var fields = [].slice.call(form.querySelectorAll('[required]'));
    fields.forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value || el.getAttribute('aria-invalid') === 'true') check(el); });
      el.addEventListener('change', function () { if (el.getAttribute('aria-invalid') === 'true') check(el); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      fields.forEach(function (el) { if (!check(el) && !firstBad) firstBad = el; });
      if (firstBad) {
        if (out) out.textContent = '';
        firstBad.focus();
        return;
      }
      if (out) out.textContent = 'Lomake ei ole käytössä tällä sivustolla. Ota yhteyttä puhelimitse tai sähköpostilla.';
    });
  }
})();
