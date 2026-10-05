/* Kivelä Rinne */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Run cb only when every image inside el is loaded and decoded, so a reveal never opens on an empty frame. */
  function whenReady(el, cb) {
    var imgs = [].slice.call(el.querySelectorAll('img'));
    if (el.tagName === 'IMG') imgs.push(el);
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

  /* phone menu */
  var header = doc.querySelector('.site-header');
  var btn = doc.querySelector('.menu-btn');
  if (header && btn) {
    var setMenu = function (open) {
      header.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'Sulje' : 'Valikko';
      doc.body.classList.toggle('no-scroll', open);
    };
    btn.addEventListener('click', function () { setMenu(!header.classList.contains('menu-open')); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('menu-open')) { setMenu(false); btn.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 860 && header.classList.contains('menu-open')) setMenu(false); });
  }

  /* hero image fades in once decoded */
  var hero = doc.querySelector('.hero-img');
  if (hero) whenReady(hero, function () { hero.classList.add('is-in'); });

  /* reveals start a little before the element enters the screen */
  var items = [].slice.call(doc.querySelectorAll('[data-reveal], .rv-img'));
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var t = en.target; io.unobserve(t);
        whenReady(t, function () { t.classList.add('is-in'); });
      });
    }, { rootMargin: '0px 0px 12% 0px', threshold: 0 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* the room: drawing and text list highlight each other */
  var room = doc.querySelector('.room');
  if (room) {
    if ('IntersectionObserver' in window && !reduce) {
      var rio = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { room.classList.add('is-in'); rio.disconnect(); }
      }, { rootMargin: '0px 0px 10% 0px' });
      rio.observe(room);
    } else { room.classList.add('is-in'); }
    var frame = room.parentNode;
    var center = function () { if (frame.scrollWidth > frame.clientWidth + 4) frame.scrollLeft = (frame.scrollWidth - frame.clientWidth) / 2; };
    center(); window.addEventListener('load', center);
    var cone = room.querySelector('.cone');
    var hot = function (key, on) {
      var a = room.querySelector('.o-' + key);
      if (a) a.classList.toggle('is-hot', on);
      room.classList.toggle('has-hot', on);
      if (cone && key === 'vako') cone.classList.toggle('on', on);
    };
    [].forEach.call(doc.querySelectorAll('.room-menu [data-key]'), function (el) {
      var k = el.getAttribute('data-key');
      ['mouseenter', 'focus'].forEach(function (ev) { el.addEventListener(ev, function () { hot(k, true); }); });
      ['mouseleave', 'blur'].forEach(function (ev) { el.addEventListener(ev, function () { hot(k, false); }); });
    });
    [].forEach.call(room.querySelectorAll('a[data-key]'), function (el) {
      var li = doc.querySelector('.room-menu [data-key="' + el.getAttribute('data-key') + '"]');
      if (!li) return;
      ['mouseenter', 'focus'].forEach(function (ev) { el.addEventListener(ev, function () { li.classList.add('is-hot'); }); });
      ['mouseleave', 'blur'].forEach(function (ev) { el.addEventListener(ev, function () { li.classList.remove('is-hot'); }); });
    });
  }

  /* the form checks its fields but is not connected to anything */
  [].forEach.call(doc.querySelectorAll('form[data-offline]'), function (f) {
    f.setAttribute('novalidate', '');
    var status = f.querySelector('.status');
    var check = function (field) {
      var err = f.querySelector('#' + field.id + '-err');
      var msg = '';
      if (field.required && !field.value.trim()) msg = 'Täytä tämä kenttä.';
      else if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) msg = 'Tarkista sähköpostiosoite.';
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg;
      return !msg;
    };
    [].forEach.call(f.querySelectorAll('input, textarea'), function (field) {
      field.addEventListener('blur', function () { if (field.value) check(field); });
    });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = [].slice.call(f.querySelectorAll('input, textarea'));
      var ok = fields.map(check).every(Boolean);
      if (!ok) {
        var first = f.querySelector('[aria-invalid="true"]');
        if (first) first.focus();
        if (status) status.textContent = '';
        return;
      }
      if (status) status.textContent = 'Lomake ei ole käytössä tällä sivustolla. Ota yhteyttä puhelimitse tai sähköpostilla.';
    });
  });
})();
