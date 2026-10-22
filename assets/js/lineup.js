// Stage filter for the lineup page. Without JavaScript every artist
// shows and the filter buttons stay hidden.
(function () {
  const group = document.querySelector(".chips");
  const artists = document.querySelectorAll(".artist");
  const empty = document.querySelector(".artists__empty");
  if (!group || !artists.length) return;

  group.hidden = false;

  group.addEventListener("click", function (event) {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    const stage = button.dataset.filter;

    group.querySelectorAll("[data-filter]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b === button));
    });

    let shown = 0;
    artists.forEach(function (artist) {
      const match = stage === "all" || artist.dataset.stage === stage;
      artist.hidden = !match;
      if (match) shown++;
    });
    empty.hidden = shown > 0;
  });
})();
