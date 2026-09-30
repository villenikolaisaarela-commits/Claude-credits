/* Routa Remontit – konseptisivuston skriptit (ei riippuvuuksia) */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('paavalikko');
  var callbar = document.querySelector('.callbar');
  var callbarUpdate = null;

  /* ---------- Mobiilivalikko ---------- */
  function setMenu(open) {
    if (!header || !toggle) return;
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    var label = toggle.querySelector('.menu-toggle__label');
    if (label) label.textContent = open ? 'Sulje' : 'Valikko';
    if (callbarUpdate) callbarUpdate();
    else if (callbar) callbar.classList.toggle('is-hidden', open);
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (header.classList.contains('is-open') && !header.contains(e.target)) setMenu(false);
    });

    window.matchMedia('(min-width: 1120px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- Headerin varjo vierittäessä ---------- */
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Palvelukortin linkki esivalitsee palvelun ---------- */
  var select = document.getElementById('palvelu');
  document.querySelectorAll('[data-service]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (select) select.value = link.getAttribute('data-service');
    });
  });

  /* ---------- Lomake (vain käyttöliittymä) ---------- */
  var form = document.getElementById('arviolomake');
  var success = document.getElementById('lomake-kiitos');
  if (form && success) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.reset();
      success.hidden = false;
      success.focus({ preventScroll: true });
      success.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
    form.addEventListener('input', function () {
      success.hidden = true;
    });
  }

  /* ---------- Mobiilipalkki: piiloon, kun heron painikkeet tai lomake ovat näkyvissä ---------- */
  var heroActions = document.querySelector('.hero__actions');
  var contact = document.getElementById('yhteys');
  if (callbar && 'IntersectionObserver' in window) {
    var visible = { hero: true, contact: false };
    var update = function () {
      var menuOpen = header && header.classList.contains('is-open');
      callbar.classList.toggle('is-hidden', visible.hero || visible.contact || menuOpen);
    };
    var watch = function (el, key, threshold) {
      if (!el) { visible[key] = false; return; }
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { visible[key] = entry.isIntersecting; });
        update();
      }, { threshold: threshold }).observe(el);
    };
    watch(heroActions, 'hero', 0);
    watch(contact, 'contact', 0.15);
    callbarUpdate = update;
    update();
  }

  /* ---------- Vuosiluku ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Ilmestymisanimaatio ---------- */
  var reveals = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }
})();
