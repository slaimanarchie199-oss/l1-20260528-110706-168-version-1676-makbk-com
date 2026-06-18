(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.js-site-search'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
  var items = Array.prototype.slice.call(document.querySelectorAll('.js-filter-item'));
  var emptyState = document.querySelector('.js-empty-state');
  var activeFilters = {};

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function currentQuery() {
    var active = searchInputs.find(function (input) {
      return input.value.trim().length > 0;
    });
    return normalize(active ? active.value : '');
  }

  function syncSearch(source) {
    searchInputs.forEach(function (input) {
      if (input !== source) {
        input.value = source.value;
      }
    });
  }

  function matchesFilters(item) {
    var query = currentQuery();
    var searchText = normalize(item.getAttribute('data-search'));

    if (query && searchText.indexOf(query) === -1) {
      return false;
    }

    return Object.keys(activeFilters).every(function (key) {
      var value = activeFilters[key];
      if (!value || value === 'all') {
        return true;
      }
      return normalize(item.getAttribute('data-' + key)) === normalize(value);
    });
  }

  function applyFilters() {
    var visible = 0;

    items.forEach(function (item) {
      var isVisible = matchesFilters(item);
      item.hidden = !isVisible;
      if (isVisible) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      syncSearch(input);
      applyFilters();
    });
  });

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      if (button.classList.contains('js-clear-filters')) {
        activeFilters = {};
        searchInputs.forEach(function (input) {
          input.value = '';
        });
        filterButtons.forEach(function (chip) {
          chip.classList.toggle('is-active', chip.getAttribute('data-filter-value') === 'all');
        });
        applyFilters();
        return;
      }

      var key = button.getAttribute('data-filter-key');
      var value = button.getAttribute('data-filter-value');

      if (!key) {
        return;
      }

      activeFilters[key] = value;

      filterButtons.forEach(function (chip) {
        if (chip.getAttribute('data-filter-key') === key) {
          chip.classList.remove('is-active');
        }
      });

      button.classList.add('is-active');
      applyFilters();
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var slideIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    slideIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === slideIndex);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === slideIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-slide')) || 0);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(slideIndex + 1);
    }, 5200);
  }

  var backToTop = document.querySelector('.back-to-top');

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
