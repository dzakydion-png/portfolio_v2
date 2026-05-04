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
