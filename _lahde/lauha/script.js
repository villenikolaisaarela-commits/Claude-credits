// Lauha: header over the photograph, menu, the Lauha line, the savings estimate, the stairwell card and the contact form.
(() => {
  const hdr = document.querySelector('.hdr');
  const home = !document.body.classList.contains('page');
  const solid = () => hdr && home && hdr.classList.toggle('is-solid', scrollY > 40);
  addEventListener('scroll', solid, { passive: true }); solid();

  const btn = document.querySelector('.menu-btn'), mnav = document.getElementById('mnav');
  if (btn && mnav) btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', open); mnav.classList.toggle('is-open', open);
    if (open && hdr) hdr.classList.add('is-solid'); else solid();
  });

  const charts = document.querySelectorAll('.chart');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .35 });
    charts.forEach(c => io.observe(c));
  } else charts.forEach(c => c.classList.add('in'));

  const fmt = n => Math.round(n).toLocaleString('fi-FI').replace(/\s/g, '\u202f');
  const eur = n => fmt(Math.round(n / 10) * 10) + '\u00a0€';

  // Savings: heat the house needs, what it costs now, and what it costs with a heat pump
  const calc = document.querySelector('[data-save]');
  if (calc) {
    const EL = 0.16, OIL = 1.35;
    const SYS = { iv: { name: 'Ilma-vesilämpöpumppu', scop: 3.0, price: 14400, lab: .30 }, ml: { name: 'Maalämpö', scop: 3.6, price: 22500, lab: .45 } };
    const amt = calc.querySelector('[name=kulutus]'), amtO = calc.querySelector('[data-amt]');
    let lastNow = null;
    const run = () => {
      const now = calc.querySelector('[name=nyt]:checked').value;
      const sys = SYS[calc.querySelector('[name=jarjestelma]:checked').value];
      const own = +calc.querySelector('[name=omistajat]:checked').value;
      if (now !== lastNow) {
        if (now === 'oil') { amt.min = 800; amt.max = 4500; amt.step = 100; amt.value = 2600; }
        else { amt.min = 8000; amt.max = 40000; amt.step = 500; amt.value = 22000; }
        lastNow = now;
      }
      const a = +amt.value;
      const heat = now === 'oil' ? a * 10 * .85 : a;
      const costNow = now === 'oil' ? a * OIL : a * EL;
      const costAfter = heat / sys.scop * EL;
      const save = costNow - costAfter;
      const oil = now === 'oil';
      const rate = oil ? .6 : .35, cap = oil ? 3500 : 1600;
      const ded = own * Math.max(0, Math.min(cap, rate * sys.price * sys.lab / own - 150));
      const pay = (sys.price - ded) / Math.max(save, 1);
      amtO.textContent = oil ? fmt(a) + ' l / v' : fmt(a) + ' kWh / v';
      calc.querySelector('[data-save-out]').textContent = eur(save);
      const mx = Math.max(costNow, costAfter);
      calc.querySelector('[data-b-now]').style.width = (costNow / mx * 100) + '%';
      calc.querySelector('[data-b-after]').style.width = (costAfter / mx * 100) + '%';
      calc.querySelector('[data-now]').textContent = eur(costNow);
      calc.querySelector('[data-after]').textContent = eur(costAfter);
      calc.querySelector('[data-price]').textContent = eur(sys.price);
      calc.querySelector('[data-ded]').textContent = eur(ded) + (oil ? ' (öljyn vaihto, 60 %)' : '');
      calc.querySelector('[data-pay]').textContent = (Math.round(pay * 10) / 10).toLocaleString('fi-FI') + ' vuotta';
    };
    calc.addEventListener('input', run); run();
  }

  // Stairwell card: one stairwell at a time
  document.querySelectorAll('[data-rk]').forEach(card => {
    const tabs = card.querySelectorAll('[role=tab]');
    tabs.forEach(t => t.addEventListener('click', () => {
      tabs.forEach(x => x.setAttribute('aria-selected', x === t));
      card.querySelectorAll('[role=tabpanel]').forEach(p => { p.hidden = p.id !== t.getAttribute('aria-controls'); });
    }));
  });

  document.querySelectorAll('form[data-demo]').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); f.classList.add('sent'); f.querySelector('.ok').focus(); }));
})();
