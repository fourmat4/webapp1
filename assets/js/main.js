// Newsletter signup. There's no mailing list hooked up yet, so this only
// validates the form and shows a confirmation. Once a provider is chosen,
// set the form's action and post to it here.
(function () {
  const form = document.querySelector(".signup");
  if (!form) return;

  const email = form.querySelector('input[type="email"]');
  const consent = form.querySelector('input[name="consent"]');
  const msg = form.querySelector(".signup__msg");

  function say(text, ok) {
    msg.textContent = text;
    msg.classList.toggle("is-ok", ok);
    msg.classList.toggle("is-error", !ok);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!email.value.trim() || !email.validity.valid) {
      say("That email doesn't look quite right.", false);
      email.focus();
      return;
    }
    if (!consent.checked) {
      say("Tick the box so we know you're happy to hear from us.", false);
      consent.focus();
      return;
    }

    say("Lovely. You're on the list, we'll be in touch.", true);
    form.reset();
  });
})();

// Stage cards: clicking one opens its panel over the whole board.
(function () {
  const board = document.querySelector(".stages-board");
  if (!board) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let openPanel = null;
  let openButton = null;

  function close() {
    if (!openPanel) return;
    openPanel.hidden = true;
    board.classList.remove("is-open");
    openButton.setAttribute("aria-expanded", "false");
    openButton.focus({ preventScroll: true });
    openButton.closest(".stage").scrollIntoView({ block: "nearest" });
    openPanel = openButton = null;
  }

  function open(button) {
    close();
    const card = button.closest(".stage");
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    const from = card.getBoundingClientRect();

    board.classList.add("is-open");
    panel.hidden = false;
    button.setAttribute("aria-expanded", "true");
    openPanel = panel;
    openButton = button;

    const to = panel.getBoundingClientRect();
    if (to.top < 0 || to.top > window.innerHeight * 0.5) {
      panel.scrollIntoView({ block: "start" });
    }
    panel.focus({ preventScroll: true });

    // Grow the panel out of the card that was clicked.
    if (!reduceMotion.matches && panel.animate) {
      const after = panel.getBoundingClientRect();
      const dx = from.left - after.left;
      const dy = from.top - after.top;
      panel.animate(
        [
          { transformOrigin: "0 0", transform: `translate(${dx}px, ${dy}px) scale(${from.width / after.width}, ${from.height / after.height})`, opacity: 0.6 },
          { transformOrigin: "0 0", transform: "none", opacity: 1 }
        ],
        { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" }
      );
    }
  }

  board.addEventListener("click", function (event) {
    if (event.target.closest(".stage-panel__close")) return close();
    const card = event.target.closest(".stage");
    if (card) open(card.querySelector(".stage__open"));
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") close();
  });
})();

// Peekers: pop out while their spot is in the middle of the screen,
// tuck away again once it scrolls past.
(function () {
  const peeks = document.querySelectorAll(".peek");
  if (!peeks.length) return;
  if (!("IntersectionObserver" in window)) {
    peeks.forEach(function (p) { p.classList.add("is-out"); });
    return;
  }
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      entry.target.classList.toggle("is-out", entry.isIntersecting);
    });
  }, { rootMargin: "-12% 0px -12% 0px" });
  peeks.forEach(function (p) { io.observe(p); });
})();
