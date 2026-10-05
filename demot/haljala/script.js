/* Arkkitehtitoimisto Haljala Oy. Ei kirjastoja. */
(function () {
  'use strict';
  window.HALJALA_OK = true;
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Kuvan avaus alkaa vasta, kun kuva on ladattu ja purettu, jotta animaatio ei koskaan näytä tyhjää kehystä. */
  function whenReady(el, cb) {
    var imgs = [].slice.call(el.querySelectorAll('img'));
    var done = false;
    function go() { if (!done) { done = true; requestAnimationFrame(cb); } }
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
  }

  var items = [].slice.call(document.querySelectorAll('.reveal, [data-reveal]'));
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        io.unobserve(el);
        if (el.hasAttribute('data-reveal')) whenReady(el, function () { el.classList.add('is-in'); });
        else el.classList.add('is-in');
      });
    }, { rootMargin: '0px 0px 15% 0px', threshold: 0 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* Puhelimen valikko. */
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  var head = document.querySelector('.head');
  if (btn && nav) {
    var setOpen = function (open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'Sulje' : 'Valikko';
      nav.classList.toggle('is-open', open);
      if (head) head.classList.toggle('is-open', open);
      root.style.overflow = open ? 'hidden' : '';
      if (open) { var first = nav.querySelector('a'); if (first) first.focus(); }
    };
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setOpen(false); btn.focus(); }
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    var mq = window.matchMedia('(min-width: 861px)');
    var reset = function () { if (mq.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', reset);
  }

  /* Töiden suodatus. Ilman JavaScriptiä kaikki työt näkyvät eikä painikkeita ole. */
  var cards = document.querySelector('[data-cards]');
  if (cards) {
    var list = [].slice.call(cards.querySelectorAll('.card'));
    var types = [['kaikki', 'Kaikki'], ['talo', 'Talot'], ['huvila', 'Huvilat'], ['sauna', 'Saunat'], ['korjaus', 'Korjaukset']];
    var bar = document.createElement('div');
    bar.className = 'filters';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Näytä työt tyypeittäin');
    var status = document.createElement('p');
    status.className = 'visually-hidden';
    status.setAttribute('aria-live', 'polite');
    types.forEach(function (t, i) {
      var n = t[0] === 'kaikki' ? list.length : list.filter(function (c) { return (c.dataset.type || '').indexOf(t[0]) > -1; }).length;
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.f = t[0];
      b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      b.innerHTML = t[1] + ' <span class="count">' + n + '</span>';
      bar.appendChild(b);
    });
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var f = b.dataset.f;
      [].forEach.call(bar.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var shown = 0;
      list.forEach(function (c) {
        var on = f === 'kaikki' || (c.dataset.type || '').indexOf(f) > -1;
        c.hidden = !on;
        if (on) { shown++; c.querySelectorAll('[data-reveal], .reveal').forEach(function (r) { r.classList.add('is-in'); }); }
      });
      status.textContent = 'Näytetään ' + shown + ' työtä.';
    });
    cards.parentNode.insertBefore(bar, cards);
    cards.parentNode.insertBefore(status, cards);
  }

  /* Lomake tarkistaa kentät mutta ei lähetä mitään. */
  [].forEach.call(document.querySelectorAll('form[data-form]'), function (form) {
    /* Ilman JavaScriptiä painike ei lähetä lomaketta; tässä se otetaan käyttöön tarkistusta varten. */
    form.noValidate = true;
    [].forEach.call(form.querySelectorAll('button[data-submit]'), function (b) { b.type = 'submit'; });
    var msgs = {
      nimi: 'Kirjoita nimesi.',
      email: 'Kirjoita sähköpostiosoite kokonaan, myös @-merkki ja verkkotunnus.',
      sijainti: 'Kerro kunta tai tontin sijainti.',
      viesti: 'Kirjoita muutama sana hankkeesta.'
    };
    function check(input) {
      var err = document.getElementById(input.id + '-err');
      var bad = !input.checkValidity();
      input.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (err) err.textContent = bad ? (msgs[input.name] || 'Tarkista tämä kenttä.') : '';
      return !bad;
    }
    [].forEach.call(form.querySelectorAll('[required]'), function (input) {
      input.addEventListener('blur', function () { if (input.value) check(input); });
      input.addEventListener('input', function () { if (input.getAttribute('aria-invalid') === 'true') check(input); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      [].forEach.call(form.querySelectorAll('[required]'), function (input) { if (!check(input) && !firstBad) firstBad = input; });
      var status = form.querySelector('.form__status');
      if (firstBad) { firstBad.focus(); if (status) status.textContent = ''; return; }
      if (status) status.textContent = 'Lomake ei ole käytössä tällä sivustolla. Ota yhteyttä puhelimitse tai sähköpostilla.';
    });
  });
})();
