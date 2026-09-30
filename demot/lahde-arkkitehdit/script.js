/* Lähde Arkkitehdit — pienet vuorovaikutukset. Ei riippuvuuksia. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Header state ---------- */
  var header = document.querySelector('[data-header]');
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');
  var label = document.querySelector('[data-menu-label]');

  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Sulje' : 'Valikko';
    header.classList.toggle('is-open', open);
    if (open) {
      menu.hidden = false;
      // allow the display change to apply before animating items in
      requestAnimationFrame(function () { menu.classList.add('is-visible'); });
      root.style.overflow = 'hidden';
      var first = menu.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    } else {
      menu.classList.remove('is-visible');
      menu.hidden = true;
      root.style.overflow = '';
    }
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 861px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (!('IntersectionObserver' in window) || reduceMotion.matches) {
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

  /* ---------- Hero: curtain reveal + gentle parallax ---------- */
  var hero = document.querySelector('[data-hero]');
  var heroImg = document.querySelector('[data-parallax]');

  function showHero() {
    if (!hero) return;
    requestAnimationFrame(function () {
      hero.classList.add('is-in');
      window.setTimeout(function () { hero.classList.add('is-settled'); }, 2300);
    });
  }
  if (heroImg && !heroImg.complete) {
    heroImg.addEventListener('load', showHero, { once: true });
    heroImg.addEventListener('error', showHero, { once: true });
    window.setTimeout(showHero, 1200); // never keep the image hidden for long
  } else {
    showHero();
  }

  var ticking = false;
  function parallax() {
    ticking = false;
    if (!hero || !heroImg || reduceMotion.matches) return;
    var r = hero.getBoundingClientRect();
    var vh = window.innerHeight;
    if (r.bottom < 0 || r.top > vh) return;
    var p = Math.min(Math.max((vh - r.top) / (vh + r.height), 0), 1);
    var shift = -0.07 * r.height * (1 - p);
    hero.style.setProperty('--py', shift.toFixed(1) + 'px');
  }

  /* ---------- Active nav link ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__list a'));
  var sections = navLinks.map(function (a) {
    return document.querySelector(a.getAttribute('href'));
  });
  function activeNav() {
    var y = window.scrollY + window.innerHeight * 0.35;
    var current = -1;
    sections.forEach(function (s, i) {
      if (s && s.offsetTop <= y) current = i;
    });
    navLinks.forEach(function (a, i) {
      a.classList.toggle('is-active', i === current);
    });
  }

  function onScroll() {
    onScrollHeader();
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () {
        parallax();
        activeNav();
      });
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Helsinki clock ---------- */
  var clock = document.querySelector('[data-clock]');
  if (clock) {
    var fmt;
    try {
      fmt = new Intl.DateTimeFormat('fi-FI', {
        hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Helsinki'
      });
    } catch (err) {
      fmt = null;
    }
    var tick = function () {
      var now = new Date();
      clock.textContent = fmt ? fmt.format(now) : now.toTimeString().slice(0, 5).replace(':', '.');
    };
    tick();
    window.setInterval(tick, 20000);
  }
})();
