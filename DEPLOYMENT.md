# Deployment guide and status

## Hosting plan

- **Backend:** Render Node web service, configured by the repository's `render.yaml` Blueprint. Health check: `/health`.
- **Frontend:** Vercel static site, with its project root set to `client/`. `client/vercel.json` sends browser routes to the React app entry point.
- **Database:** MongoDB Atlas (recommended for hosted use); create a database user with only the permissions needed by this service and allow the Render service to connect.

## Required production environment variables

Set these in the Render service dashboard (never commit their actual values):

| Variable | Required value |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas connection URI for the catalog database |
| `JWT_SECRET` | Random secret of at least 32 characters; Render Blueprint can generate it |
| `CORS_ORIGINS` | Exact deployed frontend origin, e.g. `https://your-library.vercel.app` (no trailing slash); comma-separate additional trusted origins |
| `LOAN_PERIOD_DAYS` | Optional integer from 0 to 365; default is 14; keep 14 in production |

The recommended Vercel deployment uses same-origin proxy rewrites in `client/vercel.json`, so no frontend API-origin variable is needed. The rewrite target defaults to the Render service hostname generated from `render.yaml` (`library-catalog-api.onrender.com`); update those three rewrite destinations if Render assigns a different URL. `VITE_API_BASE_URL` is optional only when intentionally calling the API directly:

| Variable | Required value |
| --- | --- |
| `VITE_API_BASE_URL` | Optional direct backend origin (no trailing slash); normally leave unset so requests use the same-origin Vercel proxy |

The deployed backend uses HTTPS and sets auth cookies as `HttpOnly`, `Secure`, and `SameSite=None`. The recommended Vercel rewrites keep requests same-origin in the browser, avoiding third-party-cookie blocking while still proxying to the live API; the frontend fetch helper uses `credentials: 'include'`. The API only grants credentialed CORS access to the exact `CORS_ORIGINS` allowlist and rejects state-changing requests whose browser `Origin` is not allowlisted. Do not use `*` for credentialed CORS. Add custom frontend domains to the allowlist if used.

## Deploy steps

1. Create/connect the Vercel project first so its intended production domain is known (for example `https://library-catalog-frontend.vercel.app`), then connect this repository to Render. Create the web service from `render.yaml`; set `MONGODB_URI` and that exact Vercel origin in `CORS_ORIGINS` before the first production start.
2. Provision Atlas, create a restricted database user, add the Render outbound network policy as required by the Atlas plan, and set `MONGODB_URI` in Render.
3. Deploy the Vercel project with the root directory `client/`, build command `npm run build`, and output directory `dist`. Verify that the proxy destinations in `client/vercel.json` match the Render backend URL. Leave `VITE_API_BASE_URL` unset to use the same-origin proxy.
4. After the first Vercel deployment, copy its exact HTTPS origin into Render's `CORS_ORIGINS`, save, and redeploy/restart the API. If using a custom frontend domain, update the allowlist and redeploy.
5. Run the seed command once against the production database only if this is a fresh assignment database. Do not run it against a database containing records you need: the seed intentionally clears books and genres.
6. Check `https://<backend-host>/health`, `https://<backend-host>/genres`, and the frontend. In browser DevTools, verify `/catalog/books`, `/catalog/genres`, and `/api` requests go through Vercel to the deployed backend and return credentialed responses. Test register/login, a patron borrow request, and the librarian pages.

## Deployment integration issue and resolution

During production-readiness review, the authentication cookie was configured with `SameSite=Strict`. That works when Vite proxies requests locally, but a separately hosted Vercel frontend and Render API are cross-site: browsers will not send a Strict cookie on those frontend-to-API fetches, so the profile check and protected routes would appear logged out after a successful login. The production cookie is now `SameSite=None; Secure`, while development keeps `SameSite=Strict`. The same integration also needs credentialed CORS, so the API now uses an explicit origin allowlist, checks the `Origin` on state-changing requests, and the frontend includes credentials. The allowlist is required at production startup to prevent an accidentally unconfigured cross-origin deployment.

This is an issue found and addressed during deployment preparation; a provider deployment has **not** been performed from this environment. No Render/Vercel account credentials or provisioned service URLs are available here. Replace the example hostnames above with the actual provider URLs and record any additional provider-specific issue encountered before submitting.

## Live service URLs

- Frontend: **pending Vercel deployment**
- Backend: **pending Render deployment**
- Repository: https://github.com/saiton-del/library-catalog-service

The live URLs cannot be truthfully supplied until the hosting services are created and deployed. The repository includes the service configuration and environment-variable checklist to complete that step.
