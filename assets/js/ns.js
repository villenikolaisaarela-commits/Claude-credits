// The one motion moment: a soft light follows the pointer across the embossed mark.
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('.mark').forEach(mark => {
    const light = mark.querySelector('.light');
    if (!light) return;
    let raf = 0;
    mark.addEventListener('pointermove', e => {
      const r = mark.getBoundingClientRect();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        light.style.setProperty('--x', `${((e.clientX - r.left) / r.width) * 100}%`);
        light.style.setProperty('--y', `${((e.clientY - r.top) / r.height) * 100}%`);
      });
      mark.classList.add('is-lit');
    });
    mark.addEventListener('pointerleave', () => mark.classList.remove('is-lit'));
  });
})();
