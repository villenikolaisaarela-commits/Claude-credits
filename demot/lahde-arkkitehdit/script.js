/* Lähde Arkkitehdit: vuorovaikutus (vanilla JS, Lenis pehmeään vieritykseen) */
(function () {
  'use strict';

  var d = document;
  var root = d.documentElement;
  window.LAHDE_OK = true;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var easeInOut = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

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
  /* Lopputekstien rivit nousevat yksi kerrallaan: järjestysnumero --k */
  $$('[data-reveal]').forEach(function (block) {
    $$('.rise, .credits > div', block).forEach(function (el, k) {
      if (el.matches('.credits > div')) {
        Array.prototype.forEach.call(el.children, function (c) { c.style.setProperty('--k', k); });
      } else {
        el.style.setProperty('--k', k);
      }
    });
  });

  var revealEls = $$('.reveal, [data-reveal]');
  var heroEls = revealEls.filter(function (el) { return el.closest('.hero'); });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { if (heroEls.indexOf(el) === -1) io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ------------------------------------------------------------------
     Sivu valmis: alkuteksti ja hero-elementit esiin
     ------------------------------------------------------------------ */
  function ready() {
    root.classList.add('is-ready');
    heroEls.forEach(function (el) { el.classList.add('is-in'); });
  }
  requestAnimationFrame(ready);

  /* ------------------------------------------------------------------
     Smooth scroll (Lenis)
     ------------------------------------------------------------------ */
  var lenis = null;
  if (!reduce && typeof window.Lenis === 'function') {
    try {
      lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 0.95, autoRaf: false });
    } catch (err) { lenis = null; }
  }

  /* ------------------------------------------------------------------
     Header state
     ------------------------------------------------------------------ */
  var header = $('[data-header]');
  var lastY = window.scrollY;
  var menuOpen = false;

  var isHome = d.body.classList.contains('is-home');
  function updateHeader(y, vh) {
    if (isHome) root.classList.toggle('film-top', y < vh * 0.55);
    header.classList.toggle('is-scrolled', y > 40);
    if (!menuOpen) {
      if (y > lastY + 6 && y > vh * 0.9) header.classList.add('is-hidden');
      else if (y < lastY - 6 || y < vh * 0.5) header.classList.remove('is-hidden');
    }
    lastY = y;
  }
  header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });

  /* ------------------------------------------------------------------
     Scroll-linked effects
     ------------------------------------------------------------------ */
  var heroImg = $('[data-hero-img]');
  var parallax = reduce ? [] : $$('[data-parallax]').map(function (el) {
    var s = parseFloat(el.getAttribute('data-parallax')) || 0.1;
    el.style.setProperty('--ps', (1 + s * 2).toFixed(3));
    return { el: el, frame: el.parentElement, s: s };
  });

  var aperture = $('[data-aperture]');
  var apClip = $('[data-aperture-clip]');
  var apImg = $('[data-aperture-img]');
  var apCap = $('[data-aperture-caption]');
  var chapters = $$('[data-chapter]').map(function (el) {
    return { el: el, bar: $('[data-chapter-bar]', el) };
  });

  /* Etusivu: kuva himmenee mustaan, kun se vierii pois (kuin elokuvan häivytys) */
  var fades = reduce ? [] : $$('[data-fadeout]').map(function (el) {
    return { el: el, box: el.closest('[data-shot], [data-opening]') || el };
  });

  function updateScroll() {
    var y = window.scrollY;
    var vh = window.innerHeight;
    var vw = window.innerWidth;

    updateHeader(y, vh);
    if (reduce) return;

    for (var f = 0; f < fades.length; f++) {
      var fr = fades[f].box.getBoundingClientRect();
      if (fr.bottom < -60 || fr.top > vh) continue;
      var off = vh / 2 - (fr.top + fr.height / 2);
      var o = off > 0 ? 1 - clamp(off / (vh * 0.62), 0, 1) * 0.92 : 1;
      fades[f].el.style.opacity = o.toFixed(3);
    }

    if (heroImg && y < vh * 1.3) {
      heroImg.style.transform = 'translate3d(0,' + (y * 0.3).toFixed(1) + 'px,0)';
    }

    for (var i = 0; i < parallax.length; i++) {
      var p = parallax[i];
      var r = p.frame.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) continue;
      var prog = clamp(((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
      p.el.style.setProperty('--py', (-prog * p.s * r.height).toFixed(1) + 'px');
    }

    if (aperture) {
      var ar = aperture.getBoundingClientRect();
      if (ar.bottom > -50 && ar.top < vh + 50) {
        var total = Math.max(1, ar.height - vh);
        var ap = clamp(-ar.top / total, 0, 1);
        var e = easeInOut(clamp(ap / 0.72, 0, 1));
        var small = vw < 768, mid = vw < 1024;
        var it = lerp(small ? 24 : mid ? 20 : 16, 0, e);
        var il = lerp(small ? 6 : mid ? 10 : 30, 0, e);
        apClip.style.clipPath = 'inset(' + it.toFixed(2) + '% ' + il.toFixed(2) + '% ' + it.toFixed(2) + '% ' + il.toFixed(2) + '%)';
        apImg.style.transform = 'scale(' + lerp(1.28, 1, e).toFixed(4) + ')';
        var c = clamp((ap - 0.66) / 0.2, 0, 1);
        apCap.style.opacity = c.toFixed(3);
        apCap.style.transform = 'translate3d(0,' + ((1 - c) * 30).toFixed(1) + 'px,0)';
      }
    }

    if (vw >= 1024) {
      for (var k = 0; k < chapters.length; k++) {
        var ch = chapters[k];
        var cr = ch.el.getBoundingClientRect();
        var cp = clamp((vh * 0.2 - cr.top) / Math.max(1, cr.height - vh * 0.5), 0, 1);
        ch.bar.style.setProperty('--p', cp.toFixed(3));
      }
    }
  }

  /* ------------------------------------------------------------------
     Kohteet: lista / ruudukko + leijuva esikatselu
     ------------------------------------------------------------------ */
  var work = $('.work');
  var index = $('[data-index]');
  var toggle = $('[data-view-toggle]');
  var preview = $('[data-preview]');
  var pFrame = $('[data-preview-frame]');
  var pTag = $('[data-preview-tag]');
  var entries = index ? $$('.entry', index) : [];
  var pImgs = null;
  var pVisible = false;
  var pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  var pos = { x: pointer.x, y: pointer.y };
  var rot = 0;

  function hidePreview() {
    pVisible = false;
    if (preview) preview.classList.remove('is-on');
  }

  if (work && index && toggle && preview) {
    var mqList = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
    var userView = null;
    try { userView = window.localStorage.getItem('lahde-view'); } catch (err) { userView = null; }

    var setView = function (v) {
      work.classList.toggle('is-list', v === 'list');
      $$('button', toggle).forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-view') === v));
      });
      if (v !== 'list') hidePreview();
    };
    var applyView = function () {
      if (mqList.matches) {
        toggle.hidden = false;
        setView(userView === 'grid' ? 'grid' : 'list');
      } else {
        toggle.hidden = true;
        setView('grid');
      }
    };
    toggle.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      userView = b.getAttribute('data-view');
      try { window.localStorage.setItem('lahde-view', userView); } catch (err) { /* ei haittaa */ }
      setView(userView);
    });
    if (mqList.addEventListener) mqList.addEventListener('change', applyView);
    applyView();

    var buildPreview = function () {
      if (pImgs) return;
      pImgs = entries.map(function (en) {
        var src = $('img', en);
        var im = new Image();
        im.decoding = 'async';
        im.alt = '';
        im.src = src.currentSrc || src.getAttribute('src');
        pFrame.appendChild(im);
        return im;
      });
    };
    var showPreview = function (i) {
      if (!work.classList.contains('is-list')) return;
      buildPreview();
      if (!pVisible) { pos.x = pointer.x; pos.y = pointer.y; }
      pVisible = true;
      preview.classList.add('is-on');
      pImgs.forEach(function (im, j) { im.classList.toggle('is-active', j === i); });
      var place = $('.entry__place', entries[i]);
      var name = $('.entry__name', entries[i]);
      pTag.textContent = (name ? name.textContent.trim() : '') + (place ? ', ' + place.textContent.replace(/^Sijainti:\s*/, '').trim() : '');
    };
    entries.forEach(function (en, i) {
      en.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') showPreview(i); });
      var link = $('a', en);
      if (link) {
        link.addEventListener('focus', function () {
          if (!work.classList.contains('is-list')) return;
          var r = en.getBoundingClientRect();
          pointer.x = r.left + r.width * 0.55; pointer.y = r.top + r.height / 2;
          showPreview(i);
        });
        link.addEventListener('blur', hidePreview);
      }
    });
    index.addEventListener('pointerleave', hidePreview);
    window.addEventListener('pointermove', function (e) { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
  }

  function updatePreview() {
    if (!preview) return;
    if (!pVisible && !preview.classList.contains('is-on')) return;
    var w = preview.offsetWidth;
    var h = preview.offsetHeight;
    var vw = window.innerWidth;
    var tx = pointer.x + 36;
    if (tx + w > vw - 16) tx = pointer.x - w - 36;
    var ty = clamp(pointer.y - h * 0.55, 12, window.innerHeight - h - 12);
    var k = reduce ? 1 : 0.14;
    var dx = tx - pos.x;
    pos.x += dx * k;
    pos.y += (ty - pos.y) * k;
    rot = lerp(rot, clamp(dx * 0.02, -5, 5), 0.12);
    preview.style.transform = 'translate3d(' + pos.x.toFixed(1) + 'px,' + pos.y.toFixed(1) + 'px,0) rotate(' + (reduce ? 0 : rot).toFixed(2) + 'deg)';
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
    closeTimer = setTimeout(function () { if (!menuOpen) menu.hidden = true; }, 700);
    if (returnFocus) menuBtn.focus();
  }
  if (menuBtn && menu) {
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
    window.addEventListener('resize', function () { if (window.innerWidth >= 1024) closeMenu(false); });
  }

  /* ------------------------------------------------------------------
     Sivun sisäiset ankkurit (pehmeä vieritys, fokus)
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
      lenis.scrollTo(target || 0, { duration: 1.5, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
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
     Yhteydenottolomake: ei lähetä mitään (konsepti)
     ------------------------------------------------------------------ */
  $$('[data-concept-form]').forEach(function (form) {
    var status = $('[data-form-status]', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!status) return;
      status.hidden = false;
      status.textContent = 'Tämä on konseptisivusto, joten viestiä ei lähetetty eikä mitään tietoja tallennettu. Oikealle toimistolle kirjoittaisit osoitteeseen toimisto@lahde-arkkitehdit.example.';
    });
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
    updatePreview();
    requestAnimationFrame(frame);
  }
  updateScroll();
  requestAnimationFrame(frame);
})();
