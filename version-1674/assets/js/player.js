(function () {
  function loadVideo(video, url, onReady) {
    var hls;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      onReady();
      return null;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, onReady);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }

        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }

        hls.destroy();
      });
      return hls;
    }

    video.src = url;
    onReady();
    return null;
  }

  window.initPlayer = function (videoId, url) {
    var video = document.getElementById(videoId);

    if (!video) {
      return;
    }

    var wrap = video.closest('.player-wrap');
    var overlay = wrap ? wrap.querySelector('.player-overlay') : null;
    var started = false;
    var hls = null;

    function play() {
      if (!started) {
        started = true;
        hls = loadVideo(video, url, function () {
          video.play().catch(function () {});
        });
      } else {
        video.play().catch(function () {});
      }

      if (wrap) {
        wrap.classList.add('is-playing');
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
