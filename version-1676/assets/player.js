
(function () {
  const onReady = (fn) => {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  };

  function initPlayer(root) {
    const video = root.querySelector('video');
    const playBtn = root.querySelector('[data-play-toggle]');
    const muteBtn = root.querySelector('[data-mute-toggle]');
    const fullBtn = root.querySelector('[data-full-toggle]');
    const timeEl = root.querySelector('[data-player-state]');
    if (!video || !playBtn) return;
    const src = root.getAttribute('data-src');

    let hls = null;
    let ready = false;

    const setState = (text) => {
      if (timeEl) timeEl.textContent = text;
    };

    const updatePlayIcon = () => {
      playBtn.setAttribute('data-playing', String(!video.paused));
      playBtn.innerHTML = video.paused
        ? '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>'
        : '<svg viewBox="0 0 24 24"><path d="M7 6h4v12H7z"></path><path d="M13 6h4v12h-4z"></path></svg>';
    };

    const load = () => {
      if (!src) return;
      if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          ready = true;
          setState('视频已就绪');
        });
        hls.on(window.Hls.Events.ERROR, (_, data) => {
          if (data && data.fatal) {
            setState('视频加载失败');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        ready = true;
        setState('视频已就绪');
      } else {
        setState('当前浏览器不支持 HLS 播放');
      }
    };

    const togglePlay = async () => {
      try {
        if (video.paused) {
          if (!ready && !video.src) load();
          await video.play();
        } else {
          video.pause();
        }
      } catch (err) {
        setState('播放受限，请再次点击');
      } finally {
        updatePlayIcon();
      }
    };

    const toggleMute = () => {
      video.muted = !video.muted;
      muteBtn.textContent = video.muted ? '取消静音' : '静音';
    };

    const toggleFull = async () => {
      try {
        if (!document.fullscreenElement) {
          await root.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      } catch (err) {}
    };

    playBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);
    muteBtn && muteBtn.addEventListener('click', toggleMute);
    fullBtn && fullBtn.addEventListener('click', toggleFull);
    video.addEventListener('play', () => {
      setState('正在播放');
      updatePlayIcon();
      root.classList.add('is-playing');
    });
    video.addEventListener('pause', () => {
      setState('已暂停');
      updatePlayIcon();
      root.classList.remove('is-playing');
    });
    video.addEventListener('loadedmetadata', () => setState('视频已就绪'));
    load();
    updatePlayIcon();
  }

  onReady(() => {
    document.querySelectorAll('[data-player-root]').forEach(initPlayer);
  });
})();
