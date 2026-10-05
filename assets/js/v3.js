// Version 3: smooth scroll, Helsinki clock, menu state, cursor image over the index.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  if (!reduce && window.Lenis) {
    var lenis = new window.Lenis({ lerp: 0.1, anchors: { offset: -90 } });
    var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  var loaded = function () { root.classList.add('is-loaded'); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { requestAnimationFrame(loaded); });
  setTimeout(loaded, 1200);

  var clock = document.querySelector('[data-clock]');
  if (clock) {
    var t = new Intl.DateTimeFormat('fi-FI', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Helsinki' });
    var d = new Intl.DateTimeFormat('fi-FI', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Helsinki' });
    var tick = function () { var n = new Date(); clock.innerHTML = t.format(n) + ' Helsinki<br>' + d.format(n); };
    tick(); setInterval(tick, 30000);
  }
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Menu: mark the section in view
  var links = [].slice.call(document.querySelectorAll('.menu a'));
  if ('IntersectionObserver' in window && links.length) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('is-cur', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) io.observe(s); });
  }

  // Index: the project image follows the cursor (fine pointers only)
  var list = document.querySelector('.index'), box = document.querySelector('.preview');
  if (!list || !box || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var imgs = {}, cur = null, built = false, mx = 0, my = 0, x = 0, y = 0, running = false, shown = false;
  var build = function () {
    if (built) return; built = true;
    list.querySelectorAll('[data-preview]').forEach(function (a) {
      var src = a.getAttribute('data-preview'); if (imgs[src]) return;
      var im = new Image(); im.src = src; im.alt = ''; im.decoding = 'async'; box.appendChild(im); imgs[src] = im;
    });
  };
  var target = function () {
    var w = box.offsetWidth, h = box.offsetHeight, gap = 24, tx = mx + gap, ty = my - h / 2;
    if (tx + w > innerWidth - 16) tx = mx - w - gap;
    return [tx, Math.max(16, Math.min(ty, innerHeight - h - 16))];
  };
  var tick2 = function () {
    var p = target(), k = reduce ? 1 : 0.18;
    x += (p[0] - x) * k; y += (p[1] - y) * k;
    box.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
    if (shown || Math.abs(p[0] - x) > 0.5 || Math.abs(p[1] - y) > 0.5) requestAnimationFrame(tick2); else running = false;
  };
  var run = function () { if (!running) { running = true; requestAnimationFrame(tick2); } };
  list.addEventListener('pointerenter', build);
  list.addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; if (!shown) { var p = target(); x = p[0]; y = p[1]; } run(); });
  list.querySelectorAll('[data-preview]').forEach(function (a) {
    a.addEventListener('pointerenter', function () {
      build(); var im = imgs[a.getAttribute('data-preview')];
      if (cur && cur !== im) cur.classList.remove('is-cur');
      if (im) { im.classList.add('is-cur'); cur = im; }
      shown = true; box.classList.add('is-on'); run();
    });
  });
  list.addEventListener('pointerleave', function () { shown = false; box.classList.remove('is-on'); });
})();
