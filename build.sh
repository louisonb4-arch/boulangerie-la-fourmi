#!/bin/sh
set -e
cd "$(dirname "$0")"
npx -y esbuild@0.24 css/styles.css --minify --target=chrome100,safari15,firefox100 --outfile=css/styles.min.css --log-level=warning
npx -y esbuild@0.24 js/main.js --minify --target=es2017 --outfile=js/main.min.js --log-level=warning
CV=$(cksum css/styles.min.css | cut -d' ' -f1); JV=$(cksum js/main.min.js | cut -d' ' -f1)
perl -pi -e "s/styles\.min\.css\?v=[0-9a-z]+/styles.min.css?v=$CV/g; s/main\.min\.js\?v=[0-9a-z]+/main.min.js?v=$JV/g" index.html mentions-legales.html
echo "CSS $(wc -c < css/styles.min.css) o · JS $(wc -c < js/main.min.js) o"
