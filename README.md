# Tim Viney — Portfolio

Source code for [timviney.com](https://timviney.com), a portfolio site with an
editorial "broadsheet" design, plus playable side-projects (Sudoku solver,
Tanks game, PubPoint case study, finance dashboard).

## Stack

- **Vite** — build tool & dev server (React plugin)
- **React 19** + **React Router 7**
- **Tailwind CSS v4** — CSS-first theme in `src/index.css`
- **Recharts** (finance dashboard), **EmailJS** (contact form), **react-icons**

## Develop

```bash
npm install
npm start        # dev server at http://localhost:5173
```

## Build & deploy

```bash
npm run build    # outputs to build/
npm run preview  # serve the production build locally
```

Deploys to S3/CloudFront via `.github/workflows/deploy-aws.yml`. API endpoint
URLs are injected at build time as `VITE_DATAACCESS_URL` / `VITE_SUDOKU_URL`
(see `.env.development` for local values).

## Design notes

Dark theme throughout. Typography: Sora (display), Hanken Grotesk (body),
JetBrains Mono (labels/data). Palette: page `#0b0f16`, panel `#11161f`,
text `#d4dae4`, blue accent `#5d7bff`. Motion is CSS-first: one orchestrated
hero load, IntersectionObserver scroll reveals, and a pure-CSS ticker marquee.
The sub-apps reuse the legacy token names (`bodyColor`, `designColor`, …)
remapped to the dark palette in `@theme` so every page stays consistent.
