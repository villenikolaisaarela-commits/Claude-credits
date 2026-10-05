/* Kaulus Oy · script.js · v1. Ostoskori ja suosikit tallentuvat vain selaimen localStorageen. */
(function () {
  'use strict';
  window.__k = 1;
  var doc = document.documentElement;
  var root = doc.getAttribute('data-root') || '';
  var PRODUCTS = window.KAULUS_PRODUCTS || [];
  var bySlug = {};
  PRODUCTS.forEach(function (p) { bySlug[p.slug] = p; });
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SIZES = ['XS', 'S', 'M', 'L', 'XL'];
  var FREE_SHIP = 200, SHIP = 5.9;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function eur(n) { var s = (Math.round(n * 100) / 100).toFixed(2).replace('.', ','); return s.replace(/,00$/, '') + '\u00a0€'; }
  function colourOf(p, id) { var c = p.colours.filter(function (x) { return x.id === id; })[0]; return c || p.colours[0]; }

  /* Start a reveal only when the images inside are loaded and decoded. */
  function whenReady(node, cb) {
    var imgs = $$('img', node); if (node.tagName === 'IMG') imgs.push(node);
    var done = false, go = function () { if (!done) { done = true; requestAnimationFrame(cb); } };
    if (!imgs.length || !window.Promise) return go();
    Promise.all(imgs.map(function (i) {
      if (i.loading === 'lazy') i.loading = 'eager';
      var loaded = (i.complete && i.naturalWidth) ? Promise.resolve() : new Promise(function (r) { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); });
      return loaded.then(function () { return i.decode ? i.decode().catch(function () {}) : null; });
    })).then(go);
    setTimeout(go, 4000);
  }

  /* ------------------------------------------------------------ storage */
  function load(key) { try { var v = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* private mode: memory only */ } }
  var cart = load('kaulus-cart').filter(function (l) { return bySlug[l.slug] && l.size && l.qty > 0; });
  var favs = load('kaulus-favs').filter(function (k) { return bySlug[String(k).split(':')[0]]; });

  /* ------------------------------------------------------------ header */
  var hdr = $('.hdr');
  function onScroll() { if (hdr) hdr.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ------------------------------------------------------------ toast */
  var toastEl = $('[data-toast]'), toastT;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2400);
  }

  /* ------------------------------------------------------------ cart + favourites */
  function cartCount() { return cart.reduce(function (n, l) { return n + l.qty; }, 0); }
  function renderCounts() {
    $$('[data-count="cart"]').forEach(function (e) { e.textContent = cartCount(); });
    $$('[data-count="favs"]').forEach(function (e) { e.textContent = favs.length; });
  }
  function thumb(c, href, label) {
    var a = document.createElement('a'); a.href = href; a.className = 'line__img'; a.setAttribute('aria-label', label);
    var img = new Image(); img.src = root + 'img/' + c.img + '-1-300.jpg'; img.alt = ''; img.width = 300; img.height = 375; img.decoding = 'async';
    a.appendChild(img); return a;
  }
  function renderCart() {
    var list = $('[data-cart-list]'), foot = $('[data-cart-foot]');
    if (!list) return;
    list.innerHTML = '';
    if (!cart.length) {
      var p = el('p', 'drawer__empty', 'Ostoskori on tyhjä. ');
      var a = el('a', '', 'Katso paidat'); a.href = root + 'paidat/index.html'; p.appendChild(a);
      list.appendChild(p); foot.hidden = true; return;
    }
    var sub = 0;
    cart.forEach(function (l, i) {
      var p = bySlug[l.slug], c = colourOf(p, l.colour); sub += c.price * l.qty;
      var href = root + 'paidat/' + p.slug + '/index.html' + (c.id !== p.colours[0].id ? '?vari=' + c.id : '');
      var row = el('div', 'line');
      var mid = el('div');
      mid.appendChild(el('p', 'line__name', p.name));
      mid.appendChild(el('p', 'line__meta', c.name + ' · koko ' + l.size));
      var q = el('div', 'line__qty');
      var minus = el('button', '', '−'); minus.type = 'button'; minus.setAttribute('aria-label', 'Vähennä yksi: ' + p.name + ', koko ' + l.size);
      var num = el('span', '', String(l.qty));
      var plus = el('button', '', '+'); plus.type = 'button'; plus.setAttribute('aria-label', 'Lisää yksi: ' + p.name + ', koko ' + l.size);
      minus.addEventListener('click', function () { setQty(i, l.qty - 1); });
      plus.addEventListener('click', function () { setQty(i, l.qty + 1); });
      q.appendChild(minus); q.appendChild(num); q.appendChild(plus); mid.appendChild(q);
      var right = el('div', 'line__right');
      right.appendChild(el('p', '', eur(c.price * l.qty)));
      var rm = el('button', 'line__rm', 'Poista'); rm.type = 'button'; rm.setAttribute('aria-label', 'Poista ' + p.name + ', koko ' + l.size);
      rm.addEventListener('click', function () { setQty(i, 0); });
      right.appendChild(rm);
      row.appendChild(thumb(c, href, p.name)); row.appendChild(mid); row.appendChild(right);
      list.appendChild(row);
    });
    var ship = sub >= FREE_SHIP ? 0 : SHIP;
    $('[data-subtotal]').textContent = eur(sub);
    $('[data-ship]').textContent = ship ? eur(ship) : '0 €';
    $('[data-total]').textContent = eur(sub + ship);
    $('[data-ship-note]').textContent = ship
      ? 'Toimitus on maksuton yli 200 euron tilauksiin. Siihen puuttuu ' + eur(FREE_SHIP - sub) + '.'
      : 'Toimitus pakettiautomaattiin tai noutopisteeseen on maksuton.';
    foot.hidden = false;
  }
  function setQty(i, q) {
    if (q <= 0) cart.splice(i, 1); else cart[i].qty = Math.min(q, 9);
    save('kaulus-cart', cart); renderCart(); renderCounts();
    var m = $('[data-checkout-msg]'); if (m) m.textContent = '';
  }
  function addToCart(slug, colour, size) {
    var line = cart.filter(function (l) { return l.slug === slug && l.colour === colour && l.size === size; })[0];
    if (line) line.qty = Math.min(line.qty + 1, 9); else cart.push({ slug: slug, colour: colour, size: size, qty: 1 });
    save('kaulus-cart', cart); renderCart(); renderCounts();
  }
  function renderFavs() {
    var list = $('[data-fav-list]');
    if (!list) return;
    list.innerHTML = '';
    if (!favs.length) { list.appendChild(el('p', 'drawer__empty', 'Suosikkilista on tyhjä. Lisää paita suosikkeihin sen omalla sivulla.')); return; }
    favs.forEach(function (key) {
      var parts = String(key).split(':'), p = bySlug[parts[0]], c = colourOf(p, parts[1]);
      var href = root + 'paidat/' + p.slug + '/index.html' + (c.id !== p.colours[0].id ? '?vari=' + c.id : '');
      var row = el('div', 'line');
      var mid = el('div');
      var n = el('a', 'line__name', p.name); n.href = href; mid.appendChild(n);
      mid.appendChild(el('p', 'line__meta', c.name));
      var go = el('a', 'line__add', c.soldout ? 'Loppuunmyyty' : 'Valitse koko'); go.href = href; mid.appendChild(el('p', '')).appendChild(go);
      var right = el('div', 'line__right');
      right.appendChild(el('p', '', eur(c.price)));
      var rm = el('button', 'line__rm', 'Poista'); rm.type = 'button'; rm.setAttribute('aria-label', 'Poista suosikeista: ' + p.name + ', ' + c.name);
      rm.addEventListener('click', function () { toggleFav(key); });
      right.appendChild(rm);
      row.appendChild(thumb(c, href, p.name)); row.appendChild(mid); row.appendChild(right);
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
  function toggleFav(key) {
    var i = favs.indexOf(key);
    if (i > -1) favs.splice(i, 1); else favs.push(key);
    save('kaulus-favs', favs); renderFavs(); renderCounts(); syncFavButtons();
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
    if (e.key === 'Escape') { if (openDrawer) close(); else closeMenu(true); }
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
    var m = $('[data-checkout-msg]'); m.textContent = '';
    setTimeout(function () { m.textContent = 'Tilauksia ei oteta vastaan tällä sivustolla. Ostoskori säilyy vain tässä selaimessa, eikä mitään veloiteta.'; }, 60);
  });

  /* ------------------------------------------------------------ phone menu */
  var mbtn = $('[data-menu]'), menu = $('#mmenu');
  function closeMenu(focusBtn) {
    if (menu && !menu.hidden) {
      menu.hidden = true; mbtn.setAttribute('aria-expanded', 'false'); mbtn.textContent = 'Valikko';
      document.body.classList.remove('is-locked');
      if (focusBtn) mbtn.focus();
    }
  }
  if (mbtn && menu) mbtn.addEventListener('click', function () {
    var openNow = menu.hidden;
    if (!openNow) return closeMenu();
    menu.hidden = false; mbtn.setAttribute('aria-expanded', 'true'); mbtn.textContent = 'Sulje';
    document.body.classList.add('is-locked');
    var f = $('a', menu); if (f) f.focus();
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 900) closeMenu(); });

  /* ------------------------------------------------------------ product page */
  var pdp = $('[data-product]');
  if (pdp) {
    var p = bySlug[pdp.getAttribute('data-product')];
    var form = $('[data-buy]', pdp), msg = $('[data-buy-msg]', pdp), stockline = $('[data-stockline]', pdp);
    var addBtn = $('[data-add]', pdp), addLabel = $('[data-add-label]', pdp), notify = $('[data-notify]', pdp);
    var favBtn = $('[data-fav]', pdp);
    var current = p.colours[0];
    var setColour = function (id, push) {
      current = colourOf(p, id);
      $$('[data-colour-name]', pdp).forEach(function (n) { n.textContent = current.name; });
      $$('[data-gallery]', pdp).forEach(function (g) { g.hidden = g.getAttribute('data-gallery') !== current.id; });
      $$('[data-colour-only]', pdp).forEach(function (n) { n.hidden = n.getAttribute('data-colour-only') !== current.id; });
      $$('input[name="vari"]', pdp).forEach(function (r) { r.checked = r.value === current.id; });
      $$('input[name="koko"]', pdp).forEach(function (r) {
        var n = current.stock[r.value] || 0, lab = r.closest('.size');
        r.disabled = n === 0; lab.classList.toggle('size--out', n === 0);
        if (n === 0 && r.checked) r.checked = false;
        r.setAttribute('aria-label', r.value + (n === 0 ? ', loppu' : n <= 2 ? ', ' + n + ' jäljellä' : ''));
      });
      if (favBtn) favBtn.setAttribute('data-fav', p.slug + ':' + current.id);
      var out = current.soldout;
      addBtn.disabled = !!out; addLabel.textContent = out ? 'Loppuunmyyty' : 'Lisää ostoskoriin';
      if (notify) notify.hidden = !out;
      msg.textContent = '';
      updateStock();
      syncFavButtons();
      if (push) { try { history.replaceState(null, '', id === p.colours[0].id ? location.pathname : '?vari=' + id); } catch (e) {} }
      var dots = $$('.gal__dots span', pdp); dots.forEach(function (d, k) { d.classList.toggle('on', k === 0); });
    };
    var updateStock = function () {
      var s = $('input[name="koko"]:checked', form);
      var gone = SIZES.filter(function (k) { return (current.stock[k] || 0) === 0; });
      var t = '';
      if (current.soldout) t = current.name + ' on loppuunmyyty. Seuraava erä ' + current.next + '.';
      else if (s) {
        var n = current.stock[s.value];
        t = 'Koko ' + s.value + ': ' + (n === 1 ? 'viimeinen kappale.' : n <= 3 ? n + ' jäljellä.' : n + ' kpl varastossa.') + ' Lähtee 1–2 arkipäivässä.';
      } else if (gone.length) t = gone.join(', ') + (gone.length > 1 ? ' ovat' : ' on') + ' loppu. Seuraava erä ' + current.next + '.';
      stockline.textContent = t;
    };
    $$('input[name="vari"]', pdp).forEach(function (r) { r.addEventListener('change', function () { setColour(r.value, true); }); });
    form.addEventListener('change', function (e) { if (e.target.name === 'koko') { msg.textContent = ''; updateStock(); } });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (current.soldout) return;
      var s = $('input[name="koko"]:checked', form);
      if (!s) { msg.textContent = 'Valitse ensin koko.'; var f = $('input[name="koko"]:not([disabled])', form); if (f) f.focus(); return; }
      addToCart(p.slug, current.id, s.value);
      msg.textContent = '';
      open('cart');
    });
    var qm = /[?&]vari=([a-z-]+)/.exec(location.search);
    setColour(qm && p.colours.some(function (c) { return c.id === qm[1]; }) ? qm[1] : p.colours[0].id, false);
    $$('[data-gal-track]', pdp).forEach(function (track) {
      track.addEventListener('scroll', function () {
        var i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
        $$('.gal__dots span', track.parentNode).forEach(function (d, k) { d.classList.toggle('on', k === i); });
      }, { passive: true });
    });
  }
  $$('[data-fav]').forEach(function (b) {
    b.addEventListener('click', function () {
      var added = toggleFav(b.getAttribute('data-fav'));
      toast(added ? 'Lisätty suosikkeihin' : 'Poistettu suosikeista');
    });
  });

  /* ------------------------------------------------------------ forms (never send) */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  $$('form[data-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, firstBad = null;
      $$('[data-err]', f).forEach(function (x) { x.textContent = ''; });
      $$('input, textarea, select', f).forEach(function (inp) {
        inp.removeAttribute('aria-invalid');
        var need = inp.hasAttribute('required'), v = (inp.value || '').trim(), bad = '';
        if (need && !v) bad = inp.getAttribute('data-msg') || 'Täytä tämä kenttä.';
        else if (inp.type === 'email' && v && !EMAIL.test(v)) bad = 'Tarkista sähköpostiosoite.';
        if (bad) {
          ok = false; inp.setAttribute('aria-invalid', 'true');
          var er = $('[data-err="' + inp.name + '"]', f); if (er) er.textContent = bad;
          if (!firstBad) firstBad = inp;
        }
      });
      var out = $('[data-form-msg]', f);
      if (!ok) { out.textContent = ''; firstBad.focus(); return; }
      out.textContent = '';
      setTimeout(function () { out.textContent = 'Lomake ei ole käytössä tällä sivustolla. Ota yhteyttä puhelimitse tai sähköpostilla.'; }, 60);
    });
  });

  /* ------------------------------------------------------------ reveals */
  var items = $$('.reveal-img, [data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (x) { x.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { var t = en.target; io.unobserve(t); whenReady(t, function () { t.classList.add('is-in'); }); }
      });
    }, { rootMargin: '0px 0px 15% 0px', threshold: 0 });
    items.forEach(function (x) { io.observe(x); });
  }

  renderCounts(); renderCart(); renderFavs(); syncFavButtons();
})();
