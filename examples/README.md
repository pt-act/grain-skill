# Examples

Three pages built by the grain skill itself — each from one brief, one dealt
direction, real pictures found in open archives, and the house rules applied.

| Page | Direction | Palette | Type | What it demonstrates |
| --- | --- | --- | --- | --- |
| [wine-bar](wine-bar/) | The Ledger | Kraft | Editorial Serif | Ledger entries, columns hero, margin notes |
| [mountain-hut](mountain-hut/) | The Atlas | Newsprint | Swiss Grotesk | Annotated plates, window hero, map logic |
| [studio](studio/) | The Blueprint | Drafting Blue | Technical Grotesk | Sequence stages, window hero, annotations |

## How they were built

Each page followed the same pipeline:

1. `preflight.mjs` — confirmed the machine could run the full pipeline
2. `draw.mjs` — dealt a direction from the brief
3. `tokens.mjs` — emitted the `:root` tokens and font links
4. `assets.mjs` — found and downloaded real pictures with credits
5. Built still, then `lint.mjs` + `inspect.mjs` for the gate
6. Motion layer with `prefers-reduced-motion` fallback

## Running the gate on an example

```bash
cd examples/wine-bar
node ../../skills/grain/scripts/lint.mjs .
node ../../skills/grain/scripts/inspect.mjs index.html
```

The inspector needs Chrome, Edge, Chromium, or Brave. Screenshots land in
`.grain/inspect/`.

The window and columns heroes carry no photograph by design, so the
`hero-media` warning is expected on those pages and is defended rather than
fixed. Every other warning is either fixed or explained in the page's own
comments.

## Replacing the content

All three pages use sample content — dish names, prices, dates. The
photographs are real, found via Openverse, and credited in each footer.
Replace both before launch.
