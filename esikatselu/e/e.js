(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const webm = document.createElement('video').canPlayType('video/webm; codecs="vp9"') !== '';
  const vsrc = slug => `../../assets/video/tyot/${slug}.${webm ? 'webm' : 'mp4'}`;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const smooth = t => t * t * (3 - 2 * t);
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // Smooth scroll and anchors
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1 });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const el = document.querySelector(a.getAttribute('href'));
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { offset: a.getAttribute('href') === '#tarina' ? 0 : -24, duration: 1.4 }); else el.scrollIntoView();
  }));

  // Reveals
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Story: one sentence per screen, the photos fan out in between
  const story = document.querySelector('.story');
  const lines = [...story.querySelectorAll('.line')].map(el => ({ el, a: +el.dataset.a, b: +el.dataset.b, u: el.dataset.u }));
  const stack = story.querySelector('.stack');
  const pols = [...stack.querySelectorAll('.pol')];
  const hint = story.querySelector('.hint');
  const nav = document.getElementById('nav');
  const F = 0.05;
  const onScroll = () => {
    const r = story.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight));
    lines.forEach(({ el, a, b, u }) => {
      const fin = a < 0 ? 1 : clamp((p - a) / F), fout = clamp((b - p) / F);
      el.style.setProperty('--o', Math.min(fin, fout).toFixed(3));
      el.style.setProperty('--y', ((1 - fin) * 40 - (1 - fout) * 40).toFixed(1));
      if (u) el.style.setProperty('--u', smooth(clamp((p - a - 0.05) / 0.12)).toFixed(3));
    });
    const f = smooth(clamp((p - 0.15) / 0.17)) * (1 - smooth(clamp((p - 0.7) / 0.16)));
    pols.forEach(el => { el.style.setProperty('--f', f.toFixed(3)); el.style.setProperty('--s', (0.62 + 0.38 * f).toFixed(3)); });
    stack.style.setProperty('--sy', (-24 * f + smooth(clamp((p - 0.84) / 0.16)) * 420).toFixed(1));
    hint.style.setProperty('--h', (1 - clamp(p / 0.04)).toFixed(2));
    nav.classList.toggle('is-hidden', r.bottom > innerHeight * 0.55);
  };
  if (lenis) lenis.on('scroll', onScroll);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  // Work: the site's own video on hover
  if (fine && !reduce) document.querySelectorAll('.wk[data-video]').forEach(a => {
    let v = null;
    a.addEventListener('mouseenter', () => {
      if (!v) {
        v = document.createElement('video');
        Object.assign(v, { muted: true, playsInline: true, loop: true, preload: 'auto' });
        v.src = vsrc(a.dataset.video);
        v.addEventListener('playing', () => v.classList.add('is-on'));
        a.querySelector('.media').insertBefore(v, a.querySelector('.badge'));
      }
      v.currentTime = 0; v.play().catch(() => {});
    });
    a.addEventListener('mouseleave', () => { if (v) { v.pause(); v.classList.remove('is-on'); } });
  });

  // FAQ
  document.querySelectorAll('.faq button').forEach(b => b.addEventListener('click', () => {
    b.setAttribute('aria-expanded', String(b.getAttribute('aria-expanded') !== 'true'));
  }));

  // Start a project: compose an email, nothing is stored
  const form = document.getElementById('form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const lines = [
      `Mitä tarvitsen: ${fd.getAll('tarve').join(', ') || '-'}`,
      `Budjetti: ${fd.get('budjetti') || '-'}`,
      `Aikataulu: ${fd.get('aikataulu') || '-'}`,
      '',
      fd.get('viesti') || '',
      '',
      [fd.get('nimi'), fd.get('yritys')].filter(Boolean).join(', '),
    ];
    const subject = `Projekti${fd.get('yritys') ? ': ' + fd.get('yritys') : ''}`;
    location.href = `mailto:info@villesaarela.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  });
})();
