# Boulangerie La Fourmi — site vitrine

Site statique (HTML/CSS/JS, sans framework ni librairie), hébergé sur Vercel.

## Voir en local
`./serve.sh` puis ouvrir http://localhost:8811 (ou double-cliquer `index.html`).

## Modifier
- Styles : `css/styles.css` · Interactions : `js/main.js`
- Après modification, lancer `./build.sh` : minifie (`styles.min.css`, `main.min.js`) et met à jour le `?v=` dans les pages.

## Paramètres d'URL
- `?intro=0` : saute l'ouverture (rideau de fer)
- `?qa` : coupe ouverture et animations (captures)

## DA
- Titres de section composés avec les vraies lettres du logo (paths SVG extraits du wordmark).
- Couleurs : or `#AE9A45` et ardoise `#26363E` (logo), gris de la devanture `#8A8F97`, pierre `#ECE5D8`.
- Polices auto-hébergées (`fonts/`) : Instrument Serif, Instrument Sans, DM Mono.
- Images en AVIF / WebP / JPEG, 700 et 1200 px (`images/`).
