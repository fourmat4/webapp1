# An Experience

Website for An Experience, an independent UK music festival. Seven stages and a boozer.

## Running it

It's a static site with no build step. Open `index.html`, or serve the folder:

```sh
python3 -m http.server 8000
```

## Layout

- `index.html`: the homepage
- `lineup.html`: The Lineup, one card per artist (instructions for adding artists are in a comment above the cards)
- `assets/css/styles.css`: styles, with the flyer palette as CSS variables at the top
- `assets/js/main.js`: newsletter form handling
- `assets/js/lineup.js`: stage filter on the lineup page
- `assets/img/`: web-sized exports of the festival artwork
- `assets/fonts/`: brand fonts Chonkyboi and Comical Sans, plus Work Sans as a fallback

## Still to fill in

- Exact festival dates (the hero says June 2027, dates TBA)
- Artist names, photos and descriptions on `lineup.html` once the line up is announced
- Newsletter form `action` for a mailing list provider. Search `index.html` for `PLACEHOLDER`.

Content comes from the current site, anexperience.co.uk, and the festival's Skiddle page.
