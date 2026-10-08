(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Smooth scroll
  if (window.Lenis && !reduce) {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, anchors: { offset: -72 } });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // Cards settle in as they arrive
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    io.unobserve(e.target);
  }), { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));

  // Header line, and stacked cards that shrink a little as the next slides over
  const hdr = document.getElementById('hdr');
  const cards = [...document.querySelectorAll('.scard')];
  const onScroll = () => {
    hdr.classList.toggle('is-stuck', scrollY > 16);
    if (reduce) return;
    cards.forEach((c, k) => {
      const next = cards[k + 1];
      if (!next) return;
      if (getComputedStyle(c).position !== 'sticky') { c.style.transform = ''; c.style.opacity = ''; return; }
      const a = c.getBoundingClientRect(), b = next.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - (b.top - a.top) / a.height));
      c.style.transform = `scale(${(1 - p * 0.05).toFixed(4)})`;
      c.style.opacity = (1 - p * 0.35).toFixed(3);
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Videos play only while they are on screen
  document.querySelectorAll('video[data-auto]').forEach(v => {
    if (reduce) return;
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && v.closest('.win')?.dataset.show !== 'draft') { v.preload = 'auto'; v.play().catch(() => {}); }
      else v.pause();
    }), { threshold: 0.4 }).observe(v);
  });

  // Draft and finished: draft first, then the finished site, or switch by hand
  document.querySelectorAll('.win[data-toggle]').forEach(win => {
    const vid = win.querySelector('video');
    const tgs = [...document.querySelectorAll(`.tg[data-for="${win.id}"]`)];
    let user = false, seen = false;
    const show = v => {
      win.dataset.show = v;
      tgs.forEach(t => t.setAttribute('aria-pressed', String(t.dataset.v === v)));
      if (!vid) return;
      if (v === 'final' && !reduce) { vid.preload = 'auto'; vid.currentTime = 0; vid.play().catch(() => {}); } else vid.pause();
    };
    show('draft');
    tgs.forEach(t => t.addEventListener('click', () => { user = true; show(t.dataset.v); }));
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && !seen) { seen = true; setTimeout(() => { if (!user) show('final'); }, 2200); }
    }), { threshold: 0.5 }).observe(win);
  });

  // Long page that pans: the window height sets how far it travels
  document.querySelectorAll('.pan').forEach(p => {
    const set = () => p.style.setProperty('--ph', `${p.clientHeight}px`);
    set(); addEventListener('resize', set);
  });

  // Draft request: opens an email with the details filled in
  const form = document.getElementById('form');
  if (form) {
    const note = document.getElementById('form-note');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const f = new FormData(form);
      const name = (f.get('name') || '').trim();
      const mail = form.querySelector('[name="email"]');
      if (!name) { form.querySelector('[name="name"]').focus(); note.textContent = 'Kirjoita ensin nimesi.'; return; }
      if (!mail.value.trim() || !mail.checkValidity()) { mail.focus(); note.textContent = 'Tarkista sähköpostiosoite.'; return; }
      const body = `Hei Ville,\n\nhaluaisin luonnoksen uudesta etusivusta.\n\nNimi: ${name}\nSähköposti: ${mail.value.trim()}\nNykyiset sivut: ${(f.get('site') || '-').toString().trim() || '-'}\n`;
      note.textContent = 'Sähköpostiohjelmasi avautuu valmiilla viestillä. Jos se ei avaudu, kirjoita osoitteeseen info@villesaarela.com.';
      location.href = `mailto:info@villesaarela.com?subject=${encodeURIComponent('Luonnospyyntö')}&body=${encodeURIComponent(body)}`;
    });
  }
})();
