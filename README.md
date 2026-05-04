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

Note: local `http.server` cannot run Vercel Serverless Functions. The contact form will show a fallback link that opens an email draft.

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

## Deploy (Vercel)

This site is designed to be deployed on Vercel.

### Contact form (email only)

The contact form calls the serverless function at `/api/contact`.

Required environment variables (Vercel Project Settings → Environment Variables):
- `RESEND_API_KEY` — Resend API key
- `CONTACT_TO_EMAIL` — Your inbox email address (destination)

### Private dashboard

The dashboard is served from `/api/dashboard` and protected with Basic Auth.

Required environment variables:
- `DASHBOARD_PASS` — Password (required)
- `DASHBOARD_USER` — Username (optional)

## License

MIT — see [LICENSE](LICENSE).
