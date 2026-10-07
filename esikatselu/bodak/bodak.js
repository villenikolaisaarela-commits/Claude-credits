(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const webm = document.createElement('video').canPlayType('video/webm; codecs="vp9"') !== '';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rng = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const ORANGE = '#ff4f1f', CREAM = '#f8f4ec', INK = '#000000';
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // Helsinki time, used in the hero and the footer clock
  const hel = () => new Intl.DateTimeFormat('fi-FI', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Helsinki' }).format(new Date()).replace(':', '.');
  const clk = document.querySelector('[data-clock]');
  const tickClock = () => { clk.textContent = hel(); };
  tickClock(); setInterval(tickClock, 10000);

  // Smooth scroll
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.09 });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const scrollToEl = el => { if (lenis) lenis.scrollTo(el, { duration: 1.4 }); else el.scrollIntoView(); };
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = id === '#top' ? document.body : document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    if (id === '#top') { if (lenis) lenis.scrollTo(0, { duration: 1.6 }); else scrollTo(0, 0); } else scrollToEl(el);
  }));

  // Pixel field: squares spring to their home and step aside for the cursor
  class Field {
    constructor(canvas, build, o = {}) {
      this.c = canvas; this.x = canvas.getContext('2d'); this.build = build;
      this.o = Object.assign({ R: 90, F: 7, k: 0.07, damp: 0.8 }, o);
      this.mx = -1e4; this.my = -1e4; this.pts = []; this.on = false;
      const move = e => { const r = this.c.getBoundingClientRect(); this.mx = e.clientX - r.left; this.my = e.clientY - r.top; };
      addEventListener('pointermove', move, { passive: true });
      addEventListener('pointerdown', e => { move(e); if (e.pointerType !== 'mouse') this.burst(this.mx, this.my); }, { passive: true });
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
        return Object.assign(p, { x: q ? q.x : p.hx, y: q ? q.y : p.hy, vx: 0, vy: 0, wait: 0 });
      });
      this.draw();
    }
    scatter(spread = 1, sweep = 0) {
      const r = rng(7);
      this.pts.forEach(p => {
        p.x = this.w / 2 + (r() - 0.5) * this.w * spread; p.y = this.h / 2 + (r() - 0.5) * this.h * 2 * spread;
        p.vx = p.vy = 0;
        p.wait = sweep ? Math.round((p.hx / this.w) * sweep + r() * 14) : Math.round(r() * 30);
      });
      this.draw();
    }
    burst(x, y) { this.pts.forEach(p => { const dx = p.x - x, dy = p.y - y, d = Math.hypot(dx, dy) || 1; if (d < this.o.R * 1.6) { p.vx += dx / d * 14; p.vy += dy / d * 14; } }); }
    kick(n) { for (let i = 0; i < n; i++) { const p = this.pts[(Math.random() * this.pts.length) | 0]; if (p) { p.vx += (Math.random() - 0.5) * 18; p.vy += (Math.random() - 0.5) * 18; } } }
    step() {
      const { R, F, k, damp } = this.o;
      for (const p of this.pts) {
        if (p.wait > 0) { p.wait--; continue; }
        p.vx += (p.hx - p.x) * k; p.vy += (p.hy - p.y) * k;
        const dx = p.x - this.mx, dy = p.y - this.my, d = Math.hypot(dx, dy);
        if (d < R && d > 0.01) { const f = (1 - d / R) * F; p.vx += dx / d * f; p.vy += dy / d * f; }
        p.vx *= damp; p.vy *= damp; p.x += p.vx; p.y += p.vy;
      }
    }
    draw() {
      const x = this.x; x.clearRect(0, 0, this.w, this.h);
      let col = '';
      for (const p of this.pts) { if (p.c !== col) { col = p.c; x.fillStyle = col; } x.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s); }
    }
    loop() {
      if (this.raf) return;
      const f = () => { this.raf = 0; if (!this.on) return; if (!reduce) this.step(); this.draw(); this.raf = requestAnimationFrame(f); };
      this.raf = requestAnimationFrame(f);
    }
  }

  // VS monogram in pixels
  const V = ['1...1', '1...1', '1...1', '1...1', '.1.1.', '.1.1.', '..1..'];
  const S = ['.1111', '1....', '1....', '.111.', '....1', '....1', '1111.'];
  const mono = (cols = 11) => { const out = []; for (let y = 0; y < 7; y++) for (let x = 0; x < 5; x++) { if (V[y][x] === '1') out.push([x, y]); if (S[y][x] === '1') out.push([x + cols - 5, y]); } return out; };

  const vsCanvas = document.querySelector('.vs');
  const hero = new Field(vsCanvas, (w, h) => {
    const cell = Math.round(clamp(h / 9, 10, 24)), s = cell - Math.max(2, Math.round(cell * 0.18));
    const ox = w / 2 - (11 * cell) / 2 + cell / 2, oy = h / 2 - (7 * cell) / 2 + cell / 2;
    return mono().map(([x, y]) => ({ hx: ox + x * cell, hy: oy + y * cell, s, c: ORANGE }));
  }, { R: 110, F: 9 });
  if (!reduce) setInterval(() => { if (hero.on && !document.hidden) hero.kick(3); }, 1700);

  // Headline: the last words rewrite themselves
  const cyc = document.querySelector('.cyc');
  const PHRASES = ['tekevät töitä', 'tuovat soittoja', 'myyvät puolestasi', 'näyttävät työsi'];
  const CH = 'abcdefghijklmnopqrstuvwxyzäö';
  let phrase = 0, scrambling = false;
  const scramble = to => new Promise(done => {
    const from = cyc.textContent, L = Math.max(from.length, to.length), r = rng(phrase * 31 + 3);
    const at = [...Array(L)].map((_, i) => i * 1.2 + r() * 8);
    let f = 0; scrambling = true;
    const step = () => {
      let out = '';
      for (let i = 0; i < L; i++) {
        const t = to[i] || '';
        if (f >= at[i] + 6) out += t;
        else if (f >= at[i]) out += t === ' ' ? ' ' : `<i>${CH[(Math.random() * CH.length) | 0]}</i>`;
        else out += from[i] || '';
      }
      cyc.innerHTML = out;
      if (f++ < at[L - 1] + 6) setTimeout(step, 38); else { cyc.textContent = to; scrambling = false; done(); }
    };
    step();
  });
  const cycle = async () => {
    for (;;) {
      await wait(3400);
      if (document.hidden || scrollY > innerHeight || scrambling) continue;
      phrase = (phrase + 1) % PHRASES.length;
      await scramble(PHRASES[phrase]);
    }
  };

  // Intro: the headline alone in the middle, then the page opens around it
  const h1 = document.querySelector('.h1');
  const loader = document.querySelector('.loader');
  const placeIntro = () => {
    const spans = [...h1.querySelectorAll('.ln > span')];
    const tw = Math.max(...spans.map(s => s.offsetWidth));
    const m = innerWidth < 760 ? 28 : 120;
    const sc = clamp((innerWidth - m) / tw, 1, 1.7);
    const cy = h1.offsetTop + h1.offsetHeight / 2;
    h1.style.setProperty('--is', sc.toFixed(3));
    h1.style.setProperty('--iy', `${(innerHeight / 2 - cy).toFixed(1)}px`);
  };
  const start = () => { hero.on && hero.loop(); if (!reduce) cycle(); };
  if (root.classList.contains('is-intro')) {
    scrollTo(0, 0);
    if (lenis) lenis.stop();
    placeIntro();
    hero.scatter(1.2);
    document.fonts && document.fonts.ready.then(() => { if (root.classList.contains('is-intro')) placeIntro(); });
    const n = loader.querySelector('.ld-n'), px = [...loader.querySelectorAll('.ld-px i')];
    const t0 = performance.now(), D = 1500;
    const count = t => {
      const p = clamp((t - t0) / D, 0, 1), e = 1 - Math.pow(1 - p, 3);
      n.textContent = String(Math.round(e * 100)).padStart(3, '0');
      px.forEach((el, i) => el.classList.toggle('on', i < Math.round(e * px.length)));
      if (p < 1) requestAnimationFrame(count);
    };
    requestAnimationFrame(count);
    setTimeout(() => h1.classList.add('go'), 120);
    setTimeout(() => {
      h1.classList.add('land');
      root.classList.remove('is-intro');
      hero.scatter(1.2);
      if (lenis) lenis.start();
      setTimeout(() => { h1.classList.remove('land'); }, 1400);
      start();
    }, 1900);
  } else {
    h1.classList.add('go');
    start();
  }

  // Work rows: wireframe → final with a scanline, then the live site plays
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const a = e.target;
    a.vis = e.isIntersecting;
    if (a.vis && !a.classList.contains('is-built')) {
      const scr = a.querySelector('.scr');
      a.style.setProperty('--sh', `${scr.offsetHeight + 2}px`);
      a.classList.add('is-built');
      setTimeout(() => { a.classList.add('is-done'); play(a); }, reduce ? 0 : 1700);
    } else play(a);
  }), { threshold: 0.35 });
  const play = a => {
    if (reduce || !a.classList.contains('is-done')) return;
    let v = a.querySelector('video');
    if (a.vis) {
      if (!v) {
        v = document.createElement('video');
        Object.assign(v, { muted: true, playsInline: true, loop: true, preload: 'auto' });
        v.setAttribute('aria-hidden', 'true');
        v.src = `../../assets/video/tyot/${a.dataset.video}.${webm ? 'webm' : 'mp4'}`;
        v.addEventListener('playing', () => v.classList.add('is-on'));
        a.querySelector('.scr').appendChild(v);
      }
      v.play().catch(() => {});
    } else if (v) v.pause();
  };
  document.querySelectorAll('.row').forEach(r => vio.observe(r));

  // Mini site in each card: 15 blocks, four phases
  const B = [
    ['logo', 20, 16, 60, 14], ['nav', 370, 18, 40, 10], ['nav', 420, 18, 40, 10], ['cta', 470, 16, 70, 14],
    ['t', 20, 56, 290, 26], ['t', 20, 88, 210, 26],
    ['x', 20, 128, 260, 7], ['x', 20, 142, 240, 7], ['x', 20, 156, 170, 7],
    ['btn', 20, 178, 96, 22], ['img', 340, 56, 200, 144],
    ['card', 20, 222, 160, 108], ['card', 200, 222, 160, 108], ['card', 380, 222, 160, 108],
    ['f', 20, 346, 520, 14],
  ];
  const PH = ['../../demot/haljala/img/ahti-maisema-640.webp', '../../demot/haljala/img/harju-sauna-640.webp', '../../demot/keljon-puusepat/img/hylly-syrja-600.webp', '../../demot/kaulus/img/harakka-1-600.webp'];
  const FILL = { logo: INK, nav: '#8f8a82', cta: ORANGE, t: INK, x: '#a9a397', btn: ORANGE, f: '#d9d2c6' };
  const phaseStyle = (b, i, ph) => {
    const [kind, x, y, w, h] = b;
    if (ph <= 0) {
      const r = rng(i * 7 + 3 + (ph < 0 ? 99 : 0)), sz = 16 + r() * 18, wide = ph < 0 ? 1.6 : 1;
      const cx = 280 + (r() - 0.5) * 380 * wide, cy = 190 + (r() - 0.5) * 240 * wide;
      return { l: cx - sz / 2, t: cy - sz / 2, w: sz, h: sz, bg: i % 5 === 3 ? ORANGE : i % 3 ? INK : '#8f8a82', bd: 'transparent', rad: '2px', op: ph < 0 ? 0 : 1, img: '' };
    }
    let X = x, Y = y, W = w, H = h;
    if (ph === 3) { X = 28 + x * 0.9; Y = 56 + y * 0.84; W = w * 0.9; H = h * 0.84; }
    if (ph === 1) return { l: X, t: Y, w: W, h: H, bg: 'transparent', bd: kind === 'img' || kind === 'card' ? '#8f8a82' : INK, rad: kind === 'btn' ? '12px' : '1px', op: 1, img: '' };
    const photo = kind === 'img' ? PH[0] : kind === 'card' ? PH[1 + (i - 11)] : '';
    return { l: X, t: Y, w: W, h: H, bg: photo ? '#cfc7ba' : FILL[kind], bd: 'transparent', rad: kind === 'btn' ? '12px' : '1px', op: 1, img: photo };
  };
  const stages = [...document.querySelectorAll('.stage')].map(st => {
    st.innerHTML = '<div class="chrome"><i></i><i></i><i></i><span>sinunyritys.fi</span></div>' + B.map(() => '<i class="bk"></i>').join('') + '<span class="stamp">Julkaistu ✓</span>';
    return st;
  });
  const setPhase = (st, ph, instant) => {
    st.classList.toggle('no-t', !!instant);
    st.classList.toggle('p3', ph === 3);
    st.querySelectorAll('.bk').forEach((el, i) => {
      const s = phaseStyle(B[i], i, ph);
      Object.assign(el.style, { left: `${s.l / 5.6}%`, top: `${s.t / 3.8}%`, width: `${s.w / 5.6}%`, height: `${s.h / 3.8}%`, backgroundColor: s.bg, borderColor: s.bd, borderRadius: s.rad, opacity: s.op, backgroundImage: s.img ? `url("${s.img}")` : 'none' });
    });
    if (instant) { void st.offsetWidth; st.classList.remove('no-t'); }
  };
  stages.forEach((st, i) => setPhase(st, i, true));

  // Card backs: orange with the VS monogram and a pixel frame
  const drawBack = cv => {
    const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
    if (!r.width) return;
    cv.width = r.width * d; cv.height = r.height * d;
    const x = cv.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); x.fillStyle = INK;
    const cell = r.width / 17, s = cell * 0.78, rows = Math.floor(r.height / cell);
    for (let i = 1; i < 16; i += 2) { x.fillRect(i * cell, cell, s, s); x.fillRect(i * cell, (rows - 3) * cell, s, s); }
    for (let j = 3; j < rows - 3; j += 2) { x.fillRect(cell, j * cell, s, s); x.fillRect(15 * cell, j * cell, s, s); }
    const oy = Math.round((rows - 7) / 2) - 1;
    mono().forEach(([a, b]) => x.fillRect((a + 3) * cell, (b + oy) * cell, s, s));
  };
  const backs = [...document.querySelectorAll('.back-px')];
  const drawBacks = () => backs.forEach(drawBack);

  // The deck: drag, click, or pick a step
  const deck = document.querySelector('.deck');
  const cards = [...deck.querySelectorAll('.pc')];
  const stepBtns = [...document.querySelectorAll('.steps button')];
  const N = cards.length;
  let k = 0, dealt = false, busy = false;
  const setT = (c, tx, ty, rz, ry) => { c.style.setProperty('--tx', `${tx}px`); c.style.setProperty('--ty', `${ty}px`); c.style.setProperty('--rz', `${rz}deg`); c.style.setProperty('--ry', `${ry}deg`); };
  const place = () => {
    cards.forEach((c, i) => {
      const rel = (i - k + N) % N;
      if (rel === 0) setT(c, 0, 0, 0, 0);
      else setT(c, rel * 14, rel * 12, rel * 3.5, 180);
      c.style.zIndex = String(10 - rel);
      c.setAttribute('aria-hidden', String(rel !== 0));
    });
    stepBtns.forEach((b, i) => { b.classList.toggle('is-on', i === k); b.setAttribute('aria-current', i === k ? 'step' : 'false'); });
  };
  const go = (to, dir) => {
    if (busy) return;
    to = (to + N) % N;
    if (to === k) { place(); return; }
    busy = true;
    const old = cards[k];
    old.classList.remove('is-drag');
    old.style.zIndex = '20';
    const w = deck.offsetWidth;
    setT(old, -dir * (w * 0.55 + 160), -40, -dir * 18, 0);
    const prevPh = k;
    k = to;
    setPhase(stages[k], dir > 0 ? Math.min(prevPh, k - 1) : -1, true);
    setTimeout(() => {
      place();
      setTimeout(() => setPhase(stages[k], k), 250);
      setTimeout(() => { busy = false; }, 500);
    }, reduce ? 0 : 380);
  };
  // Deal the cards in when the section first shows
  cards.forEach((c, i) => setT(c, (i - 1.5) * 60, innerHeight * 0.8, (i - 1.5) * 12, 180));
  new IntersectionObserver((es, ob) => {
    if (!es[0].isIntersecting) return;
    ob.disconnect(); dealt = true; drawBacks();
    cards.forEach((c, i) => { c.style.transitionDelay = `${(N - i) * 0.08}s`; });
    place();
    setPhase(stages[0], -1, true);
    setTimeout(() => { cards.forEach(c => { c.style.transitionDelay = ''; }); setPhase(stages[0], 0); }, 900);
  }, { threshold: 0.3 }).observe(deck);
  addEventListener('resize', drawBacks);

  stepBtns.forEach((b, i) => b.addEventListener('click', () => { if (dealt) go(i, i > k ? 1 : -1); }));
  deck.tabIndex = 0;
  deck.setAttribute('aria-label', 'Prosessin vaiheet korttipakkana. Nuolinäppäimillä vaihdat korttia.');
  deck.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(k + 1, 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(k - 1, -1); }
  });
  let dragging = false, sx = 0, sy = 0, dx = 0, moved = false;
  deck.addEventListener('pointerdown', e => {
    if (!dealt || busy || !cards[k].contains(e.target) || e.button > 0) return;
    dragging = true; moved = false; sx = e.clientX; sy = e.clientY; dx = 0;
    cards[k].classList.add('is-drag');
    deck.setPointerCapture(e.pointerId);
  });
  deck.addEventListener('pointermove', e => {
    if (!dragging) return;
    dx = e.clientX - sx; const dy = (e.clientY - sy) * 0.3;
    if (Math.abs(dx) > 4) moved = true;
    setT(cards[k], dx, dy, dx * 0.06, 0);
  });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    const c = cards[k];
    if (Math.abs(dx) > 80) go(dx < 0 ? k + 1 : k - 1, dx < 0 ? 1 : -1);
    else { c.classList.remove('is-drag'); if (!moved) go(k + 1, 1); else place(); }
  };
  deck.addEventListener('pointerup', release);
  deck.addEventListener('pointercancel', () => { if (dragging) { dragging = false; cards[k].classList.remove('is-drag'); place(); } });

  // "Aloitetaan." in pixels
  const pxt = document.querySelector('.pxtext');
  const cta = new Field(pxt, (w, h) => {
    const step = Math.max(4, Math.round(w / 190));
    const oc = document.createElement('canvas'); oc.width = Math.ceil(w); oc.height = Math.ceil(h);
    const x = oc.getContext('2d', { willReadFrequently: true });
    const word = 'Aloitetaan', dot = '.';
    let fs = 100; x.font = `600 ${fs}px Geist, system-ui, sans-serif`;
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
  }, { R: 120, F: 10, k: 0.06, damp: 0.82 });
  if (document.fonts) document.fonts.ready.then(() => cta.resize());
  let ctaShown = false;
  new IntersectionObserver(es => { if (es[0].isIntersecting && !ctaShown && !reduce) { ctaShown = true; cta.scatter(1.1, 70); } }, { threshold: 0.25 }).observe(pxt);

  // Footer: Helsinki time in pixels
  const DG = { 0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001111001111', 4: '101101111001001', 5: '111100111001111', 6: '111100111101111', 7: '111001001001001', 8: '111101111101111', 9: '111101111001111' };
  const pc = document.querySelector('.pxclock');
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
    // seconds walk along the bottom edge
    x.fillStyle = 'rgba(0,0,0,0.25)';
    x.fillRect(ox, oy + 5 * cell + cell * 0.6, (17 * cell) * (sec / 59), cell * 0.18);
  };
  drawClock(); setInterval(drawClock, 1000); addEventListener('resize', drawClock);

  // Price drawer
  const drawer = document.getElementById('hinnat');
  const panel = drawer.querySelector('.dr-panel');
  const outside = [document.getElementById('page'), document.getElementById('nav'), document.getElementById('navr')];
  let lastFocus = null;
  const openDr = () => {
    lastFocus = document.activeElement;
    root.classList.add('dr-open');
    drawer.setAttribute('aria-hidden', 'false');
    outside.forEach(el => { el.inert = true; });
    if (lenis) lenis.stop();
    setTimeout(() => panel.focus({ preventScroll: true }), 60);
  };
  const closeDr = () => {
    if (!root.classList.contains('dr-open')) return;
    root.classList.remove('dr-open');
    drawer.setAttribute('aria-hidden', 'true');
    outside.forEach(el => { el.inert = false; });
    if (lenis) lenis.start();
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  };
  document.querySelectorAll('[data-open-prices]').forEach(b => b.addEventListener('click', openDr));
  drawer.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeDr));
  addEventListener('keydown', e => {
    if (!root.classList.contains('dr-open')) return;
    if (e.key === 'Escape') closeDr();
    if (e.key === 'Tab') {
      const f = [...panel.querySelectorAll('a, button')];
      if (e.shiftKey && (document.activeElement === f[0] || document.activeElement === panel)) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  // Cursor label
  const cur = document.querySelector('.cur'), curT = cur.querySelector('span');
  let cx = 0, cy = 0, tx = 0, ty = 0, curRaf = 0;
  const curLoop = () => { cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22; cur.style.transform = `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px)`; curRaf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.3 ? requestAnimationFrame(curLoop) : 0; };
  if (fine) addEventListener('pointermove', e => {
    tx = e.clientX; ty = e.clientY;
    const t = e.target.closest && e.target.closest('[data-cur]');
    const label = t && !(t.classList.contains('deck') && !cards[k].contains(e.target)) ? t.dataset.cur : '';
    if (label) curT.textContent = label;
    cur.classList.toggle('on', !!label && !root.classList.contains('dr-open'));
    if (!curRaf) curRaf = requestAnimationFrame(curLoop);
  }, { passive: true });

  // Nav state and the pixel progress bar
  const nav = document.getElementById('nav'), navr = document.getElementById('navr');
  const navLinks = [...nav.querySelectorAll('a')];
  const navSecs = [...document.querySelectorAll('[data-nav]')];
  const darks = [...document.querySelectorAll('[data-dark]')];
  const bar = document.querySelector('.bar');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty('--p', max > 0 ? clamp(scrollY / max, 0, 1).toFixed(4) : 0);
    const onDark = darks.some(d => { const b = d.getBoundingClientRect(); return b.top <= 34 && b.bottom >= 34; });
    nav.classList.toggle('on-dark', onDark); navr.classList.toggle('on-dark', onDark);
    let curSec = 'tyot';
    navSecs.forEach(s => { if (s.getBoundingClientRect().top <= innerHeight * 0.4) curSec = s.dataset.nav; });
    navLinks.forEach(a => a.classList.toggle('is-on', a.dataset.for === curSec));
  };
  if (lenis) lenis.on('scroll', onScroll);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
})();
