// Studio Luoto: the phone menu, the reel, the statement that brightens as it is read, the work filter and the copy buttons.
// Everything on the page works without this file; it only adds motion and comfort.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Phone menu: opens over the page, closes with the button, Esc or a link
  const hdr = document.querySelector('.hdr');
  const btn = hdr && hdr.querySelector('.menu-btn');
  if (btn) {
    const label = btn.querySelector('span');
    const set = open => {
      hdr.classList.toggle('is-open', open);
      document.documentElement.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      label.textContent = open ? 'Sulje' : 'Valikko';
    };
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
    hdr.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
    });
    matchMedia('(min-width: 900px)').addEventListener('change', e => { if (e.matches) set(false); });
  }

  // The statement brightens word by word as it moves up the screen
  const st = document.querySelector('.reveal');
  if (st) {
    const ws = [...st.querySelectorAll('.w')];
    if (reduce) ws.forEach(w => w.classList.add('on'));
    else {
      let t = 0;
      const paint = () => {
        t = 0;
        const r = st.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.3)));
        const n = Math.round(p * ws.length);
        ws.forEach((w, i) => w.classList.toggle('on', i < n));
      };
      addEventListener('scroll', () => { if (!t) t = requestAnimationFrame(paint); }, { passive: true });
      addEventListener('resize', paint, { passive: true });
      paint();
    }
  }

  // The reel: the six sites in turn while it is on screen; it can be paused, and stays still for reduced motion
  const reel = document.querySelector('[data-reel]');
  if (reel) {
    const imgs = [...reel.querySelectorAll('img')];
    const name = document.querySelector('[data-reel-name]');
    const rb = document.querySelector('[data-reel-btn]');
    let i = 0, timer = 0, seen = false, paused = reduce;
    const show = k => {
      imgs[i].classList.remove('is-on');
      i = (k + imgs.length) % imgs.length;
      const im = imgs[i];
      if (im.loading === 'lazy') im.loading = 'eager';
      im.classList.add('is-on');
      if (name) name.textContent = im.dataset.name;
    };
    const tick = () => { stop(); if (seen && !paused) timer = setTimeout(() => { show(i + 1); tick(); }, 3200); };
    const stop = () => { clearTimeout(timer); timer = 0; };
    if (rb) {
      const lab = rb.querySelector('span');
      const sync = () => { rb.setAttribute('aria-pressed', paused ? 'true' : 'false'); lab.textContent = paused ? 'Toista' : 'Pysäytä'; };
      sync();
      rb.addEventListener('click', () => { paused = !paused; sync(); tick(); });
    }
    new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (seen) imgs.forEach(im => { im.loading = 'eager'; });
      tick();
    }, { rootMargin: '200px 0px' }).observe(reel);
  }

  // Work filter: the pills show one field at a time
  document.querySelectorAll('.pills').forEach(group => {
    const list = group.closest('section, main').querySelector('.cards') || document.querySelector('.cards');
    const count = group.parentElement.querySelector('[data-count]');
    const pills = [...group.querySelectorAll('.pill')];
    pills.forEach(p => p.addEventListener('click', () => {
      const f = p.dataset.filter;
      pills.forEach(q => q.setAttribute('aria-pressed', q === p ? 'true' : 'false'));
      let shown = 0;
      list.querySelectorAll('.card').forEach(c => {
        const on = f === 'kaikki' || c.dataset.cat === f;
        c.hidden = !on;
        if (on) shown += 1;
      });
      if (count) count.textContent = f === 'kaikki' ? '' : `${shown} ${shown === 1 ? 'työ' : 'työtä'}: ${p.textContent}`;
    }));
  });

  // Copy the address or the number, and say so
  const status = document.querySelector('.status');
  document.querySelectorAll('[data-copy]').forEach(b => {
    b.addEventListener('click', async () => {
      const text = b.dataset.copy;
      let ok = false;
      try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
        const t = document.createElement('textarea');
        t.value = text; t.setAttribute('readonly', ''); t.style.position = 'absolute'; t.style.left = '-9999px';
        document.body.append(t); t.select();
        try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
        t.remove();
      }
      const span = b.querySelector('span');
      span.textContent = ok ? 'Kopioitu' : 'Ei onnistunut';
      if (status) status.textContent = ok ? `${text} kopioitu leikepöydälle.` : 'Kopiointi ei onnistunut. Valitse teksti ja kopioi se itse.';
      setTimeout(() => { span.textContent = 'Kopioi'; }, 2200);
    });
  });
})();
