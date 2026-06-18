(function () {
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  var toggle = $('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
  }

  $all('.site-nav a').forEach(function (link) {
    link.addEventListener('click', function () {
      document.body.classList.remove('nav-open');
    });
  });

  var slider = $('[data-hero-slider]');
  if (slider) {
    var slides = $all('[data-hero-slide]', slider);
    var dots = $all('[data-hero-dot]', slider);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    show(0);
    start();
  }

  $all('[data-filter-form]').forEach(function (form) {
    var grid = $('[data-movie-grid]');
    if (!grid) return;

    var input = $('[data-filter-input]', form);
    var year = $('[data-filter-year]', form);
    var type = $('[data-filter-type]', form);
    var cards = $all('.movie-card', grid);
    var empty = $('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var y = params.get('year') || '';
    var t = params.get('type') || '';

    if (input && q) input.value = q;
    if (year && y) year.value = y;
    if (type && t) type.value = t;

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var query = normalize(input ? input.value : '');
      var selectedYear = normalize(year ? year.value : '');
      var selectedType = normalize(type ? type.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var matched = true;

        if (query && text.indexOf(query) === -1) matched = false;
        if (selectedYear && cardYear !== selectedYear) matched = false;
        if (selectedType && cardType !== selectedType) matched = false;

        card.style.display = matched ? '' : 'none';
        if (matched) visible += 1;
      });

      if (empty) empty.classList.toggle('is-visible', visible === 0);
    }

    ['input', 'change'].forEach(function (eventName) {
      if (input) input.addEventListener(eventName, apply);
      if (year) year.addEventListener(eventName, apply);
      if (type) type.addEventListener(eventName, apply);
    });

    form.addEventListener('reset', function () {
      window.setTimeout(apply, 0);
    });

    apply();
  });
})();
