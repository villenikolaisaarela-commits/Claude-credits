// Reveal-on-scroll, Finnish local time and current year. No dependencies.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Inertia scrolling (Lenis, MIT). Native scroll events still fire, so the rest works unchanged.
  if (!reduce && window.Lenis) {
    var lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 0.9, anchors: { offset: -64 } });
    var raf = function (time) { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  var items = document.querySelectorAll('[data-reveal]');

  // Start an image reveal only when its images are loaded and decoded, so it never wipes over an empty frame.
  var whenReady = function (el, cb) {
    var imgs = [].slice.call(el.querySelectorAll('img'));
    var done = false, go = function () { if (!done) { done = true; requestAnimationFrame(cb); } };
    if (!imgs.length || !window.Promise) return go();
    Promise.all(imgs.map(function (i) {
      if (i.loading === 'lazy') i.loading = 'eager';
      var loaded = (i.complete && i.naturalWidth) ? Promise.resolve() : new Promise(function (r) { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); });
      return loaded.then(function () { return i.decode ? i.decode().catch(function () {}) : null; });
    })).then(go);
    setTimeout(go, 4000);
  };
  // Fetch images a screen and a half ahead of the scroll, so they are ready when their reveal starts.
  if ('IntersectionObserver' in window) {
    var pre = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.querySelectorAll('img[loading="lazy"]').forEach(function (i) { i.loading = 'eager'; }); pre.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px 150% 0px' });
    items.forEach(function (el) { pre.observe(el); });
  }

  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var t = entry.target;
          io.unobserve(t);
          whenReady(t, function () { t.classList.add('is-in'); });
        }
      });
    }, { rootMargin: '0px 0px 15% 0px', threshold: 0 });
    items.forEach(function (el) { io.observe(el); });
  }

  // Once the photo reveal has played, mark it done so parallax runs without easing lag.
  document.querySelectorAll('.about-photo').forEach(function (fig) {
    var img = fig.querySelector('img');
    if (img) img.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'transform' && fig.classList.contains('is-in')) fig.classList.add('is-done');
    });
  });

  // Gentle scroll parallax: the image drifts inside its frame (max ±6% of frame height).
  var drifting = reduce ? [] : Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (drifting.length) {
    var ticking = false;
    var update = function () {
      var vh = window.innerHeight;
      drifting.forEach(function (img) {
        var frame = img.parentElement.getBoundingClientRect();
        if (frame.bottom < 0 || frame.top > vh) return;
        var progress = (frame.top + frame.height / 2 - vh / 2) / (vh / 2 + frame.height / 2);
        var shift = Math.max(-1, Math.min(1, progress)) * frame.height * 0.06;
        img.style.setProperty('--py', shift.toFixed(1) + 'px');
      });
      ticking = false;
    };
    var onScroll = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  // Hero lines rise once fonts are ready (so the mask never clips a fallback font).
  var markLoaded = function () { document.documentElement.classList.add('is-loaded'); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { requestAnimationFrame(markLoaded); });
  else window.addEventListener('load', markLoaded);
  setTimeout(markLoaded, 1500);

  var clocks = document.querySelectorAll('[data-clock]');
  if (clocks.length) {
    var fmt = new Intl.DateTimeFormat('fi-FI', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Helsinki' });
    var tick = function () { var v = fmt.format(new Date()) + ' Helsinki'; clocks.forEach(function (c) { c.textContent = v; }); };
    tick();
    setInterval(tick, 30000);
  }

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Work cards: play a short muted preview of the site on hover (desktop pointers only).
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.card').forEach(function (card) {
      var video = card.querySelector('.card-video');
      if (!video) return;
      var ready = false;
      card.addEventListener('mouseenter', function () {
        if (!ready) {
          video.querySelectorAll('source').forEach(function (s) { s.src = s.dataset.src; });
          video.load(); ready = true;
        }
        var play = video.play();
        if (play && play.then) play.then(function () { card.classList.add('is-playing'); }).catch(function () {});
        else card.classList.add('is-playing');
      });
      card.addEventListener('mouseleave', function () {
        card.classList.remove('is-playing');
        setTimeout(function () { if (!card.classList.contains('is-playing')) { video.pause(); video.currentTime = 0; } }, 700);
      });
    });
  }
})();

// Project index: on desktop the project image follows the cursor over the list.
(function () {
  var list = document.querySelector('.projects');
  var box = document.querySelector('.proj-preview');
  if (!list || !box || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var imgs = {}, cur = null, built = false;
  var mx = 0, my = 0, x = 0, y = 0, running = false, shown = false;
  var build = function () {
    if (built) return; built = true;
    list.querySelectorAll('.proj').forEach(function (a) {
      var src = a.getAttribute('data-preview');
      if (!src || imgs[src]) return;
      var im = new Image(); im.src = src; im.alt = ''; im.decoding = 'async';
      box.appendChild(im); imgs[src] = im;
    });
  };
  var target = function () {
    var w = box.offsetWidth, h = box.offsetHeight, gap = 28;
    var tx = mx + gap, ty = my - h / 2;
    if (tx + w > window.innerWidth - 16) tx = mx - w - gap;
    ty = Math.max(16, Math.min(ty, window.innerHeight - h - 16));
    return [tx, ty];
  };
  var tick = function () {
    var t = target();
    x += (t[0] - x) * (reduce ? 1 : 0.16); y += (t[1] - y) * (reduce ? 1 : 0.16);
    box.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
    if (shown || Math.abs(t[0] - x) > 0.5 || Math.abs(t[1] - y) > 0.5) requestAnimationFrame(tick); else running = false;
  };
  var run = function () { if (!running) { running = true; requestAnimationFrame(tick); } };
  list.addEventListener('pointerenter', build);
  list.addEventListener('pointermove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (!shown) { var t = target(); x = t[0]; y = t[1]; }
    run();
  });
  list.querySelectorAll('.proj').forEach(function (a) {
    a.addEventListener('pointerenter', function () {
      build();
      var im = imgs[a.getAttribute('data-preview')];
      if (cur && cur !== im) cur.classList.remove('is-cur');
      if (im) { im.classList.add('is-cur'); cur = im; }
      shown = true; box.classList.add('is-on'); run();
    });
  });
  list.addEventListener('pointerleave', function () { shown = false; box.classList.remove('is-on'); });
  window.addEventListener('scroll', function () { if (shown && !list.matches(':hover')) { shown = false; box.classList.remove('is-on'); } }, { passive: true });
})();
