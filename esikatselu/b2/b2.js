(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const webm = document.createElement('video').canPlayType('video/webm; codecs="vp9"') !== '';
  const vsrc = slug => `../../assets/video/tyot/${slug}.${webm ? 'webm' : 'mp4'}`;
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // Helsinki clock
  const fmt = new Intl.DateTimeFormat('fi-FI', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Helsinki' });
  const clocks = document.querySelectorAll('[data-clock]');
  const tick = () => { const t = fmt.format(new Date()).replace('.', ':'); clocks.forEach(c => { c.textContent = t; }); };
  tick(); setInterval(tick, 15000);

  // Smooth scroll and anchors
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1 });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const nav = document.getElementById('nav');
  const menuBtn = nav.querySelector('.menu-btn');
  const setMenu = open => { nav.classList.toggle('is-open', open); menuBtn.setAttribute('aria-expanded', String(open)); };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', e => { if (!nav.contains(e.target)) setMenu(false); });
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const el = document.querySelector(a.getAttribute('href'));
    if (!el) return;
    e.preventDefault(); setMenu(false);
    if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.3 }); else el.scrollIntoView();
  }));

  requestAnimationFrame(() => setTimeout(() => document.body.classList.add('is-loaded'), 60));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-rv]').forEach(el => io.observe(el));

  // Asterisks turn with the scroll
  const asts = [...document.querySelectorAll('.ast')];
  const spin = () => asts.forEach(a => a.style.setProperty('--spin', `${(scrollY * 0.25) % 360}deg`));
  if (!reduce) { if (lenis) lenis.on('scroll', spin); addEventListener('scroll', spin, { passive: true }); }

  // Reel: one small screen cycles through the work videos
  const reelV = document.querySelector('.reel-box video');
  const reelN = document.querySelector('[data-reel-n]');
  const slugs = [...document.querySelectorAll('.wcard [data-video]')].map(a => a.dataset.video);
  let ri = 0, reelTimer = null;
  const playReel = () => {
    reelV.src = vsrc(slugs[ri]); reelN.textContent = String(ri + 1).padStart(2, '0');
    reelV.play().catch(() => {});
  };
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !reduce) {
      if (!reelV.src) playReel(); else reelV.play().catch(() => {});
      clearInterval(reelTimer);
      reelTimer = setInterval(() => { ri = (ri + 1) % slugs.length; playReel(); }, 3600);
    } else { clearInterval(reelTimer); reelV.pause(); }
  }).observe(reelV);

  // Latest work video
  const lv = document.querySelector('.latest-card video');
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !reduce) { if (!lv.src) lv.src = vsrc(lv.dataset.src); lv.play().catch(() => {}); } else lv.pause();
  }).observe(lv);

  // Work cards: video on hover, structure on the tag
  document.querySelectorAll('.wcard [data-video]').forEach(a => {
    const card = a.closest('.wcard');
    const tag = a.querySelector('.xr-btn');
    let v = null;
    if (fine && !reduce) {
      a.addEventListener('mouseenter', () => {
        if (!v) {
          v = document.createElement('video');
          Object.assign(v, { muted: true, playsInline: true, loop: true, preload: 'auto' });
          v.src = vsrc(a.dataset.video);
          v.addEventListener('playing', () => v.classList.add('is-on'));
          a.querySelector('.scr').insertBefore(v, a.querySelector('.wire'));
        }
        v.currentTime = 0; v.play().catch(() => {});
      });
      a.addEventListener('mouseleave', () => { if (v) { v.pause(); v.classList.remove('is-on'); } card.classList.remove('show-wire'); });
    }
    tag.addEventListener('mouseenter', () => card.classList.add('show-wire'));
    tag.addEventListener('mouseleave', () => card.classList.remove('show-wire'));
    const toggle = e => { e.preventDefault(); e.stopPropagation(); card.classList.toggle('show-wire'); };
    tag.addEventListener('click', toggle);
    tag.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') toggle(e); });
  });

  // Stickers: pick up, drag, drop
  document.querySelectorAll('.stk').forEach(st => {
    let sx = 0, sy = 0, dx = 0, dy = 0, id = null;
    st.addEventListener('pointerdown', e => {
      e.preventDefault(); id = e.pointerId; st.setPointerCapture(id); st.classList.add('is-drag');
      sx = e.clientX - dx; sy = e.clientY - dy;
      document.querySelector('.drag-hint')?.remove();
    });
    st.addEventListener('pointermove', e => {
      if (e.pointerId !== id) return;
      dx = e.clientX - sx; dy = e.clientY - sy;
      st.style.setProperty('--dx', `${dx}px`); st.style.setProperty('--dy', `${dy}px`);
    });
    const drop = e => {
      if (e.pointerId !== id) return;
      id = null; st.classList.remove('is-drag');
      st.style.setProperty('--r', `${(Math.random() * 16 - 8).toFixed(1)}deg`);
    };
    st.addEventListener('pointerup', drop);
    st.addEventListener('pointercancel', drop);
  });

  // Filters
  const tabs = [...document.querySelectorAll('.tabs button')];
  tabs.forEach(b => b.addEventListener('click', () => {
    tabs.forEach(t => t.setAttribute('aria-pressed', String(t === b)));
    const f = b.dataset.f;
    document.querySelectorAll('.wcard').forEach(c => c.classList.toggle('is-hidden', f !== 'all' && c.dataset.cat !== f && c.dataset.cat !== 'all'));
  }));

  // FAQ
  document.querySelectorAll('.faq button').forEach(b => b.addEventListener('click', () => {
    b.setAttribute('aria-expanded', String(b.getAttribute('aria-expanded') !== 'true'));
  }));

  // Colour dock (preview only)
  const dock = [...document.querySelectorAll('.dock button')];
  const setAcc = c => {
    document.documentElement.dataset.acc = c;
    dock.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.c === c)));
    try { localStorage.setItem('vs-acc2', c); } catch (e) {}
  };
  dock.forEach(b => b.addEventListener('click', () => setAcc(b.dataset.c)));
  dock.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.c === document.documentElement.dataset.acc)));
})();
