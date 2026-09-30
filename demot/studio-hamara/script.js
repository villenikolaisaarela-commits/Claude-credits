/* Studio Hämärä — vuorovaikutukset ilman kirjastoja.
   Sivu toimii täysin ilman JavaScriptiä; tämä tiedosto vain hienosäätää kokemusta. */
(function () {
  "use strict";

  var root = document.documentElement;
  var motion = root.classList.contains("motion");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var easeInOut = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  if (motion) {
    window.setTimeout(function () { root.classList.remove("intro"); }, 1900);
  }

  /* ------------------------------------------------------------------
     Tekstin pilkkominen sanoiksi (maskit ja vierityksen mukaan syttyvät sanat)
  ------------------------------------------------------------------ */
  function splitWords(el, mode) {
    var index = 0;
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(" "));
              return;
            }
            var outer = document.createElement("span");
            if (mode === "mask") {
              outer.className = "w";
              var inner = document.createElement("span");
              inner.className = "wi";
              inner.style.setProperty("--wi", index);
              inner.textContent = part;
              outer.appendChild(inner);
            } else {
              outer.className = "sw";
              outer.textContent = part;
            }
            index += 1;
            frag.appendChild(outer);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
    return index;
  }

  if (motion) {
    $$(".split").forEach(function (el) { splitWords(el, "mask"); });
  }

  var scrubEl = $("[data-scrub]");
  var scrubWords = [];
  if (motion && scrubEl) {
    splitWords(scrubEl, "scrub");
    scrubWords = $$(".sw", scrubEl);
  }

  /* ------------------------------------------------------------------
     Paljastukset näkymään tultaessa
  ------------------------------------------------------------------ */
  var revealTargets = $$(".reveal, [data-reveal]");
  if (motion && "IntersectionObserver" in window) {
    // clip-path piilottaa kohteen myös IntersectionObserverilta, joten
    // kuvien kohdalla tarkkaillaan vanhempaa elementtiä.
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target._revealEl || entry.target;
          el.classList.add("is-in");
          revealIO.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.04 });
    revealTargets.forEach(function (el) {
      var watch = el;
      if (el.hasAttribute("data-reveal") && el.parentElement) {
        watch = el.parentElement;
        watch._revealEl = el;
      }
      revealIO.observe(watch);
    });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-in"); });
    $$("[data-manual]").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ------------------------------------------------------------------
     Pehmeä vieritys (vain hiiren rulla, natiivi muuten)
  ------------------------------------------------------------------ */
  var ss = { cur: window.scrollY, target: window.scrollY, active: false, ease: 0.1 };
  var maxScroll = function () { return document.documentElement.scrollHeight - window.innerHeight; };
  var locked = function () { return root.classList.contains("has-lightbox") || root.classList.contains("menu-open"); };

  if (motion && finePointer) {
    window.addEventListener("wheel", function (e) {
      if (e.ctrlKey || e.defaultPrevented || locked()) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      var delta = e.deltaY * (e.deltaMode === 1 ? 36 : e.deltaMode === 2 ? window.innerHeight : 1);
      e.preventDefault();
      if (!ss.active) ss.cur = ss.target = window.scrollY;
      ss.ease = 0.1;
      ss.target = clamp(ss.target + delta, 0, maxScroll());
      ss.active = true;
      tick();
    }, { passive: false });

    ["keydown", "mousedown", "touchstart"].forEach(function (type) {
      window.addEventListener(type, function () { ss.active = false; }, { passive: true });
    });
  }

  function scrollToEl(target) {
    var top = target.getBoundingClientRect().top + window.scrollY;
    var y = clamp(top - (target.id === "top" ? 0 : 0), 0, maxScroll());
    if (!motion) {
      window.scrollTo(0, y);
      return;
    }
    ss.cur = window.scrollY;
    ss.target = y;
    ss.ease = 0.075;
    ss.active = true;
    tick();
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href^='#']");
    if (!a || e.defaultPrevented) return;
    var id = a.getAttribute("href").slice(1);
    var target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    closeMenu(false);
    scrollToEl(target);
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    if (history.replaceState) history.replaceState(null, "", "#" + id);
  });

  /* ------------------------------------------------------------------
     Yksi rAF-silmukka: vieritys, parallaksi, sanojen syttyminen, välihetki
  ------------------------------------------------------------------ */
  var header = $("#site-header");
  var parallaxEls = motion ? $$("[data-parallax]") : [];
  var interlude = $(".interlude");
  var interludeMedia = interlude && $(".interlude__sticky", interlude);
  var interludeTitle = interlude && $("[data-manual]", interlude);
  var lastY = window.scrollY;
  var scrubMax = 0;
  var ticking = false;
  var vh = window.innerHeight;

  function update() {
    ticking = false;

    if (ss.active) {
      ss.cur += (ss.target - ss.cur) * ss.ease;
      if (Math.abs(ss.target - ss.cur) < 0.4) {
        ss.cur = ss.target;
        ss.active = false;
      }
      window.scrollTo(0, ss.cur);
    }

    var y = window.scrollY;

    // Ylätunniste: tausta ja piilotus alaspäin vieritettäessä
    if (header) {
      header.classList.toggle("is-scrolled", y > 40);
      if (!root.classList.contains("menu-open")) {
        if (y > lastY + 4 && y > vh * 0.6) root.classList.add("hdr-hidden");
        else if (y < lastY - 4 || y < vh * 0.6) root.classList.remove("hdr-hidden");
      }
    }
    lastY = y;

    if (motion) {
      // Parallaksi
      for (var i = 0; i < parallaxEls.length; i++) {
        var el = parallaxEls[i];
        var box = el.parentNode.getBoundingClientRect();
        if (box.bottom < -100 || box.top > vh + 100) continue;
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0;
        var off = (box.top + box.height / 2 - vh / 2) * -speed;
        if (el.classList.contains("hero__parallax")) off = Math.max(0, -box.top) * speed;
        else off = clamp(off, -box.height * 0.055, box.height * 0.055);
        el.style.transform = "translate3d(0," + off.toFixed(1) + "px,0)";
      }

      // Lausuman sanat syttyvät vierittäessä
      if (scrubEl && scrubWords.length) {
        var r = scrubEl.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) {
          var p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.3), 0, 1);
          if (p > scrubMax) {
            scrubMax = p;
            var n = scrubWords.length;
            for (var k = 0; k < n; k++) {
              var o = clamp(p * n * 1.15 - k, 0, 1);
              scrubWords[k].style.setProperty("--o", (0.16 + o * 0.84).toFixed(3));
            }
          }
        }
      }

      // Välihetki: kuva avautuu täysleveäksi
      if (interlude) {
        var ir = interlude.getBoundingClientRect();
        if (ir.top < vh && ir.bottom > 0) {
          var t = clamp((vh * 0.55 - ir.top) / (vh * 1.15), 0, 1);
          interludeMedia.style.setProperty("--c", (1 - easeInOut(t)).toFixed(4));
          if (t > 0.72 && interludeTitle) interludeTitle.classList.add("is-in");
        }
      }
    }

    if (ss.active) tick();
  }

  function tick() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", function () {
    if (!ss.active) ss.cur = ss.target = window.scrollY;
    tick();
  }, { passive: true });

  window.addEventListener("resize", function () {
    vh = window.innerHeight;
    tick();
  });
  tick();

  /* ------------------------------------------------------------------
     Kursori galleriassa ja palveluiden kuvaesikatselu
  ------------------------------------------------------------------ */
  if (motion && finePointer) {
    var cursor = $(".cursor");
    var preview = $(".service-preview");
    var previewImg = preview && $("img", preview);
    var m = { x: -200, y: -200 };
    var c = { x: -200, y: -200, s: 0, ts: 0 };
    var pv = { x: -999, y: -999, r: 0 };
    var looping = false;

    var loop = function () {
      c.x += (m.x - c.x) * 0.2;
      c.y += (m.y - c.y) * 0.2;
      c.s += (c.ts - c.s) * 0.18;
      cursor.style.setProperty("--cx", c.x.toFixed(1) + "px");
      cursor.style.setProperty("--cy", c.y.toFixed(1) + "px");
      cursor.style.setProperty("--cs", c.s.toFixed(3));

      if (preview) {
        var tx = m.x + 28;
        var ty = m.y - preview.offsetHeight / 2;
        var dx = tx - pv.x;
        pv.x += dx * 0.12;
        pv.y += (ty - pv.y) * 0.12;
        pv.r += (clamp(dx * 0.04, -7, 7) - pv.r) * 0.1;
        preview.style.setProperty("--px", pv.x.toFixed(1) + "px");
        preview.style.setProperty("--py", pv.y.toFixed(1) + "px");
        preview.style.setProperty("--pr", pv.r.toFixed(2) + "deg");
      }

      if (Math.abs(m.x - c.x) > 0.3 || Math.abs(m.y - c.y) > 0.3 || Math.abs(c.ts - c.s) > 0.01 || Math.abs(dx || 0) > 0.3) {
        window.requestAnimationFrame(loop);
      } else {
        looping = false;
      }
    };

    var kick = function () {
      if (!looping) {
        looping = true;
        window.requestAnimationFrame(loop);
      }
    };

    window.addEventListener("mousemove", function (e) {
      m.x = e.clientX;
      m.y = e.clientY;
      kick();
    }, { passive: true });

    document.addEventListener("mouseover", function (e) {
      var over = !!e.target.closest(".piece__link");
      c.ts = over ? 1 : 0;
      cursor.classList.toggle("is-active", over);
      kick();
    });

    document.addEventListener("scroll", function () {
      if (c.ts) {
        var el = document.elementFromPoint(m.x, m.y);
        if (!el || !el.closest(".piece__link")) {
          c.ts = 0;
          cursor.classList.remove("is-active");
          kick();
        }
      }
    }, { passive: true });

    if (preview) {
      $$(".service").forEach(function (row) {
        row.addEventListener("mouseenter", function () {
          var src = row.getAttribute("data-preview");
          if (previewImg.getAttribute("src") !== src) previewImg.setAttribute("src", src);
          if (!preview.classList.contains("is-on")) {
            pv.x = m.x + 28;
            pv.y = m.y - preview.offsetHeight / 2;
          }
          preview.classList.add("is-on");
          kick();
        });
      });
      var list = $(".service-list");
      list.addEventListener("mouseleave", function () { preview.classList.remove("is-on"); });
    }
  }

  /* ------------------------------------------------------------------
     Mobiilivalikko
  ------------------------------------------------------------------ */
  var toggle = $(".menu-toggle");
  var menu = $("#mobile-menu");
  var toggleLabel = toggle && $(".menu-toggle__label", toggle);
  var inertEls = [$("#main"), $(".site-footer"), $(".brand")];

  function openMenu() {
    menu.hidden = false;
    // pakotetaan piirto, jotta animaatio käynnistyy
    void menu.offsetWidth;
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggleLabel.textContent = toggleLabel.getAttribute("data-close");
    root.classList.add("menu-open");
    root.classList.remove("hdr-hidden");
    inertEls.forEach(function (el) { if (el) el.inert = true; });
    var first = $("a", menu);
    if (first) first.focus();
  }

  function closeMenu(returnFocus) {
    if (!menu || menu.hidden) return;
    menu.classList.remove("is-open");
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggleLabel.textContent = toggleLabel.getAttribute("data-open");
    root.classList.remove("menu-open");
    inertEls.forEach(function (el) { if (el) el.inert = false; });
    if (returnFocus) toggle.focus();
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      if (menu.hidden) openMenu();
      else closeMenu(true);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) closeMenu(true);
    });
    window.matchMedia("(min-width: 861px)").addEventListener("change", function (mq) {
      if (mq.matches) closeMenu(false);
    });
  }

  /* ------------------------------------------------------------------
     Aktiivinen osio navigaatiossa
  ------------------------------------------------------------------ */
  var navLinks = $$(".site-nav a[href^='#']");
  if ("IntersectionObserver" in window && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (a) { a.removeAttribute("aria-current"); });
          link.setAttribute("aria-current", "true");
        } else if (link.getAttribute("aria-current")) {
          link.removeAttribute("aria-current");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) navIO.observe(el);
    });
  }

  /* ------------------------------------------------------------------
     Galleria: masonry-asettelu ja suodatus
  ------------------------------------------------------------------ */
  var gallery = $(".gallery");
  var items = $$(".gallery__item");
  var filterButtons = $$(".filter");
  var statusEl = $(".filters-status");
  var currentFilter = "all";

  function isMatch(item, f) {
    return f === "all" || item.getAttribute("data-category") === f;
  }

  function layout() {
    if (!gallery) return;
    var W = gallery.clientWidth;
    var cols = W >= 960 ? 3 : W >= 540 ? 2 : 1;
    var gap = cols === 1 ? 0 : clamp(W * 0.04, 20, 64);
    var vgap = cols === 1 ? 52 : clamp(W * 0.05, 44, 96);
    var colW = (W - gap * (cols - 1)) / cols;
    var visible = items.filter(function (it) { return isMatch(it, currentFilter); });

    // 1. leveydet
    visible.forEach(function (it) {
      var small = it.getAttribute("data-size") === "s";
      var w = small ? colW * (cols === 1 ? 0.82 : 0.76) : colW;
      it._w = w;
      it.style.setProperty("--w", w.toFixed(2) + "px");
    });

    // 2. kuvatekstien korkeudet (yksi reflow)
    visible.forEach(function (it) {
      var cap = it.querySelector(".piece__cap");
      it._cap = cap ? cap.offsetHeight : 0;
    });

    // 3. sijainnit
    var heights = cols === 3 ? [0, colW * 0.42, colW * 0.14] : cols === 2 ? [0, colW * 0.34] : [0];
    var sCount = 0;
    visible.forEach(function (it) {
      var col = 0;
      for (var i = 1; i < cols; i++) if (heights[i] < heights[col] - 1) col = i;
      var link = it.querySelector(".piece__link");
      var ratio = Number(link.getAttribute("data-h")) / Number(link.getAttribute("data-w"));
      var h = it._w * ratio + it._cap;
      var offset = 0;
      if (it._w < colW - 1) {
        offset = sCount % 2 === 0 ? colW - it._w : 0;
        sCount += 1;
      }
      var x = col * (colW + gap) + offset;
      it.style.setProperty("--x", x.toFixed(2) + "px");
      it.style.setProperty("--y", heights[col].toFixed(2) + "px");
      heights[col] += h + vgap;
    });

    gallery.style.height = Math.max.apply(null, heights) - vgap + "px";
  }

  if (gallery) {
    gallery.classList.add("is-masonry");
    layout();

    var resizeTimer = null;
    var lastW = gallery.clientWidth;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        if (gallery.clientWidth === lastW) return;
        lastW = gallery.clientWidth;
        gallery.classList.remove("is-animating");
        layout();
      }, 120);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

    var counts = { all: items.length };
    items.forEach(function (it) {
      var k = it.getAttribute("data-category");
      counts[k] = (counts[k] || 0) + 1;
    });
    filterButtons.forEach(function (btn) {
      var sup = $("sup", btn);
      if (sup) sup.textContent = String(counts[btn.getAttribute("data-filter")] || 0);
    });

    var leaveTimer = null;
    var applyFilter = function (f) {
      if (f === currentFilter) return;
      currentFilter = f;
      window.clearTimeout(leaveTimer);

      var entering = [];
      var leaving = [];
      items.forEach(function (it) {
        var match = isMatch(it, f);
        if (match && (it.hidden || it.classList.contains("is-leaving"))) {
          if (it.hidden) entering.push(it);
          it.hidden = false;
          it.classList.remove("is-leaving");
        } else if (!match && !it.hidden) {
          leaving.push(it);
        }
      });

      if (!motion) {
        leaving.forEach(function (it) { it.hidden = true; });
        layout();
      } else {
        leaving.forEach(function (it) { it.classList.add("is-leaving"); });
        entering.forEach(function (it) { it.classList.add("is-entering"); });
        gallery.classList.add("is-animating");
        // uudet kohteet sijoitetaan paikalleen ilman liukumaa
        entering.forEach(function (it) { it.style.transition = "none"; });
        layout();
        void gallery.offsetWidth;
        entering.forEach(function (it, i) {
          it.style.transition = "";
          it.style.transitionDelay = 250 + i * 70 + "ms";
        });
        window.requestAnimationFrame(function () {
          entering.forEach(function (it) { it.classList.remove("is-entering"); });
        });
        leaveTimer = window.setTimeout(function () {
          leaving.forEach(function (it) {
            if (!isMatch(it, currentFilter)) it.hidden = true;
            it.classList.remove("is-leaving");
          });
          items.forEach(function (it) { it.style.transitionDelay = ""; });
        }, 1100);
      }

      filterButtons.forEach(function (btn) {
        btn.setAttribute("aria-pressed", String(btn.getAttribute("data-filter") === f));
      });
      var shown = items.filter(function (it) { return isMatch(it, f); }).length;
      if (statusEl) statusEl.textContent = "Näytetään " + shown + " / " + items.length;
    };

    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyFilter(btn.getAttribute("data-filter"));
        var bar = $(".work .section-head");
        var galleryTop = gallery.getBoundingClientRect().top;
        if (galleryTop < 0 && bar) scrollToEl(gallery.parentNode);
      });
    });
  }

  /* ------------------------------------------------------------------
     Lightbox
  ------------------------------------------------------------------ */
  var dialog = $("#lightbox");
  if (dialog && typeof dialog.showModal === "function") {
    var lbImg = $(".lb__img", dialog);
    var lbTitle = $(".lb__title", dialog);
    var lbCat = $(".lb__cat", dialog);
    var lbLight = $(".lb__light", dialog);
    var lbCur = $(".lb__cur", dialog);
    var lbTotal = $(".lb__total", dialog);
    var lbProgress = $(".lb__progress", dialog);
    var lbStage = $(".lb__stage", dialog);
    var current = 0;
    var list = [];
    var opener = null;
    var token = 0;
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };

    var show = function (index, dir) {
      if (!list.length) return;
      current = (index + list.length) % list.length;
      var link = list[current];
      var thumb = $("img", link);
      var fig = link.closest("figure");
      var my = ++token;
      var src = link.getAttribute("href");

      lbImg.classList.add("is-out");
      lbImg.classList.toggle("is-out-next", dir === 1);
      lbImg.classList.toggle("is-out-prev", dir === -1);

      var started = Date.now();
      var pre = new Image();
      pre.decoding = "async";
      pre.onload = pre.onerror = function () {
        var wait = Math.max(0, (dir ? 260 : 0) - (Date.now() - started));
        window.setTimeout(function () {
          if (my !== token) return;
          lbImg.src = src;
          lbImg.width = pre.naturalWidth || Number(link.getAttribute("data-w"));
          lbImg.height = pre.naturalHeight || Number(link.getAttribute("data-h"));
          lbImg.alt = thumb ? thumb.alt : "";
          window.requestAnimationFrame(function () {
            lbImg.classList.remove("is-out", "is-out-next", "is-out-prev");
          });
        }, wait);
      };
      pre.src = src;

      lbTitle.textContent = $(".piece__title", fig).textContent;
      lbCat.textContent = $(".piece__meta", fig).textContent;
      lbLight.textContent = "Valo: " + (link.getAttribute("data-light") || "");
      lbCur.textContent = pad(current + 1);
      lbTotal.textContent = pad(list.length);
      lbProgress.style.setProperty("--p", ((current + 1) / list.length).toFixed(3));

      [current + 1, current - 1].forEach(function (i) {
        var n = list[(i + list.length) % list.length];
        if (n) { var im = new Image(); im.src = n.getAttribute("href"); }
      });
    };

    var openLb = function (link) {
      list = items.filter(function (it) { return !it.hidden && !it.classList.contains("is-leaving"); })
        .map(function (it) { return $(".piece__link", it); });
      opener = link;
      root.classList.add("has-lightbox");
      ss.active = false;
      lbImg.removeAttribute("src");
      dialog.showModal();
      show(list.indexOf(link), 0);
      $(".lb__close", dialog).focus();
    };

    dialog.addEventListener("close", function () {
      root.classList.remove("has-lightbox");
      if (opener) opener.focus({ preventScroll: true });
    });

    items.forEach(function (it) {
      var link = $(".piece__link", it);
      link.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
        e.preventDefault();
        openLb(link);
      });
    });

    $(".lb__close", dialog).addEventListener("click", function () { dialog.close(); });
    $(".lb__prev", dialog).addEventListener("click", function () { show(current - 1, -1); });
    $(".lb__next", dialog).addEventListener("click", function () { show(current + 1, 1); });

    dialog.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); show(current + 1, 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); show(current - 1, -1); }
      else if (e.key === "Home") { e.preventDefault(); show(0, -1); }
      else if (e.key === "End") { e.preventDefault(); show(list.length - 1, 1); }
    });

    lbStage.addEventListener("click", function (e) {
      if (e.target === lbStage) dialog.close();
    });

    var tx = null;
    var ty = null;
    lbStage.addEventListener("touchstart", function (e) {
      tx = e.touches[0].clientX;
      ty = e.touches[0].clientY;
    }, { passive: true });
    lbStage.addEventListener("touchend", function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx;
      var dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        var d = dx < 0 ? 1 : -1;
        show(current + d, d);
      }
      tx = ty = null;
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     Päivän hämärä Helsingissä (auringonlasku ja siviilihämärän loppu)
  ------------------------------------------------------------------ */
  (function dusk() {
    var LAT = 60.1699;
    var LNG = 24.9384;
    var TZ = "Europe/Helsinki";
    var fmt;
    var partsFmt;
    try {
      fmt = new Intl.DateTimeFormat("fi-FI", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
      partsFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric", month: "numeric", day: "numeric" });
    } catch (e) {
      return;
    }

    var now = new Date();
    var parts = {};
    partsFmt.formatToParts(now).forEach(function (p) { parts[p.type] = Number(p.value); });
    var y = parts.year;
    var mo = parts.month;
    var d = parts.day;
    if (!y || !mo || !d) return;

    var rad = Math.PI / 180;
    var N = Math.round((Date.UTC(y, mo - 1, d) - Date.UTC(y, 0, 0)) / 864e5);

    // "Almanac for Computers" -algoritmi; palauttaa UTC-tunnit tai null
    var sunset = function (zenith) {
      var lngHour = LNG / 15;
      var t = N + (18 - lngHour) / 24;
      var M = 0.9856 * t - 3.289;
      var L = M + 1.916 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 282.634;
      L = ((L % 360) + 360) % 360;
      var RA = Math.atan(0.91764 * Math.tan(L * rad)) / rad;
      RA = ((RA % 360) + 360) % 360;
      RA = (RA + Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90) / 15;
      var sinDec = 0.39782 * Math.sin(L * rad);
      var cosDec = Math.cos(Math.asin(sinDec));
      var cosH = (Math.cos(zenith * rad) - sinDec * Math.sin(LAT * rad)) / (cosDec * Math.cos(LAT * rad));
      if (cosH > 1 || cosH < -1) return null;
      var H = Math.acos(cosH) / rad / 15;
      var T = H + RA - 0.06571 * t - 6.622;
      var UT = ((T - lngHour) % 24 + 24) % 24;
      return new Date(Date.UTC(y, mo - 1, d) + UT * 3600e3);
    };

    var set = sunset(90.833);
    var end = sunset(96);
    if (!set) return;

    var tSet = fmt.format(set).replace(":", ".");
    var tEnd = end ? fmt.format(end).replace(":", ".") : null;
    var state = "before";
    if (now >= set && (!end || now < end)) state = "during";
    else if (end && now >= end) state = "after";

    var longText;
    var label = "Tänään Helsingissä";
    if (!end) {
      longText = "Aurinko laskee klo " + tSet + ", mutta yö ei pimene – hämärä kestää aamuun.";
      if (state === "during") label = "Juuri nyt Helsingissä";
    } else if (state === "before") {
      longText = "Aurinko laskee klo " + tSet + ". Hämärä kestää klo " + tEnd + " asti.";
    } else if (state === "during") {
      label = "Juuri nyt Helsingissä";
      longText = "On hämärä. Valoa riittää vielä klo " + tEnd + " asti.";
    } else {
      longText = "Aurinko laski klo " + tSet + " ja hämärä kesti klo " + tEnd + " asti.";
    }

    $$("[data-dusk-long]").forEach(function (el) { el.textContent = longText; });
    var st = $("[data-dusk-state]");
    if (st) st.textContent = label;
    var card = $("[data-dusk-card]");
    if (card) {
      card.hidden = false;
      card.classList.toggle("is-dusk", state === "during");
    }
    var short = $("[data-dusk-short]");
    if (short) {
      short.innerHTML = "";
      short.appendChild(document.createTextNode("Hämärä tänään "));
      var b = document.createElement("b");
      b.textContent = tEnd ? tSet + "–" + tEnd : "klo " + tSet + " alkaen";
      short.appendChild(b);
      short.hidden = false;
    }
  })();
})();
