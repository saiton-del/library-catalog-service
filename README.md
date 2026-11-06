# Library Catalog Service

An Express and MongoDB/Mongoose REST API plus a React patron-facing catalog. Books reference shared genre records by ObjectId.

## Requirements and setup

- Node.js 18 or newer
- MongoDB (local or Atlas)

1. Run `npm install`.
2. Copy `.env.example` to `.env`, set `MONGODB_URI`, and replace `JWT_SECRET` with a random secret of at least 32 characters. Keep `.env` private; it is ignored by Git.
3. Optionally run `npm run seed` to replace the current books and genres with the sample catalog.
4. Start the API with `npm start` (or `npm run dev` for Node's watch mode). The default URL is `http://localhost:3000`; set `PORT` to change it.

The seed command clears the existing `books` and `genres` documents before inserting four genres and sixteen books. It also removes existing librarian-role accounts and creates exactly one test librarian; other user accounts are preserved. It logs inserted totals and closes the MongoDB connection even if seeding fails. **Test librarian:** `librarian@example.com` / `LibraryAdmin123!`. This known password is for local assignment testing only; change or remove the account before production use.

## Frontend setup and demo

Keep the API running in one terminal (`npm start` from the repository root) and start the React app in another:

1. In `client/`, run `npm install` once.
2. Run `npm run dev` from `client/` and open the local URL printed by Vite (normally `http://localhost:5173`).
3. If the catalog is empty, run `npm run seed` from the repository root, then reload the browser.

Vite proxies `/books` and `/genres` to the local API at `http://localhost:3000`. The client uses the API's server-side genre filter and search together with page/limit parameters, rather than downloading the whole collection; this keeps the browser payload small and makes result totals/pagination accurate. Search is debounced by 400 ms and synchronized to the URL. The grid adapts from two columns on narrow screens to three or four on wider screens.

### Week 5: reading list, account, and booking flow

The reading list is stored in browser `localStorage` under `stacks-reading-list`. This keeps the feature independent of a backend reading-list API, makes saved books available immediately after refresh, and is suitable for the current single-browser assignment. It is device- and browser-specific, can be cleared by the user or browser settings, and does not synchronize between devices or accounts; a future version could move it to an authenticated server-side list. Book cards and detail pages can add/remove entries, and `/reading-list` displays or clears them.

The login and registration pages use the real `/api/auth/login` and `/api/auth/register` endpoints. Requests include browser credentials so the API's HTTP-only auth cookie is used; auth status is restored from `/api/users/profile` at app startup. Registration creates a patron and signs the new account in. `/booking` is protected by a route guard, remembers the requested destination, and redirects signed-out visitors to `/login`. The booking form captures a space, date, start time, and end time locally, validates the time order, and does not submit a booking to the API yet.

**Week 5 recording:** capture this sequence after starting the API and frontend: save a catalog book, open **Reading list**, refresh and show the saved card remains, remove it, sign out, type `/booking` directly and show the redirect to sign-in, log in, open **Book a space**, and complete the four fields. Add the recording/GIF at `client/demo/week-5-flow.gif` and replace/embed this line with its repository link before submission. No recording is committed yet.

**Demo flow:** open the catalog and browse the grid, choose a genre, type a title or author into search while keeping the genre selected, then open a result card to show its detail page. For the assignment's short recording, capture that sequence at a desktop width and briefly resize to mobile. Suggested filename/link after recording: `[add a short GIF or screen-recording URL here]`. No recording is included yet; add the resulting GIF to the repository (for example `client/demo/catalog-flow.gif`) and link/embed it here before final submission.

To build the frontend bundle, run `npm run build` in `client/`; use `npm run preview` there to preview it locally. For deployment, configure the frontend host to reach the API at the same origin or set `VITE_API_BASE_URL` to an API origin that explicitly allows that frontend origin.

## API

All request and response bodies use JSON. Create and update requests reject missing, unknown, or incorrectly typed fields with HTTP 400 and a field-specific `fields` array. Invalid JSON, IDs, duplicate unique values, and nonexistent book genre references also return JSON errors rather than database error details.

### Authentication and users

| Method | Endpoint | Success / access |
| --- | --- | --- |
| POST | `/api/auth/register` | `201`; creates a patron account (role cannot be set by the client) |
| POST | `/api/auth/login` | `200`; verifies credentials and sets the authentication cookie |
| POST | `/api/auth/logout` | `200`; clears the authentication cookie |
| GET | `/api/users/profile` | `200`; authenticated caller's own profile only |

Passwords are hashed with bcrypt before persistence. Login returns user details without the password and sets a signed one-hour JWT in an HTTP-only cookie. The cookie is `SameSite=Strict`, and is `Secure` in production. Send the cookie jar with subsequent requests. Registration accepts `username`, `email`, and `password`; the role always defaults to `patron`. The profile endpoint derives the user from the verified cookie, and ignores client-supplied identity values.

Creating, updating, and deleting books requires an authenticated librarian. No token returns `401`; an authenticated patron receives `403`. The seeded librarian credentials above can be used to exercise these routes.

### Genres

| Method | Endpoint | Success |
| --- | --- | --- |
| GET | `/genres` | `200` with all genres |
| GET | `/genres/:id` | `200` with one genre; `404` if absent |
| POST | `/genres` | `201` with the created genre |
| PUT | `/genres/:id` | `200` with the updated genre; `404` if absent |
| DELETE | `/genres/:id` | `204` when deleted; `404` if absent |

Genre create/update bodies require both `name` and `slug`. Slugs contain lowercase letters, numbers, and single hyphens. To avoid dangling references, deleting a genre referenced by any book is rejected with `409 Conflict`; delete or reassign those books first.

### Books

| Method | Endpoint | Success |
| --- | --- | --- |
| GET | `/books` | `200` with paginated results and totals |
| GET | `/books/:id` | `200` with one book; `404` if absent |
| POST | `/books` | `201` with the created book |
| PUT | `/books/:id` | `200` with the updated book; `404` if absent |
| DELETE | `/books/:id` | `204` when deleted; `404` if absent |

Book create/update bodies require `title`, `author`, `isbn`, `description`, `coverImage`, `totalCopies`, `availableCopies`, and `genre`. Copy counts must be non-negative integers and `availableCopies` cannot exceed `totalCopies`. `coverImage` must be an HTTP(S) URL and `genre` must identify an existing genre. PUT replaces the full required payload.

`GET /books` accepts these combinable query parameters:

| Parameter | Behavior |
| --- | --- |
| `genre=<genreId>` | Filter by the genre ObjectId |
| `search=<text>` | Case-insensitive literal match against title or author |
| `page=<n>` | 1-based page number; default `1` |
| `limit=<n>` | Results per page, from 1 through 100; default `10` |

Example: `/books?genre=65abc1234567890123456789&search=dune&page=2&limit=5`.

The list response is `{ "data": [], "total": 0, "page": 1, "limit": 10, "totalPages": 0 }`. `total` counts records after all filters; results are sorted by title.

## Postman

Import [postman/library-catalog.postman_collection.json](postman/library-catalog.postman_collection.json) into Postman. Set its `baseUrl` collection variable if the server is not running on `http://localhost:3000`. Requests are ordered to create a test genre and book, exercise each route, then clean up. Set unique `slug`, `name`, and `isbn` values before rerunning a completed collection. The invalid empty-book request includes a saved example of the expected HTTP 400 response.

## Schema Design

`Book` embeds its catalog title, author, ISBN, description, cover URL, and copy counts because these values are read together. Its genre is a reference so shared names/slugs remain consistent. `Genre` stores unique `name` and lowercase `slug` values. Copy-count schema validation prevents available inventory from exceeding total inventory.

## Token Storage

The API stores the signed JWT in a browser-managed, HTTP-only cookie named `library_token`; it does not return the token in JSON or ask the frontend to keep it in localStorage. The browser sends the cookie automatically on requests to the API, and the server verifies its signature and expiry before loading the current user and role from MongoDB. The cookie is marked `SameSite=Strict` to reduce cross-site request forgery risk, `Secure` in production so it is only sent over HTTPS, and `HttpOnly` so ordinary page JavaScript cannot read or copy it. Frontends hosted on another origin must use credentialed requests and have an explicitly configured, trusted CORS origin; the default API does not enable cross-origin access.

This choice trades some deployment flexibility for improved protection against token theft through cross-site scripting. `HttpOnly` prevents scripts from extracting the credential, but it does not stop injected same-origin JavaScript from making requests as the user; input handling and content security still matter. Cookies are sent automatically, so CSRF must also be considered: strict same-site behavior is a defense-in-depth measure, and production deployments that need cross-site clients should add a CSRF token mechanism rather than loosening cookie policy without protection. A strict same-site cookie may also complicate legitimate flows that navigate from another site. Logout clears the cookie in the client; this stateless JWT is not placed on a server-side denylist, so a previously copied token remains valid until its one-hour expiry. The short expiry limits that residual risk while avoiding session-store infrastructure.