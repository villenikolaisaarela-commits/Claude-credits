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
    const show = () => { const on = !v.paused; b.textContent = on ? (b.dataset.pause || 'Pysäytä') : (b.dataset.play || 'Toista'); b.setAttribute('aria-pressed', String(!on)); };
    v.addEventListener('play', show); v.addEventListener('pause', show);
    b.addEventListener('click', () => { if (v.paused) { paused = false; v.play().catch(() => {}); } else { paused = true; v.pause(); } });
    if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && !paused) v.play().catch(() => {}); else if (!e.isIntersecting) v.pause();
    }), { threshold: 0.35 }).observe(f);
  });

  // Demo requests open a choice of ways to write, because a bare mailto does nothing without a mail app
  const d = document.getElementById('ask');
  if (d && d.showModal) {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="mailto:"][href*="subject="]');
      if (!a || d.contains(a)) return;
      e.preventDefault(); d.showModal();
    });
    d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
    // The form posts through FormSubmit, so no mail app is needed
    const f = d.querySelector('.ask-f');
    if (f && window.fetch) f.addEventListener('submit', async e => {
      e.preventDefault();
      const st = f.querySelector('.ask-st'), b = f.querySelector('button[type=submit]');
      const data = new FormData(f);
      if (data.get('Yritys')) data.set('_subject', data.get('_subject') + ': ' + data.get('Yritys'));
      b.disabled = true; st.textContent = f.dataset.busy;
      try {
        const r = await fetch(f.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), { method: 'POST', headers: { Accept: 'application/json' }, body: data });
        const j = await r.json();
        if (!r.ok || String(j.success) !== 'true') throw new Error(j.message || r.status);
        const ok = document.createElement('p'); ok.className = 'ask-ok'; ok.setAttribute('role', 'status'); ok.textContent = f.dataset.ok;
        f.replaceWith(ok); ok.focus && ok.setAttribute('tabindex', '-1'); ok.focus();
      } catch (err) { st.textContent = f.dataset.err; b.disabled = false; }
    });
  }

  const els = [...document.querySelectorAll('.rv')];
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  requestAnimationFrame(() => requestAnimationFrame(() => els.forEach(e => {
    if (e.getBoundingClientRect().top < innerHeight) e.classList.add('in'); else io.observe(e);
  })));
})();
