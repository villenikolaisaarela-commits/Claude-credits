(() => {
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // Announcement bar
  const bar = document.getElementById('bar');
  bar.querySelector('.bar-close').addEventListener('click', () => bar.classList.add('is-hidden'));

  // Mobile menu
  const burger = document.querySelector('.burger');
  const mnav = document.getElementById('mnav');
  const setMenu = open => { burger.setAttribute('aria-expanded', String(open)); mnav.hidden = !open; };
  burger.addEventListener('click', () => setMenu(mnav.hidden));
  mnav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !mnav.hidden) { setMenu(false); burger.focus(); } });

  // Carousel arrows
  const track = document.querySelector('.cards');
  const prev = document.querySelector('.arrow-prev');
  const next = document.querySelector('.arrow-next');
  const step = () => track.querySelector('.card').getBoundingClientRect().width + 18;
  const update = () => {
    prev.disabled = track.scrollLeft < 8;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
  };
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  track.addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();

  // Gentle reveals
  const targets = document.querySelectorAll('.statement h1, .services-l, .services-r, .work-head, .steps li, .about-photo, .about-text, .band h2, .band-sub, .band-ctas');
  targets.forEach(el => el.classList.add('rv'));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -6% 0px' });
  targets.forEach(el => io.observe(el));
})();
