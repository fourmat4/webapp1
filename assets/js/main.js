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
  // On phones the panel opens over the card itself, and the page never scrolls.
  const phone = window.matchMedia("(max-width: 720px)");
  const EASE = "cubic-bezier(.65,0,.25,1)";
  // Closing starts moving straight away; a slow start reads as a freeze.
  const CLOSE_EASE = "cubic-bezier(.3,.45,.5,1)";
  const OPEN_MS = 520;
  const CLOSE_MS = 380;
  let openPanel = null;
  let openButton = null;
  let running = null;
  let push = null; // phones: the animation that pushes the cards below down

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
    return { top: top, right: right, bottom: bottom, left: left };
  }

  // A black outline that tracks the clip, so the border shows the whole way.
  function ring(panel) {
    let el = panel.querySelector(".stage-panel__ring");
    if (!el) {
      el = document.createElement("span");
      el.className = "stage-panel__ring";
      el.setAttribute("aria-hidden", "true");
      panel.appendChild(el);
    }
    return el;
  }

  function reveal(panel, box, opening) {
    const cs = getComputedStyle(panel);
    const r = cs.borderTopLeftRadius;
    const bw = parseFloat(cs.borderTopWidth) || 0;
    const ins = function (b) { return `inset(${b.top}px ${b.right}px ${b.bottom}px ${b.left}px round ${r})`; };
    const zero = { top: 0, right: 0, bottom: 0, left: 0 };
    const frames = box
      ? [{ clipPath: ins(box) }, { clipPath: ins(zero) }]
      : [{ opacity: 0, transform: "translateY(16px) scale(.98)" }, { opacity: 1, transform: "none" }];
    // The ring is positioned from the padding edge, so shift it out by the border width.
    const pos = function (b) {
      return { top: (b.top - bw) + "px", right: (b.right - bw) + "px", bottom: (b.bottom - bw) + "px", left: (b.left - bw) + "px" };
    };
    const ringFrames = box ? [pos(box), pos(zero)] : null;
    const el = box ? ring(panel) : null;
    const kids = Array.from(panel.children).filter(function (k) { return k !== el; });
    if (opening) {
      const a = panel.animate(frames, { duration: OPEN_MS, easing: EASE });
      if (el) el.animate(ringFrames, { duration: OPEN_MS, easing: EASE });
      kids.forEach(function (k) {
        k.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: OPEN_MS * 0.45, easing: "ease-out", fill: "backwards" });
      });
      return a;
    }
    kids.forEach(function (k) {
      k.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: "ease-in", fill: "forwards" });
    });
    // Drop out on the very last frame. Waiting for the finished event leaves
    // the panel sitting over the card for one extra frame, which reads as a freeze.
    lastFrameOut(panel, CLOSE_MS);
    if (el) el.animate(ringFrames.slice().reverse(), { duration: CLOSE_MS, easing: CLOSE_EASE, fill: "forwards" });
    return panel.animate(frames.slice().reverse(), { duration: CLOSE_MS, easing: CLOSE_EASE, fill: "forwards" });
  }

  function lastFrameOut(panel, ms) {
    panel.animate(
      [{ visibility: "visible" }, { visibility: "visible", offset: Math.max(0, 1 - 12 / ms) }, { visibility: "hidden" }],
      { duration: ms, easing: "step-end", fill: "forwards" }
    );
  }

  function finish(panel) {
    panel.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); });
  }

  // Phones: the open card makes room for its panel by pushing the cards
  // below it down (a bottom margin), and lets them back up on close.
  // Scroll anchoring is off meanwhile so the page itself never moves.
  function pushBelow(card, px, ms, ease) {
    if (push) push.cancel();
    const from = parseFloat(card.style.marginBottom) || 0;
    card.style.marginBottom = px ? px + "px" : "";
    document.documentElement.style.overflowAnchor = "none";
    const settle = function () { document.documentElement.style.overflowAnchor = ""; };
    if (!ms) { push = null; return settle(); }
    const a = card.animate([{ marginBottom: from + "px" }, { marginBottom: px + "px" }], { duration: ms, easing: ease });
    push = a;
    a.finished.then(function () { if (push === a) { push = null; settle(); } }, function () {});
  }

  function close(instant) {
    if (!openPanel) return;
    const panel = openPanel;
    const button = openButton;
    const card = button.closest(".stage");
    openPanel = openButton = null;
    // Closed while still opening: play the opening backwards from where it is,
    // rather than snapping to full size first.
    const midOpen = running && running.playState === "running" && instant !== true;
    if (!midOpen) {
      if (running) running.cancel();
      running = null;
      finish(panel);
    }

    board.classList.remove("is-open");
    button.setAttribute("aria-expanded", "false");
    button.focus({ preventScroll: true });

    const done = function () {
      panel.hidden = true;
      finish(panel);
      if (phone.matches && card.style.marginBottom) pushBelow(card, 0, 0);
      if (instant !== true && !phone.matches) card.scrollIntoView({ block: "nearest", behavior: animates() ? "smooth" : "auto" });
    };

    if (instant === true || !animates()) return done();

    if (midOpen) {
      const anims = panel.getAnimations({ subtree: true });
      anims.forEach(function (a) { a.reverse(); });
      if (push && push.playState === "running") {
        const p = push;
        card.style.marginBottom = "";
        document.documentElement.style.overflowAnchor = "none";
        p.reverse();
        p.finished.then(function () { if (push === p) { push = null; document.documentElement.style.overflowAnchor = ""; } }, function () {});
      }
      const main = running;
      const left = main.effect.getComputedTiming().localTime || OPEN_MS;
      lastFrameOut(panel, Math.max(120, Math.min(left, OPEN_MS)));
      main.finished.then(function () { if (openPanel !== panel) done(); }, function () {});
      return;
    }

    const anim = reveal(panel, clipTo(panel, cardBox(card)), false);
    running = anim;
    if (phone.matches) pushBelow(card, 0, CLOSE_MS, CLOSE_EASE);
    anim.finished.then(function () { if (running === anim) running = null; done(); }, function () {});
  }

  function open(button) {
    if (openButton === button) return;
    close(true);
    const card = button.closest(".stage");
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    const box = cardBox(card);

    finish(panel);
    board.classList.add("is-open");
    panel.hidden = false;
    button.setAttribute("aria-expanded", "true");
    openPanel = panel;
    openButton = button;

    if (phone.matches) {
      // Sit the panel where the card is and push the cards below out of its way.
      const top = Math.max(0, box.top);
      panel.style.setProperty("--panel-top", top + "px");
      const room = Math.max(0, top + panel.offsetHeight - (box.top + card.offsetHeight));
      pushBelow(card, room, animates() ? OPEN_MS : 0, EASE);
    } else {
      const to = panel.getBoundingClientRect();
      if (to.top < 0 || to.top > window.innerHeight * 0.5) {
        panel.scrollIntoView({ block: "start", behavior: animates() ? "smooth" : "auto" });
      }
    }
    panel.focus({ preventScroll: true });

    if (animates()) {
      const anim = reveal(panel, clipTo(panel, box), true);
      running = anim;
      anim.finished.then(function () { if (running === anim) running = null; }, function () {});
    }
  }

  // Phones: every closed card is as tall as the tallest one.
  const list = board.querySelector(".stages");
  function evenHeights() {
    list.style.removeProperty("--stage-h");
    if (!phone.matches) return;
    let tallest = 0;
    list.querySelectorAll(".stage").forEach(function (c) { tallest = Math.max(tallest, c.offsetHeight); });
    list.style.setProperty("--stage-h", tallest + "px");
  }
  evenHeights();
  window.addEventListener("resize", evenHeights);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(evenHeights);
  window.addEventListener("load", evenHeights);

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

