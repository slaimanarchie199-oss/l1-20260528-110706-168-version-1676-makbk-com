
(function () {
  const catalogPath = '/assets/catalog.json';
  const HLSPath = '/assets/hls.min.js';

  function q(sel, root = document) { return root.querySelector(sel); }
  function qa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  function initPlayer() {
    const video = q('[data-player]');
    if (!video) return;
    const overlay = q('[data-play-overlay]');
    const source = video.getAttribute('data-src');
    const fallback = video.getAttribute('data-fallback');
    const playBtn = q('[data-play-btn]');
    let activated = false;

    function start() {
      if (activated) return;
      activated = true;
      if (overlay) overlay.classList.add('hidden');
      try {
        if (source && source.endsWith('.m3u8')) {
          if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (_, data) {
              console.warn('HLS error', data);
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else if (fallback) {
            video.src = fallback;
          }
        } else if (source) {
          video.src = source;
        }
      } catch (err) {
        console.warn(err);
        if (fallback) video.src = fallback;
      }
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
    }

    if (window.Hls && source && source.endsWith('.m3u8')) {
      // library already available in assets/hls.min.js
    }
    if (playBtn) playBtn.addEventListener('click', start);
    if (overlay) overlay.addEventListener('click', start);
    video.addEventListener('click', start);
    setTimeout(start, 300);
  }

  function initSearch() {
    const root = q('[data-search-root]');
    if (!root) return;
    const input = q('[data-search-input]', root);
    const grid = q('[data-search-grid]', root);
    const count = q('[data-search-count]', root);
    const bucketBtns = qa('[data-bucket-filter]', root);
    if (!input || !grid) return;

    let items = [];
    let currentBucket = 'all';

    function render(list) {
      if (count) count.textContent = list.length.toString();
      grid.innerHTML = list.map(item => `
        <a class="poster-card" href="${item.url}">
          <div class="poster" style="--g1:${item.g1};--g2:${item.g2};--g3:${item.g3};">
            <div class="poster-badge">${item.type || ''}</div>
            <div>
              <h3 class="poster-title">${item.title}</h3>
              <div class="poster-meta">${item.year || ''} · ${item.region || ''}</div>
            </div>
          </div>
          <div class="poster-body">
            <div class="info-row">
              <span class="info-chip">${item.genre || ''}</span>
            </div>
            <div class="desc">${item.one_line || ''}</div>
          </div>
        </a>
      `).join('');
    }

    function apply() {
      const term = (input.value || '').trim().toLowerCase();
      let list = items;
      if (currentBucket !== 'all') list = list.filter(item => item.bucket === currentBucket);
      if (term) {
        list = list.filter(item => [item.title, item.year, item.region, item.type, item.genre, item.tags, item.one_line]
          .join(' ').toLowerCase().includes(term));
      }
      render(list);
    }

    fetch(catalogPath)
      .then(r => r.json())
      .then(data => {
        items = data.map((x, idx) => {
          const h = hash32(x.title);
          return {
            ...x,
            g1: palette[h % palette.length][0],
            g2: palette[(h + 3) % palette.length][1],
            g3: palette[(h + 5) % palette.length][0],
          };
        });
        apply();
      })
      .catch(err => {
        console.error(err);
        grid.innerHTML = '<div class="card">搜索数据加载失败。</div>';
      });

    input.addEventListener('input', apply);
    bucketBtns.forEach(btn => btn.addEventListener('click', () => {
      bucketBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentBucket = btn.getAttribute('data-bucket-filter');
      apply();
    }));
  }

  function hash32(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  const palette = [
    ['#7d60f5', '#5d77ff'],
    ['#6d3eed', '#9d8df9'],
    ['#39d0ff', '#5d77ff'],
    ['#ff7aa2', '#7d60f5'],
    ['#22c55e', '#06b6d4'],
    ['#f59e0b', '#ef4444'],
    ['#a855f7', '#ec4899'],
    ['#14b8a6', '#0ea5e9'],
  ];

  function start() {
    initPlayer();
    initSearch();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
