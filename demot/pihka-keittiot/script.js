/* Pihka Keittiöt — interactions (vanilla JS, Lenis for smooth scroll) */
(function () {
  'use strict';

  var d = document;
  var root = d.documentElement;
  window.PIHKA_OK = true;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ------------------------------------------------------------------
     Split text into word masks
     ------------------------------------------------------------------ */
  function split(el, cls, counter) {
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        var parts = node.textContent.split(/(\s+)/);
        var frag = d.createDocumentFragment();
        parts.forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(d.createTextNode(part)); return; }
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
      } else if (node.nodeType === 1 && !/^(SUP|BR|SVG)$/i.test(node.tagName)) {
        split(node, cls, counter);
      }
    });
  }
  $$('[data-split]').forEach(function (el) { split(el, 'w', { i: 0 }); });
  $$('[data-fill]').forEach(function (el) { split(el, 'fw', { i: 0 }); });

  /* ------------------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------------------ */
  var revealEls = $$('.reveal, .reveal-img');
  var heroEls = revealEls.filter(function (el) { return el.closest('.hero'); });

  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { if (heroEls.indexOf(el) === -1) io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Hero plays once the display font is ready (or after a short timeout).
  var heroPlayed = false;
  function playHero() {
    if (heroPlayed) return;
    heroPlayed = true;
    root.classList.add('is-ready');
    heroEls.forEach(function (el) { el.classList.add('is-in'); });
  }
  if (reduce) {
    playHero();
  } else {
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { requestAnimationFrame(playHero); });
    setTimeout(playHero, 700);
  }

  /* ------------------------------------------------------------------
     Smooth scroll (Lenis)
     ------------------------------------------------------------------ */
  var lenis = null;
  if (!reduce && typeof window.Lenis === 'function') {
    try {
      lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9, autoRaf: false });
    } catch (err) { lenis = null; }
  }

  /* ------------------------------------------------------------------
     Header state
     ------------------------------------------------------------------ */
  var header = $('[data-header]');
  var darkSections = $$('[data-theme="dark"]');
  var lastY = window.scrollY;
  var menuOpen = false;

  function updateHeader(y, vh) {
    var probe = 34;
    var dark = false;
    for (var i = 0; i < darkSections.length; i++) {
      var r = darkSections[i].getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) { dark = true; break; }
    }
    header.classList.toggle('is-dark', dark);
    header.classList.toggle('is-scrolled', y > 40);
    if (!menuOpen) {
      if (y > lastY + 6 && y > vh * 0.8) header.classList.add('is-hidden');
      else if (y < lastY - 6 || y < vh * 0.4) header.classList.remove('is-hidden');
    }
    lastY = y;
  }
  header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });

  /* ------------------------------------------------------------------
     Scroll-linked effects: parallax + process progress
     ------------------------------------------------------------------ */
  var parallax = reduce ? [] : $$('[data-parallax]').map(function (el) {
    var s = parseFloat(el.getAttribute('data-parallax')) || 0.08;
    el.style.setProperty('--ps', (1 + s * 2.2).toFixed(3));
    return { el: el, frame: el.parentElement, s: s };
  });
  var steps = $('[data-steps]');
  var stepsBar = $('[data-steps-bar]');

  function updateScroll() {
    var y = window.scrollY;
    var vh = window.innerHeight;
    updateHeader(y, vh);
    if (reduce) return;

    for (var i = 0; i < parallax.length; i++) {
      var p = parallax[i];
      var r = p.frame.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      var prog = clamp(((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
      p.el.style.setProperty('--py', (-prog * p.s * r.height).toFixed(1) + 'px');
    }

    if (steps && stepsBar) {
      var sr = steps.getBoundingClientRect();
      var sp = clamp((vh * 0.6 - sr.top) / Math.max(1, sr.height), 0, 1);
      stepsBar.style.setProperty('--p', sp.toFixed(3));
    }
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
    header.classList.add('is-menu');
    header.classList.remove('is-hidden');
    root.classList.add('menu-open');
    if (lenis) lenis.stop();
    var first = $('a', menu);
    if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 60);
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
    closeTimer = setTimeout(function () { if (!menuOpen) menu.hidden = true; }, 800);
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
  window.addEventListener('resize', function () { if (window.innerWidth > 1100) closeMenu(false); });

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
      lenis.scrollTo(target || 0, { offset: 0, duration: 1.6, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
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
     Concept form: never sends anything
     ------------------------------------------------------------------ */
  var form = $('[data-form]');
  var status = $('[data-form-status]');
  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (form.elements.nimi && form.elements.nimi.value.trim()) || '';
      status.textContent = (name ? 'Kiitos, ' + name + '. ' : 'Kiitos. ') + 'Tämä on konseptisivu, joten viestiä ei lähetetty.';
    });
  }

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
