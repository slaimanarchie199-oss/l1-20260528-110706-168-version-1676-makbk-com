(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initImages() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
      });
    });
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !mobileNav) {
      return;
    }

    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var next = slider.querySelector("[data-hero-next]");
    var prev = slider.querySelector("[data-hero-prev]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, currentIndex) {
        slide.classList.toggle("is-active", currentIndex === index);
      });

      dots.forEach(function (dot, currentIndex) {
        dot.classList.toggle("is-active", currentIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    document.querySelectorAll(".js-card-scope").forEach(function (scope) {
      var input = scope.querySelector(".js-search-input");
      var type = scope.querySelector(".js-filter-type");
      var region = scope.querySelector(".js-filter-region");
      var category = scope.querySelector(".js-filter-category");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-empty-state]");

      if (!cards.length) {
        return;
      }

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function apply() {
        var keyword = normalize(input ? input.value : "");
        var typeValue = type ? type.value : "";
        var regionValue = region ? region.value : "";
        var categoryValue = category ? category.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesType = !typeValue || card.getAttribute("data-type") === typeValue;
          var matchesRegion = !regionValue || card.getAttribute("data-region") === regionValue;
          var matchesCategory = !categoryValue || card.getAttribute("data-category") === categoryValue;
          var show = matchesKeyword && matchesType && matchesRegion && matchesCategory;

          card.style.display = show ? "" : "none";

          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, type, region, category].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function initPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var source = player.getAttribute("data-source");
      var video = player.querySelector("video");
      var message = player.querySelector("[data-player-message]");
      var playButtons = player.querySelectorAll("[data-player-play]");
      var muteButton = player.querySelector("[data-player-mute]");
      var fullscreenButton = player.querySelector("[data-player-fullscreen]");
      var prepared = false;
      var hls = null;

      if (!source || !video) {
        return;
      }

      function setMessage(text) {
        if (!message) {
          return;
        }

        message.textContent = text || "";
        message.classList.toggle("is-visible", Boolean(text));
      }

      function prepare() {
        if (prepared) {
          return;
        }

        prepared = true;
        setMessage("");

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              setMessage("视频加载失败，请稍后重试");
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          setMessage("当前浏览器不支持 HLS 播放");
        }
      }

      function playOrPause() {
        prepare();

        if (video.paused) {
          var playPromise = video.play();

          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
              setMessage("点击播放器后即可开始播放");
            });
          }
        } else {
          video.pause();
        }
      }

      playButtons.forEach(function (button) {
        button.addEventListener("click", function (event) {
          event.stopPropagation();
          playOrPause();
        });
      });

      player.addEventListener("click", function (event) {
        if (event.target.closest(".player-actions") || event.target.tagName.toLowerCase() === "video") {
          return;
        }

        playOrPause();
      });

      if (muteButton) {
        muteButton.addEventListener("click", function (event) {
          event.stopPropagation();
          video.muted = !video.muted;
          muteButton.textContent = video.muted ? "取消静音" : "静音";
        });
      }

      if (fullscreenButton) {
        fullscreenButton.addEventListener("click", function (event) {
          event.stopPropagation();

          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (player.requestFullscreen) {
            player.requestFullscreen();
          }
        });
      }

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
      });

      video.addEventListener("ended", function () {
        player.classList.remove("is-playing");
      });
    });
  }

  ready(function () {
    initImages();
    initNavigation();
    initHeroSlider();
    initFilters();
    initPlayers();
  });
})();
