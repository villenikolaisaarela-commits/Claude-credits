(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // Menu
  const btn = document.querySelector('.nav-menu');
  const menu = document.getElementById('menu');
  const setMenu = open => { btn.setAttribute('aria-expanded', String(open)); menu.hidden = !open; };
  btn.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); btn.focus(); } });
  document.addEventListener('click', e => { if (!menu.hidden && !e.target.closest('.nav-wrap')) setMenu(false); });

  // Scroll-linked: ticker hides, fan and ring turn slowly
  const fan = document.querySelector('.fan');
  const ring = document.querySelector('.fan-ring');
  const dots = document.querySelector('.ring');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY;
    root.classList.toggle('is-scrolled', y > 40);
    if (reduce) return;
    ring.style.setProperty('--turn', `${Math.min(y / innerHeight, 1.2) * -9}deg`);
    dots.style.setProperty('--ringturn', `${y * 0.03}deg`);
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Fan appears once its images are decoded
  const imgs = [...fan.querySelectorAll('img')];
  Promise.all(imgs.map(i => (i.decode ? i.decode() : Promise.resolve()).catch(() => {}))).then(() => fan.classList.add('is-ready'));
  setTimeout(() => fan.classList.add('is-ready'), 2500);

  // Reveal
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Reel: cycle through the project videos
  const video = document.querySelector('.reel-card video');
  const names = [...document.querySelectorAll('.row-name')].map(n => n.textContent);
  const slugs = JSON.parse(video.dataset.vids);
  const nameEl = document.querySelector('.reel-name');
  const countEl = document.querySelector('.reel-count');
  const canWebm = video.canPlayType('video/webm; codecs="vp9"') !== '';
  let idx = 0;
  if (reduce) { video.removeAttribute('autoplay'); video.pause(); }
  const next = () => {
    idx = (idx + 1) % slugs.length;
    video.loop = false;
    video.src = `../../assets/video/tyot/${slugs[idx]}.${canWebm ? 'webm' : 'mp4'}`;
    video.poster = `../../assets/img/projektit/${slugs[idx]}/cover-600.webp`;
    nameEl.textContent = names[idx];
    countEl.textContent = `${String(idx + 1).padStart(2, '0')}/${String(slugs.length).padStart(2, '0')}`;
    video.play().catch(() => {});
  };
  if (!reduce) {
    video.loop = false;
    video.addEventListener('ended', next);
    new IntersectionObserver(es => es.forEach(e => (e.isIntersecting ? video.play().catch(() => {}) : video.pause())))
      .observe(video);
  }

  // Project rows: thumbnail follows the cursor
  const thumb = document.querySelector('.row-thumb');
  const timg = thumb.querySelector('img');
  if (matchMedia('(hover: hover)').matches) {
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const loop = () => {
      tx += (x - tx) * 0.18; ty += (y - ty) * 0.18;
      thumb.style.left = `${tx + 170}px`; thumb.style.top = `${ty}px`;
      raf = Math.abs(x - tx) + Math.abs(y - ty) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    document.querySelectorAll('.row').forEach(row => {
      row.addEventListener('mouseenter', e => { if (!thumb.classList.contains('is-on')) { x = tx = e.clientX; y = ty = e.clientY; loop(); } timg.src = row.dataset.thumb; thumb.classList.add('is-on'); });
      row.addEventListener('mouseleave', () => thumb.classList.remove('is-on'));
      row.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
    });
  }
})();
