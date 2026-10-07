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
  // The screen never moves inside its frame; only the reveal and opacity animate.
  const rows = [...document.querySelectorAll('.row')];
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const m = e.target, a = m.closest('.row'), r = e.intersectionRatio;
    a.vis = r >= 0.6;
    if (r >= 0.35 && !a.classList.contains('is-built')) {
      a.classList.add('is-built');
      setTimeout(() => { a.classList.add('is-done'); play(a); }, reduce ? 0 : 1800);
    } else play(a);
  }), { threshold: [0, 0.35, 0.6, 0.9] });
  const play = a => {
    if (reduce || !a.classList.contains('is-done')) return;
    let v = a.querySelector('video');
    if (a.vis) {
      if (!v) {
        v = document.createElement('video');
        Object.assign(v, { muted: true, playsInline: true, loop: true, preload: 'none' });
        v.setAttribute('aria-hidden', 'true');
        v.src = `${R}assets/video/tyot/${a.dataset.video}.${webm ? 'webm' : 'mp4'}?v=2`;
        v.addEventListener('playing', () => requestAnimationFrame(() => v.classList.add('is-on')));
        a.querySelector('.scr').appendChild(v);
      }
      v.play().catch(() => {});
    } else if (v && !v.paused) v.pause();
  };
  rows.forEach(r => vio.observe(r.querySelector('.media')));

  // Mini site in each card (shared with the process page, see vs.js)
  const { make: makeStage, set: setPhase } = window.VS.stage;
  const stages = [...document.querySelectorAll('.stage')].map(st => makeStage(st));
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
