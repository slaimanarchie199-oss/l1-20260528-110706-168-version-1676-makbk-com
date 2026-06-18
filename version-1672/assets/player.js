(function () {
  window.initMoviePlayer = function (videoId, maskId, source) {
    var video = document.getElementById(videoId);
    var mask = document.getElementById(maskId);
    var started = false;
    var hls = null;

    if (!video || !source) return;

    function bind() {
      if (started) return;
      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      bind();
      video.controls = true;
      if (mask) mask.classList.add('is-hidden');
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    }

    if (mask) {
      mask.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (!started) play();
    });

    video.addEventListener('play', function () {
      if (mask) mask.classList.add('is-hidden');
    });

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  };
})();
