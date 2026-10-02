/* Studio Utu, vuorovaikutus (vanilla JS, ei kirjastoja) */
(function () {
  'use strict';

  var d = document;
  var root = d.documentElement;
  window.UTU_OK = true;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* ------------------------------------------------------------------
     Reveal on scroll: .reveal elements reach their final state with .is-in
     ------------------------------------------------------------------ */
  var revealEls = $$('.reveal, [data-reveal]');
  var pending = revealEls.slice();
  function show(el) {
    el.classList.add('is-in');
    var i = pending.indexOf(el);
    if (i > -1) pending.splice(i, 1);
  }
  var io = null;
  if ('IntersectionObserver' in window && !reduce) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(show);
  }
  /* Safety net: anything that has scrolled past the lower edge is shown */
  function sweep() {
    if (!pending.length) return;
    var vh = window.innerHeight;
    pending.slice().forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.92) { show(el); if (io) io.unobserve(el); }
    });
  }

  /* ------------------------------------------------------------------
     Header
     ------------------------------------------------------------------ */
  var header = $('[data-header]');
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (!header) return;
    header.classList.toggle('is-scrolled', y > 12);
    if (!d.documentElement.classList.contains('menu-open')) {
      if (y > lastY + 6 && y > 240) header.classList.add('is-hidden');
      else if (y < lastY - 6 || y < 120) header.classList.remove('is-hidden');
    }
    lastY = y;
  }
  if (header) header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });
  window.addEventListener('scroll', function () { onScroll(); sweep(); }, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------ */
  var menuBtn = $('[data-menu-toggle]');
  var menu = $('[data-menu]');
  var menuLabel = $('[data-menu-label]');
  var menuOpen = false;
  function setMenu(open, returnFocus) {
    if (!menuBtn || !menu) return;
    menuOpen = open;
    menu.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    if (menuLabel) menuLabel.textContent = open ? 'Sulje' : 'Valikko';
    root.classList.toggle('menu-open', open);
    if (open && header) header.classList.remove('is-hidden');
    if (open) {
      menu.removeAttribute('inert');
      var first = $('a', menu);
      if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 60);
    } else {
      menu.setAttribute('inert', '');
      if (returnFocus) menuBtn.focus();
    }
  }
  if (menuBtn && menu) {
    menu.setAttribute('inert', '');
    menuBtn.addEventListener('click', function () { setMenu(!menuOpen, false); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false, false); }); });
    d.addEventListener('keydown', function (e) {
      if (!menuOpen) return;
      if (e.key === 'Escape') { setMenu(false, true); return; }
      if (e.key === 'Tab') {
        var items = [menuBtn].concat($$('a', menu));
        var idx = items.indexOf(d.activeElement);
        if (e.shiftKey && idx <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
        else if (!e.shiftKey && idx === items.length - 1) { e.preventDefault(); items[0].focus(); }
      }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 1100 && menuOpen) setMenu(false, false); });
  }

  /* ------------------------------------------------------------------
     Rail (horizontal project carousel): buttons, drag with mouse
     ------------------------------------------------------------------ */
  $$('[data-rail]').forEach(function (rail) {
    var track = $('[data-rail-track]', rail);
    var prev = $('[data-rail-prev]', rail);
    var next = $('[data-rail-next]', rail);
    if (!track) return;
    function step() {
      var item = $('.rail__item', track);
      return item ? item.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 16) : 320;
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    }
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();

    var down = false, startX = 0, startLeft = 0, moved = 0;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = 0; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 5) {
        track.classList.add('is-dragging');
        track.scrollLeft = startLeft - dx;
      }
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      if (track.classList.contains('is-dragging')) {
        setTimeout(function () { track.classList.remove('is-dragging'); }, 0);
      }
    });
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });


  /* ------------------------------------------------------------------
     Before / after comparison: pointer drag (mouse, pen, touch with
     horizontal swipe), keyboard via the native range input
     ------------------------------------------------------------------ */
  $$('[data-ba]').forEach(function (ba) {
    var stage = $('.ba__stage', ba);
    var range = $('.ba__range', ba);
    if (!stage || !range) return;
    var pos = parseFloat(range.value) || 50;
    function set(v) {
      pos = Math.max(0, Math.min(100, v));
      ba.style.setProperty('--pos', pos + '%');
      range.value = String(Math.round(pos));
      range.setAttribute('aria-valuetext', 'Ennen-kuvaa näkyy ' + Math.round(pos) + ' prosenttia');
    }
    function fromEvent(e) {
      var r = stage.getBoundingClientRect();
      return ((e.clientX - r.left) / r.width) * 100;
    }
    set(pos);
    range.addEventListener('input', function () { stopIntro(); set(parseFloat(range.value)); });

    var active = null, startX = 0, startY = 0, engaged = false;
    stage.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      stopIntro();
      active = e.pointerId; startX = e.clientX; startY = e.clientY;
      engaged = e.pointerType !== 'touch';
      if (engaged) {
        e.preventDefault();
        try { stage.setPointerCapture(e.pointerId); } catch (err) {}
        ba.classList.add('is-dragging');
        set(fromEvent(e));
        range.focus({ preventScroll: true });
      }
    });
    stage.addEventListener('pointermove', function (e) {
      if (active !== e.pointerId) return;
      if (!engaged) {
        var dx = Math.abs(e.clientX - startX), dy = Math.abs(e.clientY - startY);
        if (dx > 6 && dx > dy) {
          engaged = true;
          try { stage.setPointerCapture(e.pointerId); } catch (err) {}
          ba.classList.add('is-dragging');
        } else if (dy > 10) { active = null; return; }
        else return;
      }
      set(fromEvent(e));
    });
    function end(e) {
      if (active !== e.pointerId) return;
      if (!engaged && e.type === 'pointerup' && e.pointerType === 'touch') set(fromEvent(e));
      active = null; engaged = false;
      ba.classList.remove('is-dragging');
    }
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    stage.addEventListener('dragstart', function (e) { e.preventDefault(); });

    /* A slow one-time sweep when the comparison first comes into view */
    var raf = null, introDone = false;
    function stopIntro() { introDone = true; if (raf) cancelAnimationFrame(raf); raf = null; }
    function intro() {
      if (introDone || reduce) return;
      introDone = true;
      var from = 78, to = 50, t0 = null, dur = 1600;
      set(from);
      function ease(t) { return 1 - Math.pow(1 - t, 3); }
      function step(ts) {
        if (t0 === null) t0 = ts;
        var t = Math.min(1, (ts - t0) / dur);
        set(from + (to - from) * ease(t));
        if (t < 1) raf = requestAnimationFrame(step); else raf = null;
      }
      raf = requestAnimationFrame(step);
    }
    if (!reduce && 'IntersectionObserver' in window && ba.hasAttribute('data-ba-intro')) {
      var bio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { bio.disconnect(); setTimeout(intro, 350); } });
      }, { threshold: 0.4 });
      bio.observe(ba);
    }
  });

  /* ------------------------------------------------------------------
     Project filter
     ------------------------------------------------------------------ */
  var filters = $('[data-filters]');
  var cards = $$('[data-cards] .card');
  var filterStatus = $('[data-filter-status]');
  var busy = false;
  function setFilter(type, label) {
    if (busy) return;
    busy = true;
    var visible = cards.filter(function (c) { return !c.hidden; });
    visible.forEach(function (c) { c.classList.add('is-leaving'); });
    setTimeout(function () {
      var n = 0;
      cards.forEach(function (c) {
        var show = type === 'kaikki' || c.getAttribute('data-type') === type;
        c.hidden = !show;
        if (show) { n++; c.classList.add('is-leaving'); }
      });
      if (filterStatus) filterStatus.textContent = label + ': ' + n + (n === 1 ? ' kohde' : ' kohdetta');
      requestAnimationFrame(function () {
        cards.filter(function (c) { return !c.hidden; }).forEach(function (c, i) {
          setTimeout(function () { c.classList.remove('is-leaving'); }, reduce ? 0 : i * 70);
        });
        busy = false;
      });
    }, reduce ? 0 : 320);
  }
  if (filters) {
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-filter]');
      if (!b || b.getAttribute('aria-pressed') === 'true') return;
      $$('button', filters).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      setFilter(b.getAttribute('data-filter'), b.getAttribute('data-label') || b.textContent.trim());
    });
  }

  /* ------------------------------------------------------------------
     Material board: build your own palette
     ------------------------------------------------------------------ */
  var palette = $('[data-palette]');
  var bar = $('[data-palette-bar]');
  var swatches = $$('[data-swatch]');
  var picked = [];
  function renderPalette() {
    if (!palette) return;
    if (bar) {
      $$('span', bar).forEach(function (s, i) {
        var sw = picked[i];
        if (sw) { s.style.setProperty('--c', sw.getAttribute('data-color')); }
        else { s.removeAttribute('style'); }
      });
    }
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
     Concept form: nothing is sent
     ------------------------------------------------------------------ */
  var form = $('[data-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = $('[data-form-status]', form);
      var nameField = form.elements.nimi;
      var name = nameField ? (nameField.value || '').trim() : '';
      if (status) {
        status.textContent = (name ? 'Kiitos, ' + name.split(' ')[0] + '. ' : 'Kiitos. ') +
          'Tämä on konseptisivu, joten viestiä ei lähetetty eikä mitään tallennettu.';
      }
    });
  }
})();
