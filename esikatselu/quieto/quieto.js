(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

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
  const onHdr = () => hdr.classList.toggle('is-stuck', scrollY > 24);
  addEventListener('scroll', onHdr, { passive: true });
  onHdr();

  // Hero: the last word changes, each in its own colour
  const sws = [...document.querySelectorAll('.sw')];
  const dots = [...document.querySelectorAll('.dots i')];
  if (sws.length && !reduce) {
    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      const cur = sws[i], next = sws[(i + 1) % sws.length];
      cur.classList.remove('is-on'); cur.classList.add('is-out');
      next.classList.remove('is-out');
      next.style.transition = 'none'; next.style.transform = 'translateY(105%)';
      next.offsetWidth;
      next.style.transition = ''; next.style.transform = '';
      next.classList.add('is-on');
      i = (i + 1) % sws.length;
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
    }, 2600);
  }

  // Work index: a small preview follows the cursor
  const ix = [...document.querySelectorAll('.ix[data-img]')];
  if (ix.length && fine && !reduce) {
    const peek = document.createElement('div');
    peek.className = 'peek';
    peek.setAttribute('aria-hidden', 'true');
    peek.innerHTML = '<img alt="" width="1600" height="1000">';
    document.body.append(peek);
    const img = peek.querySelector('img');
    let x = 0, y = 0, px = 0, py = 0, raf = 0;
    const loop = () => {
      px += (x - px) * 0.14; py += (y - py) * 0.14;
      peek.style.transform = `translate3d(${px + 24}px, ${py - 100}px, 0)`;
      raf = Math.abs(x - px) + Math.abs(y - py) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(loop); }, { passive: true });
    ix.forEach(a => {
      a.addEventListener('pointerenter', e => { if (!peek.classList.contains('is-on')) { px = x = e.clientX; py = y = e.clientY; } img.src = a.dataset.img; peek.classList.add('is-on'); });
      a.addEventListener('pointerleave', () => peek.classList.remove('is-on'));
    });
  }

  // Helsinki time, in the hero and the footer
  const clocks = document.querySelectorAll('[data-clock]');
  if (clocks.length) {
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Helsinki', hour: '2-digit', minute: '2-digit' });
    const tick = () => { const t = fmt.format(new Date()); clocks.forEach(c => { c.textContent = t; }); };
    tick(); setInterval(tick, 15000);
  }

  // Work images: a small "View case" tag follows the cursor
  const imgs = [...document.querySelectorAll('.w-img')];
  if (imgs.length && fine && !reduce) {
    document.documentElement.classList.add('has-tag');
    const tag = document.createElement('div');
    tag.className = 'tag mono';
    tag.setAttribute('aria-hidden', 'true');
    tag.textContent = 'View case →';
    document.body.append(tag);
    let x = 0, y = 0, px = 0, py = 0, raf = 0;
    const loop = () => {
      px += (x - px) * 0.2; py += (y - py) * 0.2;
      tag.style.transform = `translate3d(${px + 14}px, ${py + 14}px, 0)`;
      raf = Math.abs(x - px) + Math.abs(y - py) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(loop); }, { passive: true });
    imgs.forEach(a => {
      a.addEventListener('pointerenter', e => { if (!tag.classList.contains('is-on')) { px = x = e.clientX; py = y = e.clientY; } tag.classList.add('is-on'); });
      a.addEventListener('pointerleave', () => tag.classList.remove('is-on'));
    });
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
