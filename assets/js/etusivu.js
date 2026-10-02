(() => {
  const root = document.documentElement;
  const poster = document.querySelector('.poster');
  const head = document.querySelector('[data-fit]');
  const mail = document.querySelector('[data-fit-one]');
  const mq = matchMedia('(max-width: 760px)');

  // Set the headline edge to edge: one size, chosen so the widest line spans the page.
  function fitHeadline() {
    const set = head.querySelector(mq.matches ? '.set-m' : '.set-d');
    const spans = [...set.querySelectorAll('.ln > span')];
    head.style.fontSize = '100px';
    const widest = Math.max(...spans.map(s => s.getBoundingClientRect().width));
    const cs = getComputedStyle(poster);
    const avail = poster.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    let fs = 100 * (avail + 100 * 0.055) / widest;
    if (!mq.matches) {
      // keep the whole poster inside the first screen
      const foot = poster.querySelector('.poster-foot').offsetHeight;
      const room = innerHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - foot - 48;
      fs = Math.min(fs, room / (spans.length * 0.8));
    }
    head.style.fontSize = fs.toFixed(2) + 'px';
  }
  function fitMail() {
    const span = mail.querySelector('span');
    mail.style.fontSize = '100px';
    const w = span.getBoundingClientRect().width;
    const avail = mail.parentElement.clientWidth - parseFloat(getComputedStyle(mail.parentElement).paddingLeft) * 2;
    mail.style.fontSize = (100 * avail / w).toFixed(2) + 'px';
  }
  function fit() { fitHeadline(); fitMail(); }

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    fit();
    requestAnimationFrame(() => { poster.classList.add('is-ready'); root.classList.add('is-ready'); });
  });
  let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(fit, 80); });

  // Live clock, Helsinki time.
  const clock = document.querySelector('[data-clock]');
  const fmt = new Intl.DateTimeFormat('fi-FI', { timeZone: 'Europe/Helsinki', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const tick = () => { clock.textContent = fmt.format(new Date()).replace(/:/g, '.'); };
  tick(); setInterval(tick, 1000);

  // Reveal: images open from the bottom up, text rises softly.
  document.querySelectorAll('.p, .about-photo').forEach(el => el.setAttribute('data-rv', ''));
  document.querySelectorAll('.plan, .steps li, .care, .lead, .body, .wall-note, .contact-body').forEach(el => el.setAttribute('data-rv-t', ''));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('[data-rv], [data-rv-t]').forEach(el => io.observe(el));

  // Hover plays the preview video.
  const base = 'assets/video/tyot/';
  document.querySelectorAll('[data-video]').forEach(a => {
    if (!matchMedia('(hover: hover)').matches) return;
    let v;
    a.addEventListener('mouseenter', () => {
      if (!v) {
        v = document.createElement('video');
        v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('aria-hidden', 'true');
        v.innerHTML = `<source src="${base}${a.dataset.video}.webm" type="video/webm"><source src="${base}${a.dataset.video}.mp4" type="video/mp4">`;
        a.querySelector('.media').appendChild(v);
      }
      v.play().then(() => a.classList.add('is-playing')).catch(() => {});
    });
    a.addEventListener('mouseleave', () => { a.classList.remove('is-playing'); if (v) setTimeout(() => v.pause(), 700); });
  });
})();
