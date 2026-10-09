// villesaarela.com, dark version. Motion: smooth scroll, the mark lit by the pointer, parallax on the opening, a label and a page preview over the work, and the footer showing from under the page.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desk = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1200px)');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Smooth scroll, light enough that the wheel still feels direct
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.2, smoothWheel: true, syncTouch: false, anchors: { offset: -64 } });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // The time in Helsinki, in the header
  const clock = document.querySelector('[data-clock]');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('fi-FI', { timeZone: 'Europe/Helsinki', hour: '2-digit', minute: '2-digit' });
    const tick = () => { const t = fmt.format(new Date()); if (clock.textContent !== t) clock.textContent = t; };
    tick();
    clock.parentElement.classList.add('is-on');
    setInterval(tick, 10000);
  }

  // The header panel names the part of the page in view
  const secLabel = document.querySelector('[data-sec]');
  const secs = [...document.querySelectorAll('[data-sec-name]')];
  if (secLabel && secs.length) {
    let cur = secLabel.textContent, stick = 0;
    const name = () => {
      stick = 0;
      let n = secs[0].dataset.secName;
      const line = innerHeight * 0.35;
      secs.forEach(x => { if (x.getBoundingClientRect().top <= line) n = x.dataset.secName; });
      if (n === cur) return;
      cur = n;
      secLabel.textContent = n;
      if (!reduce) { secLabel.classList.remove('is-new'); void secLabel.offsetWidth; secLabel.classList.add('is-new'); }
    };
    addEventListener('scroll', () => { if (!stick) stick = requestAnimationFrame(name); }, { passive: true });
    name();
  }

  // Scroll-linked moves: the opening mark drifts down slower than the page, the footer mark rises as the page lifts off it
  const heroMark = document.querySelector('.hero .mark');
  const hero = document.querySelector('.hero');
  const main = document.querySelector('main');
  const ftr = document.querySelector('.ftr');
  const ftrMark = ftr && ftr.querySelector('.mark');
  // Draw the footer mark once the end of the page is within a couple of screens
  if (ftr && main) {
    const near = () => {
      if (main.getBoundingClientRect().bottom > innerHeight * 2.5) return;
      ftr.classList.add('is-near');
      removeEventListener('scroll', near);
    };
    addEventListener('scroll', near, { passive: true });
    near();
  }

  if (!reduce && (heroMark || ftrMark)) {
    let tick = 0;
    const update = () => {
      tick = 0;
      const y = scrollY;
      if (heroMark && hero && y <= hero.offsetHeight) heroMark.style.transform = `translate3d(0, ${(y * 0.32).toFixed(1)}px, 0)`;
      if (ftrMark && main) {
        const s = clamp((innerHeight - main.getBoundingClientRect().bottom) / (ftr.offsetHeight || 1), 0, 1);
        ftrMark.style.transform = `translate3d(0, ${((1 - s) * 90).toFixed(1)}px, 0)`;
      }
    };
    const ask = () => { if (!tick) tick = requestAnimationFrame(update); };
    addEventListener('scroll', ask, { passive: true });
    addEventListener('resize', ask, { passive: true });
    update();
  }

  // Case study: pictures sharpen as they arrive; the chapter beside them follows the reader down the pictures
  document.querySelectorAll('.cs-frame img').forEach(img => {
    const done = () => img.classList.add('is-loaded');
    if (img.complete && img.naturalWidth) done();
    else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
  });
  const acc = document.querySelector('[data-cs-acc]');
  const gal = document.querySelector('[data-cs-gallery]');
  if (acc && gal) {
    const items = [...acc.querySelectorAll('[data-ch]')];
    const starts = [...gal.querySelectorAll('[data-ch-start]')];
    const wide = matchMedia('(min-width: 1200px)');
    let hold = false;
    const open = n => items.forEach(it => {
      const on = +it.dataset.ch === n;
      it.classList.toggle('is-open', on);
      it.querySelector('.cs-q').setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    // The chapter whose first picture has passed the upper part of the window
    const current = () => {
      let n = 0;
      const line = innerHeight * 0.4;
      starts.forEach(s => { if (s.getBoundingClientRect().top <= line) n = +s.dataset.chStart; });
      return n;
    };
    let last = -1, tick = 0;
    const spy = () => {
      tick = 0;
      if (!wide.matches || hold) return;
      const n = current();
      if (n !== last) { last = n; open(n); }
    };
    addEventListener('scroll', () => { if (!tick) tick = requestAnimationFrame(spy); }, { passive: true });
    wide.addEventListener('change', () => { last = -1; if (wide.matches) spy(); else open(0); });
    items.forEach(it => it.querySelector('.cs-q').addEventListener('click', () => {
      const n = +it.dataset.ch;
      if (!wide.matches) { open(it.classList.contains('is-open') ? -1 : n); return; }
      // On a big screen a chapter heading takes you to its pictures
      open(n); last = n;
      const s = starts.find(x => +x.dataset.chStart === n);
      if (!s) return;
      const y = n === 0 ? 0 : Math.max(0, s.getBoundingClientRect().top + scrollY - 64);
      hold = true;
      const done = () => { hold = false; };
      if (lenis) lenis.scrollTo(y, { duration: 0.9, onComplete: done });
      else { scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }); setTimeout(done, 900); }
    }));
    if (wide.matches) {
      last = current(); open(last);
      // The pictures drop into place on arrival, the way the reference does it
      if (!reduce && gal.animate && scrollY < 10) {
        const d = Math.min(1400, Math.max(800, Math.round(innerHeight * 1.15)));
        hold = true;
        gal.animate([{ transform: `translateY(-${d}px)` }, { transform: 'translateY(0)' }], { duration: 1200, delay: 50, easing: 'cubic-bezier(0.16, 1, 0.2, 1)', fill: 'backwards' })
          .finished.then(() => { hold = false; spy(); }, () => { hold = false; });
      }
    }
  }

  if (!desk.matches || reduce) return;

  // A label follows the pointer over the pictures, a step behind it
  const tag = document.createElement('span');
  tag.className = 'pcur';
  tag.setAttribute('aria-hidden', 'true');
  tag.textContent = 'Katso projekti';
  document.body.append(tag);
  let tx = 0, ty = 0, cx = 0, cy = 0, on = false, traf = 0;
  const follow = () => {
    cx += (tx - cx) * 0.1; cy += (ty - cy) * 0.1;
    tag.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) translate(-50%, -50%)`;
    traf = on || Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1 ? requestAnimationFrame(follow) : 0;
  };
  document.querySelectorAll('.w-img').forEach(a => {
    const peek = a.querySelector('.peek');
    const pimg = peek && peek.querySelector('img');
    let wait = 0;
    a.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'mouse') return;
      tx = cx = e.clientX; ty = cy = e.clientY; on = true;
      tag.classList.add('is-on');
      if (!traf) traf = requestAnimationFrame(follow);
      // Rest on a picture for half a second and it turns into the whole page, scrolling slowly
      if (pimg && !pimg.getAttribute('src')) pimg.src = pimg.dataset.src;
      wait = setTimeout(() => peek && peek.classList.add('is-on'), 500);
    });
    a.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; if (!traf) traf = requestAnimationFrame(follow); }, { passive: true });
    a.addEventListener('pointerleave', () => {
      on = false; tag.classList.remove('is-on');
      clearTimeout(wait); if (peek) peek.classList.remove('is-on');
    });
  });

  // The mark: a normal map lit in real time, so the light follows the pointer across the bevels.
  // The still image underneath is the same light at rest, so the switch is invisible.
  const VS = `#version 300 es
