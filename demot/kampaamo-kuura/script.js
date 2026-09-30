/* Kampaamo Kuura — riippuvuudeton käyttöliittymäskripti
   Pehmeä vieritys, tekstin ja kuvien esiintulo, kiinnitetyt osiot. */
(function () {
  'use strict';

  var root = document.documentElement;
  var motion = root.classList.contains('motion');
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');
  var main = document.getElementById('sisalto');
  var desktopMQ = window.matchMedia('(min-width: 1024px)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ------------------------------------------------------------------
     Tekstin pilkkominen sanoiksi (säilyttää <em>- ja <br>-elementit)
     ------------------------------------------------------------------ */
  function splitWords(el, wrapClass, innerClass) {
    var index = 0;
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var outer = document.createElement('span');
            outer.className = wrapClass;
            if (innerClass) {
              var inner = document.createElement('span');
              inner.className = innerClass;
              inner.textContent = part;
              inner.style.setProperty('--i', index);
              outer.appendChild(inner);
            } else {
              outer.textContent = part;
            }
            index++;
            frag.appendChild(outer);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    }
    walk(el);
    return index;
  }

  /* ------------------------------------------------------------------
     Mobiilivalikko
     ------------------------------------------------------------------ */
  var menuOpen = false;
  var navLinks = $$('.nav__list a');

  function setMenu(open) {
    if (!header || !toggle) return;
    menuOpen = open;
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.menu-toggle__text').textContent = open ? 'Sulje' : 'Valikko';
    document.body.style.overflow = open ? 'hidden' : '';
    if (main) {
      if (open) main.setAttribute('inert', '');
      else main.removeAttribute('inert');
    }
    if (open) header.classList.remove('is-hidden');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setMenu(!menuOpen);
      if (menuOpen && navLinks[0]) setTimeout(function () { navLinks[0].focus({ preventScroll: true }); }, 60);
    });
    document.addEventListener('keydown', function (e) {
      if (!menuOpen) return;
      if (e.key === 'Escape') { setMenu(false); toggle.focus(); return; }
      if (e.key === 'Tab') {
        var items = [document.querySelector('.brand'), toggle].concat(navLinks);
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    var onBp = function (e) { if (e.matches && menuOpen) setMenu(false); };
    if (desktopMQ.addEventListener) desktopMQ.addEventListener('change', onBp);
    else if (desktopMQ.addListener) desktopMQ.addListener(onBp);
  }

  /* ------------------------------------------------------------------
     Pehmeä vieritys (vain hiiri/kosketuslevy, ei vähennetyllä liikkeellä)
     ------------------------------------------------------------------ */
  var smooth = null;
  if (motion && finePointer.matches) {
    smooth = (function () {
      var target = window.scrollY, current = window.scrollY, running = false;
      function maxY() { return document.documentElement.scrollHeight - window.innerHeight; }
      function loop() {
        current = lerp(current, target, 0.1);
        if (Math.abs(target - current) < 0.4) { current = target; running = false; }
        window.scrollTo(0, current);
        if (running) requestAnimationFrame(loop);
      }
      function start() { if (!running) { running = true; requestAnimationFrame(loop); } }
      window.addEventListener('wheel', function (e) {
        if (e.ctrlKey || menuOpen) return;
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        var d = e.deltaY;
        if (e.deltaMode === 1) d *= 36; else if (e.deltaMode === 2) d *= window.innerHeight;
        e.preventDefault();
        if (!running) current = target = window.scrollY;
        target = clamp(target + d, 0, maxY());
        start();
      }, { passive: false });
      window.addEventListener('scroll', function () {
        if (!running) current = target = window.scrollY;
      }, { passive: true });
      ['keydown', 'mousedown', 'touchstart'].forEach(function (type) {
        window.addEventListener(type, function (e) {
          if (type === 'keydown' && ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].indexOf(e.key) < 0) return;
          running = false; current = target = window.scrollY;
        }, { passive: true });
      });
      root.classList.add('smooth');
      return {
        to: function (y) {
          if (!running) current = window.scrollY;
          target = clamp(y, 0, maxY());
          start();
        }
      };
    })();
  }

  /* Ankkurilinkit: pehmeä siirtymä ja kohdistus kohteeseen */
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href').slice(1);
    var el = id ? document.getElementById(id) : null;
    if (!el) return;
    e.preventDefault();
    if (menuOpen) setMenu(false);
    /* Osioiden yläreunassa on reilusti tilaa, joten ylätunniste ei peitä otsikoita. */
    var y = id === 'alku' ? 0 : el.getBoundingClientRect().top + window.scrollY;
    if (smooth) smooth.to(y);
    else window.scrollTo({ top: y, behavior: motion ? 'smooth' : 'auto' });
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  });

  /* ------------------------------------------------------------------
     Kaikki liike vain, jos käyttäjä ei ole pyytänyt vähennettyä liikettä
     ------------------------------------------------------------------ */
  var splitEls = $$('[data-split]');
  var scrubEl = document.querySelector('[data-scrub]');
  var scrubWords = [];

  if (motion) {
    splitEls.forEach(function (el) { splitWords(el, 'w', 'w-i'); });
    if (scrubEl) {
      splitWords(scrubEl, 'sw', null);
      scrubWords = $$('.sw', scrubEl);
    }
    root.classList.add('ready');
  }

  /* Porrastus saman vanhemman data-fade-elementeille */
  $$('[data-fade]').forEach(function (el) {
    var sibs = $$(':scope > [data-fade]', el.parentElement);
    var i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty('--d', Math.min(i, 5) * 110 + 'ms');
  });

  var hero = document.querySelector('.hero');
  var revealTargets = $$('[data-fade], [data-split], [data-clip], .section-index').filter(function (el) {
    return !hero || !hero.contains(el);
  });

  if (!motion || !('IntersectionObserver' in window)) {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
    if (hero) {
      hero.classList.add('is-in');
      $$('[data-fade], [data-split], [data-clip]', hero).forEach(function (el) { el.classList.add('is-in'); });
    }
  } else {
    /* Leikatut (clip-path) elementit eivät näy havainnoijalle, joten
       tarkkaillaan niiden vanhempaa elementtiä. */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var list = entry.target._reveal || [entry.target];
        list.forEach(function (el) { el.classList.add('is-in'); });
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealTargets.forEach(function (el) {
      var watch = el.hasAttribute('data-clip') ? el.parentElement : el;
      if (watch !== el) {
        watch._reveal = watch._reveal || [];
        watch._reveal.push(el);
      }
      io.observe(watch);
    });

    /* Hero paljastuu, kun avausanimaatio väistyy */
    var wait = Math.max(0, 820 - (window.performance ? performance.now() : 0));
    var intro = document.querySelector('.intro');
    if (intro) setTimeout(function () { intro.parentNode.removeChild(intro); }, wait + 700);
    setTimeout(function () {
      if (!hero) return;
      hero.classList.add('is-in');
      $$('[data-split]', hero).forEach(function (el) { el.classList.add('is-in'); });
      $$('[data-clip]', hero).forEach(function (el) { el.classList.add('is-in'); });
      $$('[data-fade]', hero).forEach(function (el, i) {
        el.style.setProperty('--d', 450 + i * 120 + 'ms');
        el.classList.add('is-in');
      });
    }, wait);
  }

  /* ------------------------------------------------------------------
     Palautteet: rauhallinen vaihto
     ------------------------------------------------------------------ */
  var quotesWrap = document.querySelector('[data-quotes]');
  if (quotesWrap) {
    var quotes = $$('.quote', quotesWrap);
    var controls = document.querySelector('.quotes__controls');
    var nowEl = document.querySelector('[data-quote-now]');
    var qi = 0;
    quotesWrap.classList.add('is-slider');
    if (controls) controls.hidden = false;
    var show = function (n) {
      qi = (n + quotes.length) % quotes.length;
      quotes.forEach(function (q, i) {
        q.classList.toggle('is-active', i === qi);
        q.setAttribute('aria-hidden', i === qi ? 'false' : 'true');
      });
      if (nowEl) nowEl.textContent = ('0' + (qi + 1)).slice(-2);
    };
    show(0);
    var prev = document.querySelector('[data-quote-prev]');
    var next = document.querySelector('[data-quote-next]');
    if (prev) prev.addEventListener('click', function () { show(qi - 1); });
    if (next) next.addEventListener('click', function () { show(qi + 1); });
    var sx = null;
    quotesWrap.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    quotesWrap.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 48) show(qi + (dx < 0 ? 1 : -1));
      sx = null;
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     Vierityssidonnaiset tilat (rAF)
     ------------------------------------------------------------------ */
  var sections = $$('main > section[data-label]');
  var labelEl = document.querySelector('[data-section-label]');
  var numbers = { tarina: '01', kasityo: '02', palvelut: '03', tekijat: '04', galleria: '05', sanat: '06' };
  var currentSection = null;

  var parallaxEls = motion ? $$('[data-parallax]') : [];

  var craft = document.querySelector('.craft');
  var steps = craft ? $$('.step', craft) : [];
  var stageImgs = craft ? $$('.craft__frame img', craft) : [];
  var stepNow = document.querySelector('[data-step-now]');
  var activeStep = -1;

  var gallery = document.querySelector('.gallery');
  var gTrack = gallery ? gallery.querySelector('.gallery__track') : null;
  var gBar = gallery ? gallery.querySelector('.gallery__progress span') : null;
  var gDist = 0;

  var finale = document.querySelector('.finale');
  var fMedia = finale ? finale.querySelector('.finale__media') : null;
  var fImg = fMedia ? fMedia.querySelector('img') : null;

  var lastY = window.scrollY;

  function setupLayout() {
    var wide = desktopMQ.matches;
    if (craft) craft.classList.toggle('is-live', motion && wide);

    if (gallery && gTrack) {
      var pin = motion && wide;
      gallery.classList.toggle('is-pinned', pin);
      if (pin) {
        gTrack.style.transform = '';
        gDist = Math.max(0, gTrack.scrollWidth - window.innerWidth);
        gallery.style.height = (gDist + window.innerHeight) + 'px';
      } else {
        gDist = 0;
        gallery.style.height = '';
        gTrack.style.transform = '';
      }
    }

    if (finale) {
      finale.classList.toggle('is-live', motion);
      if (!motion && fMedia) fMedia.style.clipPath = '';
    }
  }

  function setLabel(id, text) {
    if (!labelEl || currentSection === id) return;
    currentSection = id;
    var value = numbers[id] ? numbers[id] + ' — ' + text : (id === 'alku' ? 'Tampere · 61° N' : text);
    if (!motion) { labelEl.textContent = value; return; }
    labelEl.classList.add('is-swapping');
    setTimeout(function () {
      labelEl.textContent = value;
      labelEl.classList.remove('is-swapping');
    }, 260);
  }

  function update() {
    ticking = false;
    var y = window.scrollY;
    var vh = window.innerHeight;
    var vw = window.innerWidth;

    /* Ylätunniste */
    if (header && !menuOpen) {
      header.classList.toggle('is-scrolled', y > 24);
      var goingDown = y > lastY + 2;
      var goingUp = y < lastY - 2;
      if (goingDown && y > vh * 0.6) header.classList.add('is-hidden');
      else if (goingUp || y < vh * 0.6) header.classList.remove('is-hidden');
    }
    lastY = y;

    /* Aktiivinen osio */
    var active = sections[0];
    for (var s = 0; s < sections.length; s++) {
      if (sections[s].getBoundingClientRect().top <= vh * 0.42) active = sections[s];
    }
    if (active) {
      setLabel(active.id, active.getAttribute('data-label'));
      navLinks.forEach(function (a) {
        if (a.getAttribute('href') === '#' + active.id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }

    if (!motion) return;

    /* Parallaksi */
    for (var p = 0; p < parallaxEls.length; p++) {
      var el = parallaxEls[p];
      var box = el.parentElement.getBoundingClientRect();
      if (box.bottom < -100 || box.top > vh + 100) continue;
      var f = parseFloat(el.getAttribute('data-parallax')) || 0;
      var off = (box.top + box.height / 2 - vh / 2) * f;
      var lim = box.height * 0.075;
      el.style.transform = 'translate3d(0,' + clamp(off, -lim, lim).toFixed(2) + 'px,0)';
    }

    /* Manifesti syttyy sana sanalta */
    if (scrubEl && scrubWords.length) {
      var r = scrubEl.getBoundingClientRect();
      var prog = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.3), 0, 1);
      var lit = Math.round(prog * scrubWords.length);
      for (var w = 0; w < scrubWords.length; w++) {
        var on = w < lit;
        if (on !== scrubWords[w]._lit) {
          scrubWords[w]._lit = on;
          scrubWords[w].classList.toggle('is-lit', on);
        }
      }
    }

    /* Käsityö: aktiivinen vaihe ja kuva */
    if (craft && craft.classList.contains('is-live') && steps.length) {
      var idx = 0;
      for (var k = 0; k < steps.length; k++) {
        if (steps[k].getBoundingClientRect().top < vh * 0.55) idx = k;
      }
      if (idx !== activeStep) {
        activeStep = idx;
        steps.forEach(function (st, i) { st.classList.toggle('is-active', i === idx); });
        stageImgs.forEach(function (im, i) { im.classList.toggle('is-active', i === idx); });
        if (stepNow) stepNow.textContent = '0' + (idx + 1);
      }
    }

    /* Galleria: pystyvieritys liikuttaa vaakasuuntaan */
    if (gallery && gallery.classList.contains('is-pinned') && gDist > 0) {
      var gr = gallery.getBoundingClientRect();
      var gp = clamp(-gr.top / gDist, 0, 1);
      gTrack.style.transform = 'translate3d(' + (-gp * gDist).toFixed(1) + 'px,0,0)';
      if (gBar) gBar.style.transform = 'scaleX(' + gp.toFixed(4) + ')';
    }

    /* Lopetus: kaari avautuu koko ruudun kokoiseksi */
    if (finale && fMedia && finale.classList.contains('is-live')) {
      var fr = finale.getBoundingClientRect();
      var span = fr.height - vh;
      var fp = span > 0 ? clamp(-fr.top / span, 0, 1) : 1;
      var e = easeInOut(clamp(fp / 0.62, 0, 1));
      var startW = vw < 768 ? vw * 0.64 : Math.min(vw * 0.3, 440);
      var startH = Math.min(vh * 0.66, startW * 1.36);
      var sideX = (vw - startW) / 2;
      var sideY = (vh - startH) / 2;
      var ix = lerp(sideX, 0, e);
      var iy = lerp(sideY, 0, e);
      var rad = lerp(startW / 2, 0, e);
      fMedia.style.clipPath = 'inset(' + iy.toFixed(1) + 'px ' + ix.toFixed(1) + 'px ' + iy.toFixed(1) + 'px ' + ix.toFixed(1) + 'px round ' + rad.toFixed(1) + 'px ' + rad.toFixed(1) + 'px 0 0)';
      if (fImg) fImg.style.transform = 'scale(' + lerp(1.18, 1, e).toFixed(4) + ')';
      finale.style.setProperty('--shade', e.toFixed(3));
      finale.style.setProperty('--text', clamp((fp - 0.56) / 0.3, 0, 1).toFixed(3));
    }
  }

  var ticking = false;
  function requestTick() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  setupLayout();
  update();
  window.addEventListener('scroll', requestTick, { passive: true });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { setupLayout(); requestTick(); }, 120);
  });
  window.addEventListener('load', function () { setupLayout(); requestTick(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setupLayout(); requestTick(); });
})();
