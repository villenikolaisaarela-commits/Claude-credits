(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const webm = document.createElement('video').canPlayType('video/webm; codecs="vp9"') !== '';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // Pixel patterns: seeded, mirrored, drawn as SVG squares
  const rng = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const grid = (cols, rows, seed, density, mirrorY) => {
    const r = rng(seed * 9973 + 17), g = [];
    const hc = Math.ceil(cols / 2), hr = mirrorY ? Math.ceil(rows / 2) : rows;
    for (let y = 0; y < hr; y++) for (let x = 0; x < hc; x++) if (r() < density) {
      const cells = [[x, y], [cols - 1 - x, y]];
      if (mirrorY) cells.push([x, rows - 1 - y], [cols - 1 - x, rows - 1 - y]);
      cells.forEach(c => g.push(c.join(',')));
    }
    return [...new Set(g)].map(s => s.split(',').map(Number));
  };
  const draw = (svg, cols, rows, cells, gap = 0.08) => {
    svg.setAttribute('viewBox', `0 0 ${cols} ${rows}`);
    svg.innerHTML = cells.map(([x, y]) => `<rect x="${x + gap / 2}" y="${y + gap / 2}" width="${1 - gap}" height="${1 - gap}"/>`).join('');
  };
  // Card back: a frame plus a mirrored ornament
  const back = seed => {
    const C = 13, R = 16, cells = grid(C, R, seed, 0.34, true).filter(([x, y]) => x > 1 && x < C - 2 && y > 1 && y < R - 2);
    const cx = (C - 1) / 2, cy = (R - 1) / 2;
    for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) if (Math.abs(x - cx) + Math.abs(y - cy) <= 1.5) cells.push([x, y]);
    for (let x = 0; x < C; x++) if (x % 2 === 0) cells.push([x, 0], [x, R - 1]);
    for (let y = 0; y < R; y++) if (y % 2 === 0) cells.push([0, y], [C - 1, y]);
    return [C, R, cells];
  };
  document.querySelectorAll('[data-px]').forEach(svg => {
    const kind = svg.dataset.px, seed = +svg.dataset.seed || 1;
    if (kind === 'icon') draw(svg, 7, 7, grid(7, 7, seed, 0.55, true));
    if (kind === 'dot') draw(svg, 5, 5, grid(5, 5, seed, 0.6, true));
    if (kind === 'back') { const [c, r, cells] = back(seed); draw(svg, c, r, cells, 0.1); }
  });
  // Hero mark: pixels that keep rearranging
  const mark = document.querySelector('[data-px="hero"]');
  let ms = 1;
  const markStep = () => draw(mark, 15, 8, grid(15, 8, ms++, 0.32, false).filter(([x, y]) => y > 0 || x % 2), 0.18);
  markStep();
  if (!reduce) setInterval(markStep, 650);

  // Smooth scroll and anchors
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.09 });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const el = document.querySelector(a.getAttribute('href'));
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { duration: 1.4 }); else el.scrollIntoView();
  }));

  // Work rows: each site plays in its frame while it is on screen
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const a = e.target;
    let v = a.querySelector('video');
    if (e.isIntersecting && !reduce) {
      if (!v) {
        v = document.createElement('video');
        Object.assign(v, { muted: true, playsInline: true, loop: true, preload: 'auto' });
        v.setAttribute('aria-hidden', 'true');
        v.src = `../../assets/video/tyot/${a.dataset.video}.${webm ? 'webm' : 'mp4'}`;
        v.addEventListener('playing', () => v.classList.add('is-on'));
        a.querySelector('.media').appendChild(v);
      }
      v.play().catch(() => {});
    } else if (v) v.pause();
  }), { rootMargin: '10% 0px' });
  document.querySelectorAll('.row').forEach(r => vio.observe(r));

  // Services: one card face up at a time while the section is pinned
  const sec = document.querySelector('.cards-sec');
  const inner = sec.querySelector('.cards-in');
  const cards = [...sec.querySelectorAll('.pcard')];
  const dots = [...sec.querySelectorAll('.dots span')];
  let active = -1;
  const place = k => {
    if (k === active) return; active = k;
    const w = cards[0].offsetWidth;
    cards.forEach((c, i) => {
      const rel = (i - k + 3) % 3; // 0 = up, 1 = right, 2 = left
      const pos = rel === 0 ? [0, 0, 0, 0] : rel === 1 ? [w * 0.72, w * 1.05, 30, 180] : [-w * 0.72, w * 1.05, -30, 180];
      c.style.setProperty('--tx', `${pos[0]}px`); c.style.setProperty('--ty', `${pos[1]}px`);
      c.style.setProperty('--rz', `${pos[2]}deg`); c.style.setProperty('--ry', `${pos[3]}deg`);
      c.style.zIndex = rel === 0 ? 3 : 1;
      c.setAttribute('aria-hidden', String(rel !== 0));
    });
    dots.forEach((d, i) => d.classList.toggle('is-on', i === k));
  };

  // Nav: current section, light on dark
  const nav = document.getElementById('nav'), navr = document.getElementById('navr');
  const navLinks = [...nav.querySelectorAll('a')];
  const navSecs = [...document.querySelectorAll('[data-nav]')];
  const darks = [...document.querySelectorAll('[data-dark]')];
  const words = [...document.querySelectorAll('.big .w')];

  const onScroll = () => {
    const r = sec.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight), 0, 1);
    inner.classList.toggle('past-lead', p > 0.1);
    inner.classList.toggle('show-after', p > 0.78);
    place(p < 0.1 ? 0 : Math.min(2, Math.floor((p - 0.1) / 0.9 * 3)));
    const y = 30;
    const onDark = darks.some(d => { const b = d.getBoundingClientRect(); return b.top <= y && b.bottom >= y; });
    nav.classList.toggle('on-dark', onDark); navr.classList.toggle('on-dark', onDark);
    let cur = 'tyot';
    navSecs.forEach(s => { if (s.getBoundingClientRect().top <= innerHeight * 0.4) cur = s.dataset.nav; });
    navLinks.forEach(a => a.classList.toggle('is-on', a.dataset.for === cur));
    words.forEach((w, i) => {
      const b = w.getBoundingClientRect();
      const t = reduce ? 1 : clamp((innerHeight * 0.95 - b.top) / (innerHeight * 0.35), 0, 1);
      w.style.setProperty('--wy', `${((1 - t) * 40).toFixed(1)}px`);
      w.style.setProperty('--wo', (0.15 + 0.85 * t).toFixed(2));
    });
  };
  if (lenis) lenis.on('scroll', onScroll);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { active = -1; onScroll(); });
  onScroll();
})();
