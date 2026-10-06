(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const NS = 'http://www.w3.org/2000/svg';
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // Tween with cancellation: a newer tween on the same key wins
  const tokens = new WeakMap();
  const tween = (key, from, to, dur, step) => new Promise(done => {
    const id = (tokens.get(key) || 0) + 1; tokens.set(key, id);
    if (reduce) { step(to); return done(); }
    const t0 = performance.now();
    const tick = now => {
      if (tokens.get(key) !== id) return done();
      const t = clamp((now - t0) / dur, 0, 1);
      step(from + (to - from) * ease(t));
      t < 1 ? requestAnimationFrame(tick) : done();
    };
    requestAnimationFrame(tick);
  });

  // Smooth scroll, anchors, menu
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const menuBtn = document.querySelector('.menu-btn');
  const menu = document.getElementById('mmenu');
  menuBtn.addEventListener('click', () => { menu.hidden = !menu.hidden; menuBtn.setAttribute('aria-expanded', String(!menu.hidden)); });
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const el = document.querySelector(a.getAttribute('href'));
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { offset: -56, duration: 1.2 }); else el.scrollIntoView();
    menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false');
  }));

  // Hand-drawn arrow from a note to a point, both in host coordinates
  const arrow = (host, from, to, bend = 1) => {
    let svg = host.querySelector(':scope > .arrows');
    if (!svg) { svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'arrows'); svg.setAttribute('aria-hidden', 'true'); host.appendChild(svg); }
    const hr = host.getBoundingClientRect(), fr = from.getBoundingClientRect();
    const f = { l: fr.left - hr.left, r: fr.right - hr.left, t: fr.top - hr.top, b: fr.bottom - hr.top };
    const cx = (f.l + f.r) / 2, cy = (f.t + f.b) / 2, dx = to.x - cx, dy = to.y - cy;
    const s = Math.abs(dx) > Math.abs(dy) * 0.8 ? { x: dx > 0 ? f.r + 8 : f.l - 8, y: cy } : { x: cx, y: dy > 0 ? f.b + 6 : f.t - 6 };
    const len = Math.hypot(to.x - s.x, to.y - s.y) || 1;
    const k = len * 0.2 * bend;
    const c = { x: (s.x + to.x) / 2 - (to.y - s.y) / len * k, y: (s.y + to.y) / 2 + (to.x - s.x) / len * k };
    const a = Math.atan2(to.y - c.y, to.x - c.x), h = 13;
    const p = d => `${(to.x - h * Math.cos(a + d)).toFixed(1)} ${(to.y - h * Math.sin(a + d)).toFixed(1)}`;
    svg.innerHTML = `<path class="shaft" pathLength="1" d="M${s.x.toFixed(1)} ${s.y.toFixed(1)} Q${c.x.toFixed(1)} ${c.y.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}"/><path class="head" d="M${p(-0.5)} L${to.x.toFixed(1)} ${to.y.toFixed(1)} L${p(0.5)}"/>`;
  };
  const rel = (host, el, fx, fy) => { const hr = host.getBoundingClientRect(), r = el.getBoundingClientRect(); return { x: r.left - hr.left + r.width * fx, y: r.top - hr.top + r.height * fy }; };

  const heroIn = document.querySelector('.hero-base .hero-in');
  const works = [...document.querySelectorAll('.work')];
  const drawArrows = () => {
    const me = heroIn.querySelector('.me');
    arrow(heroIn, me.querySelector('.me-note'), rel(heroIn, me, -0.03, 0.3), -1);
    works.forEach(w => {
      const shot = w.querySelector('.shot');
      const to = rel(w, shot, w.dataset.tx / 100, w.dataset.ty / 100);
      arrow(w, w.querySelector('.wn'), to, w.querySelector('.wn').classList.contains('r') ? -1 : 1);
    });
    const contact = document.querySelector('.contact');
    if (getComputedStyle(contact.querySelector('.cta-note')).position === 'absolute') arrow(contact, contact.querySelector('.cta-note'), rel(contact, contact.querySelector('.mail'), 0.55, -0.05), -1);
    else contact.querySelector('.arrows')?.remove();
  };
  let rz;
  addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(drawArrows, 150); });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { drawArrows(); setTimeout(drawArrows, 900); });

  requestAnimationFrame(() => setTimeout(() => document.body.classList.add('is-loaded'), 60));

  // Reveals
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in'); io.unobserve(e.target);
    if (e.target.classList.contains('work')) { setTimeout(drawArrows, 750); glimpse(e.target); }
  }), { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('[data-rv]').forEach(el => io.observe(el));

  // Hero x-ray lens: the same hero, drawn as its blueprint, seen through a circle
  const hero = document.querySelector('.hero');
  const layer = hero.querySelector('.xr-layer');
  const clone = heroIn.cloneNode(true);
  clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
  clone.querySelectorAll('a').forEach(a => a.setAttribute('tabindex', '-1'));
  clone.querySelectorAll('img').forEach(i => i.removeAttribute('alt'));
  layer.appendChild(clone);
  layer.inert = true;
  const specs = () => {
    const h1 = heroIn.querySelector('.h1'), cs = getComputedStyle(h1);
    clone.querySelector('.h1').dataset.spec = `H1 · Geist ${cs.fontWeight} · ${Math.round(parseFloat(cs.fontSize))} px`;
    clone.querySelector('.lede').dataset.spec = `Ingressi · ${Math.round(parseFloat(getComputedStyle(heroIn.querySelector('.lede')).fontSize))} px`;
    clone.querySelector('.btn').dataset.spec = 'Pääpainike';
    clone.querySelector('.me').dataset.spec = 'Kuva · 4:5';
  };
  specs(); addEventListener('resize', specs);

  const h1 = heroIn.querySelector('.h1');
  const small = () => innerWidth < 900;
  let R = small() ? 82 : 132, r = 0, rT = 0, x = 0, y = 0, tx = 0, ty = 0, follow = 0, heroOn = true;
  const t0 = performance.now();
  const wander = now => {
    const b = hero.getBoundingClientRect(), h = h1.getBoundingClientRect(), t = (now - t0) / 1000;
    tx = h.left - b.left + h.width * (small() ? 0.5 + 0.34 * Math.sin(t * 0.42) : 0.36 + 0.27 * Math.sin(t * 0.42));
    ty = h.top - b.top + h.height * (0.5 + 0.3 * Math.sin(t * 0.77 + 1));
  };
  hero.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' && e.buttons === 0) return;
    const b = hero.getBoundingClientRect();
    tx = e.clientX - b.left; ty = e.clientY - b.top; follow = performance.now() + (e.pointerType === 'mouse' ? 1e9 : 2500);
  });
  hero.addEventListener('pointerleave', () => { follow = 0; });
  new IntersectionObserver(([e]) => { heroOn = e.isIntersecting; }).observe(hero);
  addEventListener('resize', () => { R = small() ? 82 : 132; if (rT) rT = R; });
  const loop = now => {
    if (heroOn) {
      if (now > follow) wander(now);
      if (!x && !y) { x = tx; y = ty; }
      x += (tx - x) * 0.14; y += (ty - y) * 0.14; r += (rT - r) * 0.1;
      hero.style.setProperty('--lx', `${x.toFixed(1)}px`);
      hero.style.setProperty('--ly', `${y.toFixed(1)}px`);
      hero.style.setProperty('--r', `${r.toFixed(1)}px`);
      hero.style.setProperty('--lo', r > 24 ? '1' : '0');
    }
    requestAnimationFrame(loop);
  };
  if (reduce) {
    wander(t0); hero.style.setProperty('--lx', `${tx}px`); hero.style.setProperty('--ly', `${ty}px`); hero.style.setProperty('--r', `${R}px`); hero.style.setProperty('--lo', '1');
  } else {
    setTimeout(() => { rT = R; }, 1300);
    requestAnimationFrame(loop);
  }

  // Work lenses: the wireframe under the finished page
  const glimpse = w => {
    if (reduce) return;
    const shot = w.querySelector('.shot');
    setTimeout(async () => {
      if (shot.matches(':hover')) return;
      const b = shot.getBoundingClientRect();
      shot.style.setProperty('--lx', `${b.width * w.dataset.tx / 100}px`);
      shot.style.setProperty('--ly', `${b.height * w.dataset.ty / 100}px`);
      const set = v => { shot.style.setProperty('--r', `${v}px`); shot.style.setProperty('--lo', v > 24 ? '1' : '0'); };
      await tween(shot, 0, 92, 500, set);
      setTimeout(() => { if (!shot.matches(':hover')) tween(shot, 92, 0, 450, set); }, 1300);
    }, 900);
  };
  works.forEach(w => {
    const shot = w.querySelector('.shot');
    let r = 0, pressed = false, moved = false, sx = 0;
    const setR = v => { r = v; shot.style.setProperty('--r', `${v}px`); shot.style.setProperty('--lo', v > 24 ? '1' : '0'); };
    const at = e => { const b = shot.getBoundingClientRect(); shot.style.setProperty('--lx', `${e.clientX - b.left}px`); shot.style.setProperty('--ly', `${e.clientY - b.top}px`); };
    shot.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { at(e); tween(shot, r, 120, 420, setR); } });
    shot.addEventListener('pointermove', e => {
      if (e.pointerType === 'mouse') return at(e);
      if (pressed) { if (Math.abs(e.clientX - sx) > 6) moved = true; at(e); }
    });
    shot.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') tween(shot, r, 0, 350, setR); });
    shot.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') return; pressed = true; moved = false; sx = e.clientX; at(e); tween(shot, r, 90, 300, setR); });
    const release = () => { if (!pressed) return; pressed = false; setTimeout(() => tween(shot, r, 0, 400, setR), 600); };
    shot.addEventListener('pointerup', release);
    shot.addEventListener('pointercancel', release);
    shot.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } });
  });

  // Header colour follows the red sections
  const hdr = document.getElementById('hdr');
  const reds = [hero, document.querySelector('.cta')];

  // Process: one page goes from first call to launch while pinned
  const pin = document.querySelector('.proc-pin');
  const vis = document.querySelector('.proc-vis');
  const steps = [...document.querySelectorAll('.steps li')];
  const brief = vis.querySelector('.pv-brief');
  const pvNotes = [...vis.querySelectorAll('.pv-note')];
  const pvUrl = vis.querySelector('.pv-url');
  const span = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  const desk = matchMedia('(min-width: 901px)');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    hdr.classList.toggle('is-light', !reds.some(s => { const b = s.getBoundingClientRect(); return b.top <= 28 && b.bottom >= 28; }));
    if (!desk.matches) return;
    const b = pin.getBoundingClientRect();
    const p = reduce ? 1 : clamp(-b.top / (b.height - innerHeight + 56), 0, 1);
    const k = Math.min(3, Math.floor(p * 4 * 0.999));
    steps.forEach((li, i) => li.classList.toggle('is-on', i === k));
    brief.style.opacity = String(1 - span(p, 0.2, 0.27));
    vis.style.setProperty('--w', `${span(p, 0.25, 0.33) * 100}%`);
    pvNotes.forEach((n, i) => n.classList.toggle('is-on', p > 0.33 + i * 0.05 && p < 0.52));
    const f = span(p, 0.52, 0.72);
    vis.style.setProperty('--f', `${f * 100}%`);
    vis.style.setProperty('--fo', f > 0 && f < 1 ? '1' : '0');
    vis.style.setProperty('--l', span(p, 0.78, 0.86).toFixed(3));
    pvUrl.textContent = p < 0.25 ? 'tutustuminen' : p < 0.75 ? 'luonnos' : 'sinun-osoitteesi.fi';
  };
  if (lenis) lenis.on('scroll', onScroll);
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
})();
