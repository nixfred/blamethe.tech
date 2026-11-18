# blamethe.tech

A public opinion site by [Fred Nix](https://x.com/nixfred): why Windows is a worse daily driver than [Omarchy](https://omarchy.org/), with macOS as a decent but expensive middle.

Live: [https://blamethe.tech/](https://blamethe.tech/)

Every charge against Windows, and every ding at Mac, has a source link. Claims that could not be sourced were not used. Fred uses Omarchy, an Arch Linux + Hyprland setup by DHH and the Omarchy project. He did not build it.

The previous "Blame Engine" WebGL experiment lives on the `blame-engine-archive` branch.

## Local preview

```
python3 -m http.server 8080 --directory public
```

Then open http://127.0.0.1:8080/

## Deploy

Static files in `public/` on branch `main`. A push to `main` deploys the Cloudflare Pages project `blamethe-tech` (no build command, output directory `public`).

Regenerate the share card after copy or layout changes:

```
python3 scripts/og.py
```

## License

Site copy is Fred Nix's opinion. The nixfred hexagon logo is locked brand artwork; do not edit the master. Fonts in `public/assets/fonts/` keep their original SIL OFL licenses.
