# blamethe.tech

**THE BLAME ENGINE** — a WebGL scroll-descent through the stack.

At 02:47 in the morning, production goes down. You descend the ten-layer
stack as the investigator. Every layer — the user, the frontend, the
database, the network, DNS, the kernel, the hardware, a cosmic ray — is a
suspect. Each one defends itself and points one layer down. You reach the
bottom, and the Blame Engine returns its verdict.

It always blames the tech.

An experiment from [nixfred.com](https://nixfred.com).

## Stack

- **TypeScript** (strict)
- **Vite** — build and dev server
- **Three.js** — the WebGL descent
- **Lenis** — smooth scroll
- No backend — the verdict engine is 100% client-side

## Develop

```bash
bun install
bun run dev      # http://localhost:5173
bun run build    # -> dist/  (static, deploy anywhere)
```

Controls: scroll to descend. Each layer is a station — the world dims to a
spotlight, the suspect speaks, then you scroll on.

## How it's built

- `src/main.ts` — the descent engine: scroll-driven camera, the intro and
  cold open, scene playback, the spotlight scrim, the anchored dialogue panel
- `src/layers.ts` — the script: the cold open and all ten interrogations
- `src/layer-scenes.ts` — ten procedural Three.js environments, one per layer
- `src/verdict-engine.ts` — the client-side verdict generator
- `src/style.css` — the overlay (HUD, dialogue panel, verdict card, intro)
- `index.html` — page shell and overlay markup
- `public/CNAME` — custom domain for GitHub Pages

## The descent

THE USER → THE FRONTEND → THE BACKEND → THE DATABASE → THE NETWORK → DNS →
THE KERNEL → THE HARDWARE → THE COSMIC RAY → THE ROOT CAUSE

## Deploy

Static build. Intended to live at **blamethe.tech** via GitHub Pages with the
custom domain — `public/CNAME` is already set. The Pages deploy workflow
(a `bun run build` step that publishes `dist/`) is not wired up yet.

---

Private repo. Part of the nixfred.com family.
