(function () {
  function setActiveSlide(slider, index) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var next = ((index % slides.length) + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === next);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === next);
    });
    slider.setAttribute('data-active-index', String(next));
  }

  function initHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setActiveSlide(slider, Number(dot.getAttribute('data-hero-dot') || '0'));
      });
    });
    window.setInterval(function () {
      var current = Number(slider.getAttribute('data-active-index') || '0');
      setActiveSlide(slider, current + 1);
    }, 5200);
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  function initSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    inputs.forEach(function (input) {
      var panel = input.closest('.search-panel');
      var clearButton = panel ? panel.querySelector('[data-search-clear]') : null;
      var apply = function () {
        var query = input.value.trim().toLowerCase();
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          card.classList.toggle('hidden-by-search', query !== '' && text.indexOf(query) === -1);
        });
      };
      input.addEventListener('input', apply);
      if (clearButton) {
        clearButton.addEventListener('click', function () {
          input.value = '';
          apply();
          input.focus();
        });
      }
    });
  }

  window.initMoviePlayer = function (config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.overlayId);
    var source = config.source;
    var loaded = false;
    var hls = null;

    if (!video || !overlay || !source) {
      return;
    }

    function loadSource() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      loadSource();
      overlay.classList.add('is-hidden');
      video.play().catch(function () {});
    }

    overlay.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('ended', function () {
      overlay.classList.remove('is-hidden');
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initHero();
    initMenu();
    initSearch();
  });
})();
