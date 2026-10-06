(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const tween = (from, to, dur, step) => new Promise(done => {
    if (reduce) { step(to); return done(); }
    const t0 = performance.now();
    const tick = now => {
      const t = clamp((now - t0) / dur, 0, 1);
      step(from + (to - from) * ease(t));
      t < 1 ? requestAnimationFrame(tick) : done();
    };
    requestAnimationFrame(tick);
  });
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // Smooth scroll, in-page anchors, mobile menu
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const menuBtn = document.querySelector('.menu-btn');
  const menu = document.getElementById('mmenu');
  menuBtn.addEventListener('click', () => { menu.hidden = !menu.hidden; menuBtn.setAttribute('aria-expanded', String(!menu.hidden)); });
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const el = document.querySelector(a.getAttribute('href'));
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { offset: -56, duration: 1.4 }); else el.scrollIntoView();
    menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false');
  }));

  requestAnimationFrame(() => setTimeout(() => document.body.classList.add('is-loaded'), 80));

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-rv]').forEach(el => io.observe(el));

  // Hero: a page builds itself — wireframe, notes, finished page
  const SLIDES = [
    { slug: 'buffbird', name: 'BuffBird · Treenisovellus', url: 'buffbird.eu', notes: [
      [36, 74, 't', 'Yksi tavoite, yksi toiminto: odotuslista.'],
      [76, 30, 'l', 'Sovellus näkyy, vaikka sitä ei voi vielä ladata.'],
      [7, 81, '', 'Lupaus lomakkeen alla: yksi viesti, lähde milloin vain.'] ] },
    { slug: 'lindqvist-ekroos', name: 'Lindqvist Ekroos · Arkkitehtitoimisto', url: 'villesaarela.com/demot/lindqvist-ekroos', notes: [
      [6, 24, '', 'Kuka, mitä ja missä yhdellä lauseella.'],
      [74, 22, 'l', 'Faktat sivussa: perustettu, henkilöstö, työn alla.'],
      [50, 72, '', 'Rakennus puhuu puolestaan. Kuva koko leveydeltä.'] ] },
    { slug: 'keljon-puusepat', name: 'Keljon Puusepät · Puusepänliike', url: 'villesaarela.com/demot/keljon-puusepat', notes: [
      [68, 20, 'l', 'Hinta-arvio näkyy ennen ensimmäistä puhelua.'],
      [94, 4, 'lb', 'Tarjouspyyntö on aina yhden klikkauksen päässä.'],
      [30, 66, '', 'Iso kuva näyttää käsityön heti.'] ] },
  ];
  const screen = document.querySelector('.hero .screen');
  const wire = screen.querySelector('.wire');
  const fin = screen.querySelector('.final');
  const notesEl = screen.querySelector('.notes');
  const cap = document.querySelector('.hero .cap');
  const url = document.querySelector('.hero .url');
  const logName = document.querySelector('.log-name');
  const logSteps = [...document.querySelectorAll('.log-steps li')];
  const setStep = k => logSteps.forEach((li, i) => { li.classList.toggle('is-on', i === k); li.classList.toggle('is-done', i < k); });
  const src = (slug, kind) => [`img/${slug}-${kind}-900.webp`, `img/${slug}-${kind}-900.webp 900w, img/${slug}-${kind}-1440.webp 1440w`];
  const setImg = (el, [s, ss]) => { el.srcset = ss; el.src = s; return el.decode ? el.decode().catch(() => {}) : Promise.resolve(); };
  const noteHtml = (n, i) => `<div class="note ${n[2]}" style="--x:${n[0]}%;--y:${n[1]}%"><p><span class="mono">0${i + 1}</span>${n[3]}</p></div>`;
  const setScan = v => screen.style.setProperty('--scan', `${v}%`);
  SLIDES.forEach(s => ['wire', 'final'].forEach(k => { const i = new Image(); i.srcset = src(s.slug, k)[1]; i.sizes = wire.sizes; }));

  async function play(s, first) {
    if (!first) {
      screen.style.transition = 'opacity .35s'; screen.style.opacity = '0';
      await wait(380);
      screen.classList.remove('s-wire', 's-scan'); setScan(0); notesEl.innerHTML = '';
      await Promise.all([setImg(wire, src(s.slug, 'wire')), setImg(fin, src(s.slug, 'final'))]);
      screen.style.opacity = '1';
    }
    url.textContent = s.url; logName.textContent = s.name;
    setStep(0); screen.classList.add('s-wire');
    await wait(1100);
    setStep(1);
    notesEl.innerHTML = s.notes.map(noteHtml).join('');
    const ns = [...notesEl.children];
    for (let i = 0; i < ns.length; i++) {
      ns[i].classList.add('is-on');
      cap.innerHTML = `<span class="mono">0${i + 1}</span>${s.notes[i][3]}`;
      await wait(i === ns.length - 1 ? 1300 : 900);
    }
    setStep(2); screen.classList.add('s-scan');
    await tween(0, 100, 1500, setScan);
    screen.classList.remove('s-scan');
    await wait(2600);
  }
  if (reduce) {
    screen.classList.add('s-wire'); setScan(100); setStep(2);
    notesEl.innerHTML = SLIDES[0].notes.map(noteHtml).join('');
    [...notesEl.children].forEach(n => n.classList.add('is-on'));
    cap.innerHTML = `<span class="mono">01</span>${SLIDES[0].notes[0][3]}`;
  } else {
    (async () => {
      await wait(700);
      for (let i = 0; ; i = (i + 1) % SLIDES.length) {
        while (document.hidden) await wait(500);
        await play(SLIDES[i], i === 0 && !screen.dataset.played);
        screen.dataset.played = '1';
      }
    })();
  }

  // Work cards: wireframe under the finished page
  document.querySelectorAll('[data-cmp]').forEach(a => {
    const set = v => a.style.setProperty('--x', `${v}%`);
    let x = 100, dragged = false, startX = 0, live = false;
    const to = (v, d = 700) => tween(x, v, d, n => { x = n; set(n); });
    const cio = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      cio.disconnect();
      a.classList.add('is-active');
      setTimeout(() => to(0, 1500).then(() => { if (!live) a.classList.remove('is-active'); }), 350);
    }, { threshold: 0.45 });
    cio.observe(a);
    const at = e => { const r = a.getBoundingClientRect(); x = clamp((e.clientX - r.left) / r.width * 100, 0, 100); set(x); };
    a.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { live = true; a.classList.add('is-active'); } });
    a.addEventListener('pointermove', e => {
      if (e.pointerType === 'mouse') return at(e);
      if (Math.abs(e.clientX - startX) > 6) { dragged = true; live = true; a.classList.add('is-active'); at(e); }
    });
    a.addEventListener('pointerdown', e => { startX = e.clientX; dragged = false; });
    a.addEventListener('pointerleave', e => { if (e.pointerType !== 'mouse') return; live = false; to(0).then(() => { if (!live) a.classList.remove('is-active'); }); });
    a.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse' && dragged) setTimeout(() => { live = false; to(0).then(() => a.classList.remove('is-active')); }, 900); });
    a.addEventListener('click', e => { if (dragged) { e.preventDefault(); dragged = false; } });
  });

  // Process: one page goes from brief to launch while the section is pinned
  const pin = document.querySelector('.proc-pin');
  const vis = document.querySelector('.proc-vis');
  const steps = [...document.querySelectorAll('.steps li')];
  const brief = vis.querySelector('.pv-brief');
  const pvNotes = [...vis.querySelectorAll('.note')];
  const pvUrl = vis.querySelector('.pv-url');
  const span = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  const desk = matchMedia('(min-width: 901px)');
  const onScroll = () => {
    if (!desk.matches) return;
    const r = pin.getBoundingClientRect();
    const p = reduce ? 1 : clamp(-r.top / (r.height - innerHeight + 56), 0, 1);
    const k = Math.min(3, Math.floor(p * 4 * 0.999));
    steps.forEach((li, i) => li.classList.toggle('is-on', i === k));
    brief.style.opacity = String(1 - span(p, 0.2, 0.27));
    vis.style.setProperty('--w', `${span(p, 0.25, 0.33) * 100}%`);
    pvNotes.forEach((n, i) => n.classList.toggle('is-on', p > 0.33 + i * 0.05 && p < 0.52));
    const f = span(p, 0.52, 0.72);
    vis.style.setProperty('--f', `${f * 100}%`);
    vis.style.setProperty('--fo', f > 0 && f < 1 ? '1' : '0');
    vis.style.setProperty('--l', span(p, 0.78, 0.86).toFixed(3));
    pvUrl.textContent = p < 0.25 ? 'tutustuminen' : p < 0.75 ? 'luonnos' : 'sinun-osoitteesi.fi';
  };
  if (lenis) lenis.on('scroll', onScroll);
  addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  // Structure mode: the page explains how it is built
  const xr = document.querySelector('.xr');
  let specsDone = false;
  const px = v => Math.round(parseFloat(v));
  const addSpecs = () => {
    if (specsDone) return; specsDone = true;
    const tag = (el, label, first) => {
      const cs = getComputedStyle(el);
      const s = document.createElement('span');
      s.className = 'spec'; s.setAttribute('aria-hidden', 'true');
      s.textContent = `${label} · Geist ${cs.fontWeight} · ${px(cs.fontSize)} px`;
      first ? el.prepend(s) : el.append(s);
    };
    document.querySelectorAll('.h1').forEach(el => tag(el, 'H1', true));
    document.querySelectorAll('.h-cta').forEach(el => tag(el, 'H2', true));
    document.querySelectorAll('.h2').forEach(el => tag(el, 'H2'));
    document.querySelectorAll('.lede, .belief li:first-child p, .mina-text p.big').forEach(el => tag(el, 'Teksti'));
    document.querySelectorAll('.sec').forEach(sec => {
      const h = px(getComputedStyle(sec).paddingTop);
      const m = document.createElement('span');
      m.className = 'pad-mark'; m.setAttribute('aria-hidden', 'true'); m.style.setProperty('--h', `${h}px`);
      m.innerHTML = `<span class="mono">${h} px tyhjää</span>`;
      sec.prepend(m);
    });
  };
  const setX = on => {
    if (on) addSpecs();
    document.body.classList.toggle('xray', on);
    xr.setAttribute('aria-pressed', String(on));
    try { localStorage.setItem('vs-xray', on ? '1' : '0'); } catch (e) {}
  };
  xr.addEventListener('click', () => setX(xr.getAttribute('aria-pressed') !== 'true'));
  try { if (localStorage.getItem('vs-xray') === '1') setX(true); } catch (e) {}
})();
