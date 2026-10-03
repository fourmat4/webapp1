# An Experience

Website for An Experience, an independent UK music festival. Six stages and a boozer.

## Running it

It's a static site with no build step. Open `index.html`, or serve the folder:

```sh
python3 -m http.server 8000
```

## Layout

- `index.html`: the homepage
- `assets/css/styles.css`: styles, with the flyer palette as CSS variables at the top
- `assets/js/main.js`: newsletter form handling
- `assets/img/`: web-sized exports of the festival artwork
- `assets/fonts/`: self-hosted Rye, Bungee and Work Sans (SIL OFL)

## Still to fill in

- Exact festival dates (the hero says June 2027, dates TBA)
- Artist names once the line up is announced
- Newsletter form `action` for a mailing list provider. Search `index.html` for `PLACEHOLDER`.

Content comes from the current site, anexperience.co.uk, and the festival's Skiddle page.
