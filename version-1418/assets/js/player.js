(function () {
  var video = document.getElementById('movieVideo');
  var overlay = document.getElementById('playOverlay');
  var configNode = document.getElementById('player-config');

  if (!video || !overlay || !configNode) {
    return;
  }

  var config = JSON.parse(configNode.textContent || '{}');
  var videoUrl = config.video || '';
  var hls = null;
  var prepared = false;

  var prepare = function () {
    if (prepared || !videoUrl) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      prepared = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      prepared = true;
      return;
    }

    video.src = videoUrl;
    prepared = true;
  };

  var play = function () {
    prepare();
    overlay.classList.add('is-hidden');
    var playTask = video.play();
    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  };

  overlay.addEventListener('click', play);

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
})();
