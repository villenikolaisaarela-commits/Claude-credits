/* Studio Hämärä — pienet vuorovaikutukset ilman kirjastoja.
   Sisältö toimii myös ilman JavaScriptiä: tämä tiedosto vain parantaa kokemusta. */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------------------------------------------------------------
     Header: tausta vierityksen jälkeen
  --------------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------
     Mobiilivalikko
  --------------------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".nav-toggle__label").textContent = open ? "Sulje" : "Valikko";
    nav.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 861px)").addEventListener("change", function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------------------------------------------------------------
     Aktiivinen osio navigaatiossa
  --------------------------------------------------------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".site-nav a[href^='#']"));
  if ("IntersectionObserver" in window && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) {
      byId[a.getAttribute("href").slice(1)] = a;
    });
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = byId[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (a) {
              a.removeAttribute("aria-current");
            });
            link.setAttribute("aria-current", "true");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });
  }

  /* ---------------------------------------------------------------
     Reveal-animaatiot
  --------------------------------------------------------------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    reveals.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* ---------------------------------------------------------------
     Töiden suodatus
  --------------------------------------------------------------- */
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));
  var items = Array.prototype.slice.call(document.querySelectorAll(".gallery__item"));
  var status = document.querySelector(".work-status");

  var labels = {
    all: "kuvaa",
    muotokuvat: "muotokuvaa",
    brandikuvaus: "brändikuvaa",
    sisatilat: "sisätilakuvaa"
  };

  function applyFilter(filter) {
    var shown = 0;
    items.forEach(function (item) {
      var match = filter === "all" || item.getAttribute("data-category") === filter;
      if (match) {
        shown += 1;
        if (item.hidden) {
          item.hidden = false;
          if (!reduceMotion.matches) {
            item.classList.remove("is-entering");
            // pakotetaan uudelleenpiirto, jotta animaatio käynnistyy uudelleen
            void item.offsetWidth;
            item.classList.add("is-entering");
          }
        }
      } else {
        item.hidden = true;
        item.classList.remove("is-entering");
      }
    });
    filterButtons.forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-filter") === filter));
    });
    if (status) {
      status.textContent = "Näytetään " + shown + " " + (labels[filter] || "kuvaa");
    }
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyFilter(btn.getAttribute("data-filter"));
    });
  });

  // Lasketaan kategorioiden määrät painikkeisiin
  filterButtons.forEach(function (btn) {
    var f = btn.getAttribute("data-filter");
    var count = f === "all" ? items.length : items.filter(function (i) {
      return i.getAttribute("data-category") === f;
    }).length;
    var sup = btn.querySelector("sup");
    if (sup) sup.textContent = String(count);
  });

  /* ---------------------------------------------------------------
     Lightbox
  --------------------------------------------------------------- */
  var dialog = document.getElementById("lightbox");
  var supportsDialog = dialog && typeof dialog.showModal === "function";
  if (!supportsDialog) return; // ilman tukea linkit avaavat kuvan suoraan

  var lbImg = dialog.querySelector(".lb-img");
  var lbTitle = dialog.querySelector(".lb-caption .work__title");
  var lbMeta = dialog.querySelector(".lb-caption .work__meta");
  var lbCount = dialog.querySelector(".lb-count");
  var lbClose = dialog.querySelector(".lb-close");
  var lbPrev = dialog.querySelector(".lb-prev");
  var lbNext = dialog.querySelector(".lb-next");
  var lbStage = dialog.querySelector(".lb-stage");

  var current = 0;
  var visible = [];
  var opener = null;

  function visibleLinks() {
    return items
      .filter(function (item) {
        return !item.hidden;
      })
      .map(function (item) {
        return item.querySelector(".work__link");
      });
  }

  function show(index) {
    if (!visible.length) return;
    current = (index + visible.length) % visible.length;
    var link = visible[current];
    var thumb = link.querySelector("img");
    var fig = link.closest("figure");

    lbImg.classList.add("is-loading");
    var next = new Image();
    next.onload = next.onerror = function () {
      lbImg.src = link.getAttribute("href");
      lbImg.width = next.naturalWidth || Number(link.getAttribute("data-w")) || thumb.width;
      lbImg.height = next.naturalHeight || Number(link.getAttribute("data-h")) || thumb.height;
      lbImg.alt = thumb.alt;
      requestAnimationFrame(function () {
        lbImg.classList.remove("is-loading");
      });
    };
    next.src = link.getAttribute("href");

    lbTitle.textContent = fig.querySelector(".work__title").textContent;
    lbMeta.textContent = fig.querySelector(".work__meta").textContent;
    lbCount.textContent = String(current + 1).padStart(2, "0") + " / " + String(visible.length).padStart(2, "0");

    // esiladataan naapurit
    [current + 1, current - 1].forEach(function (i) {
      var n = visible[(i + visible.length) % visible.length];
      if (n) {
        var pre = new Image();
        pre.src = n.getAttribute("href");
      }
    });
  }

  function open(link) {
    visible = visibleLinks();
    opener = link;
    document.body.classList.add("has-lightbox");
    dialog.showModal();
    show(visible.indexOf(link));
    lbClose.focus();
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  dialog.addEventListener("close", function () {
    document.body.classList.remove("has-lightbox");
    lbImg.removeAttribute("src");
    if (opener) opener.focus();
  });

  items.forEach(function (item) {
    var link = item.querySelector(".work__link");
    link.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      open(link);
    });
  });

  lbClose.addEventListener("click", close);
  lbPrev.addEventListener("click", function () {
    show(current - 1);
  });
  lbNext.addEventListener("click", function () {
    show(current + 1);
  });

  dialog.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      show(current + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      show(current - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      show(0);
    } else if (e.key === "End") {
      e.preventDefault();
      show(visible.length - 1);
    }
  });

  // Klikkaus kuvan ulkopuolelle sulkee
  lbStage.addEventListener("click", function (e) {
    if (e.target === lbStage) close();
  });

  // Pyyhkäisy kosketusnäytöillä
  var touchX = null;
  var touchY = null;
  lbStage.addEventListener(
    "touchstart",
    function (e) {
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
    },
    { passive: true }
  );
  lbStage.addEventListener(
    "touchend",
    function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      var dy = e.changedTouches[0].clientY - touchY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        show(current + (dx < 0 ? 1 : -1));
      }
      touchX = touchY = null;
    },
    { passive: true }
  );
})();
