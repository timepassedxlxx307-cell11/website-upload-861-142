(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.hasAttribute('hidden') === false;
      if (isOpen) {
        mobileNav.setAttribute('hidden', '');
        menuButton.setAttribute('aria-expanded', 'false');
      } else {
        mobileNav.removeAttribute('hidden');
        menuButton.setAttribute('aria-expanded', 'true');
      }
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    var show = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    var start = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    show(0);
    start();
  }

  var searchForm = document.getElementById('searchPageForm');
  var resultGrid = document.querySelector('[data-search-results]');

  if (searchForm && resultGrid) {
    var cards = Array.prototype.slice.call(resultGrid.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);

    Array.prototype.slice.call(searchForm.elements).forEach(function (field) {
      if (!field.name) {
        return;
      }
      var value = params.get(field.name);
      if (value !== null) {
        field.value = value;
      }
    });

    var normalize = function (value) {
      return String(value || '').trim().toLowerCase();
    };

    var applyFilters = function () {
      var data = new FormData(searchForm);
      var query = normalize(data.get('q'));
      var category = normalize(data.get('category'));
      var region = normalize(data.get('region'));
      var type = normalize(data.get('type'));
      var year = normalize(data.get('year'));

      cards.forEach(function (card) {
        var ok = true;
        if (query && normalize(card.dataset.search).indexOf(query) === -1) {
          ok = false;
        }
        if (category && normalize(card.dataset.category) !== category) {
          ok = false;
        }
        if (region && normalize(card.dataset.region) !== region) {
          ok = false;
        }
        if (type && normalize(card.dataset.type) !== type) {
          ok = false;
        }
        if (year && normalize(card.dataset.year) !== year) {
          ok = false;
        }
        card.hidden = !ok;
      });
    };

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilters();
    });

    Array.prototype.slice.call(searchForm.querySelectorAll('input, select')).forEach(function (field) {
      field.addEventListener('input', applyFilters);
      field.addEventListener('change', applyFilters);
    });

    applyFilters();
  }
})();
