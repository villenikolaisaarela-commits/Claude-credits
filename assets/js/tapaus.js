// Case page: live site in the big frame, wireframe comparison, the whole page scrolling in its frame
(() => {
  const { reduce, lenis, clamp, R } = window.VS;
  const webm = document.createElement('video').canPlayType('video/webm; codecs="vp9"') !== '';

  // Big frame: the site plays once the frame is well in view
  const fig = document.querySelector('.cs-screen');
  const scr = fig.querySelector('.scr');
  let v = null;
  new IntersectionObserver(es => {
    const on = es[0].intersectionRatio >= 0.5;
    if (reduce) return;
    if (on && !v) {
      v = document.createElement('video');
      Object.assign(v, { muted: true, playsInline: true, loop: true, preload: 'none' });
      v.setAttribute('aria-hidden', 'true');
      v.src = `${R}assets/video/tyot/${fig.dataset.video}.${webm ? 'webm' : 'mp4'}?v=2`;
      v.addEventListener('playing', () => requestAnimationFrame(() => v.classList.add('is-on')));
      scr.appendChild(v);
    }
    if (v) { if (on) v.play().catch(() => {}); else v.pause(); }
  }, { threshold: [0, 0.5] }).observe(fig);

  // Wireframe vs. finished: drag the handle; it sweeps open once by itself
  const box = document.querySelector('.cmp-box');
  let x = 100, anim = 0;
  const setX = val => { x = clamp(val, 0, 100); box.style.setProperty('--x', `${x}%`); box.setAttribute('aria-valuenow', String(Math.round(x))); };
  const tween = (to, ms) => {
    cancelAnimationFrame(anim);
    const from = x, t0 = performance.now();
    const f = t => {
      const p = clamp((t - t0) / ms, 0, 1), e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      setX(from + (to - from) * e);
      if (p < 1) anim = requestAnimationFrame(f);
    };
    anim = requestAnimationFrame(f);
  };
  setX(reduce ? 50 : 100);
  new IntersectionObserver((es, ob) => { if (es[0].intersectionRatio >= 0.5) { ob.disconnect(); if (!reduce) tween(46, 1800); } }, { threshold: [0, 0.5] }).observe(box);
  let drag = false;
  const at = e => { const r = box.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * 100; };
  box.addEventListener('pointerdown', e => { drag = true; cancelAnimationFrame(anim); box.setPointerCapture(e.pointerId); setX(at(e)); });
  box.addEventListener('pointermove', e => { if (drag) setX(at(e)); });
  box.addEventListener('pointerup', () => { drag = false; });
  box.addEventListener('pointercancel', () => { drag = false; });
  box.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); tween(x - 10, 300); }
    if (e.key === 'ArrowRight') { e.preventDefault(); tween(x + 10, 300); }
  });

  // Whole front page scrolls inside its frame while the section is pinned
  const lng = document.querySelector('.lng'), fr = lng.querySelector('.lng-fr'), img = fr.querySelector('img'), pct = lng.querySelector('.lng-p');
  const phones = [...document.querySelectorAll('.phone')];
  const onScroll = () => {
    const h = innerHeight;
    const r = lng.getBoundingClientRect();
    if (r.bottom > 0 && r.top < h) {
      const p = clamp(-r.top / (r.height - h), 0, 1);
      const travel = Math.max(0, img.offsetHeight - fr.offsetHeight);
      img.style.transform = `translate3d(0, ${(-travel * p).toFixed(1)}px, 0)`;
      pct.textContent = `${String(Math.round(p * 100)).padStart(3, '0')} %`;
    }
    phones.forEach((ph, k) => {
      const b = ph.getBoundingClientRect();
      if (b.bottom < 0 || b.top > h) return;
      const t = (b.top + b.height / 2 - h / 2) / h;
      ph.style.transform = `translate3d(0, ${(t * [30, -20, 50][k]).toFixed(2)}px, 0)`;
    });
  };
  if (!reduce) { if (lenis) lenis.on('scroll', onScroll); addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll(); }
  img.addEventListener('load', onScroll);
})();
