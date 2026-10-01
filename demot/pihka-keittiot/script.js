/* Pihka Keittiöt Oy – konsepti. Ei ulkoisia kirjastoja. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobiilivalikko ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (menuBtn && nav) {
    var setMenu = function (open) {
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.textContent = open ? 'Sulje' : 'Valikko';
      nav.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && nav.classList.contains('is-open')) setMenu(false);
    });
  }

  /* ---------- piirrosviivojen pituudet (piirtyvät viivat) ---------- */
  var measure = function (scope) {
    if (reduce) return;
    Array.prototype.forEach.call((scope || document).querySelectorAll('path.draw'), function (p) {
      try {
        var L = p.getTotalLength();
        var m = p.getScreenCTM();
        var s = m ? Math.max(Math.abs(m.a), 1) : 1;
        p.style.setProperty('--len', String(Math.ceil(L * s) + 4));
      } catch (e) { /* piilotettu elementti */ }
    });
  };
  measure(document);
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { measure(document); }, 200); });

  /* ---------- reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal, [data-reveal]'));
  var showAll = function () { revealEls.forEach(function (el) { el.classList.add('is-in'); }); };
  if (reduce || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- hinnat ---------- */
  var fmt = function (n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };
  var round500 = function (n) { return Math.round(n / 500) * 500; };
  var priceBand = function (len, island) {
    var lo = Math.max(8500, round500(len * 3500));
    var hi = Math.max(12500, round500(len * 5500));
    if (island) { lo += 5000; hi += 8500; }
    return [lo, hi];
  };
  var islandLen = function (len) { return len >= 5 ? 2.6 : (len >= 3.5 ? 2.0 : 1.6); };
  var examples = [
    { no: 'K-009', len: 3.1, island: false, price: 11400, text: 'Jämsä, 3,1 m' },
    { no: 'K-003', len: 3.4, island: false, price: 14900, text: 'Harju, 3,4 m' },
    { no: 'K-006', len: 3.9, island: false, price: 17300, text: 'Lohikoski, 3,9 m' },
    { no: 'K-017', len: 4.6, island: false, price: 19800, text: 'Muurame, 4,6 m' },
    { no: 'K-024', len: 4.8, island: false, price: 24300, text: 'Palokka, 4,8 m tammea' },
    { no: 'K-022', len: 3.6, island: true, price: 22400, text: 'Laukaa, 3,6 m + saareke' },
    { no: 'K-014', len: 4.2, island: true, price: 21600, text: 'Vaajakoski, 4,2 m + saareke', href: 'keittiot/k-014/index.html' },
    { no: 'K-030', len: 4.4, island: true, price: 26700, text: 'Keltinmäki, 4,4 m + saareke' },
    { no: 'K-021', len: 5.4, island: true, price: 31400, text: 'Kuokkala, 5,4 m + saareke', href: 'keittiot/k-021/index.html' }
  ];
  var nearest = function (len, island) {
    var best = null;
    examples.forEach(function (k) {
      if (k.island !== island) return;
      if (!best || Math.abs(k.len - len) < Math.abs(best.len - len)) best = k;
    });
    return best;
  };
  var dec = function (n) { return String(n).replace('.', ','); };
  var mm = function (m) { return fmt(m * 1000); };

  var planSVG = function (len, island) {
    var x0 = 40, u = 100, w = len * u, yW = 40, d = 60, out = [];
    var p = function (dd, cls, draw) {
      out.push('<path class="' + cls + (draw ? ' draw' : '') + '" d="' + dd + '"/>');
    };
    var t = function (x, y, s, cls, anchor) {
      out.push('<text x="' + x + '" y="' + y + '" class="' + cls + '" text-anchor="' + (anchor || 'middle') + '">' + s + '</text>');
    };
    var hdim = function (xa, xb, y, label, ext) {
      if (ext !== undefined) { p('M' + xa + ' ' + ext + 'V' + (y - 5), 'dm-ext', true); p('M' + xb + ' ' + ext + 'V' + (y - 5), 'dm-ext', true); }
      p('M' + xa + ' ' + y + 'H' + xb, 'dm', true);
      p('M' + (xa - 4) + ' ' + (y + 4) + 'L' + (xa + 4) + ' ' + (y - 4) + 'M' + (xb - 4) + ' ' + (y + 4) + 'L' + (xb + 4) + ' ' + (y - 4), 'dm', false);
      var cx = (xa + xb) / 2;
      out.push('<rect class="t-bg" x="' + (cx - 26) + '" y="' + (y - 8) + '" width="52" height="15"/>');
      t(cx, y + 4, label, 't-dim');
    };
    var vdim = function (ya, yb, x, label) {
      p('M' + x + ' ' + ya + 'V' + yb, 'dm', true);
      p('M' + (x - 4) + ' ' + (ya + 4) + 'L' + (x + 4) + ' ' + (ya - 4) + 'M' + (x - 4) + ' ' + (yb + 4) + 'L' + (x + 4) + ' ' + (yb - 4), 'dm', false);
      var cy = (ya + yb) / 2;
      out.push('<text class="t-dim" text-anchor="middle" transform="translate(' + (x - 7) + ' ' + cy + ') rotate(-90)">' + label + '</text>');
    };
    out.push('<rect class="fill-ink" x="' + (x0 - 12) + '" y="' + (yW - 12) + '" width="' + (w + 24) + '" height="12"/>');
    out.push('<rect class="fill-birch" x="' + x0 + '" y="' + yW + '" width="' + w + '" height="' + d + '"/>');
    var n = Math.floor(len / 0.6 + 1e-6), rest = Math.round((len - n * 0.6) * 1000);
    if (rest > 40) {
      out.push('<rect class="fill-panel" x="' + (x0 + n * 60) + '" y="' + yW + '" width="' + (rest / 10) + '" height="' + d + '"/>');
    }
    p('M' + x0 + ' ' + yW + 'h' + w + 'v' + d + 'h' + (-w) + 'Z', 'ln', true);
    var mods = '';
    for (var i = 1; i <= n; i++) {
      var x = x0 + i * 60;
      if (i < n || rest > 40) mods += 'M' + x + ' ' + yW + 'V' + (yW + d);
    }
    if (mods) p(mods, 'ln-thin', true);
    hdim(x0, x0 + w, 16, mm(len), yW - 12);
    t(x0, yW + d + 20, n + ' × 600' + (rest > 40 ? ' + täyte ' + rest : ''), 't-s', 'start');
    if (island) {
      var il = islandLen(len) * u, ix = x0 + (w - il) / 2, iy = yW + d + 110;
      out.push('<rect class="fill-birch" x="' + ix + '" y="' + iy + '" width="' + il + '" height="60"/>');
      p('M' + ix + ' ' + iy + 'h' + il + 'v90h' + (-il) + 'Z', 'ln', true);
      p('M' + ix + ' ' + (iy + 60) + 'h' + il, 'ln-dash', false);
      vdim(yW + d, iy, ix - 16, '1 100');
      hdim(ix, ix + il, iy + 112, mm(islandLen(len)));
      t(ix + il / 2, iy + 36, 'SAAREKE', 't-s');
    }
    return out.join('');
  };

  var calc = document.querySelector('[data-calc]');
  if (calc) {
    var priceEl = calc.querySelector('[data-calc-price]');
    var exEl = calc.querySelector('[data-calc-example]');
    var modsEl = calc.querySelector('[data-calc-mods]');
    var daysEl = calc.querySelector('[data-calc-days]');
    var weeksEl = calc.querySelector('[data-calc-weeks]');
    var planEl = calc.querySelector('[data-calc-plan]');
    var islandEl = calc.querySelector('input[name="saareke"]');
    var root = calc.getAttribute('data-root') || '';
    var update = function (animate) {
      var checked = calc.querySelector('input[name="pituus"]:checked');
      var len = checked ? parseFloat(checked.value) : 4;
      var island = !!(islandEl && islandEl.checked);
      var band = priceBand(len, island);
      priceEl.innerHTML = fmt(band[0]) + '–' + fmt(band[1]) + '<span class="eur">€</span>';
      var n = Math.floor(len / 0.6 + 1e-6);
      modsEl.textContent = 'Noin ' + n + ' alakaappia (60 cm), joista ' + Math.max(1, Math.round(n / 2.6)) + ' laatikostoa' + (island ? '. Saareke ' + dec(islandLen(len)) + ' m.' : '.');
      var days = len <= 3 ? 1 : (len <= 5 ? 2 : 3);
      if (island) days += 1;
      daysEl.textContent = days + (days === 1 ? ' päivä' : ' päivää') + ', kaksi puuseppää';
      weeksEl.textContent = (len > 5 || island) ? '9–11 viikkoa' : '8–10 viikkoa';
      var ex = nearest(len, island);
      if (ex) {
        var label = ex.no + ', ' + ex.text + ': ' + fmt(ex.price) + '\u00a0€';
        exEl.innerHTML = ex.href ? '<a href="' + root + ex.href + '">' + label + '</a>' : label;
      }
      var svgEl = planEl.ownerSVGElement;
      var vbW = Math.max(420, 40 + len * 100 + 40);
      if (svgEl) {
        svgEl.setAttribute('viewBox', '0 0 ' + vbW + ' ' + (island ? 340 : 150));
        svgEl.style.setProperty('--pw', String(vbW / 760));
      }
      if (animate && !reduce) {
        planEl.classList.remove('go');
        planEl.innerHTML = planSVG(len, island);
        measure(planEl);
        void planEl.getBoundingClientRect();
        requestAnimationFrame(function () { requestAnimationFrame(function () { planEl.classList.add('go'); }); });
      } else {
        planEl.innerHTML = planSVG(len, island);
        measure(planEl);
        planEl.classList.add('go');
      }
    };
    calc.addEventListener('change', function () { update(true); });
    update(false);
  }

  /* ---------- keittiöiden suodatin ---------- */
  var filters = document.querySelector('[data-filters]');
  if (filters) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-tags]'));
    var countEl = filters.querySelector('.count');
    filters.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      var f = btn.getAttribute('data-filter');
      filters.querySelectorAll('button[data-filter]').forEach(function (b) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      var shown = 0;
      cards.forEach(function (c) {
        var ok = f === 'kaikki' || (' ' + c.getAttribute('data-tags') + ' ').indexOf(' ' + f + ' ') > -1;
        c.hidden = !ok;
        if (ok) { shown++; c.classList.add('is-in'); }
      });
      if (countEl) countEl.textContent = shown + (shown === 1 ? ' keittiö' : ' keittiötä');
    });
  }

  /* ---------- tarjouspyyntö ---------- */
  var qform = document.querySelector('[data-qform]');
  if (qform) {
    var steps = Array.prototype.slice.call(qform.querySelectorAll('.qstep'));
    var prog = Array.prototype.slice.call(document.querySelectorAll('.qprogress li'));
    var prevBtn = qform.querySelector('[data-prev]');
    var nextBtn = qform.querySelector('[data-next]');
    var sendBtn = qform.querySelector('[data-send]');
    var status = qform.querySelector('.form-status');
    var current = 0;
    qform.classList.add('is-stepped');

    var val = function (name) {
      var els = qform.querySelectorAll('[name="' + name + '"]');
      var out = [];
      els.forEach(function (el) {
        if ((el.type === 'radio' || el.type === 'checkbox')) { if (el.checked) out.push(el.getAttribute('data-label') || el.value); }
        else if (el.type === 'file') { if (el.files && el.files.length) out.push(el.files.length + (el.files.length === 1 ? ' tiedosto' : ' tiedostoa')); }
        else if (el.value) out.push(el.value);
      });
      return out.join(', ');
    };

    var summary = function () {
      var box = qform.querySelector('[data-summary]');
      if (!box) return;
      var rows = [
        ['Työ', val('tyo')], ['Pituus', val('pituus')], ['Saareke', val('saareke') ? 'Kyllä' : 'Ei'],
        ['Talo', val('talo')], ['Budjetti', val('budjetti')], ['Valmis', val('aikataulu')],
        ['Suunnittelija', val('suunnittelija')], ['Liitteet', val('liitteet') || 'Ei liitteitä']
      ];
      box.innerHTML = rows.map(function (r) {
        return '<div><dt>' + r[0] + '</dt><dd>' + (r[1] ? r[1].replace(/</g, '&lt;') : '<span class="muted">Ei valittu</span>') + '</dd></div>';
      }).join('');
    };

    var show = function (i, focus) {
      current = Math.max(0, Math.min(steps.length - 1, i));
      steps.forEach(function (s, k) { s.classList.toggle('is-active', k === current); });
      prog.forEach(function (p, k) {
        p.classList.toggle('is-done', k < current);
        p.classList.toggle('is-current', k === current);
        if (k === current) p.setAttribute('aria-current', 'step'); else p.removeAttribute('aria-current');
      });
      prevBtn.hidden = current === 0;
      nextBtn.hidden = current === steps.length - 1;
      sendBtn.hidden = current !== steps.length - 1;
      if (current === steps.length - 1) summary();
      if (focus) {
        var lg = steps[current].querySelector('legend');
        if (lg) { lg.setAttribute('tabindex', '-1'); lg.focus({ preventScroll: true }); }
        var top = qform.getBoundingClientRect().top + window.pageYOffset - 96;
        window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      }
    };

    var validStep = function (s) {
      var fields = s.querySelectorAll('input, select, textarea');
      for (var k = 0; k < fields.length; k++) {
        if (!fields[k].checkValidity()) { fields[k].reportValidity(); return false; }
      }
      return true;
    };

    nextBtn.addEventListener('click', function () { if (validStep(steps[current])) show(current + 1, true); });
    prevBtn.addEventListener('click', function () { show(current - 1, true); });

    var hint = qform.querySelector('[data-budget-hint]');
    var lenMap = { 'alle-3': [2.5, 3], '3-4': [3, 4], '4-5': [4, 5], '5-7': [5, 7], 'yli-7': [7, 8] };
    var updateHint = function () {
      if (!hint) return;
      var c = qform.querySelector('input[name="pituus"]:checked');
      var island = !!qform.querySelector('input[name="saareke"]:checked');
      if (!c || !lenMap[c.value]) { hint.textContent = ''; return; }
      var r = lenMap[c.value], a = priceBand(r[0], island), b = priceBand(r[1], island);
      hint.textContent = 'Valitsemasi koon keittiöt ovat meillä yleensä ' + fmt(a[0]) + '–' + fmt(b[1]) + '\u00a0€ asennettuna.';
    };
    qform.addEventListener('change', function (e) {
      if (e.target.name === 'pituus' || e.target.name === 'saareke') updateHint();
    });
    updateHint();

    var fileInput = qform.querySelector('input[type="file"]');
    var fileList = qform.querySelector('.upload__list');
    if (fileInput && fileList) {
      fileInput.addEventListener('change', function () {
        fileList.innerHTML = '';
        Array.prototype.forEach.call(fileInput.files, function (f) {
          var li = document.createElement('li');
          li.textContent = f.name + ' · ' + (f.size > 1048576 ? (f.size / 1048576).toFixed(1).replace('.', ',') + ' Mt' : Math.max(1, Math.round(f.size / 1024)) + ' kt');
          fileList.appendChild(li);
        });
      });
    }

    var pc = qform.querySelector('input[name="postinumero"]');
    var pcNote = qform.querySelector('[data-pc-note]');
    if (pc && pcNote) {
      pc.addEventListener('input', function () {
        var v = pc.value.trim();
        if (/^\d{5}$/.test(v)) {
          var n = parseInt(v.slice(0, 2), 10);
          pcNote.textContent = (n >= 40 && n <= 44)
            ? 'Postinumero on toimitusalueellamme Keski-Suomessa.'
            : 'Postinumero on Keski-Suomen ulkopuolella. Toimitamme sinne sopimuksen mukaan, ja mittauskäynnistä veloitamme matkat.';
        } else { pcNote.textContent = ''; }
      });
    }

    qform.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validStep(steps[current])) return;
      status.innerHTML = '<b>Konsepti</b>Tämä on konseptisivusto, joten tarjouspyyntöä ei lähetetty eikä tietoja tallennettu. Oikealla sivustolla saisit nyt vahvistuksen sähköpostiisi.';
      status.setAttribute('tabindex', '-1');
      status.focus();
    });

    show(0, false);
  }

  /* muut konseptilomakkeet */
  document.querySelectorAll('form[data-concept]').forEach(function (f) {
    if (f === qform) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var s = f.querySelector('.form-status');
      if (s) s.innerHTML = '<b>Konsepti</b>Lomake ei lähetä tietoja, koska sivusto on konseptityö.';
    });
  });
})();
