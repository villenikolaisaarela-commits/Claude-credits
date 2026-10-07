// Work page: frames open in sequence, the first frame plays the site, gentle parallax
(() => {
  const { reduce, lenis } = window.VS;
  const webm = document.createElement('video').canPlayType('video/webm; codecs="vp9"') !== '';
  const projs = [...document.querySelectorAll('.proj')];
  const play = pr => {
    if (reduce) return;
    let v = pr.querySelector('video');
    if (pr.vis) {
      if (!v) {
        v = document.createElement('video');
        Object.assign(v, { muted: true, playsInline: true, loop: true, preload: 'auto' });
        v.setAttribute('aria-hidden', 'true');
        v.src = `../../../assets/video/tyot/${pr.dataset.video}.${webm ? 'webm' : 'mp4'}`;
        v.addEventListener('playing', () => v.classList.add('is-on'));
        pr.querySelector('.fr .fb').appendChild(v);
      }
      v.play().catch(() => {});
    } else if (v) v.pause();
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    const pr = e.target;
    pr.vis = e.isIntersecting;
    if (pr.vis && !pr.classList.contains('in')) { pr.classList.add('in'); setTimeout(() => play(pr), 1300); }
    else play(pr);
  }), { threshold: 0.15 });
  projs.forEach(p => io.observe(p));

  // Frames drift a little against each other while scrolling
  const frames = projs.map(p => [...p.querySelectorAll('.fr')]);
  const par = () => {
    if (innerWidth < 761) return;
    projs.forEach((p, i) => {
      const r = p.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      const t = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      frames[i].forEach((f, k) => f.style.setProperty('--py', `${(t * (k % 2 ? 26 : -14)).toFixed(1)}px`));
    });
  };
  if (!reduce) { if (lenis) lenis.on('scroll', par); addEventListener('scroll', par, { passive: true }); par(); }
})();
