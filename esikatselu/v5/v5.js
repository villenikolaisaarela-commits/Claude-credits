(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const root = document.body.dataset.root || '../../';
  const webm = document.createElement('video').canPlayType('video/webm; codecs="vp9"') !== '';
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // Smooth scroll + in-page anchors
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const btn = document.querySelector('.menu-btn');
  const menu = document.getElementById('mmenu');
  btn.addEventListener('click', () => { menu.hidden = !menu.hidden; btn.setAttribute('aria-expanded', String(!menu.hidden)); });
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const el = document.querySelector(a.getAttribute('href'));
    if (!el) return; e.preventDefault();
    if (lenis) lenis.scrollTo(el, { offset: -52, duration: 1.4 }); else el.scrollIntoView();
    menu.hidden = true; btn.setAttribute('aria-expanded', 'false');
  }));

  requestAnimationFrame(() => setTimeout(() => document.body.classList.add('is-loaded'), 80));

  // Reveals
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-rv]').forEach(el => io.observe(el));

  // Work grid: play the site video on hover
  if (fine && !reduce) {
    document.querySelectorAll('.wcard a[data-video]').forEach(a => {
      let v = null;
      a.addEventListener('mouseenter', () => {
        if (!v) {
          v = document.createElement('video');
          Object.assign(v, { muted: true, playsInline: true, loop: true, preload: 'auto' });
          v.src = `${root}assets/video/tyot/${a.dataset.video}.${webm ? 'webm' : 'mp4'}`;
          v.addEventListener('playing', () => v.classList.add('is-on'));
          a.querySelector('.wcard-img').appendChild(v);
        }
        v.currentTime = 0; v.play().catch(() => {});
      });
      a.addEventListener('mouseleave', () => { if (v) { v.pause(); v.classList.remove('is-on'); } });
    });
  }

  // Scroll-linked: header colour, giant words drift, photo grows
  const hdr = document.getElementById('hdr');
  const reds = [...document.querySelectorAll('[data-red]')];
  const drifts = [...document.querySelectorAll('[data-drift]')];
  const grow = document.querySelector('.name [data-grow]');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    hdr.classList.toggle('is-red', reds.some(s => { const r = s.getBoundingClientRect(); return r.top <= 26 && r.bottom >= 26; }));
    if (reduce) return;
    drifts.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      const p = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1);
      el.style.setProperty('--dx', `${(p * parseFloat(el.dataset.drift) * el.offsetWidth).toFixed(1)}px`);
    });
    if (grow) {
      const r = grow.getBoundingClientRect();
      const p = clamp((innerHeight - r.top) / (innerHeight * 0.9), 0, 1);
      grow.style.setProperty('--g', (0.6 + 0.4 * (1 - Math.pow(1 - p, 3))).toFixed(3));
    }
  };
  if (lenis) lenis.on('scroll', onScroll);
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
})();
