function initMoviePlayer(streamUrl) {
  const video = document.getElementById('moviePlayer');
  const cover = document.querySelector('[data-player-cover]');
  const button = document.querySelector('[data-play-button]');
  let ready = false;
  let hls = null;

  if (!video || !streamUrl) {
    return;
  }

  function load() {
    if (ready) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      ready = true;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      ready = true;
      return;
    }
    video.src = streamUrl;
    ready = true;
  }

  function play() {
    load();
    video.controls = true;
    if (cover) {
      cover.classList.add('is-hidden');
    }
    video.play().catch(function () {});
  }

  if (button) {
    button.addEventListener('click', play);
  }
  if (cover) {
    cover.addEventListener('click', play);
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
}
