(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function toggleClass(target, name) {
    if (target) {
      target.classList.toggle(name);
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupNavigation() {
    var searchButton = document.querySelector('[data-search-toggle]');
    var searchPanel = document.querySelector('[data-search-panel]');
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (searchButton) {
      searchButton.addEventListener('click', function () {
        toggleClass(searchPanel, 'open');
        if (searchPanel && searchPanel.classList.contains('open')) {
          var input = searchPanel.querySelector('input[type="search"]');
          if (input) {
            input.focus();
          }
        }
      });
    }

    if (menuButton) {
      menuButton.addEventListener('click', function () {
        toggleClass(mobileNav, 'open');
      });
    }
  }

  function setupFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    if (!panel) {
      return;
    }

    var searchInput = panel.querySelector('[data-filter-search]');
    var clearButton = panel.querySelector('[data-filter-clear]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var state = {
      region: '',
      type: '',
      year: ''
    };

    function markActive(attribute, value) {
      panel.querySelectorAll('[' + attribute + ']').forEach(function (button) {
        button.classList.toggle('active', button.getAttribute(attribute) === value);
      });
    }

    function apply() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year')
        ].join(' '));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedRegion = !state.region || card.getAttribute('data-region') === state.region;
        var matchedType = !state.type || card.getAttribute('data-type') === state.type;
        var matchedYear = !state.year || card.getAttribute('data-year') === state.year;
        card.style.display = matchedKeyword && matchedRegion && matchedType && matchedYear ? '' : 'none';
      });
    }

    panel.querySelectorAll('[data-filter-region]').forEach(function (button) {
      button.addEventListener('click', function () {
        state.region = button.getAttribute('data-filter-region') || '';
        markActive('data-filter-region', state.region);
        apply();
      });
    });

    panel.querySelectorAll('[data-filter-type]').forEach(function (button) {
      button.addEventListener('click', function () {
        state.type = button.getAttribute('data-filter-type') || '';
        markActive('data-filter-type', state.type);
        apply();
      });
    });

    panel.querySelectorAll('[data-filter-year]').forEach(function (button) {
      button.addEventListener('click', function () {
        state.year = button.getAttribute('data-filter-year') || '';
        markActive('data-filter-year', state.year);
        apply();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', apply);
      var params = new URLSearchParams(window.location.search);
      var preset = params.get('q');
      if (preset) {
        searchInput.value = preset;
      }
    }

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        state.region = '';
        state.type = '';
        state.year = '';
        if (searchInput) {
          searchInput.value = '';
        }
        markActive('data-filter-region', '');
        markActive('data-filter-type', '');
        markActive('data-filter-year', '');
        apply();
      });
    }

    apply();
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('[data-play]');
      if (!video || !button) {
        return;
      }

      var streamUrl = video.getAttribute('data-stream');
      var hlsInstance = null;

      function attachStream() {
        if (!streamUrl || video.getAttribute('data-ready') === 'yes') {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
        video.setAttribute('data-ready', 'yes');
      }

      function playVideo(event) {
        if (event) {
          event.preventDefault();
        }
        attachStream();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }

      button.addEventListener('click', playVideo);
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          box.classList.remove('is-playing');
        }
      });
      video.addEventListener('ended', function () {
        box.classList.remove('is-playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupFilters();
    setupPlayers();
  });
})();
