(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var thumbs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-thumb]"));
      var current = 0;
      var timer = null;

      function setHero(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        thumbs.forEach(function (thumb, thumbIndex) {
          thumb.classList.toggle("is-active", thumbIndex === current);
        });
      }

      function startHero() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          setHero(current + 1);
        }, 5200);
      }

      thumbs.forEach(function (thumb, index) {
        thumb.addEventListener("click", function () {
          setHero(index);
          startHero();
        });
      });

      if (slides.length) {
        setHero(0);
        startHero();
      }
    }

    var filters = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));
    filters.forEach(function (input) {
      var scope = input.closest("main") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var counter = scope.querySelector("[data-filter-count]");
      var empty = scope.querySelector("[data-empty-state]");

      function applyFilter() {
        var query = normalize(input.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matched = !query || haystack.indexOf(query) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (counter) {
          counter.textContent = visible ? "筛选结果已更新" : "没有匹配结果";
        }
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      input.addEventListener("input", applyFilter);
      applyFilter();
    });

    var searchForm = document.querySelector("[data-search-form]");
    var searchResults = document.querySelector("[data-search-results]");
    if (searchForm && searchResults && window.MOVIE_SEARCH_INDEX) {
      var params = new URLSearchParams(window.location.search);
      var qInput = searchForm.querySelector("[name='q']");
      var regionInput = searchForm.querySelector("[name='region']");
      var typeInput = searchForm.querySelector("[name='type']");

      if (qInput && params.get("q")) {
        qInput.value = params.get("q");
      }

      function renderSearch() {
        var q = normalize(qInput && qInput.value);
        var region = normalize(regionInput && regionInput.value);
        var type = normalize(typeInput && typeInput.value);
        var rows = window.MOVIE_SEARCH_INDEX.filter(function (item) {
          var haystack = normalize([
            item.title,
            item.region,
            item.type,
            item.year,
            item.genre,
            item.tags,
            item.oneLine
          ].join(" "));
          var matchedQuery = !q || haystack.indexOf(q) !== -1;
          var matchedRegion = !region || normalize(item.region).indexOf(region) !== -1;
          var matchedType = !type || normalize(item.type).indexOf(type) !== -1;
          return matchedQuery && matchedRegion && matchedType;
        }).slice(0, 80);

        if (!rows.length) {
          searchResults.innerHTML = '<div class="empty-state is-visible">没有找到匹配的影片</div>';
          return;
        }

        searchResults.innerHTML = rows.map(function (item) {
          return '<article class="movie-card">' +
            '<a href="' + escapeHtml(item.url) + '" class="movie-card-link">' +
              '<span class="poster-wrap">' +
                '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                '<span class="poster-shade"></span>' +
                '<span class="play-dot">▶</span>' +
              '</span>' +
              '<span class="movie-info">' +
                '<span class="meta-line"><span>' + escapeHtml(item.genre || item.type) + '</span><span>' + escapeHtml(item.year) + '</span></span>' +
                '<strong>' + escapeHtml(item.title) + '</strong>' +
                '<span class="movie-desc">' + escapeHtml(item.oneLine) + '</span>' +
              '</span>' +
            '</a>' +
          '</article>';
        }).join("");
      }

      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        renderSearch();
      });
      [qInput, regionInput, typeInput].forEach(function (field) {
        if (field) {
          field.addEventListener("input", renderSearch);
          field.addEventListener("change", renderSearch);
        }
      });
      renderSearch();
    }

    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (shell) {
      var video = shell.querySelector("video[data-src]");
      var playButton = shell.querySelector("[data-play]");
      var attached = false;
      var hlsInstance = null;

      if (!video) {
        return;
      }

      function attachSource() {
        if (attached) {
          return;
        }
        attached = true;
        var source = video.getAttribute("data-src");
        if (!source) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }
        video.load();
      }

      function playVideo() {
        attachSource();
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            video.setAttribute("controls", "controls");
          });
        }
      }

      if (playButton) {
        playButton.addEventListener("click", playVideo);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });

      video.addEventListener("play", function () {
        if (playButton) {
          playButton.classList.add("is-hidden");
        }
      });

      video.addEventListener("pause", function () {
        if (playButton && video.currentTime === 0) {
          playButton.classList.remove("is-hidden");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
