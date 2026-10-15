# Deploying the CuraLink Admin app (Render)

This is a **checklist for you to run**. Nothing here has been executed: no Render
service was created, no setting was changed, nothing was deployed.

The admin app (`admin/`) serves the doctor, hospital, pharmacy and admin portals.
It is a static Vite build that talks to the backend API.

## 0. Why order matters (read first)

The backend now **fails closed on CORS** (`backend/utils/corsConfig.js`):

| `CORS_ORIGIN` | Production behaviour |
| --- | --- |
| set | only the exact origins listed are allowed |
| unset / blank / `*` | **no** cross-origin browser request is allowed |

`render.yaml` currently lists **only the patient frontend**. Once this backend
version is live, an admin app on any other origin is blocked by the browser until
its origin is added to `CORS_ORIGIN`. So:

1. Know the admin app's final URL **before** deploying the new backend, and
2. update `CORS_ORIGIN` **in the same change** as the backend deploy.

If the admin app is already deployed, add its existing URL to `CORS_ORIGIN`
first (step 3) — that is also safe with the old backend code.

## 1. Create the admin static site (new, or confirm the existing one)

Render dashboard -> **New + -> Static Site** (or open the existing admin service).

| Setting | Value |
| --- | --- |
| Repository / branch | `Khr29/CuraLink`, `master` |
| Root Directory | `admin` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Auto-Deploy | your choice (the blueprint uses `true`) |

**Environment variables** (build-time: Vite inlines them, so changing one needs a rebuild):

| Key | Value |
| --- | --- |
| `NODE_VERSION` | `20.19.0` |
| `VITE_BACKEND_URL` | the backend URL, e.g. `https://curalink-backend-921r.onrender.com` (no trailing slash) |
| `VITE_FRONTEND_URL` | the patient frontend URL, e.g. `https://curalink-frontend-5y9u.onrender.com` |

The build **fails on purpose** if `VITE_BACKEND_URL` is empty (`admin/viteEnvGuard.js`).

**Redirects/Rewrites** (Render dashboard -> the service -> *Redirects/Rewrites*):

| Source | Destination | Action |
| --- | --- | --- |
| `/*` | `/index.html` | Rewrite |

Without this, refreshing or deep-linking to e.g. `/doctor-dashboard` returns 404.
`admin/public/_redirects` is a Netlify-style file and is **ignored by Render**.

Note the URL Render assigns (e.g. `https://curalink-admin-xxxx.onrender.com`).

## 2. Backend environment (cookies, and variables the code reads)

Every variable the backend reads: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLOUDINARY_API_KEY`,
`CLOUDINARY_NAME`, `CLOUDINARY_SECRET_KEY`, `CORS_ORIGIN`, `COOKIE_SAME_SITE`, `COOKIE_SECURE`,
`CURRENCY`, `DISABLE_RATE_LIMITING`, `EMAIL_PASS`, `EMAIL_USER`, `EMAIL_VERIFICATION_REQUIRED`,
`FRONTEND_URL`, `JWT_SECRET`, `MONGODB_URI`, `NODE_ENV`, `PORT`, `RAZORPAY_KEY_ID`,
`RAZORPAY_KEY_SECRET`. `MONGODB_URI` **must include the database name**
(`mongodb+srv://<host>/<dbname>?<options>`); without it the backend uses the empty default
database `test` and logs a `[CONFIG]` warning at startup. `CURRENCY` must be a 3-letter code
(e.g. `INR`), or payments are refused.

### Cookies (required for login to persist)

`*.onrender.com` is on the Public Suffix List, so the frontend, admin and backend
hosts are all **cross-site** to each other. The refresh-token cookie therefore needs:

| Backend env var | Value |
| --- | --- |
| `COOKIE_SECURE` | `true` |
| `COOKIE_SAME_SITE` | `none` |

`render.yaml` leaves `COOKIE_SAME_SITE` as `sync: false` (set in the dashboard), and
this repo cannot read the dashboard — **check it is `none`**. If it is unset it defaults to
`lax`, and silent token refresh fails cross-site (users get logged out when the
15-minute access token expires). The code (`backend/utils/cookies.js`) forces `Secure`
whenever `COOKIE_SAME_SITE=none`, because browsers drop an insecure `SameSite=None` cookie.
`onrender.com` is on the Public Suffix List, which is why these hosts count as cross-site. With a custom domain where all apps share one
registrable domain (e.g. `app.example.com`, `admin.example.com`, `api.example.com`),
`lax` is fine.

## 3. Add the admin origin to the backend `CORS_ORIGIN`

Render -> `CuraLink-Backend` -> Environment:

```
CORS_ORIGIN=https://curalink-frontend-5y9u.onrender.com,https://<your-admin-host>.onrender.com
```

- Comma-separated, **exact origins**: scheme + host, no path, no trailing slash needed
  (a trailing slash is tolerated), `https://` not `http://`.
- A bare `*` is ignored and allows nothing.
- Saving the variable restarts/redeploys the backend (choose "Save, rebuild, and deploy" if Render offers a choice), and the new value only applies after that.

## 4. Verify (from any terminal)

Replace the three URLs.

```bash
API=https://curalink-backend-921r.onrender.com
ADMIN=https://<your-admin-host>.onrender.com

# Allowed origin: response must contain access-control-allow-origin: $ADMIN
# and access-control-allow-credentials: true
curl -si -X OPTIONS "$API/api/admin/refresh-token" \
  -H "Origin: $ADMIN" -H "Access-Control-Request-Method: POST" | grep -i '^access-control'

# Any other origin: must print NOTHING (no access-control-allow-origin header)
curl -si -X OPTIONS "$API/api/admin/refresh-token" \
  -H "Origin: https://evil.example.com" -H "Access-Control-Request-Method: POST" | grep -i '^access-control'
```

Then in a browser: open the admin URL, log in as admin, reload the page (session should
survive via the refresh cookie), log out, and confirm DevTools -> Application -> Cookies
no longer shows `curalink_admin_rt`.

## 5. Rollback

- Admin site misbehaves: Render -> admin service -> *Deploys* -> redeploy a previous build.
- Users locked out by CORS: add the missing origin to `CORS_ORIGIN` (step 3). Do **not**
  clear the variable or set `*` — that blocks everyone in production.

## 6. Optional: Blueprint sync

`render.yaml` already contains a `CuraLink-Admin` **placeholder** block. A Blueprint
sync only adopts an existing service whose `name:` matches **exactly**, and creates a
duplicate otherwise — rename the block to the real service name (or delete it) before
any sync. Also change `CORS_ORIGIN` in `render.yaml` to include the admin origin, or a
sync will reset the dashboard value back to the frontend-only list.

## Local development

No setup needed: `admin/.env.development` points the dev server at
`http://localhost:4000`, and the dev server refuses a non-local backend unless
`VITE_ALLOW_REMOTE_BACKEND=true`. With `CORS_ORIGIN` unset the backend allows
`localhost` / `127.0.0.1` origins in development only.
