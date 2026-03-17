# SEO setup

When you deploy to production, update these for your real domain:

1. **`public/sitemap.xml`** — Replace `https://your-domain.com` with your actual base URL (e.g. `https://mysite.com`).

2. **`public/robots.txt`** — Uncomment the `Sitemap:` line and set the full URL to your sitemap (e.g. `Sitemap: https://mysite.com/sitemap.xml`).

3. **`index.html`** — In the JSON-LD script, replace `https://your-domain.com` in the `url` field with your site URL.

Vite copies `public/` into the build output, so `robots.txt` and `sitemap.xml` will be served at the root of your site.
