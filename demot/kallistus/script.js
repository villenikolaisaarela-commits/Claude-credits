// Kallistus: menu, the slope dividers, the price estimate and the request form. The pages read fine without it.
(() => {
  const hdr = document.querySelector('.hdr');
  const onScroll = () => hdr && hdr.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const btn = document.querySelector('.menu-btn'), mnav = document.getElementById('mnav');
  if (btn && mnav) btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', open); mnav.classList.toggle('is-open', open);
  });

  // Slope dividers draw once when they reach the screen
  const slopes = document.querySelectorAll('.slope');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
    slopes.forEach(s => io.observe(s));
  } else slopes.forEach(s => s.classList.add('in'));

  // Price estimate. Labour is about half of the price; the household deduction is 35 % of labour minus 150 €, at most 1 600 € per owner (2026).
  const calc = document.querySelector('[data-calc]');
  if (calc) {
    const T = {
      kt: { base: 9900, m2: 2300, def: 4, lab: .52 },
      ok: { base: 11500, m2: 2100, def: 6, lab: .52 },
      sa: { base: 15800, m2: 2000, def: 9, lab: .54 },
      wc: { base: 5900, m2: 1600, def: 1.5, lab: .5 },
    };
    const RATE = .35, CAP = 1600, SELF = 150;
    const eur = n => Math.round(n / 100) * 100;
    const fmt = n => eur(n).toLocaleString('fi-FI').replace(/\s/g, '\u202f') + '\u00a0€';
    const m2 = calc.querySelector('[name=m2]'), m2o = calc.querySelector('[data-m2]');
    let lastType = null;
    const run = () => {
      const type = calc.querySelector('[name=tyyppi]:checked').value;
      const own = +calc.querySelector('[name=omistajat]:checked').value;
      if (type !== lastType) { m2.value = T[type].def; lastType = type; }
      const t = T[type], a = +m2.value;
      const mid = t.base + t.m2 * a, lo = mid * .93, hi = mid * 1.08;
      const lab = mid * t.lab;
      const ded = own * Math.max(0, Math.min(CAP, RATE * lab / own - SELF));
      m2o.textContent = a.toLocaleString('fi-FI') + ' m²';
      calc.querySelector('[data-range]').textContent = fmt(lo) + ' – ' + fmt(hi);
      calc.querySelector('[data-lab]').textContent = 'noin ' + fmt(lab);
      calc.querySelector('[data-ded]').textContent = fmt(ded);
      calc.querySelector('[data-net]').textContent = fmt(lo - ded) + ' – ' + fmt(hi - ded);
    };
    calc.addEventListener('input', run); run();
  }

  // The request form is a demonstration: it shows what would happen and sends nothing
  document.querySelectorAll('form[data-demo]').forEach(f => {
    f.addEventListener('submit', e => { e.preventDefault(); f.classList.add('sent'); f.querySelector('.ok').focus(); });
    f.querySelectorAll('input[type=file]').forEach(inp => inp.addEventListener('change', () => {
      const n = inp.files.length; inp.closest('.upload').querySelector('[data-files]').textContent = n ? `${n} kuva${n > 1 ? 'a' : ''} valittu` : 'Lisää kuvia nykyisestä kylpyhuoneesta';
    }));
  });
})();
