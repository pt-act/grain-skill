# Colour

Apply the palette from the sheet. Its proportions matter as much as its hues.

## §1 The roles

```
--ground      the page's main surface
--ground-deep a step down: footers, the bottom of a page, a second field
--ink         running text, headings
--ink-soft    captions, secondary notes
--accent      the action, and perhaps one other thing per page
--field       an alternative ground for whole sections
--on-accent   the colour of text sitting on the accent (usually the ground)
```

Everything references tokens. No colour appears in the CSS that is not a token.

## §2 Proportions

A strong page is mostly ground. Rough budgets:

- ground: 70–85% of the area
- ink: 10–20%
- accent: 2–5% — the action, one word, one line
- field: used by at most two sections, never by two neighbours

The accent is a spice. A page where accent covers 15% of the area is not a page with a colour scheme; it is a page where nothing is emphasised.

## §3 Tone steps, not lines

Surfaces separate by a step in tone: ground against ground-deep against field. Never a border, never a shadow. If two surfaces cannot be told apart without a line, their tones are too close — move one step further apart.

## §4 A page may change its ground

One section may sit on `field` while its neighbours sit on `ground`, and a dark page may carry one light section. The change is a cut, not a fade: hard edges between grounds, no gradient transitions between them. The inspector counts gradient backgrounds and fails them.

## §5 Dark pages

Dark pages are the harder craft. On a dark ground:

- The ink steps down to a warm white (#efece4, not #fff) to keep contrast honest.
- The accent steps up — on dark, the same red reads muted; use a brighter or lighter step.
- Photographs carry more of the page; type carries less. Set type a step larger to compensate for the quiet.

## §6 Contrast

Running text: a ratio of at least 4.5:1 against its ground, 7:1 for anything large. The full ink on the full ground is the default and is almost always above it. Watch: ink-soft on ground for captions (use it for notes of a sentence or two, not paragraphs), ink on field (a dark ink on a dark field is the classic failure).

## §7 The assistant palette, banned

Yellow-cream ground with terracotta or rust, and violet or indigo anywhere, read as the generator's own signature. They are banned outright. If a client brand genuinely is violet, that is a brand asset — keep it, say so, pass `--allow no-shadow` only where the brand forces it, and never let violet touch the ground.

## §8 Found colour

The subject often has its own colours: the paint of its street, the glaze of its pots, the wood it works. Take the palette from the subject by sampling its material and mapping onto the roles — ground from the wall, ink from the signwriting, accent from the door. Photograph the thing, sample its pixels, and write the hexes in the report. The sheet's proportions stay; the hues change.
