// Home page: intro, VS monogram, headline, work rows and the process deck
(() => {
  const { root, reduce, clamp, rng, lenis, Field, ORANGE, INK, R } = window.VS;
  const webm = document.createElement('video').canPlayType('video/webm; codecs="vp9"') !== '';
  const wait = ms => new Promise(r => setTimeout(r, ms));

  // VS monogram in pixels
  const V = ['1...1', '1...1', '1...1', '1...1', '.1.1.', '.1.1.', '..1..'];
  const S = ['.1111', '1....', '1....', '.111.', '....1', '....1', '1111.'];
  const mono = (cols = 11) => { const out = []; for (let y = 0; y < 7; y++) for (let x = 0; x < 5; x++) { if (V[y][x] === '1') out.push([x, y]); if (S[y][x] === '1') out.push([x + cols - 5, y]); } return out; };

  const hero = new Field(document.querySelector('.vs'), (w, h) => {
    const cell = Math.round(clamp(h / 9, 10, 24)), s = cell - Math.max(2, Math.round(cell * 0.18));
    const ox = w / 2 - (11 * cell) / 2 + cell / 2, oy = h / 2 - (7 * cell) / 2 + cell / 2;
    return mono().map(([x, y]) => ({ hx: ox + x * cell, hy: oy + y * cell, s, c: ORANGE }));
  }, { R: 130, push: 30, ease: 0.07 });

  // Headline: the last words slide out behind the line and new ones slide in
  const cyc = document.querySelector('.cyc');
  const PHRASES = ['myös toimivat', 'tuovat soittoja', 'myyvät puolestasi', 'näyttävät työsi'];
  const setWords = t => { cyc.innerHTML = t.split(' ').map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`).join(' '); };
  setWords(PHRASES[0]);
  let phrase = 0;
  const cycle = async () => {
    for (;;) {
      await wait(3600);
      if (document.hidden || scrollY > innerHeight) continue;
      phrase = (phrase + 1) % PHRASES.length;
      cyc.classList.add('out');
      await wait(1000);
      setWords(PHRASES[phrase]);
      cyc.classList.remove('out'); cyc.classList.add('pre');
      void cyc.offsetWidth;
      cyc.classList.remove('pre');
    }
  };

  // Intro: the headline alone in the middle, then the page opens around it
  const h1 = document.querySelector('.h1');
  const loader = document.querySelector('.loader');
  const placeIntro = () => {
    const spans = [...h1.querySelectorAll('.ln > span')];
    const tw = Math.max(...spans.map(s => s.offsetWidth));
    const m = innerWidth < 760 ? 28 : 160;
    const sc = clamp((innerWidth - m) / tw, 1, 1.6);
    const cy = h1.offsetTop + h1.offsetHeight / 2;
    h1.style.setProperty('--is', sc.toFixed(3));
    h1.style.setProperty('--iy', `${(innerHeight / 2 - cy).toFixed(1)}px`);
  };
  const start = () => { if (!reduce) cycle(); };
  const land = () => {
    h1.classList.add('land');
    root.classList.remove('is-intro');
    hero.gather(1.2);
    if (lenis) lenis.start();
    setTimeout(() => { h1.classList.remove('land'); }, 1500);
    start();
  };
  if (root.classList.contains('is-intro')) {
    // The loader follows what has really loaded and opens the page as soon as it is ready
    scrollTo(0, 0);
    if (lenis) lenis.stop();
    placeIntro();
    const prog = { t: 0.12, d: 0 };
    const bump = v => { prog.t = Math.max(prog.t, v); };
    if (document.fonts) document.fonts.ready.then(() => { bump(0.55); if (root.classList.contains('is-intro')) placeIntro(); });
    const ph = document.querySelector('.me-ph img');
    if (!ph || ph.complete) bump(0.75); else { ph.addEventListener('load', () => bump(0.75), { once: true }); ph.addEventListener('error', () => bump(0.75), { once: true }); }
    if (document.readyState === 'complete') bump(1); else addEventListener('load', () => bump(1), { once: true });
    setTimeout(() => bump(1), 2400);
    const n = loader.querySelector('.ld-n'), px = [...loader.querySelectorAll('.ld-px i')];
    const t0 = performance.now();
    let done = false;
    const count = t => {
      prog.d += (prog.t - prog.d) * 0.16;
      if (prog.t >= 1 && prog.d > 0.985) prog.d = 1;
      n.textContent = String(Math.round(prog.d * 100)).padStart(3, '0');
      px.forEach((el, i) => el.classList.toggle('on', i < Math.round(prog.d * px.length)));
      if (prog.d >= 1 && t - t0 > 700) { if (!done) { done = true; setTimeout(land, 120); } return; }
      requestAnimationFrame(count);
    };
    requestAnimationFrame(count);
    setTimeout(() => h1.classList.add('go'), 60);
  } else {
    h1.classList.add('go');
    if (!reduce) hero.gather(1.2);
    start();
  }

  // Work rows: the finished site slides down over the wireframe, then the live site plays.
  // Only transforms and opacity animate, and only rows well in view play video.
  const rows = [...document.querySelectorAll('.row')];
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const a = e.target, r = e.intersectionRatio;
    a.vis = r >= 0.55;
    if (r >= 0.3 && !a.classList.contains('is-built')) {
      a.classList.add('is-built');
      setTimeout(() => { a.classList.add('is-done'); play(a); }, reduce ? 0 : 1800);
    } else play(a);
  }), { threshold: [0, 0.3, 0.55, 0.8] });
  const play = a => {
    if (reduce || !a.classList.contains('is-done')) return;
    let v = a.querySelector('video');
    if (a.vis) {
      if (!v) {
        v = document.createElement('video');
        Object.assign(v, { muted: true, playsInline: true, loop: true, preload: 'none' });
        v.setAttribute('aria-hidden', 'true');
        v.src = `${R}assets/video/tyot/${a.dataset.video}.${webm ? 'webm' : 'mp4'}`;
        v.addEventListener('playing', () => requestAnimationFrame(() => v.classList.add('is-on')));
        a.querySelector('.scr').appendChild(v);
      }
      v.play().catch(() => {});
    } else if (v && !v.paused) v.pause();
  };
  rows.forEach(r => vio.observe(r));

  // A little depth: the screen drifts inside its frame while you scroll
  const scrs = rows.map(r => r.querySelector('.scr'));
  const drift = () => {
    const h = innerHeight;
    rows.forEach((r, i) => {
      const b = r.getBoundingClientRect();
      if (b.bottom < 0 || b.top > h) return;
      const t = (b.top + b.height / 2 - h / 2) / h;
      scrs[i].style.transform = `translate3d(0, ${(t * -16).toFixed(2)}px, 0)`;
    });
  };
  if (!reduce) { if (lenis) lenis.on('scroll', drift); else addEventListener('scroll', drift, { passive: true }); drift(); }

  // Mini site in each card: 15 blocks, four phases
  const B = [
    ['logo', 20, 16, 60, 14], ['nav', 370, 18, 40, 10], ['nav', 420, 18, 40, 10], ['cta', 470, 16, 70, 14],
    ['t', 20, 56, 290, 26], ['t', 20, 88, 210, 26],
    ['x', 20, 128, 260, 7], ['x', 20, 142, 240, 7], ['x', 20, 156, 170, 7],
    ['btn', 20, 178, 96, 22], ['img', 340, 56, 200, 144],
    ['card', 20, 222, 160, 108], ['card', 200, 222, 160, 108], ['card', 380, 222, 160, 108],
    ['f', 20, 346, 520, 14],
  ];
  const PH = [R + 'demot/haljala/img/ahti-maisema-640.webp', R + 'demot/haljala/img/harju-sauna-640.webp', R + 'demot/keljon-puusepat/img/hylly-syrja-600.webp', R + 'demot/kaulus/img/harakka-1-600.webp'];
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
  const cards_cur = () => cards.forEach((c, i) => { if (i === k) c.dataset.cur = 'Vedä'; else delete c.dataset.cur; });
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
    cards_cur();
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

})();
