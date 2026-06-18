(function () {
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function setupMobileMenu() {
    const button = qs('[data-menu-toggle]');
    const nav = qs('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    const root = qs('[data-hero-carousel]');
    if (!root) {
      return;
    }
    const slides = qsa('[data-hero-slide]', root);
    const thumbs = qsa('[data-hero-thumb]', root);
    const previous = qs('[data-hero-prev]', root);
    const next = qs('[data-hero-next]', root);
    let active = 0;
    let timer = null;

    function setActive(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === active);
      });
      thumbs.forEach(function (thumb, idx) {
        thumb.classList.toggle('is-active', idx === active);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        setActive(active + 1);
      }, 5600);
    }

    thumbs.forEach(function (thumb, idx) {
      thumb.addEventListener('click', function () {
        setActive(idx);
        start();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        setActive(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setActive(active + 1);
        start();
      });
    }

    setActive(0);
    start();
  }

  function setupLocalFilter() {
    const input = qs('[data-card-search]');
    const chips = qsa('[data-filter-value]');
    const cards = qsa('[data-movie-card]');
    const empty = qs('[data-empty-state]');
    if (!cards.length) {
      return;
    }
    let activeFilter = 'all';

    function apply() {
      const query = input ? input.value.trim().toLowerCase() : '';
      let visible = 0;
      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title || '',
          card.dataset.tags || '',
          card.dataset.region || '',
          card.dataset.year || '',
          card.dataset.type || ''
        ].join(' ').toLowerCase();
        const matchesQuery = !query || haystack.indexOf(query) !== -1;
        const matchesFilter = activeFilter === 'all' || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
        const show = matchesQuery && matchesFilter;
        card.classList.toggle('hidden-card', !show);
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        activeFilter = chip.dataset.filterValue || 'all';
        apply();
      });
    });

    apply();
  }

  function setupSearchPage() {
    const input = qs('[data-global-search]');
    const results = qs('[data-global-results]');
    if (!input || !results || !window.SEARCH_MOVIES) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    input.value = query;

    function card(movie) {
      return [
        '<article class="movie-card" data-movie-card>',
        '<a href="' + movie.url + '">',
        '<div class="poster-wrap">',
        '<img src="' + movie.cover + '" alt="' + movie.title + '">',
        '<div class="poster-gradient"></div>',
        '</div>',
        '<div class="movie-card-body">',
        '<h2 class="movie-title">' + movie.title + '</h2>',
        '<p class="movie-desc">' + movie.oneLine + '</p>',
        '<div class="card-meta">',
        '<span>' + movie.year + '</span>',
        '<span>' + movie.region + '</span>',
        '<span>' + movie.type + '</span>',
        '</div>',
        '</div>',
        '</a>',
        '</article>'
      ].join('');
    }

    function normalize(value) {
      return String(value || '').toLowerCase();
    }

    function render() {
      const value = normalize(input.value.trim());
      const matches = window.SEARCH_MOVIES.filter(function (movie) {
        const haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine,
          movie.category
        ].join(' '));
        return !value || haystack.indexOf(value) !== -1;
      }).slice(0, 96);
      results.innerHTML = matches.map(card).join('');
    }

    input.addEventListener('input', render);
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupLocalFilter();
    setupSearchPage();
  });
})();
