# Polder

Business intelligence for a single CSV file, made for **DLL** and dressed in DLL's look
(DLL blue `#0099ff`, greys `#333`/`#666`, Effra with Figtree as the open-source stand-in).
Drag fields onto shelves to get charts and pivot tables, filter with tabs, and restyle the
visualizations with a CSS file. Runs fully offline in the browser: double-click `index.html`,
nothing to install.

Polder is a rebrand of [Tatko](../Tatko) with the same features.

**The name.** DLL stands for *De Lage Landen*, "the Low Countries". A *polder* is Dutch land
reclaimed from the sea, and Polder reclaims insight from a sea of data. The tagline, "Let's grow
your insights together", plays on DLL's "Let's grow your business together".

**The icon.** A tractor (equipment finance, where DLL started) driving across a field whose
furrows rise like a bar chart (growth), on a DLL-blue tile. Source: `tools/icon.svg`.

## What changed from Tatko

| Tatko (8-bit)                         | Polder (DLL)                                               |
|---------------------------------------|------------------------------------------------------------|
| Arcade UI, pixel fonts                | DLL UI: white, DLL blue, Figtree/Effra, sentence case      |
| CRT scanlines toggle                  | Dark mode toggle (also flips DLL ↔ DLL Night chart theme)  |
| Chiptune sounds, on by default        | Soft sine clicks, off by default (same toggle)             |
| Arcade chart theme by default         | DLL theme by default; DLL Night, Arcade, Corporate presets |
| "Pixel Mart" retro-electronics demo   | Fictional "Lowlands Asset Finance" contract portfolio      |
| Levels / save game / score            | Sheets / workbook / KPI                                    |

Everything else (12 chart types, pivot engine, filters, theme CSS, save/open, PNG/SVG/CSV
export, Mac app) is unchanged.

## Folder layout

```
Polder/
├── app/                  the application (this is what gets zipped)
│   ├── index.html        entry point, works from file://
│   ├── css/polder.css    DLL-style UI (light + dark)
│   ├── css/fonts.css     generated: Figtree as a data: URL
│   ├── js/               data, theme, pivot, charts, export, app (same engine as Tatko)
│   ├── vendor/           plotly.js 2.35.2 (MIT)
│   ├── fonts/            Figtree (SIL OFL) + licence
│   ├── assets/           icons generated from tools/icon.svg
│   ├── samples/          generated demo dataset (fictional)
│   └── themes/           example theme CSS files (dll.css, dll-night.css, …)
├── desktop/macos/        native Mac wrapper (Swift + WKWebView)
├── website/              static landing page, ready to upload as-is
├── dist/                 Polder-<version>.zip, Polder-<version>.dmg, Polder.app
└── tools/                build scripts, icon.svg
```

## Build

Uses the macOS system Python 3 with Pillow, plus `rsvg-convert` (`brew install librsvg`) for the icons.

```sh
/usr/bin/python3 tools/build.py          # icons, fonts.css, demo data, themes, zip, dmg, website/
python3 -m http.server 8765 --bind 127.0.0.1 &   # then:
tools/screenshots.sh                     # regenerate website screenshots
```

The Mac app is ad-hoc signed, not notarized (see the Tatko README for notarization steps).
Self-test: `POLDER_SELFTEST=/some/dir dist/Polder.app/Contents/MacOS/Polder`.

## Deep links

`index.html#demo&preset=table|bar|line|scatter|treemap|kpi&theme=dll|dll-night|arcade|corporate&dark|light&mute`

## Theme CSS

Variables are named `--polder-*`; see `app/themes/dll.css` or the Theme tab in the app.
