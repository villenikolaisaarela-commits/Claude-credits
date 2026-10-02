/* Pihka Keittiöt Oy – konsepti. Ei ulkoisia kirjastoja. */
(function () {
  'use strict';

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


  /* ---------- mobiilivalikko ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (menuBtn && nav) {
    var setMenu = function (open) {
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.textContent = open ? 'Sulje' : 'Valikko';
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860 && nav.classList.contains('is-open')) setMenu(false);
    });
  }

  /* ---------- etusivun kuva ---------- */
  var hero = document.querySelector('.hero');
  if (hero) {
    var img = hero.querySelector('img');
    var go = function () { requestAnimationFrame(function () { hero.classList.add('is-in'); }); };
    if (reduce || !img) go();
    else whenReady(hero, function () { hero.classList.add('is-in'); });
  }


  /* ---------- reveal ---------- */
  var els = Array.prototype.slice.call(document.querySelectorAll('.reveal, [data-reveal]'));
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { var t = en.target; io.unobserve(t); whenReady(t, function () { t.classList.add('is-in'); }); }
      });
    }, { rootMargin: '0px 0px 15% 0px', threshold: 0 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- hidas parallaksi leveissä kuvissa ---------- */
  var bands = Array.prototype.slice.call(document.querySelectorAll('.band img'));
  if (bands.length && !reduce) {
    var ticking = false;
    var move = function () {
      ticking = false;
      var vh = window.innerHeight;
      bands.forEach(function (im) {
        var r = im.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var p = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
        im.style.transform = 'translate3d(0,' + (p * -12).toFixed(2) + '%,0)';
      });
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(move); } }, { passive: true });
    move();
  }

  /* ---------- hintalaskuri ---------- */
  var fmt = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
  var r500 = function (n) { return Math.round(n / 500) * 500; };
  var dec = function (n) { return String(n).replace('.', ','); };
  var examples = [
    { no: 'K-009', len: 3.1, island: false, price: 11400, text: 'Jämsä, 3,1 m' },
    { no: 'K-003', len: 3.4, island: false, price: 14900, text: 'Harju, 3,4 m' },
    { no: 'K-006', len: 3.9, island: false, price: 17300, text: 'Lohikoski, 3,9 m' },
    { no: 'K-017', len: 4.6, island: false, price: 19800, text: 'Muurame, 4,6 m' },
    { no: 'K-024', len: 4.8, island: false, price: 24300, text: 'Palokka, 4,8 m tammea' },
    { no: 'K-022', len: 3.6, island: true, price: 22400, text: 'Laukaa, 3,6 m + saareke' },
    { no: 'K-014', len: 4.2, island: true, price: 21600, text: 'Vaajakoski, 4,2 m + saareke', href: 'keittiot/k-014/index.html' },
    { no: 'K-030', len: 4.4, island: true, price: 26700, text: 'Keltinmäki, 4,4 m + saareke' },
    { no: 'K-021', len: 5.4, island: true, price: 31400, text: 'Kuokkala, 5,4 m + saareke', href: 'keittiot/k-021/index.html' }
  ];
  var calc = document.querySelector('[data-calc]');
  if (calc) {
    var root = calc.getAttribute('data-root') || '';
    var out = function (k) { return calc.querySelector('[data-' + k + ']'); };
    var update = function () {
      var c = calc.querySelector('input[name="pituus"]:checked');
      var len = c ? parseFloat(c.value) : 4;
      var island = calc.querySelector('input[name="saareke"]').checked;
      var lo = Math.max(8500, r500(len * 3500)), hi = Math.max(12500, r500(len * 5500));
      if (island) { lo += 5000; hi += 8500; }
      out('price').innerHTML = fmt(lo) + '–' + fmt(hi) + '<small>€</small>';
      var n = Math.floor(len / 0.6 + 1e-6);
      var il = len >= 5 ? 2.6 : (len >= 3.5 ? 2.0 : 1.6);
      out('mods').textContent = 'Noin ' + n + ' alakaappia (60 cm), joista ' + Math.max(1, Math.round(n / 2.6)) + ' laatikostoa' + (island ? '. Saareke noin ' + dec(il) + ' m.' : '.');
      var days = (len <= 3 ? 1 : (len <= 5 ? 2 : 3)) + (island ? 1 : 0);
      out('days').textContent = days + (days === 1 ? ' päivä' : ' päivää') + ', kaksi puuseppää';
      out('weeks').textContent = (len > 5 || island) ? '9–11 viikkoa' : '8–10 viikkoa';
      var best = null;
      examples.forEach(function (k) {
        if (k.island === island && (!best || Math.abs(k.len - len) < Math.abs(best.len - len))) best = k;
      });
      if (best) {
        var t = best.no + ', ' + best.text + ': ' + fmt(best.price) + ' €';
        out('example').innerHTML = best.href ? '<a class="u" href="' + root + best.href + '">' + t + '</a>' : t;
      }
    };
    calc.addEventListener('change', update);
    update();
  }

  /* ---------- tarjouspyyntö (ei lähetä) ---------- */
  var form = document.querySelector('[data-qform]');
  if (form) {
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var missing = Array.prototype.filter.call(form.querySelectorAll('[required]'), function (el) { return !el.value.trim(); });
      if (missing.length) {
        status.textContent = 'Täytä vielä nimi ja sähköposti.';
        missing[0].focus();
        return;
      }
      status.textContent = 'Kiitos. Tämä on konseptisivusto, joten lomake ei lähettänyt eikä tallentanut mitään.';
    });
  }
})();
