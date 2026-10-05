/* Lindqvist Ekroos Arkkitehdit · sivuston skriptit. Ei kirjastoja. */
(function () {
  'use strict';
  window.LE_OK = true;
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Kuva avautuu vasta, kun tiedosto on ladattu ja purettu. */
  function whenReady(el, cb) {
    var imgs = [].slice.call(el.querySelectorAll('img'));
    var done = false;
    var go = function () { if (!done) { done = true; requestAnimationFrame(cb); } };
    if (!imgs.length || !window.Promise) return go();
    Promise.all(imgs.map(function (i) {
      if (i.loading === 'lazy') i.loading = 'eager';
      var loaded = (i.complete && i.naturalWidth) ? Promise.resolve() : new Promise(function (r) {
        i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true });
      });
      return loaded.then(function () { return i.decode ? i.decode().catch(function () {}) : null; });
    })).then(go);
    setTimeout(go, 4000);
  }

  var items = [].slice.call(document.querySelectorAll('[data-reveal]'));
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        io.unobserve(el);
        if (el.getAttribute('data-reveal') === 'img') whenReady(el, function () { el.classList.add('is-in'); });
        else el.classList.add('is-in');
      });
    }, { rootMargin: '0px 0px 12% 0px', threshold: 0 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* Puhelimen valikko. */
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    var labelOpen = btn.getAttribute('data-open') || 'Valikko';
    var labelClose = btn.getAttribute('data-close') || 'Sulje';
    var setOpen = function (open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? labelClose : labelOpen;
      nav.classList.toggle('is-open', open);
      root.classList.toggle('menu-open', open);
      root.style.overflow = open ? 'hidden' : '';
      if (open) { var f = nav.querySelector('a'); if (f) f.focus(); }
    };
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setOpen(false); btn.focus(); }
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 880 && nav.classList.contains('is-open')) setOpen(false); });
  }

  /* Arkisto: rajaus tyypin mukaan. */
  [].forEach.call(document.querySelectorAll('[data-archive]'), function (box) {
    var buttons = [].slice.call(box.querySelectorAll('.fbtn'));
    var rows = [].slice.call(box.querySelectorAll('tr.r'));
    var live = box.querySelector('.arch-live');
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        var t = b.getAttribute('data-filter');
        buttons.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        var n = 0;
        rows.forEach(function (r) {
          var show = t === 'all' || r.getAttribute('data-type') === t;
          r.hidden = !show; if (show) n++;
        });
        if (live) live.textContent = (live.getAttribute('data-tpl') || '{n}').replace('{n}', n);
      });
    });

    /* Esikatselukuva rivin päällä (vain hiirellä). */
    var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine) return;
    var pv = null, img = null;
    var ensure = function () {
      if (pv) return;
      pv = document.createElement('div');
      pv.className = 'preview'; pv.setAttribute('aria-hidden', 'true');
      img = document.createElement('img'); img.alt = ''; img.decoding = 'async';
      pv.appendChild(img); document.body.appendChild(pv);
    };
    var x = 0, y = 0, raf = 0, cur = null;
    var place = function () {
      raf = 0;
      if (!pv) return;
      var w = pv.offsetWidth, h = pv.offsetHeight || w * 1.25;
      var px = x + 28, py = y - h * 0.5;
      if (px + w > window.innerWidth - 12) px = x - w - 28;
      py = Math.max(12, Math.min(py, window.innerHeight - h - 12));
      pv.style.transform = 'translate(' + px + 'px,' + py + 'px)';
    };
    rows.forEach(function (r) {
      var src = r.getAttribute('data-preview');
      if (!src) return;
      r.addEventListener('mouseenter', function (e) {
        ensure();
        cur = r; x = e.clientX; y = e.clientY;
        if (img.getAttribute('src') !== src) {
          pv.classList.remove('on');
          img.onload = function () { if (cur === r) { place(); pv.classList.add('on'); } };
          img.src = src;
        } else { place(); pv.classList.add('on'); }
      });
      r.addEventListener('mousemove', function (e) { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(place); });
      r.addEventListener('mouseleave', function () { cur = null; if (pv) pv.classList.remove('on'); });
    });
  });

  /* Lomakkeet tarkistetaan, mutta niitä ei lähetetä. */
  [].forEach.call(document.querySelectorAll('form[data-form]'), function (form) {
    var status = form.querySelector('.form-status');
    var msgs = {
      required: form.getAttribute('data-msg-required') || 'Täytä tämä kenttä.',
      email: form.getAttribute('data-msg-email') || 'Tarkista sähköpostiosoite.',
      off: form.getAttribute('data-msg-off') || 'Lomake ei ole käytössä tällä sivustolla. Ota yhteyttä puhelimitse tai sähköpostilla.'
    };
    var check = function (f) {
      var err = document.getElementById(f.id + '-err');
      var msg = '';
      if (f.required && !f.value.trim()) msg = msgs.required;
      else if (f.type === 'email' && f.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value)) msg = msgs.email;
      f.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg;
      return !msg;
    };
    var fields = [].slice.call(form.querySelectorAll('input, textarea, select'));
    fields.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, first = null;
      fields.forEach(function (f) { if (!check(f)) { ok = false; if (!first) first = f; } });
      if (!ok) { if (status) status.textContent = ''; if (first) first.focus(); return; }
      if (status) { status.textContent = msgs.off; status.focus && status.focus(); }
    });
  });
})();
