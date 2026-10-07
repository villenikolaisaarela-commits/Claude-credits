(() => {
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
  const onScroll = () => hdr.classList.toggle('is-stuck', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Draft and finished homepage
  const r = document.getElementById('cmp-r');
  if (r) {
    const box = r.closest('.cmp-box');
    const set = () => box.style.setProperty('--x', `${r.value}%`);
    r.addEventListener('input', set);
    set();
  }

  // Sample site: the form does not send anything yet, and says so
  const form = document.getElementById('form');
  const note = document.getElementById('form-note');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.querySelector('[name="name"]');
    if (!name.value.trim()) { name.focus(); note.textContent = 'Add your name first.'; return; }
    note.textContent = 'Sample site: this form does not send anything yet.';
  });
})();
