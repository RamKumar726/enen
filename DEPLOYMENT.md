# Production deployment

## Runtime configuration

Copy `server/.env.example` into the deployment platform's secret manager and replace every placeholder. Never commit a populated `.env` file. Use strong, distinct JWT secrets, set `NODE_ENV=production`, restrict `ALLOWED_ORIGINS` to the exact storefront origins, and set `TRUST_PROXY_HOPS` to the number of trusted reverse proxies.

Set the frontend build variable `VITE_API_URL` to the public HTTPS API base URL ending in `/api`. When using Netlify, set the site base directory to `client`; its configuration rewrites application routes to `index.html`.

Products link to the seller's Amazon product page. Amazon handles checkout, payment, delivery, returns, order support, and its customer reviews. Keep the product's Amazon URL current in the admin catalog.

For reliable refresh-cookie behavior, serve the storefront and API on the same registrable domain (for example `shop.example.com` and `api.example.com`), use HTTPS, and list the storefront's exact origin in `ALLOWED_ORIGINS`. The production refresh cookie is HTTP-only, Secure, and SameSite=None; some browsers restrict third-party cookies when services use unrelated domains.

## Operational requirements

- Use MongoDB Atlas or another replica-set database with automated backups and a restricted network allowlist.
- Keep `/api/health` readiness checks enabled; it returns HTTP 503 until MongoDB is connected.
- Product images must use HTTPS and durable object storage or a media CDN. The admin interface accepts image URLs; it does not upload files.
- Configure platform logs, uptime and alert monitoring, TLS, database backup/restore drills, and a shared rate-limit store before scaling beyond one API instance.
- Confirm product artwork, prices, availability, and applicable tax treatment before publishing. Demo catalog content is placeholder content and should not be activated as live inventory.

## Safe seed command

The seed script refuses to run in production and refuses to replace catalog/carousel records unless `SEED_DESTRUCTIVE=true` is explicitly set. Seed products, banners, and collections are inactive until reviewed and activated by an administrator. Replace demo designs, prices, discount copy, and generic photos with accurate content you are authorized to sell. The seed process does not delete user accounts or create public demo credentials. Optional admin bootstrapping requires `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
