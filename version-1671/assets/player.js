(function () {
  function attachPlayer(root) {
    var video = root.querySelector('video');
    var button = root.querySelector('[data-play-button]');
    if (!video || !button) {
      return;
    }

    var hlsInstance = null;
    var started = false;
    var m3u8 = video.getAttribute('data-m3u8');
    var mp4 = video.getAttribute('data-mp4');

    function fallbackToMp4() {
      if (mp4 && video.currentSrc !== mp4) {
        video.src = mp4;
      }
    }

    function playVideo() {
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          root.classList.remove('is-playing');
        });
      }
    }

    function start() {
      root.classList.add('is-playing');

      if (!started) {
        started = true;
        if (m3u8 && window.Hls && window.Hls.isSupported() && window.location.protocol !== 'file:') {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(m3u8);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (_event, data) {
            if (data && data.fatal) {
              if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
              }
              fallbackToMp4();
              playVideo();
            }
          });
        } else if (m3u8 && video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = m3u8;
        } else {
          fallbackToMp4();
        }
      }

      playVideo();
    }

    button.addEventListener('click', start);
    video.addEventListener('play', function () {
      root.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        root.classList.remove('is-playing');
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(attachPlayer);
})();
