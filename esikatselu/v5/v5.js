(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // Smooth scroll + anchors
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); const el = id === '#top' ? document.body : document.querySelector(id);
    if (!el) return; e.preventDefault();
    if (lenis) lenis.scrollTo(id === '#top' ? 0 : el, { offset: -52, duration: 1.4 }); else el.scrollIntoView();
    menu.hidden = true; btn.setAttribute('aria-expanded', 'false');
  }));

  // Menu
  const btn = document.querySelector('.menu-btn');
  const menu = document.getElementById('mmenu');
  btn.addEventListener('click', () => { menu.hidden = !menu.hidden; btn.setAttribute('aria-expanded', String(!menu.hidden)); });

  // Hero: cycle the project videos, show which project is on screen
  const v = document.querySelector('.hero-media video');
  const slugs = JSON.parse(v.dataset.vids);
  const names = [...document.querySelectorAll('.wk-t')].map(n => n.textContent);
  const nowName = document.querySelector('.hn-name');
  const webm = v.canPlayType('video/webm; codecs="vp9"') !== '';
  let i = 0;
  const load = () => {
    v.src = `../../assets/video/tyot/${slugs[i]}.${webm ? 'webm' : 'mp4'}`;
    nowName.textContent = names[i];
    v.play().catch(() => {});
  };
  v.addEventListener('playing', () => v.classList.add('is-on'));
  v.addEventListener('ended', () => { v.classList.remove('is-on'); i = (i + 1) % slugs.length; setTimeout(load, 350); });
  if (!reduce) load(); else v.remove();
  const ready = () => document.body.classList.add('is-loaded');
  requestAnimationFrame(() => setTimeout(ready, 120));

  // Reveals
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-rv]').forEach(el => io.observe(el));

  // Scroll-linked: header colour, giant words drift, photo grows
  const hdr = document.getElementById('hdr');
  const work = document.querySelector('.work');
  const ftr = document.querySelector('.ftr');
  const drifts = [...document.querySelectorAll('[data-drift]')];
  const grow = document.querySelector('[data-grow]');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY;
    const overRed = [work, ftr].some(s => { const r = s.getBoundingClientRect(); return r.top <= 26 && r.bottom >= 26; });
    hdr.classList.toggle('is-red', overRed);
    hdr.classList.toggle('is-solid', !overRed && y > innerHeight - 60);
    if (reduce) return;
    drifts.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      const p = (innerHeight - r.top) / (innerHeight + r.height);
      el.style.setProperty('--dx', `${(clamp(p, 0, 1) * parseFloat(el.dataset.drift) * el.offsetWidth).toFixed(1)}px`);
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
