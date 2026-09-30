/* Kampaamo Kuura — pieni, riippuvuudeton käyttöliittymäskripti */
(function () {
  'use strict';

  var root = document.documentElement;
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('nav-menu');
  var desktop = window.matchMedia('(min-width: 901px)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Mobiilivalikko ------------------------------------------------------- */
  function setMenu(open) {
    if (!header || !toggle) return;
    header.classList.toggle('nav-open', open);
    root.style.overflow = open ? 'hidden' : '';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.visually-hidden').textContent = open ? 'Sulje valikko' : 'Avaa valikko';
  }

  if (toggle && menu) {
    toggle.querySelector('.visually-hidden').textContent = 'Avaa valikko';

    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });

    var onBreakpoint = function (event) { if (event.matches) setMenu(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
    else if (desktop.addListener) desktop.addListener(onBreakpoint);
  }

  /* Ylätunnisteen reunaviiva vierittäessä -------------------------------- */
  if (header) {
    var ticking = false;
    var updateHeader = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
    updateHeader();
  }

  /* Sisällön pehmeä esiintulo --------------------------------------------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      // Porrastetaan saman rivin elementit hienovaraisesti
      var siblings = el.parentElement ? el.parentElement.querySelectorAll(':scope > .reveal') : [];
      var index = Array.prototype.indexOf.call(siblings, el);
      el.style.transitionDelay = Math.min(Math.max(index, 0), 5) * 70 + 'ms';
      el.classList.add('is-in');
      el.addEventListener('transitionend', function clear() {
        el.style.transitionDelay = '';
        el.removeEventListener('transitionend', clear);
      });
      observer.unobserve(el);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  items.forEach(function (el) { observer.observe(el); });
})();
