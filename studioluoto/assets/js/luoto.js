// Studio Luoto: the phone menu and the copy buttons. Everything works without this file; it only adds comfort.
(() => {
  // Phone menu: opens over the page, closes with the button, Esc or a link
  const hdr = document.querySelector('.hdr');
  const btn = hdr && hdr.querySelector('.menu-btn');
  if (btn) {
    const label = btn.querySelector('span');
    const set = open => {
      hdr.classList.toggle('is-open', open);
      document.documentElement.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      label.textContent = open ? 'Sulje' : 'Valikko';
    };
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
    hdr.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
    });
    matchMedia('(min-width: 900px)').addEventListener('change', e => { if (e.matches) set(false); });
  }

  // Copy the address or the number, and say so
  const status = document.querySelector('.status');
  document.querySelectorAll('[data-copy]').forEach(b => {
    b.addEventListener('click', async () => {
      const text = b.dataset.copy;
      let ok = false;
      try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
        const t = document.createElement('textarea');
        t.value = text; t.setAttribute('readonly', ''); t.style.position = 'absolute'; t.style.left = '-9999px';
        document.body.append(t); t.select();
        try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
        t.remove();
      }
      const span = b.querySelector('span');
      span.textContent = ok ? 'Kopioitu' : 'Ei onnistunut';
      if (status) status.textContent = ok ? `${text} kopioitu leikepöydälle.` : 'Kopiointi ei onnistunut. Valitse teksti ja kopioi se itse.';
      setTimeout(() => { span.textContent = 'Kopioi'; }, 2200);
    });
  });
})();
