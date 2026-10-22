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
// The panel is revealed from the clicked card's outline (a clip-path, so
// nothing gets squashed), and shrinks back into the card when closed.
(function () {
  const board = document.querySelector(".stages-board");
  if (!board) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const EASE = "cubic-bezier(.65,0,.25,1)";
  const OPEN_MS = 520;
  const CLOSE_MS = 420;
  let openPanel = null;
  let openButton = null;
  let running = null;

  function animates() {
    return !reduceMotion.matches && typeof board.animate === "function";
  }

  // Card position relative to the board.
  function cardBox(card) {
    const b = board.getBoundingClientRect();
    const c = card.getBoundingClientRect();
    return { top: c.top - b.top, left: c.left - b.left, width: c.width, height: c.height };
  }

  // A clip-path that cuts the panel down to the card's outline, or null when
  // the card sits outside the panel (narrow screens, where the cards stack).
  function clipTo(panel, box) {
    const b = board.getBoundingClientRect();
    const p = panel.getBoundingClientRect();
    const top = box.top - (p.top - b.top);
    const left = box.left - (p.left - b.left);
    const right = p.width - left - box.width;
    const bottom = p.height - top - box.height;
    // Tilted cards can poke a few px past the board edge; that's fine.
    if (Math.min(top, left, right, bottom) < -40) return null;
    const r = getComputedStyle(panel).borderTopLeftRadius;
    return `inset(${top}px ${right}px ${bottom}px ${left}px round ${r})`;
  }

  function reveal(panel, clip, opening) {
    const r = getComputedStyle(panel).borderTopLeftRadius;
    const full = `inset(0px 0px 0px 0px round ${r})`;
    const frames = clip
      ? [{ clipPath: clip }, { clipPath: full }]
      : [{ opacity: 0, transform: "translateY(16px) scale(.98)" }, { opacity: 1, transform: "none" }];
    const kids = Array.from(panel.children);
    if (opening) {
      const a = panel.animate(frames, { duration: OPEN_MS, easing: EASE });
      kids.forEach(function (k) {
        k.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: OPEN_MS * 0.45, easing: "ease-out", fill: "backwards" });
      });
      return a;
    }
    kids.forEach(function (k) {
      k.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: "ease-in", fill: "forwards" });
    });
    return panel.animate(frames.slice().reverse(), { duration: CLOSE_MS, easing: EASE, fill: "forwards" });
  }

  function finish(panel) {
    panel.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); });
  }

  function close(instant) {
    if (!openPanel) return;
    const panel = openPanel;
    const button = openButton;
    const card = button.closest(".stage");
    openPanel = openButton = null;
    if (running) { running.cancel(); running = null; }
    finish(panel);

    board.classList.remove("is-open");
    button.setAttribute("aria-expanded", "false");
    button.focus({ preventScroll: true });

    const done = function () {
      panel.hidden = true;
      finish(panel);
    };

    if (instant === true || !animates()) return done();

    card.scrollIntoView({ block: "nearest", behavior: "smooth" });
    const anim = reveal(panel, clipTo(panel, cardBox(card)), false);
    running = anim;
    anim.finished.then(function () { if (running === anim) running = null; done(); }, function () {});
  }

  function open(button) {
    if (openButton === button) return;
    close(true);
    const card = button.closest(".stage");
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    const box = cardBox(card);

    board.classList.add("is-open");
    panel.hidden = false;
    button.setAttribute("aria-expanded", "true");
    openPanel = panel;
    openButton = button;

    const to = panel.getBoundingClientRect();
    if (to.top < 0 || to.top > window.innerHeight * 0.5) {
      panel.scrollIntoView({ block: "start", behavior: animates() ? "smooth" : "auto" });
    }
    panel.focus({ preventScroll: true });

    if (animates()) {
      const anim = reveal(panel, clipTo(panel, box), true);
      running = anim;
      anim.finished.then(function () { if (running === anim) running = null; }, function () {});
    }
  }

  board.addEventListener("click", function (event) {
    if (event.target.closest(".stage-panel__close")) return close();
    if (event.target.closest(".stage-panel")) {
      // Anywhere on the open panel closes it, except links and text being selected.
      if (event.target.closest("a")) return;
      const sel = window.getSelection && window.getSelection();
      if (sel && !sel.isCollapsed && event.target.closest(".stage-panel").contains(sel.anchorNode)) return;
      return close();
    }
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
