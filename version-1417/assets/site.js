(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      document.body.classList.toggle('is-menu-open', nav.classList.contains('is-open'));
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    if (!cards.length) {
      return;
    }
    var filter = 'all';
    var query = '';

    function apply() {
      var normalized = query.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-title') || '').toLowerCase();
        var category = card.getAttribute('data-category') || '';
        var matchedText = !normalized || text.indexOf(normalized) !== -1;
        var matchedCategory = filter === 'all' || category === filter;
        card.classList.toggle('is-hidden', !(matchedText && matchedCategory));
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        query = input.value || '';
        inputs.forEach(function (other) {
          if (other !== input) {
            other.value = query;
          }
        });
        apply();
      });
    });

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        filter = chip.getAttribute('data-filter') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item.getAttribute('data-filter') === filter);
        });
        apply();
      });
    });
    apply();
  }

  function setupPlayer() {
    var area = document.querySelector('[data-player]');
    if (!area) {
      return;
    }
    var video = area.querySelector('video');
    var cover = area.querySelector('[data-player-toggle]');
    if (!video) {
      return;
    }
    var streamUrl = video.getAttribute('data-stream') || '';
    var loaded = false;
    var hls = null;

    function attach() {
      if (loaded || !streamUrl) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      attach();
      if (cover) {
        cover.classList.add('is-off');
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    function toggle() {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', toggle);
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-off');
      }
    });
    video.addEventListener('loadedmetadata', function () {
      if (video.autoplay) {
        play();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
