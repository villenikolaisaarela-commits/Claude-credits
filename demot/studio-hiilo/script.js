/* Studio Hiilo — konsepti */
(function () {
  'use strict';
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


  function store(key, val) {
    try {
      if (val === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, val);
    } catch (e) { return null; }
    return null;
  }

  /* mobile menu */
  var header = document.querySelector('.site-header');
  var btn = document.querySelector('.menu-btn');
  if (header && btn) {
    var setMenu = function (open) {
      header.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'Sulje' : 'Valikko';
      document.body.classList.toggle('no-scroll', open);
    };
    btn.addEventListener('click', function () { setMenu(!header.classList.contains('menu-open')); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('menu-open')) { setMenu(false); btn.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 760) setMenu(false); });
  }

  /* reveal */
  var items = [].slice.call(document.querySelectorAll('[data-reveal], .reveal'));
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { var t = en.target; io.unobserve(t); whenReady(t, function () { t.classList.add('is-in'); }); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* room: the drawing is the navigation */
  var room = document.querySelector('.room');
  if (room) {
    requestAnimationFrame(function () { requestAnimationFrame(function () { room.classList.add('is-in'); }); });
    var frame = room.parentNode;
    var center = function () { if (frame.scrollWidth > frame.clientWidth + 4) frame.scrollLeft = (frame.scrollWidth - frame.clientWidth) / 2; };
    center();
    window.addEventListener('load', center);
    var cone = room.querySelector('.cone');
    var hot = function (key, on) {
      var a = room.querySelector('.o-' + key);
      var li = document.querySelector('.room-menu [data-key="' + key + '"]');
      if (a) a.classList.toggle('is-hot', on);
      if (li) li.classList.toggle('is-hot', on);
      room.classList.toggle('has-hot', on);
      if (cone && key === 'vako') cone.classList.toggle('on', on);
    };
    [].forEach.call(document.querySelectorAll('.room-menu [data-key]'), function (el) {
      var k = el.getAttribute('data-key');
      el.addEventListener('mouseenter', function () { hot(k, true); });
      el.addEventListener('mouseleave', function () { hot(k, false); });
      el.addEventListener('focus', function () { hot(k, true); });
      el.addEventListener('blur', function () { hot(k, false); });
    });
    [].forEach.call(room.querySelectorAll('a[data-key]'), function (el) {
      var k = el.getAttribute('data-key');
      var li = document.querySelector('.room-menu [data-key="' + k + '"]');
      var on = function () { if (li) li.classList.add('is-hot'); };
      var off = function () { if (li) li.classList.remove('is-hot'); };
      el.addEventListener('mouseenter', on);
      el.addEventListener('mouseleave', off);
      el.addEventListener('focus', on);
      el.addEventListener('blur', off);
    });
  }

  /* products: list / grid view and deep links */
  var index = document.querySelector('.pindex');
  if (index) {
    var buttons = [].slice.call(document.querySelectorAll('.toggle [data-view]'));
    var setView = function (v, save) {
      index.classList.toggle('view-grid', v === 'grid');
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-view') === v ? 'true' : 'false'); });
      if (save) store('hiilo-view', v);
    };
    buttons.forEach(function (b) { b.addEventListener('click', function () { setView(b.getAttribute('data-view'), true); }); });
    var saved = store('hiilo-view');
    if (saved === 'grid' && !location.hash) setView('grid', false);

    var openHash = function () {
      var id = decodeURIComponent(location.hash.slice(1));
      if (!id) return;
      var row = document.getElementById(id);
      if (row && row.tagName === 'DETAILS') {
        setView('list', false);
        row.open = true;
        setTimeout(function () { row.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); row.querySelector('summary').focus({ preventScroll: true }); }, 60);
      }
    };
    openHash();
    window.addEventListener('hashchange', openHash);

    /* hover preview that follows the cursor (fine pointers only) */
    if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var prev = document.createElement('div');
      prev.className = 'hover-prev';
      prev.setAttribute('aria-hidden', 'true');
      var pimg = document.createElement('img');
      pimg.alt = '';
      prev.appendChild(pimg);
      document.body.appendChild(prev);
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, shown = false;
      var loop = function () {
        cx += (tx - cx) * (reduce ? 1 : 0.16);
        cy += (ty - cy) * (reduce ? 1 : 0.16);
        prev.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)';
        raf = shown ? requestAnimationFrame(loop) : 0;
      };
      [].forEach.call(index.querySelectorAll('.row'), function (row) {
        var sum = row.querySelector('summary');
        sum.addEventListener('mouseenter', function (e) {
          if (row.open) return;
          pimg.src = row.getAttribute('data-thumb');
          tx = cx = e.clientX + 28; ty = cy = e.clientY - 125;
          shown = true; prev.classList.add('on');
          if (!raf) raf = requestAnimationFrame(loop);
        });
        sum.addEventListener('mousemove', function (e) { tx = e.clientX + 28; ty = e.clientY - 125; });
        var hide = function () { shown = false; prev.classList.remove('on'); };
        sum.addEventListener('mouseleave', hide);
        sum.addEventListener('click', hide);
      });
    }
  }

  /* product page: studio shot / in use */
  var shots = document.querySelector('.shots');
  if (shots) {
    var figs = [].slice.call(shots.querySelectorAll('figure'));
    var sbtn = [].slice.call(document.querySelectorAll('.media-bar [data-shot]'));
    var show = function (i) {
      figs.forEach(function (f, j) { f.classList.toggle('on', j === i); f.setAttribute('aria-hidden', j === i ? 'false' : 'true'); });
      sbtn.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
    };
    sbtn.forEach(function (b, i) { b.addEventListener('click', function () { show(i); }); });
    show(0);
  }

  /* forms never send */
  [].forEach.call(document.querySelectorAll('form[data-concept]'), function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var s = f.querySelector('.status');
      if (s) s.textContent = 'Kiitos. Tämä on konseptisivusto, joten viestiä ei lähetetty eikä tallennettu.';
    });
  });
})();
