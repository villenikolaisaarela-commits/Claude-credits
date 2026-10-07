// Sukkula – konseptityö. Kaikki liike on transformia ja opacitya, jotta rullaus pysyy sulavana.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);

  // Smooth scroll
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
    if (lenis) lenis.scrollTo(el, { offset: -80, duration: 1.3 }); else el.scrollIntoView();
  }));

  // Intro countdown, once per visit
  const intro = document.querySelector('.intro');
  const ready = () => document.body.classList.add('ready');
  if (!reduce && !root.classList.contains('no-intro')) {
    if (lenis) lenis.stop();
    requestAnimationFrame(() => intro.classList.add('run'));
    setTimeout(() => { intro.classList.add('out'); ready(); if (lenis) lenis.start(); }, 1500);
    setTimeout(() => { intro.style.display = 'none'; }, 2500);
    try { sessionStorage.setItem('sk-intro', '1'); } catch (e) { /* storage blocked */ }
  } else {
    requestAnimationFrame(ready);
  }

  // This month's cargo and the countdown to the next launch
  const GEN = ['Tammikuun', 'Helmikuun', 'Maaliskuun', 'Huhtikuun', 'Toukokuun', 'Kesäkuun', 'Heinäkuun', 'Elokuun', 'Syyskuun', 'Lokakuun', 'Marraskuun', 'Joulukuun'];
  const now = new Date();
  document.querySelectorAll('[data-month]').forEach(el => { el.textContent = GEN[now.getMonth()]; });
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nx = document.querySelector('[data-next]'), cd = document.querySelector('[data-countdown]');
  if (nx) nx.textContent = `${next.getDate()}.${next.getMonth() + 1}.`;
  const tick = () => {
    const s = Math.max(0, Math.floor((next - new Date()) / 1000));
    const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
    cd.textContent = `${d} vrk ${String(h).padStart(2, '0')} h ${String(m).padStart(2, '0')} min ${String(x).padStart(2, '0')} s`;
  };
  if (cd) { tick(); setInterval(tick, 1000); }

  // Reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv-up, .sw').forEach((el, i) => {
    if (el.classList.contains('sw')) el.querySelector('span').style.transitionDelay = `${(i % 3) * 0.06}s`;
    if (reduce) el.classList.add('in'); else io.observe(el);
  });

  // Hero rocket: follows the pointer a little, and launches on demand
  const rocket = document.querySelector('[data-rocket]');
  const art = document.querySelector('.hero-art');
  if (fine && !reduce) addEventListener('pointermove', e => {
    if (rocket.classList.contains('launch') || rocket.classList.contains('land')) return;
    const x = (e.clientX / innerWidth - 0.5) * 30, y = (e.clientY / innerHeight - 0.5) * 24;
    rocket.style.setProperty('--mx', `${x.toFixed(1)}px`); rocket.style.setProperty('--my', `${y.toFixed(1)}px`);
  }, { passive: true });
  let flying = false;
  document.querySelector('[data-launch]').addEventListener('click', () => {
    if (flying || reduce) return;
    flying = true;
    rocket.classList.add('launch');
    setTimeout(() => {
      rocket.classList.remove('launch'); rocket.classList.add('land');
      void rocket.offsetWidth;
      requestAnimationFrame(() => { rocket.classList.remove('land'); setTimeout(() => { flying = false; }, 900); });
    }, 1400);
  });

  // Header hides while scrolling down, the mobile bar appears after the hero
  const hdr = document.querySelector('.hdr'), mbar = document.querySelector('.mbar'), hero = document.querySelector('.hero');
  let lastY = 0;

  // Capsule: pinned section, the box turns, the lid opens and the cargo rises
  const cap = document.querySelector('.capsule'), box = cap.querySelector('.box');
  const lidF = [...cap.querySelectorAll('.lid .f')];
  const pops = [...cap.querySelectorAll('.pop')];
  const heads = [...cap.querySelectorAll('.cap-h span')];
  const capFrame = () => {
    const r = cap.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight), 0, 1);
    const bh = box.offsetHeight;
    box.style.setProperty('--ry', `${(-34 + 58 * ease(p)).toFixed(2)}deg`);
    box.style.setProperty('--rx', `${(-26 + 10 * p).toFixed(2)}deg`);
    const open = ease(seg(p, 0.12, 0.45)) * 108;
    lidF.forEach(f => f.style.setProperty('--open', `${open.toFixed(2)}deg`));
    const up = ease(seg(p, 0.32, 0.72));
    const spots = [[-1.35, -18], [-1.65, 6], [-1.05, 16]];
    pops.forEach((el, i) => {
      const u = ease(seg(p, 0.32 + i * 0.07, 0.72 + i * 0.05));
      el.style.setProperty('--py', `${(spots[i][0] * bh * u).toFixed(1)}px`);
      el.style.setProperty('--pr', `${(spots[i][1] * u).toFixed(1)}deg`);
      el.style.marginLeft = `${((i - 1) * 0.42 * box.offsetWidth * u).toFixed(1)}px`;
    });
    heads.forEach((h, i) => { h.style.setProperty('--hy', `${((1 - ease(seg(p, 0, 0.3))) * 40 * (i + 1)).toFixed(1)}px`); h.style.setProperty('--hr', `${((i ? 1 : -1) * 4 * ease(seg(p, 0.5, 1))).toFixed(2)}deg`); });
    cap.classList.toggle('notes', p > 0.62);
  };

  // Styles list: socks drift
  const fls = [...document.querySelectorAll('.fl')], styles = document.querySelector('.styles');
  const flFrame = () => {
    const r = styles.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const t = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
    fls.forEach((f, i) => f.style.setProperty('--fy', `${(t * [-120, 90, -60][i]).toFixed(1)}px`));
  };

  const onScroll = () => {
    const y = scrollY;
    hdr.classList.toggle('hide', y > 300 && y > lastY + 2);
    if (y < lastY - 2 || y < 300) hdr.classList.remove('hide');
    lastY = y;
    mbar.classList.toggle('on', hero.getBoundingClientRect().bottom < 0);
    if (!reduce) { capFrame(); flFrame(); }
  };
  if (lenis) lenis.on('scroll', onScroll);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
  if (reduce) { lidF.forEach(f => f.style.setProperty('--open', '108deg')); cap.classList.add('notes'); }

  // Gift card tilts toward the pointer
  const gc = document.querySelector('.gcard');
  if (fine && !reduce) {
    gc.parentElement.addEventListener('pointermove', e => {
      const r = gc.getBoundingClientRect();
      gc.style.setProperty('--gy', `${(((e.clientX - r.left) / r.width - 0.5) * 22).toFixed(1)}deg`);
      gc.style.setProperty('--gx', `${(-((e.clientY - r.top) / r.height - 0.5) * 18).toFixed(1)}deg`);
    });
    gc.parentElement.addEventListener('pointerleave', () => { gc.style.removeProperty('--gy'); gc.style.removeProperty('--gx'); });
  }

  // Sparkles follow the cursor
  if (fine && !reduce) {
    const COL = ['#FFD23F', '#FF7AC6', '#48E5B0', '#8FA2FF', '#FF5634'];
    let last = 0, n = 0;
    addEventListener('pointermove', e => {
      const t = performance.now();
      if (t - last < 45) return;
      last = t;
      const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      s.setAttribute('class', 'spark'); s.setAttribute('viewBox', '0 0 24 24');
      s.innerHTML = '<use href="#star"/>';
      s.style.fill = COL[n++ % COL.length];
      s.style.left = `${e.clientX - 8}px`; s.style.top = `${e.clientY - 8}px`;
      s.style.setProperty('--sx', `${(Math.random() - 0.5) * 40}px`); s.style.setProperty('--sy', `${16 + Math.random() * 26}px`);
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 820);
    }, { passive: true });
  }

  // Concept: buttons that would check out tell so instead
  const toast = document.querySelector('.toast');
  let tt = 0;
  const say = msg => { toast.textContent = msg; toast.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('on'), 3600); };
  document.querySelectorAll('[data-order]').forEach(b => b.addEventListener('click', () => say(`Konsepti: ${b.dataset.order} valittu, mutta tilausta ei tehty. Oikeassa kaupassa siirtyisit nyt kassalle.`)));
  document.querySelector('[data-news]').addEventListener('submit', e => { e.preventDefault(); say('Konsepti: osoitetta ei tallennettu. Oikeassa kaupassa olisit nyt lähtölistalla.'); });
})();
