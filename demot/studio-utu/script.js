/* Studio Utu — interactions (vanilla JS, Lenis for smooth scroll) */
(function () {
  'use strict';

  var d = document;
  var root = d.documentElement;
  window.UTU_OK = true;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var easeInOut = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  /* ------------------------------------------------------------------
     Split headings into word masks, statements into fading words
     ------------------------------------------------------------------ */
  function split(el, cls, counter) {
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        var parts = node.textContent.split(/(\s+)/);
        var frag = d.createDocumentFragment();
        parts.forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(d.createTextNode(' ')); return; }
          var w = d.createElement('span');
          w.className = cls;
          if (cls === 'w') {
            var wi = d.createElement('span');
            wi.className = 'wi';
            wi.textContent = part;
            wi.style.setProperty('--i', counter.i++);
            w.appendChild(wi);
          } else {
            w.textContent = part;
            w.style.setProperty('--i', counter.i++);
          }
          frag.appendChild(w);
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && !/^(SUP|BR)$/.test(node.tagName)) {
        split(node, cls, counter);
      }
    });
  }
  $$('[data-split]').forEach(function (el) { split(el, 'w', { i: 0 }); });
  $$('[data-fill]').forEach(function (el) { split(el, 'fw', { i: 0 }); });

  /* ------------------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------------------ */
  var revealEls = $$('.reveal, .reveal-img, [data-split]');
  var heroEls = revealEls.filter(function (el) { return el.closest('.hero'); });
  var io = null;
  if ('IntersectionObserver' in window && !reduce) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { if (heroEls.indexOf(el) === -1) io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Hero sequence once the first frame is painted */
  function ready() {
    root.classList.add('is-ready');
    heroEls.forEach(function (el) { el.classList.add('is-in'); });
  }
  if (reduce) ready();
  else requestAnimationFrame(function () { requestAnimationFrame(function () { setTimeout(ready, 60); }); });

  /* ------------------------------------------------------------------
     Smooth scroll (Lenis)
     ------------------------------------------------------------------ */
  var lenis = null;
  if (!reduce && typeof window.Lenis === 'function') {
    try {
      lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9, autoRaf: false });
    } catch (err) { lenis = null; }
  }

  /* ------------------------------------------------------------------
     Header
     ------------------------------------------------------------------ */
  var header = $('[data-header]');
  var lastY = window.scrollY;
  var menuOpen = false;
  function updateHeader(y, vh) {
    header.classList.toggle('is-scrolled', y > 30);
    if (!menuOpen) {
      if (y > lastY + 6 && y > vh * 0.8) header.classList.add('is-hidden');
      else if (y < lastY - 6 || y < vh * 0.4) header.classList.remove('is-hidden');
    }
    lastY = y;
  }
  header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });

  /* Current section in nav */
  var navLinks = $$('[data-nav]');
  var navTargets = navLinks.map(function (a) { return d.getElementById(a.getAttribute('href').slice(1)); });
  function updateNav(vh) {
    var current = -1;
    for (var i = 0; i < navTargets.length; i++) {
      var t = navTargets[i];
      if (!t) continue;
      var r = t.getBoundingClientRect();
      if (r.top < vh * 0.45 && r.bottom > vh * 0.45) current = i;
    }
    navLinks.forEach(function (a, i) {
      a.classList.toggle('is-current', i === current);
      if (i === current) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }

  /* ------------------------------------------------------------------
     Scroll-linked effects
     ------------------------------------------------------------------ */
  var parallax = reduce ? [] : $$('[data-parallax]').map(function (el) {
    var s = parseFloat(el.getAttribute('data-parallax')) || 0.1;
    el.style.setProperty('--ps', (1 + s * 1.6).toFixed(3));
    return { el: el, frame: el.parentElement, s: s };
  });
  var heroImg = $('[data-hero-img]');

  var win = $('[data-window]');
  var winClip = $('[data-window-clip]');
  var winImg = $('[data-window-img]');
  var winCap = $('[data-window-caption]');
  var winShade = $('[data-window-shade]');

  var steps = $('[data-steps]');
  var stepsLine = $('[data-steps-line]');

  function updateScroll() {
    var y = window.scrollY;
    var vh = window.innerHeight;
    var vw = window.innerWidth;

    updateHeader(y, vh);
    updateNav(vh);
    if (reduce) return;

    if (heroImg && y < vh * 1.4) {
      heroImg.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0)';
    }

    for (var i = 0; i < parallax.length; i++) {
      var p = parallax[i];
      var r = p.frame.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      var prog = clamp(((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
      p.el.style.setProperty('--py', (prog * p.s * r.height).toFixed(1) + 'px');
    }

    if (win) {
      var wr = win.getBoundingClientRect();
      if (wr.bottom > -50 && wr.top < vh + 50) {
        var wp = clamp((vh - wr.top) / (vh * 0.5 + wr.height * 0.75), 0, 1);
        var e = easeInOut(clamp(wp / 0.75, 0, 1));
        var small = vw < 768;
        var it = lerp(small ? 12 : 12, 0, e);
        var il = lerp(small ? 10 : 31, 0, e);
        var rad = lerp(small ? 160 : 420, 0, e);
        winClip.style.clipPath = 'inset(' + it.toFixed(2) + '% ' + il.toFixed(2) + '% ' + it.toFixed(2) + '% ' + il.toFixed(2) + '% round ' + rad.toFixed(0) + 'px ' + rad.toFixed(0) + 'px 0 0)';
        winImg.style.transform = 'scale(' + lerp(1.22, 1, e).toFixed(4) + ')';
        var c = clamp((wp - 0.7) / 0.22, 0, 1);
        winCap.style.opacity = c.toFixed(3);
        winCap.style.transform = 'translate3d(0,' + ((1 - c) * 24).toFixed(1) + 'px,0)';
        winShade.style.opacity = c.toFixed(3);
      }
    }

    if (steps && stepsLine) {
      var sr = steps.getBoundingClientRect();
      var sp = clamp((vh * 0.85 - sr.top) / (sr.height + vh * 0.25), 0, 1);
      stepsLine.style.setProperty('--p', sp.toFixed(3));
    }
  }
  if (!reduce && stepsLine) stepsLine.style.setProperty('--p', '0');

  /* ------------------------------------------------------------------
     Project filter (keeps the asymmetric layout for any subset)
     ------------------------------------------------------------------ */
  var filters = $('[data-filters]');
  var projects = $$('[data-projects] .project');
  var filterStatus = $('[data-filter-status]');
  var filtering = false;

  function applySlots() {
    var n = 0;
    projects.forEach(function (p) {
      for (var s = 1; s <= 6; s++) p.classList.remove('slot-' + s);
      if (!p.hidden) { p.classList.add('slot-' + ((n % 6) + 1)); n++; }
    });
    return n;
  }
  function setFilter(type, label) {
    if (filtering) return;
    filtering = true;
    var visible = projects.filter(function (p) { return !p.hidden; });
    visible.forEach(function (p) { p.classList.add('is-leaving'); });
    setTimeout(function () {
      projects.forEach(function (p) {
        p.hidden = !(type === 'kaikki' || p.getAttribute('data-type') === type);
        p.classList.add('is-leaving');
      });
      var count = applySlots();
      if (filterStatus) filterStatus.textContent = label + ': ' + count + (count === 1 ? ' työ' : ' työtä');
      var shown = projects.filter(function (p) { return !p.hidden; });
      shown.forEach(function (p) {
        $$('.reveal-img', p).forEach(function (r) { r.classList.add('is-in'); });
      });
      requestAnimationFrame(function () {
        shown.forEach(function (p, i) {
          setTimeout(function () { p.classList.remove('is-leaving'); }, reduce ? 0 : i * 90);
        });
        filtering = false;
      });
    }, reduce ? 0 : 420);
  }
  if (filters) {
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-filter]');
      if (!b || b.getAttribute('aria-pressed') === 'true') return;
      $$('button', filters).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      setFilter(b.getAttribute('data-filter'), b.firstChild.textContent.trim());
    });
  }

  /* ------------------------------------------------------------------
     Moodboard: build your own palette
     ------------------------------------------------------------------ */
  var palette = $('[data-palette]');
  var swatches = $$('[data-swatch]');
  var picked = [];
  function renderPalette() {
    palette.innerHTML = '';
    if (!picked.length) {
      var em = d.createElement('p');
      em.className = 'palette__empty';
      em.innerHTML = '<span class="palette__slots" aria-hidden="true"><i></i><i></i><i></i><i></i></span>Paletti on vielä tyhjä.';
      palette.appendChild(em);
      return;
    }
    picked.forEach(function (sw) {
      var chip = d.createElement('span');
      chip.className = 'palette__chip';
      var dot = d.createElement('i');
      dot.style.setProperty('--c', sw.getAttribute('data-color'));
      chip.appendChild(dot);
      chip.appendChild(d.createTextNode(sw.getAttribute('data-swatch')));
      palette.appendChild(chip);
    });
  }
  swatches.forEach(function (sw) {
    sw.addEventListener('click', function () {
      var idx = picked.indexOf(sw);
      if (idx > -1) {
        picked.splice(idx, 1);
        sw.setAttribute('aria-pressed', 'false');
      } else {
        if (picked.length >= 4) {
          var old = picked.shift();
          old.setAttribute('aria-pressed', 'false');
        }
        picked.push(sw);
        sw.setAttribute('aria-pressed', 'true');
      }
      renderPalette();
    });
  });

  /* ------------------------------------------------------------------
     Concept form
     ------------------------------------------------------------------ */
  var form = $('[data-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = $('[data-form-status]', form);
      var name = (form.elements.nimi.value || '').trim();
      status.textContent = (name ? 'Kiitos, ' + name.split(' ')[0] + '. ' : 'Kiitos. ') + 'Tämä on konseptisivu, joten viestiä ei lähetetty.';
    });
  }

  /* ------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------ */
  var menuBtn = $('[data-menu-toggle]');
  var menu = $('[data-menu]');
  var menuLabel = $('[data-menu-label]');
  var closeTimer = null;
  function openMenu() {
    menuOpen = true;
    clearTimeout(closeTimer);
    menu.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add('is-open'); }); });
    menuBtn.setAttribute('aria-expanded', 'true');
    menuLabel.textContent = 'Sulje';
    header.classList.remove('is-hidden');
    header.classList.add('is-menu');
    root.classList.add('menu-open');
    if (lenis) lenis.stop();
    var first = $('a', menu);
    if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 80);
  }
  function closeMenu(returnFocus) {
    if (!menuOpen) return;
    menuOpen = false;
    menu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuLabel.textContent = 'Valikko';
    header.classList.remove('is-menu');
    root.classList.remove('menu-open');
    if (lenis) lenis.start();
    closeTimer = setTimeout(function () { if (!menuOpen) menu.hidden = true; }, 900);
    if (returnFocus) menuBtn.focus();
  }
  menuBtn.addEventListener('click', function () { if (menuOpen) closeMenu(false); else openMenu(); });
  d.addEventListener('keydown', function (e) {
    if (!menuOpen) return;
    if (e.key === 'Escape') { closeMenu(true); return; }
    if (e.key === 'Tab') {
      var items = [menuBtn].concat($$('a', menu));
      var idx = items.indexOf(d.activeElement);
      if (e.shiftKey && idx <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && idx === items.length - 1) { e.preventDefault(); items[0].focus(); }
    }
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 1180) closeMenu(false); });

  /* ------------------------------------------------------------------
     In-page anchors (smooth, with focus management)
     ------------------------------------------------------------------ */
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var target = id === '#top' ? null : d.getElementById(id.slice(1));
    if (id !== '#top' && !target) return;
    e.preventDefault();
    closeMenu(false);
    if (lenis) {
      lenis.scrollTo(target || 0, { offset: target ? -10 : 0, duration: 1.6, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
    } else if (target) {
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (target) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
    if (history.replaceState) history.replaceState(null, '', id === '#top' ? location.pathname : id);
  });

  /* ------------------------------------------------------------------
     Main loop
     ------------------------------------------------------------------ */
  var lastScroll = -1, lastW = -1, lastH = -1;
  function frame(t) {
    if (lenis) lenis.raf(t);
    var y = window.scrollY;
    if (y !== lastScroll || window.innerWidth !== lastW || window.innerHeight !== lastH) {
      lastScroll = y; lastW = window.innerWidth; lastH = window.innerHeight;
      updateScroll();
    }
    requestAnimationFrame(frame);
  }
  updateScroll();
  requestAnimationFrame(frame);
})();
