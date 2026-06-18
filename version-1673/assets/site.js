
(function () {
  const catalogPromise = fetch('./assets/catalog.json').then(r => r.json()).catch(() => []);

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }
  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function initDrawer() {
    const btn = qs('[data-mobile-toggle]');
    const drawer = qs('[data-mobile-drawer]');
    if (!btn || !drawer) return;
    btn.addEventListener('click', () => {
      drawer.classList.toggle('open');
      btn.setAttribute('aria-expanded', drawer.classList.contains('open') ? 'true' : 'false');
    });
  }

  function initHeroSlider() {
    const root = qs('[data-hero-slider]');
    if (!root) return;
    const track = qs('.slider-track', root);
    const slides = qsa('.hero-slide', root);
    const dots = qsa('[data-dot]', root);
    const prev = qs('[data-prev]', root);
    const next = qs('[data-next]', root);
    if (!track || slides.length === 0) return;
    let index = 0;
    let timer = null;

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, n) => dot.classList.toggle('active', n === index));
    }
    function start() {
      stop();
      timer = setInterval(() => go(index + 1), 4500);
    }
    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }
    prev && prev.addEventListener('click', () => { go(index - 1); start(); });
    next && next.addEventListener('click', () => { go(index + 1); start(); });
    dots.forEach((dot, n) => dot.addEventListener('click', () => { go(n); start(); }));
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    go(0);
    start();
  }

  function initFilters() {
    const wrap = qs('[data-filter-zone]');
    if (!wrap) return;
    const input = qs('[data-filter-input]', wrap);
    const genre = qs('[data-filter-genre]', wrap);
    const cards = qsa('.movie-card', wrap);
    const count = qs('[data-filter-count]', wrap);

    function apply() {
      const term = (input && input.value || '').trim().toLowerCase();
      const g = (genre && genre.value || '').trim();
      let visible = 0;
      cards.forEach(card => {
        const title = (card.dataset.title || '').toLowerCase();
        const tags = (card.dataset.tags || '').toLowerCase();
        const cGenre = (card.dataset.genre || '').toLowerCase();
        const cCat = (card.dataset.category || '').toLowerCase();
        const okTerm = !term || title.includes(term) || tags.includes(term) || cGenre.includes(term) || cCat.includes(term);
        const okGenre = !g || cGenre.includes(g) || cCat.includes(g);
        const show = okTerm && okGenre;
        card.style.display = show ? '' : 'none';
        if (show) visible += 1;
      });
      if (count) count.textContent = visible;
    }

    input && input.addEventListener('input', apply);
    genre && genre.addEventListener('change', apply);
    apply();
  }

  function initPlayer() {
    const players = qsa('video.js-hls-player');
    if (!players.length) return;
    players.forEach(video => {
      const src = video.getAttribute('data-src');
      if (!src) return;
      if (video.dataset.ready === '1') return;
      video.dataset.ready = '1';

      if (window.Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            console.warn('HLS error', data);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        video.src = video.getAttribute('data-fallback') || '';
      }
    });
  }

  function initCardsTap() {
    qsa('.movie-card').forEach(card => {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const link = qs('a', card);
          link && link.click();
        }
      });
    });
  }

  async function initSearchPage() {
    const root = qs('[data-search-page]');
    if (!root) return;
    const input = qs('[data-global-search]', root);
    const results = qs('[data-search-results]', root);
    const count = qs('[data-search-count]', root);
    const params = new URLSearchParams(window.location.search);
    if (input && params.get('q')) input.value = params.get('q');

    const catalog = await catalogPromise;

    function render(items) {
      if (!results) return;
      if (!items.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配影片，请尝试更短的关键词。</div>';
        if (count) count.textContent = 0;
        return;
      }
      if (count) count.textContent = items.length;
      results.innerHTML = items.map(item => `
        <article class="movie-card">
          <a class="movie-card__link" href="${item.path}">
            <div class="movie-poster movie-poster--${item.index % 8}">
              <div class="movie-poster__badge">${String(item.index).padStart(4,'0')}</div>
              <div class="movie-poster__meta">${item.year}</div>
              <div class="movie-poster__title">${item.title}</div>
            </div>
            <div class="movie-card__body">
              <h3>${item.title}</h3>
              <p>${(item.summary || item.title).slice(0, 68)}</p>
              <div class="movie-card__chips">
                <span class="chip">${item.category}</span>
                <span class="chip">${item.region}</span>
                <span class="chip">${item.type}</span>
              </div>
            </div>
          </a>
        </article>
      `).join('');
    }

    function apply() {
      const q = (input && input.value || '').trim().toLowerCase();
      const items = catalog.filter(item => {
        if (!q) return true;
        const blob = [item.title, item.genre, item.tags, item.summary, item.review, item.year, item.region, item.type, item.category].join(' ').toLowerCase();
        return blob.includes(q);
      });
      render(items.slice(0, 120));
    }

    input && input.addEventListener('input', apply);
    apply();
  }

  function initDetailTabs() {
    const tabs = qsa('[data-playline]');
    if (!tabs.length) return;
    const video = qs('video.js-hls-player');
    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        if (video) {
          const src = btn.getAttribute('data-src');
          if (src) {
            if (window.Hls && Hls.isSupported()) {
              if (video._hlsInstance) video._hlsInstance.destroy();
              const hls = new Hls({ enableWorker: true });
              video._hlsInstance = hls;
              hls.loadSource(src);
              hls.attachMedia(video);
            } else {
              video.src = src;
            }
            video.play().catch(() => {});
          }
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initDrawer();
    initHeroSlider();
    initFilters();
    initPlayer();
    initCardsTap();
    initSearchPage();
    initDetailTabs();
  });
})();
