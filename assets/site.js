
(function () {
  const onReady = (fn) => {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  };

  onReady(() => {
    const menuButton = document.querySelector('[data-menu-button]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');
    if (menuButton && mobilePanel) {
      menuButton.addEventListener('click', () => {
        const open = mobilePanel.classList.toggle('open');
        menuButton.setAttribute('aria-expanded', String(open));
      });
    }

    // Hero carousel
    const hero = document.querySelector('[data-hero-carousel]');
    if (hero) {
      const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
      const prevBtn = hero.querySelector('[data-hero-prev]');
      const nextBtn = hero.querySelector('[data-hero-next]');
      const indexEl = hero.querySelector('[data-hero-index]');
      const totalEl = hero.querySelector('[data-hero-total]');
      let index = 0;
      let timer = null;
      const total = slides.length;
      if (totalEl) totalEl.textContent = String(total).padStart(2, '0');

      const show = (next) => {
        index = (next + total) % total;
        slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
        if (indexEl) indexEl.textContent = String(index + 1).padStart(2, '0');
      };
      const start = () => {
        stop();
        timer = window.setInterval(() => show(index + 1), 5000);
      };
      const stop = () => {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      };

      prevBtn && prevBtn.addEventListener('click', () => { show(index - 1); start(); });
      nextBtn && nextBtn.addEventListener('click', () => { show(index + 1); start(); });
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      hero.addEventListener('focusin', stop);
      hero.addEventListener('focusout', start);
      show(0);
      start();
    }

    // Search page
    const searchRoot = document.querySelector('[data-search-root]');
    if (searchRoot && window.MOVIE_INDEX) {
      const input = searchRoot.querySelector('[data-search-input]');
      const region = searchRoot.querySelector('[data-search-region]');
      const type = searchRoot.querySelector('[data-search-type]');
      const year = searchRoot.querySelector('[data-search-year]');
      const results = searchRoot.querySelector('[data-search-results]');
      const stats = searchRoot.querySelector('[data-search-stats]');

      const uniqYears = [...new Set(window.MOVIE_INDEX.map((m) => m.year))].sort((a, b) => Number(b) - Number(a));
      if (year && year.options.length <= 1) {
        uniqYears.slice(0, 40).forEach((y) => {
          const opt = document.createElement('option');
          opt.value = y;
          opt.textContent = y;
          year.appendChild(opt);
        });
      }

      const iconEye = '<svg viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
      const iconFilm = '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M7 3v18"></path><path d="M17 3v18"></path><path d="M3 7.5h4"></path><path d="M3 12h18"></path><path d="M3 16.5h4"></path><path d="M17 7.5h4"></path><path d="M17 16.5h4"></path></svg>';

      const render = () => {
        const q = (input && input.value ? input.value : '').trim().toLowerCase();
        const reg = region && region.value ? region.value : '';
        const typ = type && type.value ? type.value : '';
        const yr = year && year.value ? year.value : '';
        const filtered = window.MOVIE_INDEX.filter((m) => {
          const hay = [m.title, m.region, m.type, m.year, m.genreRaw, m.oneLine, (m.tags || []).join(' ')].join(' ').toLowerCase();
          const okQ = !q || hay.includes(q);
          const okReg = !reg || m.region === reg;
          const okType = !typ || m.type === typ;
          const okYear = !yr || String(m.year) === String(yr);
          return okQ && okReg && okType && okYear;
        });

        if (stats) {
          stats.textContent = '共找到 ' + filtered.length + ' 条结果（数据总量 ' + window.MOVIE_INDEX.length + ' 条）';
        }

        if (!results) return;
        results.innerHTML = filtered.slice(0, 240).map((m) => `
          <a class="movie-card" href="movie-${m.id}.html">
            <div class="movie-poster" style="--cover-image: linear-gradient(135deg, rgba(6,182,212,.24), rgba(59,130,246,.16)), linear-gradient(135deg, rgba(15,23,42,.92), rgba(15,23,42,.72)), url('${m.cover}')">
              <div class="poster-info">
                <div class="poster-top-row">
                  <span class="poster-tag">${escapeHtml(m.region)}</span>
                  <span class="poster-year">${escapeHtml(m.year)}</span>
                </div>
                <div class="poster-btm">
                  <p class="poster-name">${escapeHtml(m.title)}</p>
                  <p class="poster-line">${escapeHtml(m.oneLine || m.genreRaw || '')}</p>
                </div>
              </div>
            </div>
            <div class="movie-body">
              <p class="movie-title">${escapeHtml(m.title)}</p>
              <p class="movie-sub">${escapeHtml(m.genreRaw || '')}</p>
              <div class="movie-meta"><span class="meta-item">${iconEye}<span>${escapeHtml(m.type)}</span></span><span class="meta-item">${iconFilm}<span>${escapeHtml(m.year)}</span></span></div>
            </div>
          </a>
        `).join('');
      };

      const escapeHtml = (str) => String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');

      [input, region, type, year].forEach((el) => el && el.addEventListener('input', render));
      [input, region, type, year].forEach((el) => el && el.addEventListener('change', render));
      render();
    }
  });
})();
