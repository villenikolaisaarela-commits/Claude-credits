/* Niisi, konseptisivusto. Ostoskori ja suosikit tallentuvat vain selaimen localStorageen. */
(function () {
  'use strict';
  var root = document.documentElement.getAttribute('data-root') || '';
  var PRODUCTS = window.NIISI_PRODUCTS || [];
  var bySlug = {};
  PRODUCTS.forEach(function (p) { bySlug[p.slug] = p; });
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------ storage */
  function load(key) {
    try { var v = JSON.parse(window.localStorage.getItem(key) || '[]'); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  }
  function save(key, val) {
    try { window.localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* private mode: keep in memory only */ }
  }
  var cart = load('niisi-cart').filter(function (l) { return bySlug[l.slug]; });
  var favs = load('niisi-favs').filter(function (s) { return bySlug[s]; });

  function eur(n) {
    var s = (Math.round(n * 100) / 100).toFixed(2).replace('.', ',');
    return s.replace(',00', '') + ' €';
  }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ------------------------------------------------------------ toast */
  var toastEl = $('[data-toast]'), toastT;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2400);
  }

  /* ------------------------------------------------------------ counts + render */
  function cartCount() { return cart.reduce(function (n, l) { return n + l.qty; }, 0); }
  function renderCounts() {
    $$('[data-count="cart"]').forEach(function (e) { e.textContent = cartCount(); });
    $$('[data-count="favs"]').forEach(function (e) { e.textContent = favs.length; });
  }
  function thumb(p) {
    var box = el('div', 'line__img');
    var img = new Image();
    img.src = root + 'img/' + p.img + '-800.jpg';
    img.alt = '';
    img.width = 800; img.height = 1000;
    box.appendChild(img);
    return box;
  }
  function renderCart() {
    var list = $('[data-cart-list]'), foot = $('[data-cart-foot]');
    if (!list) return;
    list.innerHTML = '';
    if (!cart.length) {
      list.appendChild(el('p', 'drawer__empty', 'Ostoskori on tyhjä.'));
      foot.hidden = true;
      return;
    }
    var sub = 0;
    cart.forEach(function (l, i) {
      var p = bySlug[l.slug]; sub += p.price * l.qty;
      var row = el('div', 'line');
      var a = document.createElement('a'); a.href = root + 'tuotteet/' + p.slug + '/index.html'; a.appendChild(thumb(p)); a.setAttribute('aria-label', p.name);
      var mid = el('div');
      mid.appendChild(el('p', 'line__name', p.name));
      mid.appendChild(el('p', 'line__meta', p.type + ', ' + p.colour.toLowerCase()));
      mid.appendChild(el('p', 'line__meta', 'Koko ' + l.size));
      var q = el('div', 'line__qty');
      var minus = el('button', '', '−'); minus.type = 'button'; minus.setAttribute('aria-label', 'Vähennä, ' + p.name + ' koko ' + l.size);
      var num = el('span', '', String(l.qty)); num.setAttribute('aria-live', 'polite');
      var plus = el('button', '', '+'); plus.type = 'button'; plus.setAttribute('aria-label', 'Lisää yksi, ' + p.name + ' koko ' + l.size);
      minus.addEventListener('click', function () { setQty(i, l.qty - 1); });
      plus.addEventListener('click', function () { setQty(i, l.qty + 1); });
      q.appendChild(minus); q.appendChild(num); q.appendChild(plus);
      mid.appendChild(q);
      var right = el('div', 'line__right');
      right.appendChild(el('p', '', eur(p.price * l.qty)));
      var rm = el('button', 'line__rm', 'Poista'); rm.type = 'button'; rm.setAttribute('aria-label', 'Poista ' + p.name + ', koko ' + l.size);
      rm.addEventListener('click', function () { setQty(i, 0); });
      right.appendChild(rm);
      row.appendChild(a); row.appendChild(mid); row.appendChild(right);
      list.appendChild(row);
    });
    var ship = sub >= 150 ? 0 : 6.9;
    $('[data-subtotal]').textContent = eur(sub);
    $('[data-ship]').textContent = ship ? eur(ship) : '0 €';
    $('[data-ship-note]').textContent = ship ? 'Toimitus on maksuton yli 150 euron tilauksiin. Puuttuu ' + eur(150 - sub) + '.' : 'Toimitus pakettiautomaattiin tai noutopisteeseen on maksuton.';
    foot.hidden = false;
  }
  function setQty(i, q) {
    if (q <= 0) cart.splice(i, 1); else cart[i].qty = Math.min(q, 9);
    save('niisi-cart', cart); renderCart(); renderCounts();
  }
  function addToCart(slug, size) {
    var line = cart.filter(function (l) { return l.slug === slug && l.size === size; })[0];
    if (line) line.qty = Math.min(line.qty + 1, 9); else cart.push({ slug: slug, size: size, qty: 1 });
    save('niisi-cart', cart); renderCart(); renderCounts();
  }
  function renderFavs() {
    var list = $('[data-fav-list]');
    if (!list) return;
    list.innerHTML = '';
    if (!favs.length) { list.appendChild(el('p', 'drawer__empty', 'Suosikkilista on tyhjä. Lisää tuotteita sydämestä tuotesivulla.')); return; }
    favs.forEach(function (slug) {
      var p = bySlug[slug];
      var row = el('div', 'line');
      var a = document.createElement('a'); a.href = root + 'tuotteet/' + p.slug + '/index.html'; a.appendChild(thumb(p)); a.setAttribute('aria-label', p.name);
      var mid = el('div');
      var n = document.createElement('a'); n.href = a.href; n.className = 'line__name'; n.textContent = p.name;
      mid.appendChild(n);
      mid.appendChild(el('p', 'line__meta', p.type + ', ' + p.colour.toLowerCase()));
      var right = el('div', 'line__right');
      right.appendChild(el('p', '', eur(p.price)));
      var rm = el('button', 'line__rm', 'Poista'); rm.type = 'button'; rm.setAttribute('aria-label', 'Poista suosikeista ' + p.name);
      rm.addEventListener('click', function () { toggleFav(slug); });
      right.appendChild(rm);
      row.appendChild(a); row.appendChild(mid); row.appendChild(right);
      list.appendChild(row);
    });
  }
  function syncFavButtons() {
    $$('[data-fav]').forEach(function (b) {
      var on = favs.indexOf(b.getAttribute('data-fav')) > -1;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      var lab = $('[data-fav-label]', b); if (lab) lab.textContent = on ? 'Suosikeissa' : 'Lisää suosikkeihin';
    });
  }
  function toggleFav(slug) {
    var i = favs.indexOf(slug);
    if (i > -1) favs.splice(i, 1); else favs.push(slug);
    save('niisi-favs', favs); renderFavs(); renderCounts(); syncFavButtons();
    return i === -1;
  }

  /* ------------------------------------------------------------ drawers */
  var scrim = $('[data-scrim]'), openDrawer = null, lastFocus = null;
  function open(id) {
    var d = document.getElementById(id); if (!d) return;
    if (openDrawer && openDrawer !== d) close(true);
    lastFocus = document.activeElement;
    closeMenu();
    d.hidden = false; scrim.hidden = false;
    document.body.classList.add('is-locked');
    requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add('is-open'); scrim.classList.add('is-open'); }); });
    openDrawer = d;
    var c = $('[data-close]', d); if (c) c.focus();
  }
  function close(instant) {
    var d = openDrawer; if (!d) return;
    d.classList.remove('is-open'); scrim.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    var done = function () { if (!d.classList.contains('is-open')) { d.hidden = true; if (!openDrawer) scrim.hidden = true; } };
    if (instant || reduce) done(); else setTimeout(done, 700);
    openDrawer = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$('[data-open]').forEach(function (b) { b.addEventListener('click', function () { open(b.getAttribute('data-open')); }); });
  $$('[data-close]').forEach(function (b) { b.addEventListener('click', function () { close(); }); });
  if (scrim) scrim.addEventListener('click', function () { close(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (openDrawer) close(); else closeMenu(); }
    if (e.key === 'Tab' && openDrawer) {
      var f = $$('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])', openDrawer).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var co = $('[data-checkout]');
  if (co) co.addEventListener('click', function () {
    var m = $('[data-checkout-msg]'); m.textContent = ''; setTimeout(function () {
      m.textContent = 'Kassaa ei ole: tämä on konseptisivusto. Mitään ei tilata eikä maksua pyydetä. Ostoskori tallentuu vain tähän selaimeen.';
    }, 60);
  });

  /* ------------------------------------------------------------ mobile menu */
  var mbtn = $('[data-menu]'), menu = $('#mmenu');
  function closeMenu() { if (menu && !menu.hidden) { menu.hidden = true; mbtn.setAttribute('aria-expanded', 'false'); mbtn.textContent = 'Valikko'; } }
  if (mbtn) mbtn.addEventListener('click', function () {
    var openNow = menu.hidden;
    menu.hidden = !openNow;
    mbtn.setAttribute('aria-expanded', openNow ? 'true' : 'false');
    mbtn.textContent = openNow ? 'Sulje' : 'Valikko';
  });

  /* ------------------------------------------------------------ product page */
  var buy = $('[data-buy]');
  if (buy) {
    var slug = $('[data-product]').getAttribute('data-product');
    var msg = $('[data-buy-msg]');
    buy.addEventListener('change', function () { msg.textContent = ''; });
    buy.addEventListener('submit', function (e) {
      e.preventDefault();
      var s = $('input[name="koko"]:checked', buy);
      if (!s) { msg.textContent = 'Valitse ensin koko.'; var f = $('input[name="koko"]:not([disabled])', buy); if (f) f.focus(); return; }
      addToCart(slug, s.value);
      msg.textContent = '';
      open('cart');
    });
  }
  $$('[data-fav]').forEach(function (b) {
    b.addEventListener('click', function () {
      var added = toggleFav(b.getAttribute('data-fav'));
      toast(added ? 'Lisätty suosikkeihin' : 'Poistettu suosikeista');
    });
  });
  var gal = $('[data-gal]');
  if (gal) {
    var track = $('.gal__track', gal), dots = $$('.gal__dots span', gal);
    track.addEventListener('scroll', function () {
      var i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
    }, { passive: true });
  }

  /* ------------------------------------------------------------ collection filters */
  var filters = $('[data-filters]');
  if (filters) {
    var cards = $$('[data-grid] .card'), countLabel = $('[data-count-label]');
    var apply = function (cat, push) {
      var n = 0;
      $$('.flt', filters).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-filter') === cat ? 'true' : 'false'); });
      cards.forEach(function (c) {
        var show = cat === 'kaikki' || c.getAttribute('data-cat') === cat;
        c.classList.toggle('is-hidden', !show); if (show) n++;
      });
      countLabel.textContent = n + (n === 1 ? ' tuote' : ' tuotetta');
      if (push) { try { history.replaceState(null, '', cat === 'kaikki' ? location.pathname : '?kategoria=' + cat); } catch (e) {} }
    };
    $$('.flt', filters).forEach(function (b) { b.addEventListener('click', function () { apply(b.getAttribute('data-filter'), true); }); });
    var m = /[?&]kategoria=([a-z]+)/.exec(location.search);
    if (m && $('.flt[data-filter="' + m[1] + '"]', filters)) apply(m[1], false);
  }

  /* ------------------------------------------------------------ rail (drag, arrows, keys) */
  $$('[data-rail]').forEach(function (track) {
    var sec = track.closest('section');
    var prev = $('[data-rail-prev]', sec), next = $('[data-rail-next]', sec);
    var step = function () { var c = track.querySelector('.slide'); return c ? c.getBoundingClientRect().width + 2 : 300; };
    var go = function (dir) { track.scrollBy({ left: dir * step() * (window.innerWidth > 700 ? 2 : 1), behavior: reduce ? 'auto' : 'smooth' }); };
    var upd = function () {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    };
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    track.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
    track.addEventListener('keydown', function (e) {
      if (e.target !== track) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    // mouse drag with gentle momentum (touch uses native scrolling)
    var down = false, moved = 0, sx = 0, sl = 0, lastX = 0, lastT = 0, v = 0, raf;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = 0; sx = lastX = e.clientX; sl = track.scrollLeft; lastT = performance.now(); v = 0;
      cancelAnimationFrame(raf);
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx));
      if (moved > 4) { track.classList.add('is-drag'); }
      track.scrollLeft = sl - dx;
      var t = performance.now(); v = (e.clientX - lastX) / Math.max(1, t - lastT); lastX = e.clientX; lastT = t;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return; down = false;
      if (moved > 4) {
        var vel = -v * 16;
        var glide = function () {
          if (reduce || Math.abs(vel) < 0.4) { track.classList.remove('is-drag'); return; }
          track.scrollLeft += vel; vel *= 0.93; raf = requestAnimationFrame(glide);
        };
        glide();
      }
    });
    track.addEventListener('click', function (e) { if (moved > 4) { e.preventDefault(); e.stopPropagation(); } }, true);
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });

  /* ------------------------------------------------------------ contact form (never sends) */
  var cf = $('[data-cform]');
  if (cf) cf.addEventListener('submit', function (e) {
    e.preventDefault();
    $('[data-cform-msg]', cf).textContent = 'Viestiä ei lähetetty. Tämä on konseptisivusto, eikä lomake lähetä tietoja mihinkään.';
  });

  /* ------------------------------------------------------------ reveals */
  var items = $$('.reveal-img, [data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (x) { x.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    items.forEach(function (x) { io.observe(x); });
  }

  renderCounts(); renderCart(); renderFavs(); syncFavButtons();
})();
