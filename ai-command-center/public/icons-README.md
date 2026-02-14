# Dominat8 "8" icon set

- **logo-8.svg** — Main asset: scalable figure-8 logo. Used as favicon and in the UI (showroom + engine).
- **Favicon**: The app uses this SVG as the primary favicon (see `index.html`). Browsers that don’t support SVG favicons fall back to `favicon.ico`.
- **PNG for PWA / Apple**: To generate 192×192 and 512×512 PNGs from `logo-8.svg` (e.g. for `manifest.json` or Apple touch icon), you can:
  - Use [RealFaviconGenerator](https://realfavicongenerator.net/) and upload `logo-8.svg`, or
  - Export from Figma/Illustrator/Inkscape, or
  - Use a CLI (e.g. `sharp`, `inkscape --export-type=png`).

Place exported files as `logo192.png` and `logo512.png` in `public/` if you want them used by the manifest.
