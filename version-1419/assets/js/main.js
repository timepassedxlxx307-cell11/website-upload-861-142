(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", mobileNav.classList.contains("is-open"));
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var active = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === active);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(active - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(active + 1);
          restart();
        });
      }

      show(0);
      restart();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".js-card-search"));
    searchInputs.forEach(function (input) {
      var section = input.closest("section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
      var empty = section.querySelector("[data-empty-state]");

      function apply(value) {
        var query = (value || "").trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search-text") || card.textContent || "").toLowerCase();
          var matched = !query || text.indexOf(query) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      input.addEventListener("input", function () {
        apply(input.value);
      });

      var panel = input.closest(".filter-panel");
      if (panel) {
        Array.prototype.slice.call(panel.querySelectorAll("[data-filter-value]")).forEach(function (button) {
          button.addEventListener("click", function () {
            input.value = button.getAttribute("data-filter-value") || "";
            apply(input.value);
            input.focus();
          });
        });
      }
    });
  });
})();
