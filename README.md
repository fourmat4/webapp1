# An Experience

Website for An Experience, an independent UK music festival. Ten stages and a boozer.

## Running it

It's a static site with no build step. Open `index.html`, or serve the folder:

```sh
python3 -m http.server 8000
```

## Layout

- `index.html`: the homepage
- `photos.html`: the photo album, one section per year (instructions in a comment above the years)
- `404.html`: page-not-found page (Netlify serves it automatically; its links start with `/` so it works at any address)
- `robots.txt`, `sitemap.xml`: for search engines. They and each page's canonical link assume the site lives at https://www.anexperience.co.uk
- `lineup.html`: The Lineup (hidden from search engines until the lineup is announced), one card per artist (instructions for adding artists are in a comment above the cards)
- `assets/css/styles.css`: styles, with the flyer palette as CSS variables at the top
- `assets/js/main.js`: newsletter form handling
- `assets/js/lineup.js`: stage filter on the lineup page
- `assets/img/`: web-sized exports of the festival artwork
- `assets/fonts/`: brand fonts Chonkyboi and Comical Sans, plus Work Sans as a fallback

## Still to fill in

- Artist names, photos and descriptions on `lineup.html` once the line up is announced
- Newsletter form `action` for a mailing list provider. Search `index.html` for `PLACEHOLDER`.

Content comes from the current site, anexperience.co.uk, and the festival's Skiddle page.
