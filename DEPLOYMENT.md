# Production deployment

## Runtime configuration

Copy `server/.env.example` into the deployment platform's secret manager and replace every placeholder. Never commit a populated `.env` file. Use separate Razorpay test/live keys in separate environments, and set `NODE_ENV=production` only after production credentials are configured. Restrict `ALLOWED_ORIGINS` to the exact storefront domains. `TRUST_PROXY_HOPS` must match the number of trusted reverse proxies in front of the API.

Set the frontend build variable `VITE_API_URL` to the public HTTPS API base URL ending in `/api`. Production builds fail without it, avoiding the previous fallback to a hardcoded backend host. When using Netlify, set the site base directory to `client`; its included configuration rewrites application routes to `index.html`.

For reliable refresh-cookie behavior across browsers, put the storefront and API on the same registrable domain (for example `shop.example.com` and `api.example.com`), use HTTPS, and list the storefront's exact origin in `ALLOWED_ORIGINS`. The production refresh cookie is HTTP-only, Secure, and SameSite=None to support separate frontend/API origins; some browsers restrict third-party cookies when the services use unrelated domains.

## Razorpay

1. Activate the Razorpay account and enable the desired payment methods in the Razorpay dashboard.
2. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` on the API. The secret must never be exposed to the browser.
3. Add a webhook pointing to `https://<api-host>/api/payment/webhook`, use the same secret in `RAZORPAY_WEBHOOK_SECRET`, and subscribe to `payment.captured`, `payment.failed`, `refund.processed`, and `refund.failed`.
4. Run test-mode payments and confirm the order is only marked paid after server verification. Switch to live keys only after the account's live activation is complete.

The API creates a pending order and stock reservation from database prices; the browser cannot set the payment amount or mark an order paid. Abandoned payment reservations expire after 15 minutes.

## Shiprocket

1. Enable API access in Shiprocket and set `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, and the exact pickup location name.
2. The admin order page's connection action can check credentials. Ship only paid online orders or COD orders.
3. Add a Shiprocket tracking webhook at `https://<api-host>/api/fulfillment-events` and set its `x-api-key` value to `SHIPROCKET_WEBHOOK_TOKEN`. This endpoint updates order shipment status from authenticated tracking events.
4. Configure `SHIPROCKET_PACKAGE_LENGTH_CM`, `SHIPROCKET_PACKAGE_WIDTH_CM`, and `SHIPROCKET_PACKAGE_HEIGHT_CM` to match your parcel. Enter each product's verified HSN code and unit weight in the admin product form. Shipment creation is blocked until these values are present. Shiprocket's order API expects whole-rupee amounts, so product prices and checkout discounts use whole-rupee rounding.

## Operational requirements

- Use MongoDB Atlas or another replica-set database with automated backups and a restricted network allowlist.
- Keep the service's `/api/health` readiness check enabled; it returns HTTP 503 until MongoDB is connected.
- Product images are entered as HTTPS URLs. Host them in durable object storage or a media CDN; no image-upload API is currently wired into the admin interface. The Netlify configuration adds browser security headers and a storefront CSP.
- Configure platform logs, uptime/alert monitoring, TLS, database backup/restore drills, and a shared rate-limit store before scaling beyond one API instance.
- Product catalog prices are stored as rupee values and shown with GST included. Verify each product's actual MRP/transaction value, HSN, and applicable GST treatment with the business's tax adviser before launch. GST for readymade apparel is price-tiered; the implementation applies 5% to per-piece values up to ₹1,000 and 12% above that based on the official CBIC FAQ.

## Safe seed command

The seed script refuses to run in production and refuses to replace catalog/carousel records unless `SEED_DESTRUCTIVE=true` is explicitly set. Seed products, banners, and collections are inactive until reviewed and activated by an administrator. Demo anime designs, prices, discount copy, and generic photos are placeholders; replace them with products, pricing, and artwork you are authorized to sell before activation. It no longer deletes user accounts or creates public demo credentials. Optional admin bootstrapping requires `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
