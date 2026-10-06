(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const webm = document.createElement('video').canPlayType('video/webm; codecs="vp9"') !== '';

  // Helsinki clock
  const fmt = new Intl.DateTimeFormat('fi-FI', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Helsinki' });
  const clock = document.querySelector('[data-clock]');
  const tick = () => { clock.textContent = fmt.format(new Date()); };
  tick(); setInterval(tick, 15000);

  // Info panel
  const infoBtn = document.querySelector('.chip-info');
  const setInfo = open => {
    document.body.classList.toggle('info-open', open);
    infoBtn.setAttribute('aria-expanded', String(open));
    infoBtn.querySelector('.lbl').textContent = open ? 'Sulje' : 'Info';
  };
  infoBtn.addEventListener('click', () => setInfo(!document.body.classList.contains('info-open')));
  addEventListener('keydown', e => { if (e.key === 'Escape') setInfo(false); });

  // Work rail: endless, moves with the wheel, drag or swipe
  const rail = document.querySelector('.rail');
  const track = rail.querySelector('.track');
  const cards = [...track.querySelectorAll('.card')];
  const per = cards.length / 3;
  let W = 0, x = 0, tx = 0, hover = false;
  const measure = () => {
    const prev = W;
    W = cards[per].offsetLeft - cards[0].offsetLeft;
    if (!prev) { x = tx = -W; } else { const k = W / prev; x *= k; tx *= k; }
  };
  measure();
  addEventListener('resize', measure);

  const wrap = () => {
    if (x > 0) { x -= W; tx -= W; }
    if (x < -2 * W) { x += W; tx += W; }
  };
  const loop = () => {
    const open = document.body.classList.contains('info-open');
    if (!reduce && !hover && !drag && !open && !document.hidden) tx -= 0.35;
    x += (tx - x) * (reduce ? 1 : 0.1);
    wrap();
    track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    requestAnimationFrame(loop);
  };

  addEventListener('wheel', e => {
    if (document.body.classList.contains('info-open')) return;
    e.preventDefault();
    tx -= (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * 1.1;
  }, { passive: false });

  let drag = false, moved = false, sx = 0, stx = 0, lastX = 0, lastT = 0, vel = 0;
  rail.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    drag = true; moved = false; sx = lastX = e.clientX; stx = tx; lastT = performance.now(); vel = 0;
    rail.setPointerCapture(e.pointerId);
  });
  rail.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 5) { moved = true; rail.classList.add('is-drag'); }
    tx = stx + dx * 1.15;
    const now = performance.now();
    vel = (e.clientX - lastX) / Math.max(1, now - lastT); lastX = e.clientX; lastT = now;
  });
  const end = () => {
    if (!drag) return;
    drag = false; rail.classList.remove('is-drag');
    if (!reduce) tx += vel * 260;
  };
  rail.addEventListener('pointerup', end);
  rail.addEventListener('pointercancel', end);
  rail.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  rail.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
  rail.addEventListener('pointerleave', () => { hover = false; });

  // Keyboard: bring a focused card into view, arrows move the rail
  cards.forEach(c => c.addEventListener('focus', () => {
    const r = c.getBoundingClientRect(), m = 24;
    if (r.left < m) tx += m - r.left;
    else if (r.right > innerWidth - m) tx -= r.right - (innerWidth - m);
  }));
  addEventListener('keydown', e => {
    if (document.body.classList.contains('info-open')) return;
    if (e.key === 'ArrowRight') tx -= W / per;
    if (e.key === 'ArrowLeft') tx += W / per;
  });

  // Hover: the site itself plays inside the card
  if (fine && !reduce) cards.forEach(c => {
    let v = null;
    c.addEventListener('mouseenter', () => {
      if (drag) return;
      if (!v) {
        v = document.createElement('video');
        Object.assign(v, { muted: true, playsInline: true, loop: true, preload: 'auto' });
        v.setAttribute('aria-hidden', 'true');
        v.src = `../../assets/video/tyot/${c.dataset.video}.${webm ? 'webm' : 'mp4'}`;
        v.addEventListener('playing', () => v.classList.add('is-ready'));
        c.querySelector('.media').appendChild(v);
      }
      c.classList.add('is-on');
      v.currentTime = 0; v.play().catch(() => {});
    });
    c.addEventListener('mouseleave', () => { c.classList.remove('is-on'); if (v) v.pause(); });
  });

  requestAnimationFrame(loop);
})();
