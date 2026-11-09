# LIS500.Group_Project-2

Group website for LIS 500 – Code and Power, by Nireekshana Shivarathri,
Yuthika Goel, and Madeline Root.

## What's in this repo

| Path | What it is |
|---|---|
| `index.html`, `about.html`, `resources.html`, `techheroes.html` | The four main pages |
| `stylepage.css` | Shared styles for every page |
| `images/`, `site-assets/`, other image files | Photos, artwork, logo and mascot |
| `teachablemachine/` | **Built** Teachable Machine page (what the live site serves – don't edit by hand) |
| `oscbunny-source/` | **Editable source** for the Teachable Machine page (React + Vite + p5.js) |
| `tools/` | Local preview server and the Teachable Machine build script |
| `dataset/` | Our original training images, one folder per class (e.g. `dataset/hindi/`) |

## Preview the site locally

Requires [Node.js](https://nodejs.org/) 20 or newer. From the repo root:

```sh
npm run dev
```

Then open http://127.0.0.1:4173/. Use the server rather than double-clicking
the HTML files, or the Teachable Machine page won't load.

## Editing the four main pages

Edit the HTML files or `stylepage.css` directly and refresh the browser.
No build step needed.

## Editing the Teachable Machine page

1. First time only, install its dependencies:
   ```sh
   cd oscbunny-source
   npm install
   cd ..
   ```
2. Make your changes in `oscbunny-source/src/`.
3. Rebuild from the repo root:
   ```sh
   npm run build:oscbunny
   ```
   This regenerates `teachablemachine/` and adds the shared site header and
   footer. **Commit both `oscbunny-source/` and `teachablemachine/`** – if you
   skip the rebuild, the live site keeps showing the old version.

### Where things go

All in `oscbunny-source/src/config.ts`:

- `modelUrl` – our exported Teachable Machine model link
  (Export Model → Upload my model, e.g.
  `https://teachablemachine.withgoogle.com/models/XXXX/`). The page loads it
  automatically when opened.
- `demoVideoUrl` – demonstration video (YouTube, Vimeo or Google Drive link;
  set Drive sharing to "Anyone with the link").
- `demoTranscript` – transcript for the video.
- `repositoryUrl` / `datasetUrl` / `datasetNote` – links shown on the page.

Our written project content (introduction, methods, results, analysis,
references) goes in `oscbunny-source/src/content/project.ts`.

## Publishing

The site is served by GitHub Pages straight from this repository. All paths
are relative, so the Teachable Machine page works at
`.../LIS500.Group_Project-2/teachablemachine/` with no extra setup.
