(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const webm = document.createElement('video').canPlayType('video/webm; codecs="vp9"') !== '';
  const vsrc = slug => `../../assets/video/tyot/${slug}.${webm ? 'webm' : 'mp4'}`;
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // Helsinki clock
  const fmt = new Intl.DateTimeFormat('fi-FI', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Helsinki' });
  const clocks = document.querySelectorAll('[data-clock]');
  const tick = () => { const t = fmt.format(new Date()); clocks.forEach(c => { c.textContent = t; }); };
  tick(); setInterval(tick, 15000);

  // Smooth scroll, anchors, menu, header line
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.085 });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const hdr = document.getElementById('hdr');
  const menuBtn = document.querySelector('.menu-btn');
  const menu = document.getElementById('mmenu');
  menuBtn.addEventListener('click', () => { menu.hidden = !menu.hidden; menuBtn.setAttribute('aria-expanded', String(!menu.hidden)); });
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const el = document.querySelector(a.getAttribute('href'));
    if (!el) return;
    e.preventDefault(); menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.scrollTo(el, { offset: -64, duration: 1.4 }); else el.scrollIntoView();
  }));
  const darks = [...document.querySelectorAll('[data-dark]')];
  const reelClip = document.querySelector('.reel-clip');
  const steps = document.querySelector('.steps');
  const stepLis = [...steps.querySelectorAll('li')];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const onScroll = () => {
    hdr.classList.toggle('is-scrolled', scrollY > 8);
    hdr.classList.toggle('on-dark', darks.some(d => { const b = d.getBoundingClientRect(); return b.top <= 32 && b.bottom >= 32; }));
    // Reel grows to the edges as it comes in
    const rb = reelClip.getBoundingClientRect();
    const rp = reduce ? 1 : clamp((innerHeight - rb.top) / (innerHeight * 0.85), 0, 1);
    reelClip.style.setProperty('--i', ((1 - rp) * 9).toFixed(2));
    // Process line fills, dots light up
    const sb = steps.getBoundingClientRect();
    const vertical = getComputedStyle(steps).gridTemplateColumns.split(' ').length === 1;
    const sp = reduce ? 1 : clamp((innerHeight * 0.72 - sb.top) / (vertical ? sb.height : sb.height * 1.6), 0, 1);
    steps.style.setProperty('--p', sp.toFixed(3));
    stepLis.forEach((li, i) => li.classList.toggle('is-on', vertical ? sp * sb.height >= li.offsetTop - 2 : sp >= i / stepLis.length + 0.001 || (i === 0 && sp > 0)));
  };
  if (lenis) lenis.on('scroll', onScroll);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  requestAnimationFrame(() => setTimeout(() => document.body.classList.add('is-loaded'), 60));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-rv]').forEach(el => io.observe(el));

  // Reel: the studio's work, one after another
  const items = [...document.querySelectorAll('.index a')].map(a => ({
    slug: a.dataset.img.match(/img\/(.+)-final/)[1],
    t: a.querySelector('.t').textContent,
    k: `${a.querySelector('.k').textContent} · 2026`,
  }));
  const v = document.querySelector('.reel-box video');
  const bar = document.querySelector('.reel-bar i');
  const r = k => document.querySelector(`[data-r="${k}"]`);
  const DUR = 6500;
  let ri = 0, t0 = 0, on = false;
  const show = i => {
    const it = items[i], n = String(i + 1).padStart(2, '0');
    v.classList.add('is-off');
    setTimeout(() => {
      v.poster = `../a/img/${it.slug}-final-1440.webp`;
      v.src = vsrc(it.slug);
      v.play().catch(() => {});
      v.classList.remove('is-off');
      r('n').textContent = n; r('n2').textContent = n; r('t').textContent = it.t; r('k').textContent = it.k;
    }, reduce ? 0 : 450);
    t0 = performance.now();
  };
  const loop = now => {
    if (on) {
      const p = Math.min(1, (now - t0) / DUR);
      bar.style.width = `${p * 100}%`;
      if (p >= 1) { ri = (ri + 1) % items.length; show(ri); }
    }
    requestAnimationFrame(loop);
  };
  if (!reduce) {
    new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      if (on) { if (!v.src) show(0); else { v.play().catch(() => {}); t0 = performance.now() - parseFloat(bar.style.width || 0) / 100 * DUR; } } else v.pause();
    }).observe(v);
    requestAnimationFrame(loop);
  }

  // Selected work: the site's own video on hover
  if (fine && !reduce) document.querySelectorAll('.case [data-video]').forEach(a => {
    let vid = null;
    a.addEventListener('mouseenter', () => {
      if (!vid) {
        vid = document.createElement('video');
        Object.assign(vid, { muted: true, playsInline: true, loop: true, preload: 'auto' });
        vid.src = vsrc(a.dataset.video);
        vid.addEventListener('playing', () => vid.classList.add('is-on'));
        a.querySelector('.inner').appendChild(vid);
      }
      vid.currentTime = 0; vid.play().catch(() => {});
    });
    a.addEventListener('mouseleave', () => { if (vid) { vid.pause(); vid.classList.remove('is-on'); } });
  });

  // Cursor label over the selected work
  const cur = document.querySelector('.cur');
  if (fine) {
    let cx = -200, cy = -200, tx = -200, ty = -200, run = false;
    const step = () => { cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22; cur.style.setProperty('--cx', `${cx}px`); cur.style.setProperty('--cy', `${cy}px`); run = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.4; if (run) requestAnimationFrame(step); };
    document.querySelectorAll('.case a').forEach(a => {
      a.addEventListener('mouseenter', e => { if (!cur.classList.contains('is-on')) { cx = tx = e.clientX; cy = ty = e.clientY; } cur.classList.add('is-on'); step(); });
      a.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; if (!run) { run = true; requestAnimationFrame(step); } });
      a.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
    });
  }

  // Index: a preview follows the cursor
  const peek = document.querySelector('.peek');
  const pimg = peek.querySelector('img');
  if (fine) {
    let x = 0, y = 0, tx = 0, ty = 0, raf = null;
    const follow = () => { x += (tx - x) * 0.18; y += (ty - y) * 0.18; peek.style.setProperty('--px', `${x}px`); peek.style.setProperty('--py', `${y}px`); raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(follow) : null; };
    document.querySelectorAll('.index a').forEach(a => {
      a.addEventListener('mouseenter', e => { pimg.src = a.dataset.img; if (!peek.classList.contains('is-on')) { x = tx = e.clientX + 24; y = ty = e.clientY - 110; } peek.classList.add('is-on'); });
      a.addEventListener('mousemove', e => { tx = e.clientX + 24; ty = e.clientY - 110; if (!raf) raf = requestAnimationFrame(follow); });
    });
    document.querySelector('.index ul').addEventListener('mouseleave', () => peek.classList.remove('is-on'));
  }

  // Start a project: compose an email, nothing is stored
  const form = document.getElementById('form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const need = fd.getAll('tarve').join(', ') || '-';
    const lines = [
      `Mitä tarvitsen: ${need}`,
      `Budjetti: ${fd.get('budjetti') || '-'}`,
      `Aikataulu: ${fd.get('aikataulu') || '-'}`,
      '',
      fd.get('viesti') || '',
      '',
      [fd.get('nimi'), fd.get('yritys')].filter(Boolean).join(', '),
    ];
    const subject = `Projekti${fd.get('yritys') ? ': ' + fd.get('yritys') : ''}`;
    location.href = `mailto:info@villesaarela.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  });
})();
