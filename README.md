# ChairPerSoon - Program Chair prototype

The prototype uses sample data stored in `includes/data.json`; no database service or setup is required.

## Netlify (static site)

Netlify serves static files and does not run PHP, so `scripts/build.mjs` pre-renders every page to plain HTML in `dist/` at deploy time (configured in `netlify.toml`). It needs only Node.js; there are no dependencies to install. Pages are served at clean URLs such as `/dashboard`, `/sections`, `/faculty/F02`, `/students` and `/actions`, and old `.php` links redirect to them. `robots.txt` and `sitemap.xml` are generated using the site's URL.

To preview locally: `node scripts/build.mjs` and then open `dist/index.html`, or run `netlify dev`.

## PHP version

The original PHP pages still work for local use or a PHP host and read the same `includes/data.json`. Requires PHP 8+.

`php -S localhost:8000`

Open http://localhost:8000/ to see the loading screen and continue to the dashboard. On Apache hosts, the `.htaccess` file exposes `robots.txt` and `sitemap.xml` for search crawlers.
