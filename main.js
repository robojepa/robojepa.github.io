// RoboJEPA project page.
(function () {
  "use strict";

  var video = document.getElementById("bg");
  var hero = document.querySelector(".hero");
  var media = document.querySelector(".hero-media");
  var inner = document.querySelector(".hero-inner");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ---- background video: landscape or portrait cut, chosen by the viewport's shape
  var portraitQuery = window.matchMedia("(max-aspect-ratio: 4/5)");
  function pickVideo() {
    var kind = portraitQuery.matches ? "portrait" : "landscape";
    if (video.dataset.kind === kind) return;
    video.dataset.kind = kind;
    video.poster = video.dataset[kind + "Poster"];
    video.src = video.dataset[kind];
    if (!reduce.matches) {
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* autoplay blocked: the poster stays */ });
    }
  }
  pickVideo();
  (portraitQuery.addEventListener ? portraitQuery.addEventListener("change", pickVideo)
                                  : portraitQuery.addListener(pickVideo));

  // pause the video while the cover panel is out of view
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !reduce.matches) { video.play().catch(function () {}); }
        else { video.pause(); }
      });
    }, { threshold: 0.02 }).observe(hero);
  }

  // ---- cover panel slides away: the title block lifts a little faster than the page and fades,
  //      the video drifts slower (gentle parallax)
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      if (reduce.matches) return;
      var h = hero.offsetHeight;
      var y = Math.min(window.scrollY, h);
      var p = y / h;
      inner.style.transform = "translate3d(0," + (-0.25 * y).toFixed(1) + "px,0)";
      inner.style.opacity = String(Math.max(0, 1 - 1.6 * p));
      media.style.transform = "translate3d(0," + (0.35 * y).toFixed(1) + "px,0)";
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- one gesture lifts the whole panel: a downward wheel / swipe at the top glides to the content
  var abstract = document.getElementById("abstract");
  var gliding = false;
  function glideTo(target) {
    if (gliding) return;
    gliding = true;
    target.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "start" });
    setTimeout(function () { gliding = false; }, 900);
  }
  window.addEventListener("wheel", function (e) {
    if (window.scrollY < 8 && e.deltaY > 0) { e.preventDefault(); glideTo(abstract); }
  }, { passive: false });
  var touchY = null;
  hero.addEventListener("touchstart", function (e) { touchY = e.touches[0].clientY; }, { passive: true });
  hero.addEventListener("touchend", function (e) {
    if (touchY === null) return;
    var dy = touchY - e.changedTouches[0].clientY;
    touchY = null;
    if (window.scrollY < 8 && dy > 40) glideTo(abstract);
  }, { passive: true });
  window.addEventListener("keydown", function (e) {
    if (window.scrollY < 8 && (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ")) {
      e.preventDefault(); glideTo(abstract);
    }
  });

  // the "soon" paper button does nothing until a link exists
  var paper = document.getElementById("paper-link");
  if (paper && paper.getAttribute("aria-disabled") === "true") {
    paper.addEventListener("click", function (e) { e.preventDefault(); });
  }
})();
