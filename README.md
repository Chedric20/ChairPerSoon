# ChairPerSoon - Program Chair prototype

Requires PHP 8+. The prototype uses sample data stored in `includes/data.php`; no database service or setup is required.

Start the app:

`php -S localhost:8000`

Open http://localhost:8000/ to see the loading screen and continue to the dashboard.

## Online hosting

This PHP prototype can be uploaded to a PHP 8.4 host. For a free subdomain, the project is prepared for [InfinityFree](https://www.infinityfree.com/). Create a hosting account, select a free subdomain, activate its SSL certificate, then upload the project files and folders to the account's `htdocs` directory. The `.htaccess` file exposes `robots.txt` and `sitemap.xml` for search crawlers.

After publishing, open `https://your-subdomain/robots.txt` and `https://your-subdomain/sitemap.xml` to confirm they load, then submit the sitemap in Google Search Console. Search indexing is controlled by the search engine and may take time.
