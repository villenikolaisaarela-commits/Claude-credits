// Studio Luoto: the menu and the soft arrival of each block.
(() => {
  const btn = document.querySelector('.nav-btn'), menu = document.getElementById('mvalikko');
  if (btn && menu) {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
    });
    menu.addEventListener('click', e => { if (e.target.closest('a')) { btn.setAttribute('aria-expanded', 'false'); menu.classList.remove('is-open'); } });
  }

  const els = [...document.querySelectorAll('.rv')];
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  requestAnimationFrame(() => requestAnimationFrame(() => els.forEach(e => {
    if (e.getBoundingClientRect().top < innerHeight) e.classList.add('in'); else io.observe(e);
  })));
})();
