// Reveal-on-scroll, Finnish local time and current year. No dependencies.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('[data-reveal]');

  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  // Once the photo reveal has played, mark it done so parallax runs without easing lag.
  document.querySelectorAll('.about-photo').forEach(function (fig) {
    var img = fig.querySelector('img');
    if (img) img.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'transform' && fig.classList.contains('is-in')) fig.classList.add('is-done');
    });
  });

  // Gentle scroll parallax: the image drifts inside its frame (max ±6% of frame height).
  var drifting = reduce ? [] : Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (drifting.length) {
    var ticking = false;
    var update = function () {
      var vh = window.innerHeight;
      drifting.forEach(function (img) {
        var frame = img.parentElement.getBoundingClientRect();
        if (frame.bottom < 0 || frame.top > vh) return;
        var progress = (frame.top + frame.height / 2 - vh / 2) / (vh / 2 + frame.height / 2);
        var shift = Math.max(-1, Math.min(1, progress)) * frame.height * 0.06;
        img.style.setProperty('--py', shift.toFixed(1) + 'px');
      });
      ticking = false;
    };
    var onScroll = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  var clock = document.querySelector('[data-clock]');
  if (clock) {
    var fmt = new Intl.DateTimeFormat('fi-FI', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Helsinki' });
    var tick = function () { clock.textContent = 'Suomi ' + fmt.format(new Date()); };
    tick();
    setInterval(tick, 30000);
  }

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
