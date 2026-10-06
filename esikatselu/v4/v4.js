(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const VID = '../../assets/video/tyot/';
  const canWebm = document.createElement('video').canPlayType('video/webm; codecs="vp9"') !== '';
  const vidSrc = slug => `${VID}${slug}.${canWebm ? 'webm' : 'mp4'}`;

  // Year + Helsinki clock
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  const clocks = document.querySelectorAll('[data-clock]');
  const fmt = new Intl.DateTimeFormat('fi-FI', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Helsinki' });
  const tick = () => clocks.forEach(c => { c.textContent = `${fmt.format(new Date())} Helsinki`; });
  tick(); setInterval(tick, 30000);

  // Smooth scroll
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = id === '#top' ? document.body : document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(id === '#top' ? 0 : el, { offset: -20, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
  }));

  // Menu
  const btn = document.querySelector('.nav-menu');
  const menu = document.getElementById('menu');
  const setMenu = open => { btn.setAttribute('aria-expanded', String(open)); menu.hidden = !open; };
  btn.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); btn.focus(); } });
  document.addEventListener('click', e => { if (!menu.hidden && !e.target.closest('.nav-wrap')) setMenu(false); });

  // Reveals
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-rv], .contact-title, .about-card').forEach(el => io.observe(el));
  requestAnimationFrame(() => document.querySelector('.hero-title').classList.add('is-in'));

  // Statement: words light up as it scrolls through the viewport
  const st = document.querySelector('[data-words]');
  if (st) {
    st.innerHTML = st.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  }
  const words = st ? [...st.querySelectorAll('.w')] : [];

  // Fan of browser windows
  const fan = document.querySelector('.fan');
  const ring = document.querySelector('.fan-ring');
  const items = [...fan.querySelectorAll('.fan-item')];
  items.forEach(it => it.style.setProperty('--d', Math.abs(+getComputedStyle(it).getPropertyValue('--i') - 3)));
  const imgs = items.map(it => it.querySelector('img'));
  Promise.all(imgs.map(i => (i.decode ? i.decode() : Promise.resolve()).catch(() => {}))).then(() => fan.classList.add('is-ready'));
  setTimeout(() => fan.classList.add('is-ready'), 2500);

  let drag = 0, startX = 0, startDrag = 0, moved = false, down = false;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  fan.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    down = true; moved = false; startX = e.clientX; startDrag = drag;
  });
  addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 6) { moved = true; fan.classList.add('is-dragging'); }
    if (moved) { drag = clamp(startDrag + dx * 0.035, -34, 34); fan.style.setProperty('--drag', `${drag}deg`); }
  });
  addEventListener('pointerup', () => { down = false; fan.classList.remove('is-dragging'); });
  fan.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);

  // Hover video in fan windows
  const attachHoverVideo = (host, slug) => {
    let v = null;
    host.addEventListener('mouseenter', () => {
      if (!v) {
        v = document.createElement('video');
        Object.assign(v, { muted: true, playsInline: true, loop: true, preload: 'auto' });
        v.src = vidSrc(slug);
        v.addEventListener('playing', () => v.classList.add('is-on'));
        host.querySelector('.win-view').appendChild(v);
      }
      v.currentTime = 0; v.play().catch(() => {});
    });
    host.addEventListener('mouseleave', () => { if (v) { v.pause(); v.classList.remove('is-on'); } });
  };
  if (finePointer && !reduce) fan.querySelectorAll('.win').forEach(w => attachHoverVideo(w, w.dataset.video));

  // Featured case video plays while in view
  const cv = document.querySelector('.case-media video');
  if (cv && !reduce) {
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) {
        if (!cv.src) { cv.src = vidSrc(cv.dataset.src); cv.addEventListener('playing', () => cv.classList.add('is-on'), { once: true }); }
        cv.play().catch(() => {});
      } else cv.pause();
    }), { threshold: 0.35 }).observe(cv);
  }

  // Works rows: window preview follows the cursor and plays the site
  const peek = document.querySelector('.peek');
  if (finePointer && peek) {
    const pImg = peek.querySelector('img');
    const pVid = peek.querySelector('video');
    const pName = peek.querySelector('.win-name');
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const follow = () => {
      tx += (x - tx) * 0.16; ty += (y - ty) * 0.16;
      peek.style.left = `${tx + 200}px`; peek.style.top = `${ty}px`;
      raf = Math.abs(x - tx) + Math.abs(y - ty) > 0.4 ? requestAnimationFrame(follow) : 0;
    };
    document.querySelectorAll('.row').forEach(row => {
      row.addEventListener('mouseenter', e => {
        const slug = row.dataset.video;
        if (!peek.classList.contains('is-on')) { x = tx = e.clientX; y = ty = e.clientY; follow(); }
        pImg.src = `../../assets/img/projektit/${slug}/cover-600.webp`;
        pName.textContent = row.querySelector('.row-name').textContent;
        pVid.classList.remove('is-on');
        if (!reduce) {
          pVid.src = vidSrc(slug);
          pVid.addEventListener('playing', () => pVid.classList.add('is-on'), { once: true });
          pVid.play().catch(() => {});
        }
        peek.classList.add('is-on');
      });
      row.addEventListener('mouseleave', () => { peek.classList.remove('is-on'); pVid.pause(); });
      row.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(follow); });
    });
  }

  // Magnetic buttons
  if (finePointer && !reduce) {
    document.querySelectorAll('[data-magnet]').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
      });
      b.addEventListener('mouseleave', () => { b.style.transform = ''; });
    });
  }

  // Scroll-linked: ticker, fan turn, dotted ring, statement words
  const dots = document.querySelector('.ring');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY;
    root.classList.toggle('is-scrolled', y > 40);
    if (reduce) return;
    fan.style.setProperty('--turn', `${Math.min(y / innerHeight, 1.2) * -8}deg`);
    if (dots) dots.style.setProperty('--ringturn', `${y * 0.025}deg`);
    if (words.length) {
      const r = st.getBoundingClientRect();
      const p = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35), 0, 1);
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('is-on', i < n));
    }
  };
  if (lenis) lenis.on('scroll', onScroll);
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
})();