// Burger menu (narrow screens): toggles the nav drop-down; closes on a
// link tap, Escape, or a tap anywhere else.
(function () {
  const header = document.querySelector(".site-header");
  const burger = header && header.querySelector(".burger");
  if (!burger) return;
  function set(open) {
    header.classList.toggle("is-menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Menu");
  }
  burger.addEventListener("click", function () {
    set(burger.getAttribute("aria-expanded") !== "true");
  });
  header.querySelectorAll("nav a").forEach(function (a) {
    a.addEventListener("click", function () { set(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && header.classList.contains("is-menu-open")) { set(false); burger.focus(); }
  });
  document.addEventListener("click", function (e) {
    if (!header.contains(e.target)) set(false);
  });
})();

// Always open at the top. Jump links on this page ("See the stages", the nav)
// scroll without leaving #stages etc. in the address, so a reload or a
// revisit doesn't land halfway down. Links in from the lineup page still work.
(function () {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  document.addEventListener("click", function (event) {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented) return;
    const id = link.getAttribute("href").slice(1);
    const target = id === "top" ? document.body : document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    if (id === "top") window.scrollTo({ top: 0, behavior: "smooth" });
    else target.scrollIntoView({ behavior: "smooth", block: "start" });
    if (id === "main") target.focus({ preventScroll: true });
  });
  const arrived = location.hash && document.getElementById(location.hash.slice(1));
  if (arrived) {
    // Arrived from another page's link: go there once, then tidy the address.
    history.replaceState(null, "", location.pathname + location.search);
    window.addEventListener("load", function () { arrived.scrollIntoView({ block: "start" }); });
  }
})();
