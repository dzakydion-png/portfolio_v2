# portfolio_v2

Static personal portfolio website (HTML/CSS/JS).

## Run locally

From the repository root (the folder that contains `index.html`):

### Option A — Python

```bash
# Windows (recommended)
py -m http.server 8000 --bind 127.0.0.1

# or
python -m http.server 8000 --bind 127.0.0.1
```

Open:
- http://127.0.0.1:8000/
- http://127.0.0.1:8000/about/

Admin dashboard (strict, server-protected):
- `/dashboard` (only works on Vercel deployment)

### Option B — Node.js

```bash
npx serve . -l 8000
```

## Project structure

- `index.html` — Home page
- `about/` — About page
- `assets/`
  - `css/` — Compiled CSS
  - `js/` — JavaScript
  - `img/` — Images
  - `fonts/` — Fonts
  - `docs/` — PDFs (CV, certificates)
  - `scss/` — Source SCSS

## License

MIT — see [LICENSE](LICENSE).

## Deploy (Vercel + DB)

This repo is deployed as a static site with a Vercel Serverless Function:
- `POST /api/messages` — save contact messages to the database
- `GET /api/messages` — list latest messages (requires admin access)

Note: when running locally with `python -m http.server`, the `/api/*` routes do
not exist, so the contact form and dashboard won't work. To test locally with
APIs, use `vercel dev`.

### 1) Create a Postgres database

In Vercel:
- Storage → Create → Postgres
- Attach it to this project

Vercel will add the required `POSTGRES_*` environment variables automatically.

### 2) Protect dashboard (Basic Auth)

Add an environment variable in Vercel:
- `DASHBOARD_USER` — username for Basic Auth
- `DASHBOARD_PASS` — password for Basic Auth

Optional:
- `ADMIN_TOKEN` — Bearer token for API access (not required if you use Basic Auth)

The dashboard page itself is served by a Serverless Function and will prompt for
Basic Auth. Without correct credentials, the dashboard HTML is not accessible.
