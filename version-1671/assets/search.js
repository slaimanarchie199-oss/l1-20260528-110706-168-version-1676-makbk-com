(function () {
  var params = new URLSearchParams(window.location.search);
  var q = params.get('q') || '';
  var input = document.querySelector('[data-search-input]');
  var summary = document.querySelector('[data-search-summary]');
  var results = document.querySelector('[data-search-results]');
  var items = window.SEARCH_ITEMS || [];

  if (input) {
    input.value = q;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function renderCard(item) {
    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + escapeHtml(item.url) + '" aria-label="观看 ' + escapeHtml(item.title) + '">',
      '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    <span class="poster-shade"></span>',
      '    <span class="play-chip">立即播放</span>',
      '    <span class="score-chip">' + escapeHtml(item.score) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta-line">',
      '      <a href="' + escapeHtml(item.categoryUrl) + '">' + escapeHtml(item.category) + '</a>',
      '      <span>' + escapeHtml(item.year) + '</span>',
      '      <span>' + escapeHtml(item.region) + '</span>',
      '    </div>',
      '    <h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
      '    <p>' + escapeHtml(item.summary) + '</p>',
      '    <div class="tag-row"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function runSearch(keyword) {
    var term = (keyword || '').trim().toLowerCase();
    var matches = items;

    if (term) {
      matches = items.filter(function (item) {
        return [
          item.title,
          item.year,
          item.region,
          item.type,
          item.category,
          item.genre,
          item.tags,
          item.summary
        ].join(' ').toLowerCase().indexOf(term) !== -1;
      });
    }

    if (summary) {
      summary.textContent = term ? '搜索结果：' + matches.length + ' 条' : '推荐浏览以下高清剧集';
    }

    if (results) {
      results.innerHTML = matches.slice(0, 96).map(renderCard).join('\n');
    }
  }

  runSearch(q);
})();
