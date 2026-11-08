// Photo carousel for "Here's what you missed".
// It starts with the photos already in the page. If a shared Google Drive
// folder is set up (data-drive-folder and data-drive-key on .carousel),
// it swaps them for every photo in that folder, newest first.
(function () {
  var root = document.querySelector('.carousel');
  if (!root) return;
  var track = root.querySelector('.carousel__track');
  var prev = root.querySelector('.carousel__btn--prev');
  var next = root.querySelector('.carousel__btn--next');

  function step(dir) {
    var slide = track.querySelector('.carousel__slide');
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    var by = slide ? slide.getBoundingClientRect().width + gap : track.clientWidth;
    track.scrollBy({ left: dir * by, behavior: 'smooth' });
  }

  function update() {
    var max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max;
    root.classList.toggle('is-static', max <= 0);
  }

  prev.addEventListener('click', function () { step(-1); });
  next.addEventListener('click', function () { step(1); });
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();

  var folder = root.dataset.driveFolder;
  var key = root.dataset.driveKey;
  if (!folder || !key || !window.fetch) return;

  var url = 'https://www.googleapis.com/drive/v3/files' +
    '?q=' + encodeURIComponent("'" + folder + "' in parents and mimeType contains 'image/' and trashed = false") +
    '&orderBy=createdTime desc&pageSize=200&fields=files(id)&key=' + encodeURIComponent(key);

  fetch(url)
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      var files = (data.files || []);
      if (!files.length) return;
      var html = files.map(function (f, i) {
        var id = encodeURIComponent(f.id);
        return '<li class="carousel__slide"><a class="snap" href="photos.html">' +
          '<img src="https://lh3.googleusercontent.com/d/' + id + '=w1200"' +
          ' data-fallback="https://drive.google.com/thumbnail?id=' + id + '&sz=w1200"' +
          ' alt="A photo from An Experience" width="1200" height="800"' +
          (i > 1 ? ' loading="lazy"' : '') + ' referrerpolicy="no-referrer"></a></li>';
      }).join('');
      track.innerHTML = html;
      // If one image host refuses a photo, try the other, then drop the slide
      track.querySelectorAll('img').forEach(function (img) {
        img.addEventListener('error', function () {
          if (img.dataset.fallback) { img.src = img.dataset.fallback; img.removeAttribute('data-fallback'); }
          else { img.closest('.carousel__slide').remove(); update(); }
        });
      });
      track.scrollLeft = 0;
      update();
    })
    .catch(function () { /* keep the photos already in the page */ });
})();
