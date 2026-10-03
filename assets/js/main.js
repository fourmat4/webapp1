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
