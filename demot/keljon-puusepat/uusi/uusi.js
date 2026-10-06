(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Hero entrance once the hero image is decoded
  const heroImg = document.querySelector('.hero-img img');
  const ready = () => document.body.classList.add('is-loaded');
  (heroImg.decode ? heroImg.decode() : Promise.resolve()).then(ready, ready);
  setTimeout(ready, 1800);

  // Mobile menu
  const btn = document.querySelector('.menu-btn');
  const menu = document.getElementById('mmenu');
  btn.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open; btn.setAttribute('aria-expanded', String(open));
    hdr.classList.toggle('is-solid', open || scrollY > innerHeight * 0.8);
  });

  // Reveals
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-rv], [data-clip]').forEach(el => io.observe(el));

  // Words that darken as the text passes through the viewport
  const wordsEl = document.querySelector('[data-words]');
  wordsEl.innerHTML = wordsEl.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  const words = [...wordsEl.querySelectorAll('.w')];

  const hdr = document.getElementById('hdr');
  const era = document.querySelector('.era');
  const plan = document.querySelector('.plan');
  const steps = era.querySelectorAll('.ew').length;
  const progress = el => {
    const r = el.getBoundingClientRect();
    return clamp(-r.top / (r.height - innerHeight), 0, 1);
  };
  const ease = t => 1 - Math.pow(1 - t, 3);

  let ticking = false;
  const onScroll = () => {
    ticking = false;
    hdr.classList.toggle('is-solid', scrollY > innerHeight * 0.8 || !menu.hidden);

    // Era: which word is active
    const k = Math.min(steps - 1, Math.floor(progress(era) * steps * 0.999));
    if (era.dataset.k !== String(k)) { era.dataset.k = k; era.style.setProperty('--k', k); }

    // Words
    const r = wordsEl.getBoundingClientRect();
    const wp = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.4), 0, 1);
    const n = reduce ? words.length : Math.round(wp * words.length);
    words.forEach((w, i) => w.classList.toggle('is-on', i < n));

    // Plan: photo shrinks into the drawing sheet, then becomes the drawing
    const p = reduce ? 1 : progress(plan);
    const sheet = plan.querySelector('.sheet');
    const sw = sheet.offsetWidth, sh = sheet.offsetHeight;
    const cover = Math.max(innerWidth / sw, innerHeight / sh) * 1.04;
    const a = ease(clamp(p / 0.42, 0, 1));
    plan.style.setProperty('--s', (cover + (1 - cover) * a).toFixed(4));
    plan.style.setProperty('--lift', `${(a * (innerHeight * 0.04 + 40)).toFixed(1)}px`);
    const d = clamp((p - 0.42) / 0.25, 0, 1);
    plan.style.setProperty('--draw', d.toFixed(3));
    plan.style.setProperty('--photo', (1 - d * 0.92).toFixed(3));
    plan.style.setProperty('--txt', clamp((p - 0.55) / 0.2, 0, 1).toFixed(3));
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
})();
