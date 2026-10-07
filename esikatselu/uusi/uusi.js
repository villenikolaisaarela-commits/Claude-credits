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

  // Header line once the page has moved
  const hdr = document.getElementById('hdr');
  const cards = [...document.querySelectorAll('.scard')];
  const onScroll = () => {
    hdr.classList.toggle('is-stuck', scrollY > 16);
    if (reduce) return;
    // Stacked cards: each one shrinks a little as the next slides over it
    cards.forEach((c, k) => {
      const next = cards[k + 1];
      if (!next) return;
      const a = c.getBoundingClientRect(), b = next.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - (b.top - a.top) / a.height));
      c.style.transform = `scale(${(1 - p * 0.05).toFixed(4)})`;
      c.style.opacity = (1 - p * 0.35).toFixed(3);
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Draft request: this draft site does not send anything yet, and says so
  const form = document.getElementById('form');
  const note = document.getElementById('form-note');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.querySelector('[name="name"]');
    const mail = form.querySelector('[name="email"]');
    if (!name.value.trim()) { name.focus(); note.textContent = 'Kirjoita ensin nimesi.'; return; }
    if (!mail.checkValidity() || !mail.value.trim()) { mail.focus(); note.textContent = 'Tarkista sähköpostiosoite.'; return; }
    note.textContent = 'Tämä on luonnos: lomake ei vielä lähetä mitään.';
  });
})();
