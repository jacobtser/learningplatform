# Dangme Learning Platform — AI Startup Credits site

A static, **zero-build** two-page website that pitches **Dangme Learning Platform**
to any AI provider that grants developer tokens/credits, and ends in an
**application dossier** with a fillable, `mailto:`-based application form and a
concrete **$1,000 credit plan**.

- Plain HTML + CSS + vanilla JS. **No build step, no framework, no npm.**
- Relative paths only, so it works both from the filesystem and under a
  GitHub Pages repo subpath (`https://<user>.github.io/<repo>/`).
- No external image services. The only raster asset is the brand logo.

---

## Files

```
webbb/
├── index.html                 the pitch (problem · platform · why credits · roadmap · impact · team)
├── apply.html                 the application dossier (sections 01–07 + the form)
├── 404.html                   on-brand not-found page
├── .nojekyll                  keeps files/folders beginning with "_" served
├── README.md                  this file
└── assets/
    ├── css/main.css           the whole design system
    ├── js/main.js             nav, reveal-on-scroll, form (mailto + copy/download), print
    └── img/
        ├── logo.jpg           copied from `brand/Logo.jpg`
        └── favicon.svg        monogram in the brand palette
```

At the repository root: `.github/workflows/deploy-webbb.yml` — a GitHub Actions
workflow that uploads **`webbb/`** as the Pages artifact.

---

## Preview locally

**From the filesystem** — just open `index.html` in a browser. Everything except
`file://` restrictions on the clipboard API works; the Copy-message button falls
back to a hidden-textarea copy automatically.

**With a static server** (recommended, matches how Pages serves it):

```powershell
# Python 3 (any version)
py -m http.server 8080 --directory webbb

# or Node, if you have it
npx --yes serve webbb
```

Then open <http://localhost:8080/>.

---

## Deploy

> **Read this first.** This `webbb/` folder is fully self-contained, so the
> reliable path is to publish it as its **own repository**. Do **not** push the
> parent project — it contains multi-gigabyte `calude/` and `checkpoints/`
> folders (≈13 GB) that GitHub will reject.

### Route A — new repo, branch deploy (recommended: no build, no Actions)

1. Create a new **empty** GitHub repository, e.g. `dangme-credits`.
2. Copy the **contents** of `webbb/` to a fresh local folder so `index.html`
   sits at the repository root, then commit and push:

   ```powershell
   $dest = "C:\dev\dangme-credits"
   New-Item -ItemType Directory -Force $dest | Out-Null
   Copy-Item -Recurse -Force .\webbb\* $dest
   cd $dest
   git init -b main
   git add .
   git commit -m "Dangme Learning Platform — AI startup credits site"
   git remote add origin https://github.com/<username>/dangme-credits.git
   git push -u origin main
   ```

3. In the new repo: **Settings → Pages → Source → Deploy from a branch →
   `main` / `/ (root)`**.

Your site goes live at **`https://<username>.github.io/<repo>/`** within a minute.

### Route B — GitHub Actions (only if the repo contains `webbb/`)

`.github/workflows/deploy-webbb.yml` uploads **`webbb/`** as the Pages artifact.
It applies only if you push a repository that *includes* this `webbb/` folder
(e.g. a trimmed repo). Then choose **Settings → Pages → Source: GitHub Actions**.

### Route C — `docs/` folder (within an existing repo)

Rename `webbb/` to `docs/`, commit, and select **`main` / `/docs`** in Pages.

> `.nojekyll` ships inside `webbb/`, so Jekyll won't strip any file or folder
> whose name begins with an underscore.

### Before you publish

Replace the placeholder canonical/OG URL in **both** `index.html` and
`apply.html`:

```
https://your-username.github.io/dangme/
```

with your real Pages URL (`https://<username>.github.io/<repo>/`). The
`og:image` values are relative (`assets/img/logo.jpg`) and resolve on the
deployed page; make them absolute if a share-card validator requires it.

---

## How the application form works

- Submitting composes a **`mailto:jacobtser20@gmail.com`** with the subject
  `AI Startup Credits — Application — Dangme Learning Platform` and a body built
  from the fields, then hands off to the OS mail client.
- A live **composed-message** panel offers **Copy message** and
  **Download as .txt** as fallbacks when no mail client is present.
- Validation is **client-side only** (name + email). No network calls, no
  third-party form service, no tracking.
- With **JavaScript disabled**, the `<form>` falls back to a plain
  `action="mailto:…"` submission and native browser validation still applies
  (JS turns on `novalidate` only when it loads, to use its own inline messages).

---

## Editing content

- **Palette, type and shadows** live in the `:root` block at the top of
  `assets/css/main.css` — reuse the existing brand tokens; don't invent new ones.
- **The $1,000 plan** appears in two places: as the `.budget` table and as the
  `.meter` segmented bar (and mirrored on both pages). The five segments are
  `35% / 25% / 15% / 15% / 10%`, which sums to exactly **$1,000**. If you change
  one, change the other.
- **Logo rule:** the mark is light-ground artwork — always seat it on white or
  Teal Mist (`--teal-mist`). Never place it on a bare dark ground.
"# learningplatform" 
