// Process page: the site on the screen builds itself step by step as you scroll
(() => {
  const { reduce, lenis, clamp, stage } = window.VS;
  const pin = document.querySelector('.pr-pin');
  const steps = [...pin.querySelectorAll('.ps')];
  const line = pin.querySelector('.pr-line');
  const cap = pin.querySelector('.mon-st');
  const st = stage.make(pin.querySelector('.stage'),
    '<span class="ov note n1">Mitä teet?</span><span class="ov note n2">Kenelle?</span><span class="ov note n3">Mitä sivun pitää tehdä?</span>' +
    '<span class="ov tag">Luonnos v1 · maksuton</span>' +
    '<span class="ov cmt">Vaihdetaanko pääkuva?<b>✓ Tehty</b></span>' +
    '<span class="ov serp"><i>sinunyritys.fi</i><b>Sinun Yritys · Helsinki</b><span>Hienot sivut, jotka myös toimivat. Ota yhteyttä ja pyydä tarjous.</span></span>');
  const WEEK = ['Päivä 1', 'Viikko 1', 'Viikot 2–3', 'Viikko 4'];
  let ph = -2;
  stage.set(st, -1, true);
  const show = k => {
    if (k === ph) return;
    ph = k;
    stage.set(st, Math.max(0, k));
    steps.forEach((s, i) => { s.classList.toggle('on', i === k); s.classList.toggle('done', i < k); });
    cap.textContent = `Vaihe ${Math.max(0, k) + 1} / 4 · ${WEEK[Math.max(0, k)]}`;
  };
  const onScroll = () => {
    const r = pin.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight), 0, 1);
    line.style.transform = `scaleY(${p.toFixed(4)})`;
    if (r.top > innerHeight * 0.5) { if (ph !== -1) { ph = -1; stage.set(st, -1); steps.forEach(s => s.classList.remove('on', 'done')); } return; }
    show(Math.min(3, Math.floor(p * 4)));
  };
  // Clicking a step jumps to it
  steps.forEach((s, i) => s.addEventListener('click', () => {
    const top = pin.getBoundingClientRect().top + scrollY + (pin.offsetHeight - innerHeight) * ((i + 0.5) / 4);
    if (lenis) lenis.scrollTo(top, { duration: 1.2 }); else scrollTo(0, top);
  }));
  if (lenis) lenis.on('scroll', onScroll);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
  if (reduce) show(0);
})();