in vec2 p; out vec2 uv;
void main() { uv = vec2(p.x * .5 + .5, .5 - p.y * .5); gl_Position = vec4(p, 0., 1.); }`;
  const FS = `#version 300 es
precision highp float;
in vec2 uv; out vec4 o;
uniform sampler2D N; uniform vec3 L; uniform float bg, G;
float hash(vec2 q) { vec3 r = fract(vec3(q.xyx) * .1031); r += dot(r, r.yzx + 33.33); return fract((r.x + r.y) * r.z); }
void main() {
  vec3 t = texture(N, uv).rgb;
  vec2 xy = t.rg * 2. - 1.;
  vec3 n = vec3(xy, sqrt(max(0., 1. - dot(xy, xy))));
  vec3 l = normalize(L);
  float d = clamp(dot(n, l), 0., 1.);
  float s = pow(clamp(dot(n, normalize(l + vec3(0., 0., 1.))), 0., 1.), 28.);
  float g = (hash(floor(gl_FragCoord.xy)) - .5) * G;
  float v = clamp((.34 - .15 * uv.y) * (.35 + .85 * d) + .42 * s + g, 0., 1.);
  o = vec4(vec3(t.b < .5 ? bg : mix(bg, v, t.b)), 1.);
}`;
  const L0 = [-0.55, -0.62, 0.56];
  let tex = null;
  const loadTex = () => tex || (tex = new Promise((ok, no) => {
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => ok(im);
    im.onerror = no;
    im.src = '/assets/img/aa-3d-n.webp';
  }));

  function relight(scene, mark) {
    const box = mark.querySelector('.mark-in');
    const cv = document.createElement('canvas');
    cv.className = 'relight';
    cv.setAttribute('aria-hidden', 'true');
    const gl = cv.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uL = gl.getUniformLocation(prog, 'L'), uG = gl.getUniformLocation(prog, 'G');
    gl.uniform1f(gl.getUniformLocation(prog, 'bg'), 7 / 255);
    gl.uniform1i(gl.getUniformLocation(prog, 'N'), 0);

    // The light always comes in low from the pointer's side of the mark, so the faces stay dark and only the bevels catch it
    let ang = Math.atan2(L0[1], L0[0]), rad = Math.hypot(L0[0], L0[1]), tAng = ang, tRad = rad;
    let raf = 0, seen = false, ready = false;
    const size = () => {
      const r = box.getBoundingClientRect();
      const w = Math.round(r.width * Math.min(devicePixelRatio || 1, 2));
      cv.width = w; cv.height = Math.round(w * 1240 / 2880);
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform1f(uG, 0.05 * Math.min(1, cv.width / 2880 * 1.6));
    };
    const draw = () => { gl.uniform3f(uL, Math.cos(ang) * rad, Math.sin(ang) * rad, L0[2]); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
    const step = () => {
      const da = Math.atan2(Math.sin(tAng - ang), Math.cos(tAng - ang));
      ang += da * 0.07; rad += (tRad - rad) * 0.07;
      draw();
      raf = seen && (Math.abs(da) > 1e-4 || Math.abs(tRad - rad) > 1e-4) ? requestAnimationFrame(step) : 0;
    };
    const go = () => { if (ready && seen && !raf) raf = requestAnimationFrame(step); };

    loadTex().then(im => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB8, gl.RGB, gl.UNSIGNED_BYTE, im);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      box.append(cv);
      size(); draw();
      ready = true;
      requestAnimationFrame(() => cv.classList.add('is-on'));
      go();
    }).catch(() => {});

    addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      const r = box.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top - r.height / 2) / r.width;
      tAng = Math.atan2(dy, dx);
      tRad = 0.62 + 0.3 * clamp(Math.hypot(dx, dy) / 0.5, 0, 1);
      go();
    }, { passive: true });
    addEventListener('resize', () => { if (ready) { size(); draw(); } }, { passive: true });
    new IntersectionObserver(([en]) => { seen = en.isIntersecting; go(); }).observe(scene);
  }

  const start = () => {
    if (hero && heroMark) relight(hero, heroMark);
    if (ftr && ftrMark) relight(ftr, ftrMark);
  };
  const idle = window.requestIdleCallback || (f => setTimeout(f, 200));
  if (document.readyState === 'complete') idle(start);
  else addEventListener('load', () => idle(start), { once: true });
})();
