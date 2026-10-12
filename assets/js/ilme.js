// Ville Saarela: smooth scrolling, words that settle into view, a quiet cursor, the menu, and the footer logo rising into place.
// Without this file every page reads and works the same, only without the motion.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Smooth scroll
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false, anchors: { offset: -80 } });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // Header turns solid once the page has moved
  const hdr = document.querySelector('.hdr');
  const solid = () => hdr && hdr.classList.toggle('is-solid', scrollY > 24);
  addEventListener('scroll', solid, { passive: true });
  solid();

  // Menu over the whole screen; Esc, a link or the button closes it
  const btn = document.querySelector('.menu-btn');
  const menu = document.getElementById('valikko');
  if (btn && menu) {
    const label = btn.querySelector('span');
    const set = open => {
      menu.classList.toggle('is-open', open);
      menu.toggleAttribute('inert', !open);
      document.documentElement.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      label.textContent = open ? 'Sulje' : 'Valikko';
      if (lenis) open ? lenis.stop() : lenis.start();
      if (open) setTimeout(() => menu.querySelector('a').focus({ preventScroll: true }), 50);
    };
    menu.setAttribute('inert', '');
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => set(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); } });
  }

  // Time in Helsinki
  const fmt = new Intl.DateTimeFormat('fi-FI', { timeZone: 'Europe/Helsinki', hour: '2-digit', minute: '2-digit' });
  const clocks = document.querySelectorAll('[data-clock]');
  const tick = () => { const t = fmt.format(new Date()); clocks.forEach(c => { c.textContent = t; }); };
  if (clocks.length) { tick(); setInterval(tick, 15000); }

  // Words and blocks settle out of a slight blur as they reach the screen
  if (!reduce && 'IntersectionObserver' in window) {
    document.querySelectorAll('.rv-w').forEach(el => {
      // Split into words, keeping the inner spans (the second tone) intact
      const walk = node => {
        [...node.childNodes].forEach(n => {
          if (n.nodeType === 3) {
            const parts = n.textContent.split(/(\s+)/);
            const frag = document.createDocumentFragment();
            parts.forEach(p => {
              if (!p) return;
              if (/^\s+$/.test(p)) frag.append(document.createTextNode(p));
              else { const s = document.createElement('span'); s.className = 'w'; s.textContent = p; frag.append(s); }
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
        });
      };
      walk(el);
      el.querySelectorAll('.w').forEach((w, i) => { w.style.transitionDelay = `${Math.min(i * 0.05, 0.9)}s`; });
    });
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    // What is already on the first screen comes in straight away; the rest waits for its turn
    document.querySelectorAll('.rv-w, .rv').forEach(el => {
      if (el.getBoundingClientRect().top < innerHeight) requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
      else io.observe(el);
    });
  } else {
    document.querySelectorAll('.rv-w, .rv').forEach(el => el.classList.add('in'));
  }

  // The aa mark drifts a little slower than the page; the footer logo rises and straightens as the page ends
  const mark = document.querySelector('.hero-mark');
  const flogo = document.querySelector('.ftr-logo img');
  const ftr = document.querySelector('.ftr');
  if (!reduce && (mark || flogo)) {
    let t = 0;
    const move = () => {
      t = 0;
      if (mark && scrollY < innerHeight * 1.2) mark.style.transform = `translate3d(0, ${(scrollY * 0.18).toFixed(1)}px, 0)`;
      if (flogo && ftr) {
        const r = ftr.getBoundingClientRect();
        const p = clamp((innerHeight - r.top) / Math.max(1, r.height), 0, 1);   // 0 when the footer appears, 1 when it is all in view
        const q = 1 - p;
        flogo.style.transform = `translate3d(0, ${(q * 60).toFixed(1)}px, 0) rotateX(${(q * 55).toFixed(1)}deg) scale(${(1 - q * 0.06).toFixed(3)})`;
        flogo.style.opacity = (0.25 + 0.75 * p).toFixed(3);
      }
    };
    const ask = () => { if (!t) t = requestAnimationFrame(move); };
    addEventListener('scroll', ask, { passive: true });
    addEventListener('resize', ask, { passive: true });
    move();
  }

  // Leaving for another page: a short fade, so pages follow each other softly
  if (!reduce) {
    document.addEventListener('click', e => {
      const a = e.target.closest('a');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const href = a.getAttribute('href') || '';
      if (a.target === '_blank' || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      e.preventDefault();
      document.body.classList.add('is-leaving');
      setTimeout(() => { location.href = a.href; }, 220);
    });
    addEventListener('pageshow', ev => { if (ev.persisted) document.body.classList.remove('is-leaving'); });
  }

  if (!fine || reduce) return;

  // Cursor: a dot that follows a step behind and opens into a label over the work
  const cur = document.createElement('div');
  cur.className = 'cur';
  cur.setAttribute('aria-hidden', 'true');
  cur.innerHTML = '<span>Katso</span>';
  document.body.append(cur);
  let tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty, running = false;
  const follow = () => {
    cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
    cur.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) translate(-50%, -50%)`;
    running = Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1;
    if (running) requestAnimationFrame(follow);
  };
  addEventListener('pointermove', e => {
    tx = e.clientX; ty = e.clientY;
    cur.classList.add('is-on');
    if (!running) { running = true; requestAnimationFrame(follow); }
  }, { passive: true });
  document.addEventListener('pointerleave', () => cur.classList.remove('is-on'));
  document.querySelectorAll('[data-cur]').forEach(el => {
    el.addEventListener('pointerenter', () => { cur.querySelector('span').textContent = el.dataset.cur; cur.classList.add('is-big'); });
    el.addEventListener('pointerleave', () => cur.classList.remove('is-big'));
  });

  // Work pictures lean a touch towards the pointer and settle back
  document.querySelectorAll('.tile').forEach(t => {
    const img = t.querySelector('.tile-img');
    if (!img) return;
    t.addEventListener('pointermove', e => {
      const r = img.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      img.style.transform = `perspective(900px) rotateY(${(x * 4).toFixed(2)}deg) rotateX(${(-y * 4).toFixed(2)}deg) scale(0.975)`;
    });
    t.addEventListener('pointerleave', () => { img.style.transform = ''; });
  });
})();
