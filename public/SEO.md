# SEO setup

This app is optimized for search (converters, JSON to CSV, image to PDF, file converter, etc.) with:

- **Keyword-focused titles and descriptions** — Primary search terms (e.g. "JSON to CSV converter", "PNG to PDF") in page titles and meta descriptions.
- **Dual schema.org markup** — `WebSite` (with optional SearchAction) and `WebApplication` in JSON-LD for rich results.
- **Per-route meta** — Each section (Data, Images, Calculators, Generators, File converter) has its own title and description via react-helmet-async.
- **Sitemap** — All main routes with `lastmod`, `changefreq`, and `priority`.
- **Robots** — `index, follow` and `robots.txt` allowing crawlers; add your sitemap URL when you deploy.

When you deploy to production:

1. **`public/sitemap.xml`** — Replace `https://your-domain.com` with your actual base URL. Update `lastmod` dates when you make big content changes.

2. **`public/robots.txt`** — Uncomment the `Sitemap:` line and set the full URL (e.g. `Sitemap: https://mysite.com/sitemap.xml`).

3. **`index.html`** — In the JSON-LD script, replace all `https://your-domain.com` with your site URL (WebSite and WebApplication).

Vite copies `public/` into the build output, so `robots.txt` and `sitemap.xml` are served at the root.
