(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var open = menu.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function initFiltering() {
        var input = document.querySelector("[data-search-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        var empty = document.querySelector(".no-results");
        if (!cards.length) {
            return;
        }
        var type = "all";
        function apply() {
            var q = input ? input.value.trim().toLowerCase() : "";
            var shown = 0;
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type")
                ].join(" ").toLowerCase();
                var typeText = card.getAttribute("data-type") || "";
                var matchedType = type === "all" || typeText.indexOf(type) !== -1 || text.indexOf(type.toLowerCase()) !== -1;
                var matchedText = !q || text.indexOf(q) !== -1;
                var visible = matchedType && matchedText;
                card.style.display = visible ? "" : "none";
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", shown === 0);
            }
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                type = button.getAttribute("data-filter-value") || "all";
                buttons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                apply();
            });
        });
        apply();
    }

    function initPlayers() {
        Array.prototype.slice.call(document.querySelectorAll("[data-player-src]")).forEach(function (wrap) {
            var video = wrap.querySelector("video");
            var cover = wrap.querySelector(".player-cover");
            var src = wrap.getAttribute("data-player-src");
            var hls = null;
            var attached = false;
            if (!video || !src) {
                return;
            }
            function attach() {
                if (attached) {
                    return Promise.resolve();
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                    return Promise.resolve();
                }
                if (window.Hls) {
                    hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    return new Promise(function (resolve) {
                        hls.on(Hls.Events.MANIFEST_PARSED, function () {
                            resolve();
                        });
                    });
                }
                video.src = src;
                return Promise.resolve();
            }
            function play() {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                wrap.classList.add("is-playing");
                attach().then(function () {
                    var attempt = video.play();
                    if (attempt && attempt.catch) {
                        attempt.catch(function () {});
                    }
                });
            }
            if (cover) {
                cover.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (!attached || video.paused) {
                    play();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFiltering();
        initPlayers();
    });
})();
