// Photo album: year buttons built from the sections on the page, and a
// full-screen viewer with previous/next, arrow keys and swipe.
(function () {
  const years = Array.from(document.querySelectorAll(".album-year"));
  const chips = document.querySelector(".year-chips");
  if (chips) {
    years.forEach(function (y) {
      const a = document.createElement("a");
      a.className = "chip";
      a.href = "#" + y.id;
      a.textContent = y.querySelector(".album-year__title").textContent;
      chips.appendChild(a);
    });
  }

  const viewer = document.querySelector(".viewer");
  if (!viewer || !viewer.showModal) return;
  const big = viewer.querySelector(".viewer__img");
  const count = viewer.querySelector(".viewer__count");
  let list = [];
  let at = 0;

  function show(i) {
    at = (i + list.length) % list.length;
    const img = list[at];
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    const year = img.closest(".album-year").querySelector(".album-year__title").textContent;
    count.textContent = year + " · " + (at + 1) + " of " + list.length;
  }

  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".album__photo");
    if (!btn) return;
    const img = btn.querySelector("img");
    list = Array.from(btn.closest(".album").querySelectorAll(".album__photo img"));
    show(list.indexOf(img));
    viewer.showModal();
  });

  viewer.querySelector(".viewer__close").addEventListener("click", function () { viewer.close(); });
  viewer.querySelector(".viewer__prev").addEventListener("click", function () { show(at - 1); });
  viewer.querySelector(".viewer__next").addEventListener("click", function () { show(at + 1); });
  // A tap on the dark background closes it.
  viewer.addEventListener("click", function (e) { if (e.target === viewer) viewer.close(); });
  viewer.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(at - 1);
    if (e.key === "ArrowRight") show(at + 1);
  });

  let x0 = null;
  viewer.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  viewer.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 40) show(at + (dx < 0 ? 1 : -1));
  });
})();
