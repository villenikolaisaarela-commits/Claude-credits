// Shared by every page: smooth scroll, pixels, drawers, cursor, page wipe
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rng = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const ORANGE = '#ff4f1f', CREAM = '#f8f4ec', INK = '#000000';
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  const hel = () => new Intl.DateTimeFormat('fi-FI', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Helsinki' }).format(new Date()).replace(':', '.');
  const clk = document.querySelector('[data-clock]');
  if (clk) { const t = () => { clk.textContent = hel(); }; t(); setInterval(t, 10000); }

  // Smooth scroll
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.085 });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#top') { e.preventDefault(); if (lenis) lenis.scrollTo(0, { duration: 1.6 }); else scrollTo(0, 0); return; }
    const el = id.length > 1 && document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { duration: 1.4 }); else el.scrollIntoView();
  }));

  // Pixel field: every square eases toward its place, the cursor gently pushes them aside.
  // Pure easing, no springs, so nothing overshoots or bounces.
  class Field {
    constructor(canvas, build, o = {}) {
      this.c = canvas; this.x = canvas.getContext('2d'); this.build = build;
      this.o = Object.assign({ R: 110, push: 34, ease: 0.075 }, o);
      this.mx = this.my = -1e4; this.pts = []; this.on = false;
      const move = e => { const r = this.c.getBoundingClientRect(); this.mx = e.clientX - r.left; this.my = e.clientY - r.top; };
      addEventListener('pointermove', move, { passive: true });
      addEventListener('pointerdown', move, { passive: true });
      addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') this.mx = this.my = -1e4; }, { passive: true });
      document.addEventListener('pointerleave', () => { this.mx = this.my = -1e4; });
      new IntersectionObserver(es => { this.on = es[0].isIntersecting; if (this.on) this.loop(); }).observe(canvas);
      this.resize();
      addEventListener('resize', () => this.resize());
    }
    resize() {
      const r = this.c.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
      if (!r.width) return;
      this.w = r.width; this.h = r.height;
      this.c.width = Math.round(r.width * d); this.c.height = Math.round(r.height * d);
      this.x.setTransform(d, 0, 0, d, 0, 0);
      const old = this.pts;
      this.pts = this.build(this.w, this.h).map((p, i) => {
        const q = old[i];
        return Object.assign(p, { x: q ? q.x : p.hx, y: q ? q.y : p.hy, a: q ? q.a : 1, wait: 0 });
      });
      this.draw();
    }
    // Squares drift in from a soft cloud; sweep > 0 makes them arrive left to right
    gather(spread = 1, sweep = 0) {
      const r = rng(7);
      this.pts.forEach(p => {
        const ang = r() * Math.PI * 2, dist = (0.3 + r() * 0.7) * spread;
        p.x = p.hx + Math.cos(ang) * this.w * 0.25 * dist; p.y = p.hy + Math.sin(ang) * this.h * 0.6 * dist;
        p.a = 0;
        p.wait = sweep ? Math.round((p.hx / this.w) * sweep + r() * 10) : Math.round(r() * 24);
      });
      this.draw();
    }
    step() {
      const { R, push, ease } = this.o;
      for (const p of this.pts) {
        if (p.wait > 0) { p.wait--; continue; }
        let tx = p.hx, ty = p.hy;
        const dx = p.hx - this.mx, dy = p.hy - this.my, d = Math.hypot(dx, dy);
        if (d < R && d > 0.01) { const f = Math.pow(1 - d / R, 2) * push; tx += dx / d * f; ty += dy / d * f; }
        p.x += (tx - p.x) * ease; p.y += (ty - p.y) * ease; p.a += (1 - p.a) * 0.06;
      }
    }
    draw() {
      const x = this.x; x.clearRect(0, 0, this.w, this.h);
      for (const p of this.pts) { x.globalAlpha = p.a; x.fillStyle = p.c; x.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s); }
      x.globalAlpha = 1;
    }
    loop() {
      if (this.raf) return;
      const f = () => { this.raf = 0; if (!this.on) return; if (!reduce) this.step(); this.draw(); this.raf = requestAnimationFrame(f); };
      this.raf = requestAnimationFrame(f);
    }
  }

  // Generic reveal: .rv (lines) and .fd (fade up) get .in when they enter
  const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  const reveal = els => els.forEach(el => { if (reduce) el.classList.add('in'); else rio.observe(el); });
  reveal([...document.querySelectorAll('.rv, .fd')]);

  // "Aloitetaan." in pixels
  const pxt = document.querySelector('.pxtext');
  if (pxt) {
    const cta = new Field(pxt, (w, h) => {
      const step = Math.max(4, Math.round(w / 190));
      const oc = document.createElement('canvas'); oc.width = Math.ceil(w); oc.height = Math.ceil(h);
      const x = oc.getContext('2d', { willReadFrequently: true });
      const word = 'Aloitetaan', dot = '.';
      let fs = 100; x.font = `600 ${fs}px Geist, system-ui, sans-serif`;
      if ('letterSpacing' in x) x.letterSpacing = '-5px';
      const tw = x.measureText(word + dot).width;
      fs = Math.min(fs * (w * 0.985) / tw, h * 1.15);
      x.font = `600 ${fs}px Geist, system-ui, sans-serif`;
      if ('letterSpacing' in x) x.letterSpacing = `${(-0.05 * fs).toFixed(1)}px`;
      const ww = x.measureText(word).width, total = x.measureText(word + dot).width;
      const x0 = (w - total) / 2, base = h * 0.78;
      x.fillStyle = '#fff'; x.fillText(word, x0, base);
      x.fillStyle = '#f00'; x.fillText(dot, x0 + ww, base);
      const data = x.getImageData(0, 0, oc.width, oc.height).data, out = [];
      for (let yy = step / 2; yy < h; yy += step) for (let xx = step / 2; xx < w; xx += step) {
        const o = ((yy | 0) * oc.width + (xx | 0)) * 4;
        if (data[o + 3] > 130) out.push({ hx: xx, hy: yy, s: step - 1, c: data[o + 1] < 120 ? ORANGE : CREAM });
      }
      return out;
    }, { R: 140, push: 46, ease: 0.07 });
    if (document.fonts) document.fonts.ready.then(() => cta.resize());
    let shown = false;
    new IntersectionObserver(es => { if (es[0].isIntersecting && !shown && !reduce) { shown = true; cta.gather(1, 80); } }, { threshold: 0.25 }).observe(pxt);
  }

  // Footer: Helsinki time in pixels
  const DG = { 0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001111001111', 4: '101101111001001', 5: '111100111001111', 6: '111100111101111', 7: '111001001001001', 8: '111101111101111', 9: '111101111001111' };
  const pc = document.querySelector('.pxclock');
  if (pc) {
    const drawClock = () => {
      const r = pc.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
      if (!r.width) return;
      if (pc.width !== Math.round(r.width * d)) { pc.width = Math.round(r.width * d); pc.height = Math.round(r.height * d); }
      const x = pc.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, r.width, r.height);
      const cell = Math.min(r.width / 17, r.height / 5), s = cell * 0.84;
      const ox = (r.width - 17 * cell) / 2, oy = (r.height - 5 * cell) / 2;
      const t = hel().replace('.', ''), sec = new Date().getSeconds();
      x.fillStyle = INK;
      [0, 4, 10, 14].forEach((col, n) => {
        const g = DG[t[n]];
        for (let i = 0; i < 15; i++) if (g[i] === '1') x.fillRect(ox + (col + (i % 3)) * cell, oy + Math.floor(i / 3) * cell, s, s);
      });
      if (sec % 2 === 0 || reduce) { x.fillRect(ox + 8 * cell, oy + cell, s, s); x.fillRect(ox + 8 * cell, oy + 3 * cell, s, s); }
      x.fillStyle = 'rgba(0,0,0,0.25)';
      x.fillRect(ox, oy + 5 * cell + cell * 0.6, (17 * cell) * (sec / 59), cell * 0.18);
    };
    drawClock(); setInterval(drawClock, 1000); addEventListener('resize', drawClock);
  }

  // Drawers: prices from the right, about me from the left
  const outside = ['page', 'nav', 'navr'].map(id => document.getElementById(id)).filter(Boolean);
  let open = null, lastFocus = null;
  const openDr = id => {
    const dr = document.getElementById(id);
    if (!dr) return;
    if (open) closeDr(true);
    open = dr; lastFocus = document.activeElement;
    dr.classList.add('is-open'); dr.setAttribute('aria-hidden', 'false');
    root.classList.add('dr-open'); root.classList.toggle('dr-l', dr.classList.contains('left'));
    outside.forEach(el => { el.inert = true; });
    if (lenis) lenis.stop();
    setTimeout(() => dr.querySelector('.dr-panel').focus({ preventScroll: true }), 60);
  };
  const closeDr = swap => {
    if (!open) return;
    open.classList.remove('is-open'); open.setAttribute('aria-hidden', 'true');
    open = null;
    if (swap) return;
    root.classList.remove('dr-open');
    outside.forEach(el => { el.inert = false; });
    if (lenis) lenis.start();
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  };
  document.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => openDr(b.dataset.open)));
  document.querySelectorAll('.drawer [data-close]').forEach(b => b.addEventListener('click', () => closeDr()));
  addEventListener('keydown', e => {
    if (!open) return;
    if (e.key === 'Escape') closeDr();
    if (e.key === 'Tab') {
      const panel = open.querySelector('.dr-panel'), f = [...panel.querySelectorAll('a, button')];
      if (e.shiftKey && (document.activeElement === f[0] || document.activeElement === panel)) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  // Cursor label
  const cur = document.querySelector('.cur'), curT = cur && cur.querySelector('span');
  let cx = 0, cy = 0, tx = 0, ty = 0, curRaf = 0;
  const curLoop = () => { cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2; cur.style.transform = `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px)`; curRaf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.3 ? requestAnimationFrame(curLoop) : 0; };
  if (cur && fine) addEventListener('pointermove', e => {
    tx = e.clientX; ty = e.clientY;
    const t = e.target.closest && e.target.closest('[data-cur]');
    if (t) curT.textContent = t.dataset.cur;
    cur.classList.toggle('on', !!t && !open);
    if (!curRaf) curRaf = requestAnimationFrame(curLoop);
  }, { passive: true });

  // Nav state and the pixel progress bar
  const nav = document.getElementById('nav'), navr = document.getElementById('navr');
  const navLinks = [...nav.querySelectorAll('a[data-for]')];
  const fixed = navLinks.find(a => a.hasAttribute('data-fixed'));
  const navSecs = [...document.querySelectorAll('[data-nav]')];
  const darks = [...document.querySelectorAll('[data-dark]')];
  const bar = document.querySelector('.bar');
  const onScroll = () => {
    const max = root.scrollHeight - innerHeight;
    bar.style.setProperty('--p', max > 0 ? clamp(scrollY / max, 0, 1).toFixed(4) : 0);
    const onDark = darks.some(d => { const b = d.getBoundingClientRect(); return b.top <= 34 && b.bottom >= 34; });
    nav.classList.toggle('on-dark', onDark); navr.classList.toggle('on-dark', onDark);
    if (fixed) return;
    let curSec = '';
    navSecs.forEach(s => { if (s.getBoundingClientRect().top <= innerHeight * 0.4) curSec = s.dataset.nav; });
    navLinks.forEach(a => a.classList.toggle('is-on', a.dataset.for === curSec));
  };
  if (lenis) lenis.on('scroll', onScroll);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  // Page wipe between pages: squares close in, the next page opens the same way
  const wipe = document.querySelector('.wipe');
  const PAGES = ['/', '/tyot/', '/minusta/'];
  const buildWipe = () => {
    const size = innerWidth < 760 ? 64 : 96;
    const cols = Math.ceil(innerWidth / size), rows = Math.ceil(innerHeight / size), r = rng(11);
    wipe.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    wipe.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    let h = '';
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const d = ((x + y) / (cols + rows)) * 0.42 + r() * 0.08;
      h += `<i${r() < 0.1 ? ' class="o"' : ''} style="--d:${d.toFixed(3)}s"></i>`;
    }
    wipe.innerHTML = h;
  };
  if (root.classList.contains('wipe-in')) {
    try { sessionStorage.removeItem('vs-wipe'); } catch (e) { /* storage blocked */ }
    buildWipe();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      root.classList.remove('wipe-in');
      setTimeout(() => { wipe.innerHTML = ''; }, 1200);
    }));
  }
  if (!reduce) document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || !PAGES.includes(u.pathname)) return;
    if (u.pathname === location.pathname) return;
    e.preventDefault();
    try { sessionStorage.setItem('vs-wipe', '1'); } catch (err) { location.href = u.href; return; }
    buildWipe();
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('wipe-go')));
    setTimeout(() => { location.href = u.href; }, 750);
  });
  addEventListener('pageshow', e => { if (e.persisted) { root.classList.remove('wipe-go', 'wipe-in'); wipe.innerHTML = ''; } });

  window.VS = { R: document.body.dataset.r || '', root, reduce, fine, clamp, rng, lenis, Field, hel, reveal, ORANGE, CREAM, INK };
})();
