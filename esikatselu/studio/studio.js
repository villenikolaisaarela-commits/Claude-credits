(() => {
  document.documentElement.classList.add('js');

  // Reveal on scroll, staggered at most 80 ms within a group
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    io.unobserve(e.target);
  }), { rootMargin: '0px 0px -8% 0px' });
  const seen = new Map();
  document.querySelectorAll('.rv').forEach(el => {
    const k = el.parentElement;
    const n = seen.get(k) || 0;
    seen.set(k, n + 1);
    el.style.setProperty('--d', `${Math.min(n, 3) * 80}ms`);
    io.observe(el);
  });

  // Header hairline once the page has scrolled
  const hdr = document.getElementById('hdr');
  const onScroll = () => hdr.classList.toggle('is-stuck', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Before / after
  const r = document.getElementById('cmp-r');
  if (r) {
    const box = r.closest('.cmp-box');
    const set = () => box.style.setProperty('--x', `${r.value}%`);
    r.addEventListener('input', set);
    set();
  }

  // Draft request: opens an email with the details filled in
  const form = document.getElementById('form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form);
    const nimi = (f.get('nimi') || '').trim();
    if (!nimi) { form.querySelector('[name="nimi"]').focus(); return; }
    const body = `Hei Ville,\n\nhaluaisin luonnoksen uudesta etusivusta.\n\nNimi: ${nimi}\nYritys: ${f.get('yritys') || '-'}\nNykyinen sivusto: ${f.get('sivu') || '-'}\n`;
    location.href = `mailto:info@villesaarela.com?subject=${encodeURIComponent('Luonnospyyntö')}&body=${encodeURIComponent(body)}`;
  });
})();
