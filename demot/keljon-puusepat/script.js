/* Keljon Puusepät Oy · script.js · ei ulkoisia kirjastoja */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Kuva paljastetaan vasta, kun se on ladattu ja purettu. */
  var whenReady = function (el, cb) {
    var imgs = [].slice.call(el.querySelectorAll('img'));
    if (el.tagName === 'IMG') imgs.push(el);
    var done = false;
    var go = function () { if (!done) { done = true; requestAnimationFrame(cb); } };
    if (!imgs.length || !window.Promise) return go();
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

  /* ---------- valikko ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (menuBtn && nav) {
    var setMenu = function (open) {
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.textContent = open ? 'Sulje' : 'Valikko';
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      if (open) { var f = nav.querySelector('a'); if (f) f.focus({ preventScroll: true }); }
    };
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
      if (e.key === 'Tab' && nav.classList.contains('is-open')) {
        var items = [menuBtn].concat([].slice.call(nav.querySelectorAll('a')));
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1100 && nav.classList.contains('is-open')) setMenu(false);
    });
  }

  /* ---------- etusivun avaus ---------- */
  var hero = document.querySelector('.home-hero');
  if (hero) {
    if (reduce) hero.classList.add('is-in');
    else whenReady(hero.querySelector('.hh-media') || hero, function () { hero.classList.add('is-in'); });
  }

  /* ---------- paljastus vieritettäessä ---------- */
  var els = [].slice.call(document.querySelectorAll('.reveal, [data-reveal]'));
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var t = en.target; io.unobserve(t);
          whenReady(t, function () { t.classList.add('is-in'); });
        }
      });
    }, { rootMargin: '0px 0px 15% 0px', threshold: 0 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- leveän kuvanauhan hidas liike ---------- */
  var bands = [].slice.call(document.querySelectorAll('.band img'));
  if (bands.length && !reduce) {
    var ticking = false;
    var move = function () {
      ticking = false;
      var vh = window.innerHeight;
      bands.forEach(function (im) {
        var r = im.parentNode.getBoundingClientRect();
        if (im.parentNode.tagName === 'PICTURE') r = im.parentNode.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var p = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
        im.style.transform = 'translate3d(0,' + (-8 + p * -14).toFixed(2) + '%,0)';
      });
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(move); } }, { passive: true });
    move();
  }

  /* ---------- hintalaskuri ---------- */
  var fmt = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
  var r100 = function (n) { return Math.round(n / 100) * 100; };
  var dec = function (n) { return String(n).replace('.', ','); };
  var examples = [
    { no: 'K-197', len: 3.1, island: false, price: 11420, text: 'Jämsä, 3,1 m' },
    { no: 'K-201', len: 3.4, island: false, price: 14880, text: 'Harju, 3,4 m', href: 'keittiot/k-201/index.html' },
    { no: 'K-178', len: 3.9, island: false, price: 17260, text: 'Lohikoski, 3,9 m' },
    { no: 'K-198', len: 4.6, island: false, price: 19790, text: 'Muurame, 4,6 m' },
    { no: 'K-195', len: 5.2, island: false, price: 23870, text: 'Säynätsalo, 5,2 m' },
    { no: 'K-171', len: 4.2, island: true, price: 21640, text: 'Vaajakoski, 4,2 m + saareke', href: 'keittiot/k-171/index.html' },
    { no: 'K-203', len: 4.8, island: true, price: 24960, text: 'Palokka, 4,8 m + saareke' },
    { no: 'K-186', len: 4.6, island: true, price: 26740, text: 'Keltinmäki, 4,6 m + saareke', href: 'keittiot/k-186/index.html' },
    { no: 'K-207', len: 5.4, island: true, price: 31380, text: 'Kuokkala, 5,4 m + saareke', href: 'keittiot/k-207/index.html' }
  ];
  var calc = document.querySelector('[data-calc]');
  if (calc) {
    var root = calc.getAttribute('data-root') || '';
    var out = function (k) { return calc.querySelector('[data-' + k + ']'); };
    var update = function () {
      var c = calc.querySelector('input[name="pituus"]:checked');
      var len = c ? parseFloat(c.value) : 4;
      var island = calc.querySelector('input[name="saareke"]').checked;
      var lo = Math.max(9800, r100(len * 3850)), hi = Math.max(14200, r100(len * 5900));
      if (island) { lo += 5200; hi += 9400; }
      out('price').innerHTML = fmt(lo) + '–' + fmt(hi) + '<small>€</small>';
      var n = Math.floor(len / 0.6 + 1e-6);
      var il = len >= 5 ? 2.6 : (len >= 3.5 ? 2.2 : 1.8);
      out('mods').textContent = 'Noin ' + n + ' alakaappia (60 cm), joista ' + Math.max(1, Math.round(n / 2.6)) + ' laatikostoa' + (island ? '. Saareke noin ' + dec(il) + ' m.' : '.');
      var days = (len <= 3 ? 1 : (len <= 5 ? 2 : 3)) + (island ? 1 : 0);
      out('days').textContent = days + (days === 1 ? ' päivä' : ' päivää') + ', kaksi puuseppää';
      out('weeks').textContent = (len > 5 || island) ? '9–10 viikkoa' : '8–9 viikkoa';
      var best = null;
      examples.forEach(function (k) {
        if (k.island === island && (!best || Math.abs(k.len - len) < Math.abs(best.len - len))) best = k;
      });
      if (best) {
        var t = best.no + ', ' + best.text + ': ' + fmt(best.price) + ' €';
        out('example').innerHTML = best.href ? '<a class="u" href="' + root + best.href + '">' + t + '</a>' : t;
      }
    };
    calc.addEventListener('change', update);
    update();
  }

  /* ---------- lomakkeet (eivät lähetä) ---------- */
  [].forEach.call(document.querySelectorAll('[data-form]'), function (form) {
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = [].filter.call(form.querySelectorAll('[required]'), function (el) {
        var ok = el.value.trim() !== '' && (el.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
        el.setAttribute('aria-invalid', ok ? 'false' : 'true');
        return !ok;
      });
      if (bad.length) {
        status.textContent = bad.length === 1 && bad[0].type === 'email' && bad[0].value.trim()
          ? 'Tarkista sähköpostiosoite.'
          : 'Täytä vielä kentät: ' + bad.map(function (el) { return el.getAttribute('data-name') || el.name; }).join(', ') + '.';
        bad[0].focus();
        return;
      }
      status.textContent = 'Lomake ei ole käytössä tällä sivustolla. Ota yhteyttä puhelimitse tai sähköpostilla.';
    });
  });
})();
