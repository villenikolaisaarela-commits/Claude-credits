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

  // The process film plays while it is in view, never for people who asked for less motion
  document.querySelectorAll('.film').forEach(f => {
    const v = f.querySelector('video'), b = f.querySelector('.film-t');
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let paused = calm;
    const show = () => { const on = !v.paused; b.textContent = on ? 'Pysäytä' : 'Toista'; b.setAttribute('aria-pressed', String(!on)); };
    v.addEventListener('play', show); v.addEventListener('pause', show);
    b.addEventListener('click', () => { if (v.paused) { paused = false; v.play().catch(() => {}); } else { paused = true; v.pause(); } });
    if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && !paused) v.play().catch(() => {}); else if (!e.isIntersecting) v.pause();
    }), { threshold: 0.35 }).observe(f);
  });

  const els = [...document.querySelectorAll('.rv')];
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  requestAnimationFrame(() => requestAnimationFrame(() => els.forEach(e => {
    if (e.getBoundingClientRect().top < innerHeight) e.classList.add('in'); else io.observe(e);
  })));
})();
