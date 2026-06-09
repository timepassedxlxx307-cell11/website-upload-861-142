(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navButton && mobileNav) {
        navButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        var activate = function (index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                activate(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                activate(current + 1);
            }, 5200);
        }
    }

    var filterPanel = document.querySelector('[data-filter-panel]');

    if (filterPanel) {
        var searchInput = filterPanel.querySelector('[data-search-input]');
        var categoryFilter = filterPanel.querySelector('[data-category-filter]');
        var yearFilter = filterPanel.querySelector('[data-year-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list] .movie-card, main .movie-card'));
        var params = new URLSearchParams(window.location.search);
        var initialKeyword = params.get('q');

        if (initialKeyword && searchInput) {
            searchInput.value = initialKeyword;
        }

        var normalize = function (value) {
            return String(value || '').toLowerCase().trim();
        };

        var applyFilters = function () {
            var keyword = normalize(searchInput ? searchInput.value : '');
            var category = normalize(categoryFilter ? categoryFilter.value : '');
            var year = normalize(yearFilter ? yearFilter.value : '');

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year')
                ].join(' '));
                var cardCategory = normalize(card.getAttribute('data-category'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                var categoryMatch = !category || cardCategory === category;
                var yearMatch = !year || cardYear.indexOf(year) !== -1;

                card.classList.toggle('is-hidden', !(keywordMatch && categoryMatch && yearMatch));
            });
        };

        [searchInput, categoryFilter, yearFilter].forEach(function (field) {
            if (field) {
                field.addEventListener('input', applyFilters);
                field.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var playButton = player.querySelector('.play-overlay');
        var stream = player.getAttribute('data-stream');
        var ready = false;
        var hlsInstance = null;

        var playVideo = function () {
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    player.classList.remove('is-playing');
                });
            }
        };

        var attachStream = function () {
            if (!video || !stream) {
                return;
            }

            player.classList.add('is-playing');

            if (ready) {
                playVideo();
                return;
            }

            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                playVideo();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                    hlsInstance.loadSource(stream);
                });
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                hlsInstance.on(window.Hls.Events.ERROR, function () {
                    if (video.src !== stream) {
                        video.src = stream;
                    }
                });
                return;
            }

            video.src = stream;
            playVideo();
        };

        if (playButton && video) {
            playButton.addEventListener('click', attachStream);
            video.addEventListener('click', function () {
                if (video.paused) {
                    attachStream();
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    player.classList.remove('is-playing');
                }
            });
        }
    });
})();
